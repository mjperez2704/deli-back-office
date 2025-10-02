import { type NextRequest, NextResponse } from "next/server"
import { deliveries } from "@/lib/data/deliveries"
import { successResponse, errorResponse } from "@/lib/api-response"

// GET /api/deliveries/[orderId] - Obtener seguimiento de entrega por ID de pedido
export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const delivery = deliveries.find((d) => d.orderId === params.orderId)

    if (!delivery) {
      return NextResponse.json(errorResponse("Entrega no encontrada"), {
        status: 404,
      })
    }

    return NextResponse.json(successResponse(delivery))
  } catch (error) {
    return NextResponse.json(errorResponse("Error al obtener entrega"), {
      status: 500,
    })
  }
}

// PATCH /api/deliveries/[orderId] - Actualizar ubicación y progreso de entrega
export async function PATCH(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const body = await request.json()
    const deliveryIndex = deliveries.findIndex((d) => d.orderId === params.orderId)

    if (deliveryIndex === -1) {
      return NextResponse.json(errorResponse("Entrega no encontrada"), {
        status: 404,
      })
    }

    deliveries[deliveryIndex] = {
      ...deliveries[deliveryIndex],
      ...body,
    }

    return NextResponse.json(successResponse(deliveries[deliveryIndex], "Entrega actualizada exitosamente"))
  } catch (error) {
    return NextResponse.json(errorResponse("Error al actualizar entrega"), {
      status: 500,
    })
  }
}
