import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session/edge';
import { jwtVerify } from 'jose';
import { sessionOptions } from './lib/session';

// Clave secreta para JWT, se obtiene de las variables de entorno
const SECRET_KEY = process.env.JWT_SECRET ? new TextEncoder().encode(process.env.JWT_SECRET) : undefined;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- 1. PROTEGER RUTAS DE LA API ---

  if (pathname.startsWith('/api/')) {
    // Rutas de API públicas que no requieren ninguna autenticación
    const publicApiRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/login-admin'];
    if (publicApiRoutes.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // Para todas las demás rutas de la API, se requiere autenticación.
    // Primero, verificamos si hay una sesión de admin activa (cookie).
    const session = await getIronSession(req, NextResponse.next(), sessionOptions);
    if (session.user?.role === 'admin') {
      // Es un admin logueado desde el back-office, tiene acceso total.
      return NextResponse.next();
    }

    // Si no hay sesión, verificamos si hay un Token JWT (para clientes externos).
    if (!SECRET_KEY) {
      console.error("JWT_SECRET no está definida en las variables de entorno.");
      return NextResponse.json({ success: false, error: 'Error de configuración interna del servidor.' }, { status: 500 });
    }
      
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, error: 'Token de autenticación no proporcionado.' }, { status: 401 });
    }

    try {
      // Verificamos la validez del token JWT
      await jwtVerify(token, SECRET_KEY);
      // El token es válido, permitir el acceso a la API.
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Token inválido o expirado.' }, { status: 401 });
    }
  }

  // --- 2. PROTEGER PÁGINAS DEL BACK-OFFICE ---

  // Obtener la sesión para proteger las páginas de la interfaz de usuario
  const session = await getIronSession(req, NextResponse.next(), sessionOptions);
  const { user } = session;

  // Si el usuario no ha iniciado sesión y no está intentando acceder a la página de login,
  // lo redirigimos a la página de login.
  if (!user && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Si el usuario ya ha iniciado sesión y está intentando acceder a la página de login,
  // lo redirigimos a la página principal del dashboard.
  if (user && pathname === '/login') {
     return NextResponse.redirect(new URL('/', req.url));
  }

  // Si ninguna de las condiciones anteriores se cumple, permitir el acceso a la página.
  return NextResponse.next();
}

// Configuración del matcher: El middleware se ejecutará en TODAS las rutas
// excepto los archivos estáticos de Next.js y el favicon.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
