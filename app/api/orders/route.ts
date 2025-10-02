import { type NextRequest, NextResponse } from "next/server"
import { orders } from "@/lib/data/orders"
import { users } from "@/lib/data/users"
import { getWhatsAppNotificationService } from "@/lib/whatsapp/notifications"
import { successResponse, errorResponse } from "@/lib/api-response"
import type { Order } from "@/lib/types"

// GET /api/orders - Obtener todos los pedidos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const customerId = searchParams.get("customerId")

    let filteredOrders = [...orders]

    if (status) {
      filteredOrders = filteredOrders.filter((o) => o.status === status)
    }

    if (customerId) {
      filteredOrders = filteredOrders.filter((o) => o.customerId === customerId)
    }

    return NextResponse.json(successResponse(filteredOrders))
  } catch (error) {
    return NextResponse.json(errorResponse("Error al obtener pedidos"), {
      status: 500,
    })
  }
}

// POST /api/orders - Crear nuevo pedido
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerId, customerName, items, address } = body

    if (!customerId || !customerName || !items || !address) {
      return NextResponse.json(errorResponse("Faltan campos requeridos"), {
        status: 400,
      })
    }

    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      customerId,
      customerName,
      items,
      total,
      status: "pagado",
      deliveryAddress: address,
      createdAt: new Date().toISOString(),
    }

    orders.push(newOrder)

    try {
      const customer = users.find((u) => u.id === customerId)
      if (customer) {
        const whatsappService = getWhatsAppNotificationService()
        await whatsappService.notifyOrderCreated(newOrder, customer)
      }
    } catch (whatsappError) {
      console.error("[WhatsApp] Failed to send notification:", whatsappError)
      // No fallar la creación del pedido si falla WhatsApp
    }

    return NextResponse.json(successResponse(newOrder, "Pedido creado exitosamente"), {
      status: 201,
    })
  } catch (error) {
    return NextResponse.json(errorResponse("Error al crear pedido"), {
      status: 500,
    })
  }
}
