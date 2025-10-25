// app/auth/refresh/route.ts
// Server-side token refresh endpoint using refresh_token cookie

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ZITADEL_CONFIG } from '@/lib/auth/config'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const refreshToken = cookieStore.get('refresh_token')?.value
    const returnTo = request.nextUrl.searchParams.get('returnTo') || '/'

    if (!refreshToken) {
      // No refresh available; go through full auth
      return NextResponse.redirect(new URL('/', request.url))
    }

    const tokenResponse = await fetch(
      `${ZITADEL_CONFIG.issuer}/oauth/v2/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: ZITADEL_CONFIG.clientId,
          refresh_token: refreshToken,
        }),
      },
    )

    if (!tokenResponse.ok) {
      // Refresh failed; clear cookies and go to root (middleware will redirect to Zitadel)
      const resp = NextResponse.redirect(new URL('/', request.url))
      resp.cookies.delete('token')
      resp.cookies.delete('id_token')
      resp.cookies.delete('refresh_token')
      return resp
    }

    const tokenData = await tokenResponse.json()
    const { access_token, id_token, refresh_token, expires_in } = tokenData

    const resp = NextResponse.redirect(new URL(returnTo, request.url))

    const maxAge = typeof expires_in === 'number' ? expires_in : 3600
    resp.cookies.set('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    })

    if (id_token) {
      resp.cookies.set('id_token', id_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge,
        path: '/',
      })
    }

    if (refresh_token) {
      const refreshMaxAge = 60 * 60 * 24 * 30
      resp.cookies.set('refresh_token', refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: refreshMaxAge,
        path: '/',
      })
    }

    return resp
  } catch {
    const resp = NextResponse.redirect(new URL('/', request.url))
    resp.cookies.delete('token')
    resp.cookies.delete('id_token')
    resp.cookies.delete('refresh_token')
    return resp
  }
}
