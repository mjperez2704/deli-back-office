import { type NextRequest, NextResponse } from "next/server"
import { reassignOrder } from "@/lib/services/order-assignment"

// POST /api/orders/[id]/reassign - Reasignar pedido a otro repartidor
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = Number.parseInt(params.id)
    const body = await request.json()
    const { exclude_driver_id, criteria } = body

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    if (!exclude_driver_id) {
      return NextResponse.json({ error: "exclude_driver_id is required" }, { status: 400 })
    }

    const result = await reassignOrder(orderId, exclude_driver_id, criteria)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      assignment: result,
    })
  } catch (error) {
    console.error(" Error in reassign endpoint:", error)
    return NextResponse.json({ error: "Failed to reassign order" }, { status: 500 })
  }
}
