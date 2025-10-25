// proxy.ts
// Edge proxy for authentication and authorization
// Handles PKCE generation and direct redirect to Zitadel for unauthenticated users

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'

// Zitadel configuration
const ZITADEL_ISSUER =
  process.env.NEXT_PUBLIC_ZITADEL_ISSUER || 'http://localhost:8888'
const ZITADEL_CLIENT_ID = process.env.NEXT_PUBLIC_ZITADEL_CLIENT_ID || ''
const ZITADEL_REDIRECT_URI =
  process.env.NEXT_PUBLIC_ZITADEL_REDIRECT_URI ||
  'http://localhost:3001/auth/callback'

interface DecodedJwtPayload {
  sub: string
  username: string
  roles?: string[]
  schoolId?: string | null
  'urn:zitadel:iam:org:project:roles'?: Record<string, any>
  'urn:zitadel:iam:org:id'?: string
  iat?: number
  exp?: number
}

// PKCE utilities (inline for Edge Runtime compatibility)
function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  const base64 = btoa(String.fromCharCode(...array))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const base64 = btoa(String.fromCharCode(...new Uint8Array(hash)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function generateState(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  )
}

// Extract roles from JWT
function extractRoles(decoded: DecodedJwtPayload): string[] {
  // Direct array case (unlikely for Zitadel but keep for compatibility)
  if (Array.isArray(decoded.roles)) {
    return decoded.roles.map((r) => r.toUpperCase().replace(/[-\s]/g, '_'))
  }

  const claim = decoded['urn:zitadel:iam:org:project:roles']
  const collected: string[] = []
  if (claim && typeof claim === 'object') {
    // Zitadel roles claim shape: { ROLE_NAME: { orgId: domain }, ... }
    // The role names are the top-level keys
    for (const [roleName, roleValue] of Object.entries(claim)) {
      // If the key looks like a role (not a numeric org ID), collect it
      // Role values can be boolean (true) or object ({ orgId: domain })
      if (typeof roleValue === 'boolean' && roleValue) {
        collected.push(roleName)
      } else if (roleValue && typeof roleValue === 'object') {
        // Value is an org map; the role name is the key we're iterating
        collected.push(roleName)
      }
    }
  }

  const normalized = collected.map((r) =>
    r.toUpperCase().replace(/[-\s]/g, '_'),
  )
  const allowed = new Set(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT'])
  return normalized.filter((r) => allowed.has(r))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const secFetchMode = request.headers.get('sec-fetch-mode') || ''
  const isNavigation = secFetchMode === 'navigate'
  const isPrefetchHeader = request.headers.get('next-router-prefetch') === '1'
  const isRSC = request.headers.get('rsc') === '1'
  const isRSCNavigation = isRSC && !isPrefetchHeader
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const useSecureCookies = (forwardedProto || request.nextUrl.protocol).startsWith('https')

  // Public routes - allow without authentication
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/auth/refresh') ||
    pathname.startsWith('/auth/logout') ||
    pathname === '/unauthorized' ||
    pathname === '/debug-token' ||
    pathname === '/test-auth' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Get tokens from cookies
  const accessToken = request.cookies.get('token')?.value
  const idToken = request.cookies.get('id_token')?.value

  // If no token, redirect to Zitadel with PKCE (only for real navigations)
  if (!accessToken && !idToken) {
    if (!(isNavigation || isRSCNavigation)) {
      // Avoid redirecting prefetch/data requests to external domain to prevent CORS errors
      return NextResponse.next()
    }

    // Generate PKCE pair
    const verifier = generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)
    const state = generateState()

    // Build Zitadel authorization URL
    const authUrl = new URL(`${ZITADEL_ISSUER}/oauth/v2/authorize`)
    authUrl.searchParams.set('client_id', ZITADEL_CLIENT_ID)
    authUrl.searchParams.set('redirect_uri', ZITADEL_REDIRECT_URI)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set(
      'scope',
      'openid profile email urn:zitadel:iam:org:project:id:zitadel:aud urn:zitadel:iam:org:project:roles',
    )
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('code_challenge', challenge)
    authUrl.searchParams.set('code_challenge_method', 'S256')

    // Create redirect response
    const response = NextResponse.redirect(authUrl)

    // Store PKCE verifier and state in HTTP-only cookies
    response.cookies.set('pkce_verifier', verifier, {
      httpOnly: true,
      secure: useSecureCookies,
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })

    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: useSecureCookies,
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })

    // Store original destination
    response.cookies.set('redirect_after_login', pathname, {
      httpOnly: true,
      secure: useSecureCookies,
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })

    return response
  }

  // Validate token
  try {
    // Prefer ID token for identity/roles, fall back to access token
    const tokenForAuth = idToken || accessToken
    if (!tokenForAuth) {
      throw new Error('No token available for decoding')
    }
    const decoded = jwtDecode<DecodedJwtPayload>(tokenForAuth)

    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      const url = new URL('/auth/refresh', request.url)
      url.searchParams.set('returnTo', pathname)
      return NextResponse.redirect(url)
    }

    // For /admin routes, check roles
    if (pathname.startsWith('/admin')) {
      const roles = extractRoles(decoded)
      const hasAdminRole = roles.some(
        (role) => role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN',
      )

      if (!hasAdminRole) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    // Token valid, allow request
    return NextResponse.next()
  } catch {
    const url = new URL('/auth/refresh', request.url)
    url.searchParams.set('returnTo', pathname)
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
