import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/session';

// Only run middleware on paths that actually need protection
export const config = {
  matcher: ['/dashboard/:path*'],
};

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  try {
    // Just verify the token exists and is valid without rewriting it on every GET
    await verifyToken(sessionCookie.value);
    return NextResponse.next();
  } catch (error) {
    console.error('Session verification failed:', error);
    const response = NextResponse.redirect(new URL('/sign-in', request.url));
    response.cookies.delete('session');
    return response;
  }
}