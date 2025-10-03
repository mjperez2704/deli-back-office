import { type NextRequest, NextResponse } from "next/server"
import { updateDriverLocation } from "@/lib/db/queries"

// POST /api/drivers/[id]/location - Actualizar ubicación del repartidor
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const driverId = Number.parseInt(params.id)
    const body = await request.json()
    const { lat, lng } = body

    if (isNaN(driverId)) {
      return NextResponse.json({ error: "Invalid driver ID" }, { status: 400 })
    }

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "Valid latitude and longitude are required" }, { status: 400 })
    }

    const { data: driver, error } = await updateDriverLocation(driverId, lat, lng)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ driver })
  } catch (error) {
    console.error(" Error updating driver location:", error)
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
}
