import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1]

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Token de autenticación no proporcionado.' },
      { status: 401 }
    )
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    // Opcional: Adjuntar el payload del token a la solicitud para uso en las rutas
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-user-payload', JSON.stringify(payload))

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        }
    })
  } catch (error) {
    let errorMessage = 'Token inválido o expirado.'
    if (error instanceof Error) {
        if (error.name === 'JWTExpired') {
            errorMessage = 'El token ha expirado.';
        } else if (error.name === 'JWSInvalid') {
            errorMessage = 'El token tiene un formato inválido.';
        }
    }
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 401 }
    )
  }
}

// Configuración del matcher para proteger rutas específicas
export const config = {
  matcher: [
    '/api/products/:path*',
    '/api/orders/:path*',
    '/api/customers/:path*',
    '/api/drivers/:path*',
    // Excluir rutas de autenticación
    // '/api/auth/login',
    // '/api/auth/register',
  ],
}
