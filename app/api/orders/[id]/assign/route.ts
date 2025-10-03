import { type NextRequest, NextResponse } from "next/server"
import { assignOrderToDriver } from "@/lib/db/queries"

// POST /api/orders/[id]/assign - Asignar pedido a repartidor
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = Number.parseInt(params.id)
    const body = await request.json()
    const { driver_id } = body

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    if (!driver_id) {
      return NextResponse.json({ error: "Driver ID is required" }, { status: 400 })
    }

    const { data: order, error } = await assignOrderToDriver(orderId, driver_id)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error(" Error assigning order:", error)
    return NextResponse.json({ error: "Failed to assign order" }, { status: 500 })
  }
}
