import { type NextRequest, NextResponse } from "next/server"
import { orders } from "@/lib/data/orders"
import { users } from "@/lib/data/users"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getWhatsAppNotificationService } from "@/lib/whatsapp/notifications"

// POST /api/orders/[id]/assign - Asignar repartidor a pedido
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { deliveryPersonId } = body

    if (!deliveryPersonId) {
      return NextResponse.json(errorResponse("ID de repartidor requerido"), {
        status: 400,
      })
    }

    const orderIndex = orders.findIndex((o) => o.id === params.id)

    if (orderIndex === -1) {
      return NextResponse.json(errorResponse("Pedido no encontrado"), {
        status: 404,
      })
    }

    const deliveryPerson = users.find((u) => u.id === deliveryPersonId && u.role === "repartidor")

    if (!deliveryPerson) {
      return NextResponse.json(errorResponse("Repartidor no encontrado"), {
        status: 404,
      })
    }

    orders[orderIndex].deliveryPersonId = deliveryPersonId
    orders[orderIndex].deliveryPersonName = deliveryPerson.name
    orders[orderIndex].status = "en ruta"

    try {
      const customer = users.find((u) => u.id === orders[orderIndex].customerId)
      const whatsappService = getWhatsAppNotificationService()

      // Notificar al cliente que el pedido está en camino
      if (customer) {
        await whatsappService.notifyOrderInTransit(orders[orderIndex], customer, deliveryPerson)
      }

      // Notificar al repartidor de la nueva asignación
      await whatsappService.notifyDeliveryAssigned(orders[orderIndex], deliveryPerson)
    } catch (whatsappError) {
      console.error("[WhatsApp] Failed to send notifications:", whatsappError)
    }

    return NextResponse.json(successResponse(orders[orderIndex], "Repartidor asignado exitosamente"))
  } catch (error) {
    return NextResponse.json(errorResponse("Error al asignar repartidor"), {
      status: 500,
    })
  }
}
