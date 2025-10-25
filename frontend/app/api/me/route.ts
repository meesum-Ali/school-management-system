// app/api/me/route.ts
// Server API route to expose authenticated user info from httpOnly cookies

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtDecode } from 'jwt-decode'

type UserRole = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT'

interface DecodedJwtPayload {
  sub: string
  email?: string
  preferred_username?: string
  username?: string
  name?: string
  roles?: UserRole[]
  'urn:zitadel:iam:org:project:roles'?: Record<string, unknown>
  'urn:zitadel:iam:org:id'?: string
  schoolId?: string | null
  iat?: number
  exp?: number
}

function extractRoles(decoded: DecodedJwtPayload): UserRole[] {
  if (Array.isArray(decoded.roles)) return decoded.roles as UserRole[]
  const zitadelRoles = decoded['urn:zitadel:iam:org:project:roles']
  if (zitadelRoles && typeof zitadelRoles === 'object') {
    return Object.keys(zitadelRoles).filter((r) =>
      ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT'].includes(r),
    ) as UserRole[]
  }
  return []
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const cookieStore = await cookies()
  const idToken = cookieStore.get('id_token')?.value
  const accessToken = cookieStore.get('token')?.value
  const token = idToken || accessToken

  if (!token) {
    return NextResponse.json(
      { isAuthenticated: false, user: null },
      { status: 401 },
    )
  }

  try {
    const decoded = jwtDecode<DecodedJwtPayload>(token)
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return NextResponse.json(
        { isAuthenticated: false, user: null },
        { status: 401 },
      )
    }
    const username =
      decoded.username ||
      decoded.preferred_username ||
      decoded.email ||
      'Unknown'
    const roles = extractRoles(decoded)
    const schoolId =
      decoded.schoolId || decoded['urn:zitadel:iam:org:id'] || null

    return NextResponse.json({
      isAuthenticated: true,
      user: {
        id: decoded.sub,
        username,
        roles,
        schoolId,
      },
    })
  } catch {
    return NextResponse.json(
      { isAuthenticated: false, user: null },
      { status: 401 },
    )
  }
}
