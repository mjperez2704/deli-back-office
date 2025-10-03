import { NextResponse } from "next/server";
import { getAllProducts, createProduct } from "@/lib/db/queries";
import { handleApiError, ApiResponse } from "@/lib/api-response";
import { z } from "zod";

// Esquema de validación para un nuevo producto
const createProductSchema = z.object({
  name: z.string().min(3, "El nombre del producto es requerido."),
  description: z.string().optional(),
  price: z.number().positive("El precio debe ser un número positivo."),
  storeId: z.number().int("Se requiere el ID de la tienda."),
  imageUrl: z.string().url("URL de imagen no válida.").optional(),
  sku: z.string().optional(),
  stock: z.number().int().positive().optional(),
  isAvailable: z.boolean().optional(),
});

/**
 * Maneja las solicitudes GET para obtener todos los productos.
 * Permite filtrar por storeId a través de query params (ej: /api/products?storeId=1)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeIdParam = searchParams.get("storeId");
    const storeId = storeIdParam ? Number(storeIdParam) : undefined;

    if (storeIdParam && isNaN(storeId as number)) {
      return ApiResponse.badRequest({
        storeId: "ID de tienda inválido en los parámetros de consulta.",
      });
    }

    const { data: allProducts, error } = await getAllProducts(storeId);

    if (error) {
      return ApiResponse.error(error, 500);
    }

    return ApiResponse.success(allProducts);
  } catch (error) {
    return handleApiError(error, "Error al obtener los productos.");
  }
}

/**
 * Maneja las solicitudes POST para crear un nuevo producto.\n * */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createProductSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.badRequest(validation.error.formErrors.fieldErrors);
    }

    const { data: newProduct, error } = await createProduct(validation.data);

    if (error) {
      // Maneja errores de llave foránea (ej: si storeId no existe)
      if (error.includes("a foreign key constraint fails")) {
        return ApiResponse.badRequest({
          storeId: "La tienda especificada no existe.",
        });
      }
      return ApiResponse.error(error, 500);
    }

    return ApiResponse.created(newProduct);
  } catch (error) {
    return handleApiError(error, "Error al crear el producto.");
  }
}
