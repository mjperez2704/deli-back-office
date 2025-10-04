// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { jwtVerify } from 'jose';
import { sessionOptions, type SessionData } from './lib/session'; // Importar el tipo
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET ? new TextEncoder().encode(process.env.JWT_SECRET) : undefined;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- 1. PROTEGER RUTAS DE LA API ---
  if (pathname.startsWith('/api/')) {
    const publicApiRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/login-admin', '/api/auth/logout'];
    if (publicApiRoutes.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    if (session.user?.role === 'admin') {
      return NextResponse.next();
    }

    if (!SECRET_KEY) {
      console.error("CRITICAL: JWT_SECRET is not defined in environment variables.");
      return NextResponse.json({ success: false, error: 'Internal Server Configuration Error.' }, { status: 500 });
    }
      
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, error: 'Authentication token not provided.' }, { status: 401 });
    }

    try {
      await jwtVerify(token, SECRET_KEY);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token.' }, { status: 401 });
    }
  }

  // --- 2. PROTEGER PÁGINAS DEL BACK-OFFICE ---
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  const { user } = session;

  if (!user && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  if (user && pathname === '/login') {
     return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
