import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Ignore well-known requests that Chrome DevTools makes
  if (request.nextUrl.pathname.startsWith('/.well-known/')) {
    return NextResponse.json({ message: 'Not available' }, { status: 404 });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/.well-known/:path*',
};
