import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db/connection";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { handleApiError } from "@/lib/api-response";

const loginSchema = z.object({
  email: z.string().email("El email no es válido."),
  password: z.string().min(1, "La contraseña es requerida."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.formErrors.fieldErrors }, { status: 400 });
    }

    const { email, password } = validation.data;

    // Buscar al usuario por su email
    const userResult = await db.select().from(users).where(eq(users.email, email));
    
    if (userResult.length === 0) {
      return NextResponse.json({ success: false, error: "Credenciales inválidas." }, { status: 401 });
    }

    const user = userResult[0];

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash || "");
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: "Credenciales inválidas." }, { status: 401 });
    }

    // Generar el token JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("La clave secreta JWT no está configurada en las variables de entorno.");
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      secret,
      { expiresIn: "1d" } // El token expira en 1 día
    );

    return NextResponse.json({ success: true, token });

  } catch (error) {
    return handleApiError(error, "Error al iniciar sesión.");
  }
}
