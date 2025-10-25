// app/auth/callback/route.ts
// Server-side OAuth callback handler for Zitadel
// Exchanges authorization code for access token

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ZITADEL_CONFIG } from '@/lib/auth/config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Get host information for proper redirects (declared once at the top)
  const host = request.headers.get('host') || 'localhost'
  const protocol =
    request.headers.get('x-forwarded-proto') ||
    (host.includes('localhost') ? 'http' : 'https')
  const baseUrl = `${protocol}://${host}`

  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    console.log('=== CALLBACK HANDLER (SERVER) ===')
    console.log('Code present:', !!code)
    console.log('State present:', !!state)
    console.log('Error:', error)

    // Handle OAuth errors from Zitadel
    if (error) {
      console.error('OAuth error from Zitadel:', error)
      return NextResponse.redirect(
        `${baseUrl}/unauthorized?error=${encodeURIComponent(error)}`,
      )
    }

    // Validate required parameters
    if (!code || !state) {
      console.error('Missing code or state parameter')
      return NextResponse.redirect(
        `${baseUrl}/unauthorized?error=missing_parameters`,
      )
    }

    // Get stored PKCE verifier and state from cookies
    const cookieStore = await cookies()
    const storedVerifier = cookieStore.get('pkce_verifier')?.value
    const storedState = cookieStore.get('oauth_state')?.value
    const redirectAfterLogin =
      cookieStore.get('redirect_after_login')?.value || '/admin/dashboard'

    console.log('Stored verifier present:', !!storedVerifier)
    console.log('Stored state present:', !!storedState)
    console.log('Received state:', state)
    console.log('Stored state:', storedState)
    console.log('State match:', state === storedState)

    // Validate state (CSRF protection)
    if (state !== storedState) {
      console.error('State mismatch! Possible CSRF attack')
      console.error('Expected:', storedState)
      console.error('Received:', state)
      return NextResponse.redirect(
        `${baseUrl}/unauthorized?error=invalid_state`,
      )
    }

    // Validate verifier exists
    if (!storedVerifier) {
      console.error('PKCE verifier not found in cookies')
      return NextResponse.redirect(
        `${baseUrl}/unauthorized?error=missing_verifier`,
      )
    }

    // Exchange authorization code for tokens
    // With Nginx proxy, the issuer is consistent for both browser and server
    console.log('Exchanging code for tokens...')
    console.log('Token endpoint:', `${ZITADEL_CONFIG.issuer}/oauth/v2/token`)

    const tokenResponse = await fetch(
      `${ZITADEL_CONFIG.issuer}/oauth/v2/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: ZITADEL_CONFIG.redirectUri,
          client_id: ZITADEL_CONFIG.clientId,
          code_verifier: storedVerifier,
        }),
      },
    )

    console.log('Token response status:', tokenResponse.status)

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token exchange failed:', errorText)

      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error_description: errorText }
      }

      return NextResponse.redirect(
        `${baseUrl}/unauthorized?error=${encodeURIComponent(errorData.error_description || 'token_exchange_failed')}`,
      )
    }

    const tokenData = await tokenResponse.json()
    const { access_token, id_token, refresh_token, expires_in } = tokenData

    console.log('Token exchange successful!')
    console.log('Access token present:', !!access_token)
    console.log('ID token present:', !!id_token)
    console.log('Expires in:', expires_in)

    // Create response with redirect
    // Construct the redirect URL using the host from the request headers to avoid 0.0.0.0 issues
    const redirectUrl = `${baseUrl}${redirectAfterLogin}`

    console.log('Redirect URL:', redirectUrl)

    const response = NextResponse.redirect(redirectUrl)

    // Set secure HTTP-only cookies
    const maxAge = expires_in || 604800 // 7 days default

    response.cookies.set('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: maxAge,
      path: '/',
    })

    if (id_token) {
      response.cookies.set('id_token', id_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: maxAge,
        path: '/',
      })
    }

    // Persist refresh token if provided (for silent renewal)
    if (refresh_token) {
      // Per OAuth best practices, store refresh token as httpOnly cookie
      // Use a conservative maxAge (e.g., 30 days) unless token response specifies otherwise
      const refreshMaxAge = 60 * 60 * 24 * 30 // 30 days
      response.cookies.set('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: refreshMaxAge,
        path: '/',
      })
    }

    // Clean up PKCE cookies
    response.cookies.delete('pkce_verifier')
    response.cookies.delete('oauth_state')
    response.cookies.delete('redirect_after_login')

    console.log('Redirecting to:', redirectAfterLogin)
    console.log('=================================')

    return response
  } catch (error) {
    console.error('Unexpected error in callback handler:', error)
    return NextResponse.redirect(`${baseUrl}/unauthorized?error=server_error`)
  }
}
