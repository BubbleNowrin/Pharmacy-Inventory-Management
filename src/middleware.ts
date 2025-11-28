import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function middleware(request: NextRequest) {
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
    '/register-pharmacy',
    '/api/auth/login', 
    '/api/auth/register', 
    '/api/auth/logout',
    '/api/pharmacies',
    '/test-login'
  ];
  
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Check for token in cookies first, then headers
  const token = request.cookies.get('token')?.value || 
               request.headers.get('authorization')?.replace('Bearer ', '');
               
  if (!token) {
    // Redirect to login for protected routes
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    const payload = await verifyToken(token);
    
    console.log('Token payload:', {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      pharmacyId: payload.pharmacyId
    });
    
    // Add user info to request headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-role', payload.role);
    if (payload.pharmacyId) {
      requestHeaders.set('x-pharmacy-id', payload.pharmacyId);
      console.log('Setting x-pharmacy-id header:', payload.pharmacyId);
    } else {
      console.warn('No pharmacyId in token payload for role:', payload.role);
    }
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // Invalid token, clear cookie and redirect to login
    console.error('Token verification error in middleware:', error);
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