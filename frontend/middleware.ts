// middleware.ts
// Edge middleware for authentication and authorization
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
    // Two possible shapes:
    // 1) { ROLE_A: true, ROLE_B: true }
    // 2) { projectId: { ROLE_A: true, ROLE_B: true } }
    for (const [k, v] of Object.entries(claim)) {
      if (typeof v === 'boolean') {
        collected.push(k)
      } else if (v && typeof v === 'object') {
        for (const innerKey of Object.keys(v as Record<string, boolean>)) {
          collected.push(innerKey)
        }
      }
    }
  }

  const normalized = collected.map((r) =>
    r.toUpperCase().replace(/[-\s]/g, '_'),
  )
  const allowed = new Set(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT'])
  return normalized.filter((r) => allowed.has(r))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const secFetchMode = request.headers.get('sec-fetch-mode') || ''
  const isNavigation = secFetchMode === 'navigate'
  const isPrefetchHeader = request.headers.get('next-router-prefetch') === '1'
  const isRSC = request.headers.get('rsc') === '1'
  // Treat as navigation when either traditional navigate OR RSC navigation (non-prefetch)
  const isRSCNavigation = isRSC && !isPrefetchHeader
  // Public routes - allow without authentication
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/auth/refresh') ||
    pathname.startsWith('/auth/logout') ||
    pathname === '/unauthorized' ||
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
      // Let the actual navigation trigger the redirect instead
      console.log(
        `[Middleware] No token for ${pathname} on non-navigation (mode=${secFetchMode}, rsc=${isRSC}). Skipping redirect.`,
      )
      return NextResponse.next()
    }

    console.log(
      `[Middleware] No token found for ${pathname}, redirecting to Zitadel`,
    )

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
      // Request roles claim so admin routes can be authorized client-side
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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    })

    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    })

    // Store original destination
    response.cookies.set('redirect_after_login', pathname, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
      path: '/',
    })

    console.log(`[Middleware] Redirecting to Zitadel: ${authUrl.toString()}`)
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
      console.log('[Middleware] Token expired, attempting refresh')
      const url = new URL('/auth/refresh', request.url)
      url.searchParams.set('returnTo', pathname)
      return NextResponse.redirect(url)
    }

    // For /admin routes, check roles
    if (pathname.startsWith('/admin')) {
      // Log roles structure for debugging role-based access
      const rawRoles = decoded['urn:zitadel:iam:org:project:roles'] || null
      console.log('[Middleware] Raw roles claim:', JSON.stringify(rawRoles))
      const roles = extractRoles(decoded)
      console.log('[Middleware] Extracted roles:', roles)
      const hasAdminRole = roles.some(
        (role) => role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN',
      )

      if (!hasAdminRole) {
        console.log(
          '[Middleware] User lacks admin role, redirecting to unauthorized',
        )
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    // Token valid, allow request
    return NextResponse.next()
  } catch (error) {
    console.error('[Middleware] Invalid token:', error)
    const url = new URL('/auth/refresh', request.url)
    url.searchParams.set('returnTo', pathname)
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
