import { type NextRequest, NextResponse } from "next/server"
import { getAllDrivers, getOnlineDrivers, createDriver } from "@/lib/db/queries"

// GET /api/drivers - Obtener todos los repartidores
export async function GET(request: NextRequest) {
  try {
    console.log(" Fetching drivers...")
    const { searchParams } = new URL(request.url)
    const onlineOnly = searchParams.get("online") === "true"

    let result
    if (onlineOnly) {
      result = await getOnlineDrivers()
    } else {
      result = await getAllDrivers()
    }

    if (result.error) {
      console.error(" Error fetching drivers:", result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }


    const drivers = Array.isArray(result.data) ? result.data : []
    //const drivers: string[] = result.data || []
    console.log(" Drivers fetched successfully:", drivers.length)
    return NextResponse.json({ drivers })
  } catch (error) {
    console.error(" Error fetching drivers:", error)
    return NextResponse.json({ error: "Error fetching drivers" }, { status: 500 })
  }
}

// POST /api/drivers - Crear nuevo repartidor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { full_name, phone, email, vehicle_type, license_plate } = body

    // Validar campos requeridos
    if (!full_name || !phone || !email || !vehicle_type || !license_plate) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    const result = await createDriver({
      full_name,
      phone,
      email,
      vehicle_type,
      license_plate,
    })

    if (result.error) {
      console.error(" Error creating driver:", result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error(" Error creating driver:", error)
    return NextResponse.json({ error: "Error creating driver" }, { status: 500 })
  }
}
