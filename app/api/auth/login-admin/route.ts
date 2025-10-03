// app/api/auth/login-admin/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

import { db } from '@/lib/db/connection';
import { users } from '@/lib/db/schema';
import { sessionOptions } from '@/lib/session';
import { handleApiError } from '@/lib/api-response';

const loginSchema = z.object({
  email: z.string().email('El email no es válido.'),
  password: z.string().min(1, 'La contraseña es requerida.'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: 'Datos de entrada inválidos.' }, { status: 400 });
    }

    const { email, password } = validation.data;

    // 1. Buscar al usuario
    const userResult = await db.select().from(users).where(eq(users.email, email));
    if (userResult.length === 0) {
      return NextResponse.json({ success: false, error: 'Credenciales inválidas.' }, { status: 401 });
    }
    const user = userResult[0];

    // 2. Verificar que el usuario sea administrador
    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Acceso no autorizado.' }, { status: 403 });
    }

    // 3. Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash || '');
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: 'Credenciales inválidas.' }, { status: 401 });
    }
    
    // 4. Crear la sesión
    const session = await getIronSession(cookies(), sessionOptions);
    session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    await session.save();

    // Excluimos el hash de la contraseña de la respuesta
    const { passwordHash, ...userResponse } = user;

    return NextResponse.json({ success: true, user: userResponse });
  } catch (error) {
    return handleApiError(error, 'Error al iniciar sesión.');
  }
}
