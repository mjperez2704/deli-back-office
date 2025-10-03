import { db } from '@/lib/db/connection';
import { products } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { handleApiError, ApiResponse } from '@/lib/api-response';
import { z } from 'zod';

// Esquema para actualizar un producto (campos opcionales)
const updateProductSchema = z.object({
    name: z.string().min(3, 'El nombre del producto es requerido.').optional(),
    description: z.string().optional(),
    price: z.number().positive('El precio debe ser un número positivo.').optional(),
    imageUrl: z.string().url('URL de imagen no válida.').optional(),
    // No permitimos cambiar el storeId de un producto
});

// Función auxiliar para buscar un producto por ID
async function getProductById(id: number) {
    const product = await db.query.products.findFirst({ where: eq(products.id, id) });
    if (!product) {
        throw new Error('Producto no encontrado.');
    }
    return product;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        const product = await getProductById(id);
        return ApiResponse.success(product);
    } catch (error) {
        if (error.message === 'Producto no encontrado.') {
            return ApiResponse.notFound(error.message);
        }
        return handleApiError(error, 'Error al obtener el producto.');
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        await getProductById(id); // Verificar que el producto existe

        const body = await request.json();
        const validation = updateProductSchema.safeParse(body);

        if (!validation.success) {
            return ApiResponse.badRequest(validation.error.formErrors.fieldErrors);
        }

        const updatedProduct = await db
            .update(products)
            .set(validation.data)
            .where(eq(products.id, id))
            .returning();

        return ApiResponse.success(updatedProduct[0]);
    } catch (error) {
        if (error.message === 'Producto no encontrado.') {
            return ApiResponse.notFound(error.message);
        }
        return handleApiError(error, 'Error al actualizar el producto.');
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id);
        await getProductById(id); // Verificar que el producto existe

        await db.delete(products).where(eq(products.id, id));
        return ApiResponse.noContent();
    } catch (error) {
        if (error.message === 'Producto no encontrado.') {
            return ApiResponse.notFound(error.message);
        }
        return handleApiError(error, 'Error al eliminar el producto.');
    }
}
