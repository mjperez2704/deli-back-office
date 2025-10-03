import { type NextRequest, NextResponse } from "next/server"
import { getDriverById, updateDriver, deleteDriver } from "@/lib/db/queries"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await getDriverById(Number(params.id))

    if (result.error) {
      console.error(" Error fetching driver:", result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    if (!result.data) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error(" Error fetching driver:", error)
    return NextResponse.json({ error: "Error fetching driver" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { full_name, phone, email, vehicle_type, license_plate } = body

    const result = await updateDriver(Number(params.id), {
      full_name,
      phone,
      email,
      vehicle_type,
      license_plate,
    })

    if (result.error) {
      console.error(" Error updating driver:", result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error(" Error updating driver:", error)
    return NextResponse.json({ error: "Error updating driver" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await deleteDriver(Number(params.id))

    if (result.error) {
      console.error(" Error deleting driver:", result.error)
      if (result.error.includes("not found")) {
        return NextResponse.json({ error: result.error }, { status: 404 })
      }
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(" Error deleting driver:", error)
    return NextResponse.json({ error: "Error deleting driver" }, { status: 500 })
  }
}
