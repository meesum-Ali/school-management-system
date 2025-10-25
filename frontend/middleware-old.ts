import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface DecodedJwtPayload {
  sub: string;
  username: string;
  roles?: string[];
  schoolId?: string | null;
  'urn:zitadel:iam:org:project:roles'?: Record<string, any>;
  'urn:zitadel:iam:org:id'?: string;
  iat?: number;
  exp?: number;
}

const extractRoles = (decoded: DecodedJwtPayload): string[] => {
  if (Array.isArray(decoded.roles)) {
    return decoded.roles;
  }

  const zitadelRoles = decoded['urn:zitadel:iam:org:project:roles'];
  if (zitadelRoles && typeof zitadelRoles === 'object') {
    return Object.keys(zitadelRoles).filter((role) =>
      ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT'].includes(role),
    );
  }

  return [];
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    // Get token from cookie or localStorage (for SSR, we use cookies)
    const token = request.cookies.get('token')?.value;

    if (!token) {
      // No token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const decoded = jwtDecode<DecodedJwtPayload>(token);

      // Check if token is expired
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Check if user has required roles (SUPER_ADMIN or SCHOOL_ADMIN)
      const roles = extractRoles(decoded);
      const hasAdminRole = roles.some(
        (role) => role === 'SUPER_ADMIN' || role === 'SCHOOL_ADMIN'
      );

      if (!hasAdminRole) {
        // User doesn't have permission
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // User is authenticated and authorized
      return NextResponse.next();
    } catch (error) {
      // Invalid token
      console.error('Invalid token in middleware:', error);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
