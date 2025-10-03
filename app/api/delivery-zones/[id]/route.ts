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

    const zone = {
      ...data,
      area: JSON.parse(data.area_geojson), // Parse the GeoJSON string
    }

    return NextResponse.json({ success: true, data: zone })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
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
    const body = await request.json()
    const { data, error } = await updateDeliveryZone(id, body)

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 })
    }

    const updatedZone = {
      ...data,
      area: JSON.parse(data.area_geojson),
    }

    return NextResponse.json({ success: true, data: updatedZone })
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
