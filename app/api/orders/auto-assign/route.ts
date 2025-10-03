import { type NextRequest, NextResponse } from "next/server"
import { autoAssignOrder, autoAssignPendingOrders } from "@/lib/services/order-assignment"

// POST /api/orders/auto-assign - Asignar automáticamente un pedido específico
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { order_id, criteria } = body

    if (!order_id) {
      return NextResponse.json({ error: "order_id is required" }, { status: 400 })
    }

    const result = await autoAssignOrder(order_id, criteria)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      assignment: result,
    })
  } catch (error) {
    console.error(" Error in auto-assign endpoint:", error)
    return NextResponse.json({ error: "Failed to auto-assign order" }, { status: 500 })
  }
}

// GET /api/orders/auto-assign - Asignar todos los pedidos pendientes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const maxDistance = searchParams.get("max_distance")
    const minRating = searchParams.get("min_rating")

    const criteria = {
      max_distance_km: maxDistance ? Number.parseFloat(maxDistance) : undefined,
      min_rating: minRating ? Number.parseFloat(minRating) : undefined,
    }

    const result = await autoAssignPendingOrders(criteria)

    return NextResponse.json({
      success: true,
      summary: result,
    })
  } catch (error) {
    console.error(" Error in batch auto-assign endpoint:", error)
    return NextResponse.json({ error: "Failed to auto-assign orders" }, { status: 500 })
  }
}
