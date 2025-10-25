// app/auth/logout/route.ts
// Clears auth cookies and redirects to root

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const resp = NextResponse.redirect(new URL('/', request.url))
  resp.cookies.delete('token')
  resp.cookies.delete('id_token')
  resp.cookies.delete('refresh_token')
  resp.cookies.delete('pkce_verifier')
  resp.cookies.delete('oauth_state')
  resp.cookies.delete('redirect_after_login')
  return resp
}
