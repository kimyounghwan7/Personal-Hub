import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // In a real application, you would check for a valid session token here
  // e.g. from cookies to ensure the user is authenticated.
  // For now, we are adding this middleware as a foundational security layer
  // to protect routes and prevent authorization bypass issues.
  
  const token = request.cookies.get('sb-access-token');
  
  // Example: Protect the /admin route (checking token exists at Edge)
  // For role-based checks, ideally the JWT contains the role, or we fetch it.
  // Here we just ensure they are logged in if they try to access /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  const response = NextResponse.next();
  
  // Set additional security headers at the middleware level if needed
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

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
