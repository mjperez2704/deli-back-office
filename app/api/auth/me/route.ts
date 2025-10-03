import { handleApiError, ApiResponse } from '@/lib/api-response';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db/connection';
import { eq } from 'drizzle-orm';
import { users } from '@/lib/db/schema';

// Definimos el tipo del payload decodificado del JWT
interface JwtPayload {
    id: number;
    email: string;
    name: string;
    role: 'customer' | 'driver' | 'admin';
}

/**
 * Maneja las solicitudes GET para obtener el perfil del usuario autenticado.
 */
export async function GET(request: NextRequest) {
    try {
        // 1. Obtener el token de la cookie
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return ApiResponse.unauthorized('No autenticado.');
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET no está definido.');
        }

        // 2. Verificar y decodificar el token
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        // 3. Opcional pero recomendado: Verificar que el usuario todavía existe en la BD
        const user = await db.query.users.findFirst({
            where: eq(users.id, decoded.id),
            columns: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
            }
        });

        if (!user) {
            return ApiResponse.unauthorized('El usuario ya no existe.');
        }

        // 4. Devolver los datos del usuario
        return ApiResponse.success(user);
    } catch (error) {
        // El error puede ser por un token expirado o inválido
        if (error instanceof jwt.JsonWebTokenError) {
            return ApiResponse.unauthorized('Token inválido o expirado.');
        }
        return handleApiError(error, 'Error al obtener el perfil de usuario.');
    }
}
