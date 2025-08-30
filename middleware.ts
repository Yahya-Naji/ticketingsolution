import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/verify-email',
    '/api/send-verification',
    '/api/verify-token'
  ];
  
  // Define routes that require authentication
  const protectedRoutes = [
    '/ideas',
    '/my-ideas', 
    '/my-votes',
    '/pinned',
    '/admin',
    '/profile'
  ];

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If it's a protected route, we'll let the AuthProvider handle authentication
  // The middleware here is just for basic route protection
  if (isProtectedRoute) {
    // In a production app, you might want to check for auth tokens here
    // For now, we'll let the client-side AuthProvider handle the authentication
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};