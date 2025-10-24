import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

interface DecodedJwtPayload {
  sub: string;
  username: string;
  roles: string[];
  schoolId?: string | null;
  iat?: number;
  exp?: number;
}

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
      const hasAdminRole = decoded.roles.some(
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
