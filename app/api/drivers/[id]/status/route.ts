import { type NextRequest, NextResponse } from "next/server"
import { setDriverOnlineStatus } from "@/lib/db/queries"

// POST /api/drivers/[id]/status - Cambiar estado online/offline del repartidor
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const driverId = Number.parseInt(params.id)
    const body = await request.json()
    const { is_online } = body

    if (isNaN(driverId)) {
      return NextResponse.json({ error: "Invalid driver ID" }, { status: 400 })
    }

    if (typeof is_online !== "boolean") {
      return NextResponse.json({ error: "is_online must be a boolean" }, { status: 400 })
    }

    const { data: driver, error } = await setDriverOnlineStatus(driverId, is_online)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ driver })
  } catch (error) {
    console.error(" Error updating driver status:", error)
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 })
  }
}
