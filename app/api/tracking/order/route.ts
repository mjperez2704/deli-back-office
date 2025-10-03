import { type NextRequest, NextResponse } from "next/server"
import { updateOrderStatus } from "@/lib/db/queries"

// POST /api/tracking/order - Actualizar estado de orden y broadcast
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id, status, notes, driver_location, estimated_arrival } = body

    if (!order_id || !status) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    // Actualizar en base de datos
    const { data: order, error } = await updateOrderStatus(order_id, status, notes)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    // En producción, broadcast via WebSocket
    // wsServer.broadcast(`order:${order_id}`, {
    //   type: 'order_status_update',
    //   payload: { order_id, status, driver_location, estimated_arrival },
    //   timestamp: Date.now()
    // })
    //
    // wsServer.broadcastToBackoffice({
    //   type: 'order_status_update',
    //   payload: { order_id, status },
    //   timestamp: Date.now()
    // })

    return NextResponse.json({
      success: true,
      order,
      broadcasted: true,
    })
  } catch (error) {
    console.error(" Error updating order status:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
