import { type NextRequest, NextResponse } from "next/server"
import { orders } from "@/lib/data/orders"
import { users } from "@/lib/data/users"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getWhatsAppNotificationService } from "@/lib/whatsapp/notifications"
import type { OrderStatus } from "@/lib/types"

// PATCH /api/orders/[id]/status - Actualizar estado del pedido
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status } = body as { status: OrderStatus }

    if (!status) {
      return NextResponse.json(errorResponse("Estado requerido"), {
        status: 400,
      })
    }

    const orderIndex = orders.findIndex((o) => o.id === params.id)

    if (orderIndex === -1) {
      return NextResponse.json(errorResponse("Pedido no encontrado"), {
        status: 404,
      })
    }

    const previousStatus = orders[orderIndex].status
    orders[orderIndex].status = status

    try {
      const customer = users.find((u) => u.id === orders[orderIndex].customerId)
      if (customer) {
        const whatsappService = getWhatsAppNotificationService()

        // Notificar entrega completada
        if (status === "entregado") {
          await whatsappService.notifyOrderDelivered(orders[orderIndex], customer)
        }
        // Notificar cambio de estado general
        else if (previousStatus !== status) {
          await whatsappService.notifyOrderStatusUpdated(orders[orderIndex], customer, status)
        }
      }
    } catch (whatsappError) {
      console.error("[WhatsApp] Failed to send notification:", whatsappError)
    }

    return NextResponse.json(successResponse(orders[orderIndex], "Estado actualizado exitosamente"))
  } catch (error) {
    return NextResponse.json(errorResponse("Error al actualizar estado"), {
      status: 500,
    })
  }
}
