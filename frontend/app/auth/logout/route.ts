// app/auth/logout/route.ts
// Clears auth cookies and redirects to root

import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Use localhost for redirect to avoid 0.0.0.0 issue
  const redirectUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost'
  const resp = NextResponse.redirect(redirectUrl)
  
  resp.cookies.delete('token')
  resp.cookies.delete('id_token')
  resp.cookies.delete('refresh_token')
  resp.cookies.delete('pkce_verifier')
  resp.cookies.delete('oauth_state')
  resp.cookies.delete('redirect_after_login')
  
  return resp
}
