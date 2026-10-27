import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  verifySessionToken,
  createSessionToken,
  SESSION_COOKIE_NAME,
  DEFAULT_CONSULTANT_USER,
} from '@/shared/auth';

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

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

  // Helper: Attach consultant session cookie to a response
  const setConsultantCookie = async (res: NextResponse) => {
    const consultantToken = await createSessionToken(DEFAULT_CONSULTANT_USER);
    res.cookies.set(SESSION_COOKIE_NAME, consultantToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  };

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

  // 5. Allow other API routes to process directly
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 6. Auth page handling (/login)
  // When explicitly summoned via console command admin() (with ?admin=1 or ?role=admin),
  // allow viewing the login page regardless of current consultant session
  const hasAdminQuery = searchParams.has('admin') || searchParams.get('role') === 'admin';
  if (pathname === '/login') {
    if (hasAdminQuery) {
      return NextResponse.next();
    }
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/templates', request.url));
    }
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/products', request.url));
    }
    // First time visitor: automatically log in as consultant without showing login
    const res = NextResponse.redirect(new URL('/products', request.url));
    return await setConsultantCookie(res);
  }

  // 7. Root path redirect
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/products', request.url));
    }
    const res = NextResponse.redirect(new URL('/products', request.url));
    return await setConsultantCookie(res);
  }

  // 8. Auto-authenticate first-time visitors as consultant on any app page
  if (!isAuthenticated) {
    const targetPath = pathname.startsWith('/admin') ? '/products' : pathname;
    const res = NextResponse.redirect(new URL(targetPath, request.url));
    return await setConsultantCookie(res);
  }

  // 9. Role-based route guard:
  // Admin has access to all pages (/admin/*, /products, /print)
  // Consultant cannot access /admin/*, redirect to /products
  if (pathname.startsWith('/admin')) {
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/products', request.url));
    }
  }

  return NextResponse.next();
}

// Support both 'proxy' and 'middleware' export conventions
export const middleware = proxy;
export default proxy;

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
