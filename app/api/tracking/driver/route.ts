import { type NextRequest, NextResponse } from "next/server"
import { updateDriverLocation } from "@/lib/db/queries"

// POST /api/tracking/driver - Actualizar ubicación y broadcast a clientes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { driver_id, lat, lng, order_id, speed, heading } = body

    if (!driver_id || typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 })
    }

    // Actualizar en base de datos
    const { data: driver, error } = await updateDriverLocation(driver_id, lat, lng)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    // En producción, aquí se haría broadcast via WebSocket
    // wsServer.broadcast(`order:${order_id}`, {
    //   type: 'driver_location_update',
    //   payload: { driver_id, lat, lng, order_id, speed, heading },
    //   timestamp: Date.now()
    // })

    return NextResponse.json({
      success: true,
      driver,
      broadcasted: true,
    })
  } catch (error) {
    console.error(" Error updating driver location:", error)
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
}
