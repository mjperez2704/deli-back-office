import { db } from '@/lib/db/connection';
import { users } from '@/lib/db/schema';
import { handleApiError, ApiResponse } from '@/lib/api-response';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

// Esquema de validación para los datos del nuevo usuario
const registerSchema = z.object({
    name: z.string().min(3, 'El nombre es requerido.'),
    email: z.string().email('El correo electrónico no es válido.'),
    phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos.'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    // El rol debe ser uno de los permitidos en tu base de datos
    role: z.enum(['customer', 'driver', 'admin']),
});

/**
 * Maneja las solicitudes POST para registrar un nuevo usuario.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = registerSchema.safeParse(body);

        if (!validation.success) {
            return ApiResponse.badRequest(validation.error.formErrors.fieldErrors);
        }

        const { email, password, name, phone, role } = validation.data;

        // 1. Verificar si el usuario ya existe
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (existingUser) {
            return ApiResponse.conflict('Ya existe un usuario con este correo electrónico.');
        }

        // 2. Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 12);

        // 3. Crear el nuevo usuario en la base de datos
        const newUser = await db
            .insert(users)
            .values({
                email,
                passwordHash: hashedPassword,
                name,
                phone,
                role,
            })
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
            });

        // 4. Devolver una respuesta exitosa
        return ApiResponse.created(newUser[0]);
    } catch (error) {
        return handleApiError(error, 'Error al registrar el usuario.');
    }
}
