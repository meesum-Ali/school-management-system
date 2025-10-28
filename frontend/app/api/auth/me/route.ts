// app/api/auth/me/route.ts
// Returns current user info from token cookies

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtDecode } from 'jwt-decode'

export const dynamic = 'force-dynamic'

interface DecodedToken {
  sub: string
  email?: string
  preferred_username?: string
  name?: string
  'urn:zitadel:iam:org:project:roles'?: Record<string, any>
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const idToken = cookieStore.get('id_token')?.value
    const accessToken = cookieStore.get('token')?.value

    const token = idToken || accessToken
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const decoded = jwtDecode<DecodedToken>(token)

    // Extract roles
    const rolesClaim = decoded['urn:zitadel:iam:org:project:roles'] || {}
    const roles = Object.keys(rolesClaim)

    return NextResponse.json({
      authenticated: true,
      user: {
        id: decoded.sub,
        email: decoded.email,
        username: decoded.preferred_username || decoded.email,
        name: decoded.name,
        roles,
      },
    })
  } catch (error) {
    console.error('Error decoding token:', error)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
