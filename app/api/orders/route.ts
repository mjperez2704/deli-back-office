import { NextResponse } from "next/server";
import { getAllOrders, createOrder } from "@/lib/db/queries";
import { handleApiError, ApiResponse } from "@/lib/api-response";
import { z } from "zod";

// Esquema para validar la creación de un nuevo pedido
const createOrderSchema = z.object({
  customerId: z.number().int("ID de cliente inválido."),
  storeId: z.number().int("ID de tienda inválido."),
  deliveryAddressId: z.number().int("ID de dirección de entrega inválido."),
  paymentMethod: z.enum(["cash", "credit_card", "paypal"]),
  notes: z.string().optional(),
  // Los items del pedido: un array de objetos con productId y quantity
  items: z
    .array(
      z.object({
        productId: z.number().int(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "El pedido debe tener al menos un artículo."),
});

/**
 * Maneja las solicitudes GET para obtener todos los pedidos.
 * Se pueden añadir filtros por query params, ej: /api/orders?status=pending
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const { data, error } = await getAllOrders(status || undefined);

    if (error) {
      return ApiResponse.error(error, 500);
    }

    return ApiResponse.success(data);
  } catch (error) {
    return handleApiError(error, "Error al obtener los pedidos.");
  }
}

/**
 * Maneja las solicitudes POST para crear un nuevo pedido.
 * Utiliza una transacción para garantizar la integridad de los datos.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.badRequest(validation.error.formErrors.fieldErrors);
    }

    // createOrder ahora maneja toda la lógica de validación de productos y creación en la base de datos
    const { data: newOrder, error } = await createOrder(validation.data);

    if (error) {
      // Si el error es el que lanzamos manualmente, es un badRequest.
      if (error.includes("Algunos productos no existen")) {
        return ApiResponse.badRequest({ items: error });
      }
      return ApiResponse.error(error, 500);
    }

    return ApiResponse.created(newOrder);
  } catch (error) {
    return handleApiError(error, "Error al crear el pedido.");
  }
}
