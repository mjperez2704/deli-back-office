import { db } from '@/lib/db/connection';
// TODO: No se ha podido encontrar el fichero 'schema.ts'.
// Por favor, comprueba que la siguiente importación es correcta y que el fichero existe.
import { stores } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { handleApiError, ApiResponse } from '@/lib/api-response';
import { z } from 'zod';

// Esquema para actualizar una tienda (todos los campos son opcionales)
const updateStoreSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.').optional(),
    address: z.string().min(10, 'La dirección debe tener al menos 10 caracteres.').optional(),
    phone: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos.').optional(),
});

// Función auxiliar para buscar una tienda por ID
async function getStoreById(id: number) {
    // Asumimos que `db.query.stores` existe. Si `stores` no se importa correctamente, esto fallará en tiempo de ejecución.
    const store = await db.query.stores.findFirst({ where: eq(stores.id, id) });
    if (!store) {
        throw new Error('Tienda no encontrada.');
    }
    return store;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        const store = await getStoreById(id);
        return ApiResponse.success(store);
    } catch (error) {
        if (error instanceof Error && error.message === 'Tienda no encontrada.') {
            return ApiResponse.notFound(error.message);
        }
        return handleApiError(error, 'Error al obtener la tienda.');
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        await getStoreById(id); // Verificar que la tienda existe

        const body = await request.json();
        const validation = updateStoreSchema.safeParse(body);

        if (!validation.success) {
            return ApiResponse.badRequest(validation.error.formErrors.fieldErrors);
        }

        const updatedStore = await db
            .update(stores)
            .set(validation.data)
            .where(eq(stores.id, id))
            .returning();

        return ApiResponse.success(updatedStore[0]);
    } catch (error) {
        if (error instanceof Error && error.message === 'Tienda no encontrada.') {
            return ApiResponse.notFound(error.message);
        }
        return handleApiError(error, 'Error al actualizar la tienda.');
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        await getStoreById(id); // Verificar que la tienda existe

        await db.delete(stores).where(eq(stores.id, id));
        return ApiResponse.noContent();
    } catch (error) {
        if (error instanceof Error && error.message === 'Tienda no encontrada.') {
            return ApiResponse.notFound(error.message);
        }
        return handleApiError(error, 'Error al eliminar la tienda.');
    }
}
