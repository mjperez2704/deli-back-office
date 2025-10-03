import { db } from '@/lib/db/connection';
import { users } from '@/lib/db/schema';
import { handleApiError, ApiResponse } from '@/lib/api-response';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { serialize } from 'cookie';
import { NextApiResponse } from 'next';
import { NextResponse } from 'next/server';

const loginSchema = z.object({
    email: z.string().email('El correo electrónico no es válido.'),
    password: z.string().min(1, 'La contraseña es requerida.'),
});

/**
 * Maneja las solicitudes POST para el inicio de sesión de un usuario.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = loginSchema.safeParse(body);

        if (!validation.success) {
            return ApiResponse.badRequest(validation.error.formErrors.fieldErrors);
        }

        const { email, password } = validation.data;
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new Error('JWT_SECRET no está definido en las variables de entorno.');
        }

        // 1. Buscar al usuario por su correo
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user || !user.passwordHash) {
            return ApiResponse.unauthorized('Credenciales inválidas.');
        }

        // 2. Comparar la contraseña proporcionada con la hasheada
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return ApiResponse.unauthorized('Credenciales inválidas.');
        }

        // 3. Crear el payload del JWT
        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };

        // 4. Firmar el token JWT
        const token = jwt.sign(payload, jwtSecret, {
            expiresIn: '7d', // El token expirará en 7 días
        });

        // 5. Serializar la cookie
        const cookie = serialize('auth_token', token, {
            httpOnly: true,       // El navegador no permite el acceso a la cookie desde JS
            secure: process.env.NODE_ENV !== 'development', // Solo HTTPS en producción
            maxAge: 60 * 60 * 24 * 7, // 1 semana, en segundos
            sameSite: 'strict',   // Mitiga ataques CSRF
            path: '/',            // Disponible en todo el sitio
        });

        // 6. Enviar la respuesta con la cookie en la cabecera
        const response = NextResponse.json({
            success: true,
            message: 'Inicio de sesión exitoso.',
            data: payload,
        });

        response.headers.set('Set-Cookie', cookie);

        return response;

    } catch (error) {
        return handleApiError(error, 'Error al iniciar sesión.');
    }
}
