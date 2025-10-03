import { type NextRequest, NextResponse } from "next/server"
import { geocodeAddress } from "@/lib/services/google-maps"

// POST /api/google-maps/geocode - Convertir dirección a coordenadas
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address } = body

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    const location = await geocodeAddress(address)

    if (!location) {
      return NextResponse.json({ error: "Failed to geocode address" }, { status: 500 })
    }

    return NextResponse.json({ location })
  } catch (error) {
    console.error(" Error geocoding address:", error)
    return NextResponse.json({ error: "Failed to geocode address" }, { status: 500 })
  }
}
