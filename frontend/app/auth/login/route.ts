// app/auth/login/route.ts
// Initiates OAuth flow with Zitadel using PKCE

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ZITADEL_CONFIG } from '@/lib/auth/config'

export const dynamic = 'force-dynamic'

// Generate random string for PKCE and state
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  let result = ''
  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length]
  }
  return result
}

// Generate PKCE challenge from verifier
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const base64 = Buffer.from(hash).toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const redirectAfterLogin = searchParams.get('redirect') || '/admin/dashboard'

  // Generate PKCE verifier and state
  const codeVerifier = generateRandomString(128)
  const state = generateRandomString(32)
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  // Store in httpOnly cookies
  const cookieStore = await cookies()
  const response = NextResponse.redirect(
    new URL(
      `${ZITADEL_CONFIG.issuer}/oauth/v2/authorize?` +
        new URLSearchParams({
          client_id: ZITADEL_CONFIG.clientId,
          redirect_uri: ZITADEL_CONFIG.redirectUri,
          response_type: 'code',
          scope: ZITADEL_CONFIG.scope,
          state: state,
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
        }),
    ),
  )

  // Set PKCE cookies
  response.cookies.set('pkce_verifier', codeVerifier, {
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
    maxAge: 600,
    path: '/',
  })

  response.cookies.set('redirect_after_login', redirectAfterLogin, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  return response
}
