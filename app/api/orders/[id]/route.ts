import { type NextRequest, NextResponse } from "next/server"
import { getOrderById, updateOrderStatus } from "@/lib/db/queries"

// GET /api/orders/[id] - Obtener pedido por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = Number.parseInt(params.id)

    if (isNaN(orderId)) {
      return NextResponse.json({ success: false, error: "Invalid order ID" }, { status: 400 })
    }

    const { data: order, error } = await getOrderById(orderId)

    if (error) {
      return NextResponse.json({ success: false, error: `Failed to fetch order: ${error}` }, { status: 500 })
    }

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: order })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error(" Error fetching order:", errorMessage)
    return NextResponse.json({ success: false, error: `Server error: ${errorMessage}` }, { status: 500 })
  }
}

// PATCH /api/orders/[id] - Actualizar estado del pedido
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = Number.parseInt(params.id)
    const body = await request.json()
    const { status, notes } = body

    if (isNaN(orderId)) {
      return NextResponse.json({ success: false, error: "Invalid order ID" }, { status: 400 })
    }

    if (!status) {
      return NextResponse.json({ success: false, error: "Status is required" }, { status: 400 })
    }

    const { data: updatedOrder, error } = await updateOrderStatus(orderId, status, notes)

    if (error) {
      return NextResponse.json({ success: false, error: `Failed to update order: ${error}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: updatedOrder })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error(" Error updating order:", errorMessage)
    return NextResponse.json({ success: false, error: `Server error: ${errorMessage}` }, { status: 500 })
  }
}
