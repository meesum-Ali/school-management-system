import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'

interface DecodedToken {
  sub: string
  email?: string
  'urn:zitadel:iam:org:project:roles'?: Record<string, any>
  'urn:zitadel:iam:org:id'?: string
  exp?: number
}

function extractRoles(decoded: DecodedToken): string[] {
  const rolesObj = decoded['urn:zitadel:iam:org:project:roles'] || {}
  return Object.keys(rolesObj)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value || request.cookies.get('id_token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    try {
      const decoded = jwtDecode<DecodedToken>(token)

      // Check expiration
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Check roles
      const roles = extractRoles(decoded)
      const hasAccess = roles.some(r => r === 'SUPER_ADMIN' || r === 'SCHOOL_ADMIN')

      if (!hasAccess) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      // ✅ Auth validated - allow through and add custom headers for server components
      const response = NextResponse.next()
      response.headers.set('x-user-token', token)
      response.headers.set('x-user-roles', roles.join(','))
      if (decoded['urn:zitadel:iam:org:id']) {
        response.headers.set('x-user-school-id', decoded['urn:zitadel:iam:org:id'])
      }
      return response
    } catch (error) {
      console.error('Token validation failed:', error)
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
