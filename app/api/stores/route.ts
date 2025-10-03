import { db } from '@/lib/db/connection';
import { stores } from '@/lib/db/schema';
import { handleApiError, ApiResponse } from '@/lib/api-response';
import { z } from 'zod';

// Esquema de validación para los datos de una nueva tienda
const createStoreSchema = z.object({
    name: z.string().min(3, 'El nombre de la tienda es requerido.'),
    address: z.string().min(10, 'La dirección es requerida.'),
    phone: z.string().min(10, 'El teléfono es requerido.'),
    // Puedes agregar más campos como 'latitude', 'longitude', etc.
});

/**
 * Maneja las solicitudes GET para obtener todas las tiendas.
 */
export async function GET() {
    try {
        const allStores = await db.select().from(stores);
        return ApiResponse.success(allStores);
    } catch (error) {
        return handleApiError(error, 'Error al obtener las tiendas.');
    }
}

/**
 * Maneja las solicitudes POST para crear una nueva tienda.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = createStoreSchema.safeParse(body);

        if (!validation.success) {
            return ApiResponse.badRequest(validation.error.formErrors.fieldErrors);
        }

        const { name, address, phone } = validation.data;

        const newStore = await db
            .insert(stores)
            .values({
                name,
                address,
                phone,
            })
            .returning();

        return ApiResponse.created(newStore[0]);
    } catch (error) {
        return handleApiError(error, 'Error al crear la tienda.');
    }
}
