import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/connection";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { handleApiError } from "@/lib/api-response";

const registerSchema = z.object({
  name: z.string().min(3, "El nombre es requerido."),
  email: z.string().email("El email no es válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.formErrors.fieldErrors }, { status: 400 });
    }

    const { name, email, password } = validation.data;

    // Verificar si el usuario ya existe
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return NextResponse.json({ success: false, error: { email: "Este correo electrónico ya está en uso." } }, { status: 409 });
    }

    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const newUser = await db.insert(users).values({
      name,
      email,
      passwordHash,
      role: 'customer', // Asignar rol de cliente por defecto
    });

    return NextResponse.json({ 
        success: true, 
        message: "Usuario registrado exitosamente." 
    }, { status: 201 });

  } catch (error) {
    return handleApiError(error, "Error al registrar el usuario.");
  }
}
