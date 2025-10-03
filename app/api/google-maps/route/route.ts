import { type NextRequest, NextResponse } from "next/server"
import { calculateRoute } from "@/lib/services/google-maps"

// POST /api/google-maps/route - Calcular ruta usando Google Maps API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { origin, destination } = body

    if (!origin || !destination) {
      return NextResponse.json({ error: "Origin and destination are required" }, { status: 400 })
    }

    if (typeof origin.lat !== "number" || typeof origin.lng !== "number") {
      return NextResponse.json({ error: "Invalid origin coordinates" }, { status: 400 })
    }

    if (typeof destination.lat !== "number" || typeof destination.lng !== "number") {
      return NextResponse.json({ error: "Invalid destination coordinates" }, { status: 400 })
    }

    const route = await calculateRoute(origin, destination)

    if (!route) {
      return NextResponse.json({ error: "Failed to calculate route" }, { status: 500 })
    }

    return NextResponse.json({ route })
  } catch (error) {
    console.error(" Error calculating route:", error)
    return NextResponse.json({ error: "Failed to calculate route" }, { status: 500 })
  }
}
