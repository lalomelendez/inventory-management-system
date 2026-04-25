import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Check if the user has a token
  const token = request.cookies.get('token')?.value;

  // 2. Identify the route they are trying to access
  // We want to protect the root / and any /products, /create, etc.
  // But we must NOT protect /login or files inside _next/static, etc.
  const isTryingToAccessSecureRoute = 
    request.nextUrl.pathname === '/' || 
    request.nextUrl.pathname.startsWith('/products') || 
    request.nextUrl.pathname.startsWith('/create');

  // 3. If they want a secure route but have no token, bounce them to login
  if (isTryingToAccessSecureRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. If they have a token and try to visit login, send them home
  if (request.nextUrl.pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Otherwise, let them proceed
  return NextResponse.next();
}

// Optimize middleware to only run on relevant routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
