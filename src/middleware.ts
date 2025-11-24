import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('Middleware called for:', pathname);
  
  // Skip middleware for root path
  if (pathname === '/') {
    return NextResponse.next();
  }
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/login', 
    '/register', 
    '/api/auth/login', 
    '/api/auth/register', 
    '/api/auth/logout',
    '/test-login'
  ];
  
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Check for token in cookies first, then headers
  const token = request.cookies.get('token')?.value || 
               request.headers.get('authorization')?.replace('Bearer ', '');
               
  console.log('Token exists:', !!token);
  if (token) {
    console.log('Token preview:', token.substring(0, 20) + '...');
  }
  
  if (!token) {
    // Redirect to login for protected routes
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    console.log('Attempting to verify token:', token.substring(0, 50) + '...');
    const payload = verifyToken(token);
    console.log('Token verification successful for:', payload.email);
    
    // Add user info to request headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-role', payload.role);
    
    console.log('Allowing access to:', pathname);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // Invalid token, clear cookie and redirect to login
    console.log('Token verification failed:', error.message);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.ico).*)',
  ],
};