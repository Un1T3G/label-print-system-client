import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/shared/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, internal Next.js endpoints, and images
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt')
  ) {
    return NextResponse.next();
  }

  // 2. Read and verify session from cookies
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;
  const isAuthenticated = !!session;
  const isAdmin = session?.role === 'ADMIN';

  // 3. Allow authentication API routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 4. API admin routes protection
  if (pathname.startsWith('/api/admin')) {
    // Non-GET requests (POST/PUT/DELETE) require ADMIN role
    if (request.method !== 'GET' && !isAdmin) {
      return NextResponse.json(
        { error: 'Доступ запрещен. Требуются права администратора' },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // 5. Auth page handling (/login)
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/products', request.url));
    }
    return NextResponse.next();
  }

  // 6. Root path redirect
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/products', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 7. Protect dashboard and app routes if user is not authenticated
  const isProtectedPath =
    pathname.startsWith('/products') ||
    pathname.startsWith('/print') ||
    pathname.startsWith('/admin');

  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 8. Role-based route guard:
  // Admin has access to all pages (/admin/*, /products, /print)
  // Consultant can only access /products and /print
  if (pathname.startsWith('/admin')) {
    if (!isAdmin) {
      // Consultant is forbidden from admin routes, redirect to products
      return NextResponse.redirect(new URL('/products', request.url));
    }
  }

  return NextResponse.next();
}

// Support both 'proxy' and 'middleware' export conventions
export const middleware = proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
