import { NextResponse } from "next/server"
import {
  getDeliveryZoneById,
  updateDeliveryZone,
  deleteDeliveryZone,
} from "@/lib/db/queries"

interface Params {
  id: string
}

// GET a single delivery zone
export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const id = Number(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 })
    }
    const { data, error } = await getDeliveryZoneById(id)

    if (error) {
      throw new Error(error)
    }
    if (!data) {
      return NextResponse.json({ success: false, error: "Zone not found" }, { status: 404 })
    }

    // The area is stored as a JSON string, so we parse it before sending.
    const zone = {
      ...data,
      area: JSON.parse(data.area_geojson),
    }

    return NextResponse.json({ success: true, data: zone })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    // If parsing fails, it's a server error.
    if (errorMessage.includes("JSON")) {
      return NextResponse.json({ success: false, error: "Failed to parse zone area data." }, { status: 500 })
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

// PUT (update) a delivery zone
export async function PUT(request: Request, { params }: { params: Params }) {
  try {
    const id = Number(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 })
    }
    const zoneData = await request.json()
    const { data: updatedZoneData, error } = await updateDeliveryZone(id, zoneData)

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 })
    }

    if (!updatedZoneData) {
      return NextResponse.json({ success: false, error: "Zone not found or failed to update" }, { status: 404 })
    }

    // The updated data also needs its area parsed.
    const zone = {
        ...updatedZoneData,
        area: JSON.parse(updatedZoneData.area_geojson),
    }

    return NextResponse.json({ success: true, data: zone })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

// DELETE a delivery zone
export async function DELETE(request: Request, { params }: { params: Params }) {
  try {
    const id = Number(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 })
    }
    const { error } = await deleteDeliveryZone(id)

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: { message: "Zone deleted successfully" } })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
