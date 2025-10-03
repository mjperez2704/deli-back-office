import { NextResponse } from "next/server"
import {
  getAllDeliveryZones,
  createDeliveryZone,
} from "@/lib/db/queries"

// GET all delivery zones
export async function GET() {
  try {
    const { data, error } = await getAllDeliveryZones()
    if (error) {
      // Provide a more specific error if the table doesn't exist
      if (error.toLowerCase().includes("doesn't exist")) {
        return NextResponse.json({ success: false, error: "La tabla 'delivery_zones' no fue encontrada. Por favor, ejecuta las migraciones de la base de datos." }, { status: 500 });
      }
      throw new Error(error)
    }

    const zones = data.map((zone: any) => {
        try {
          // If area is null/undefined in DB, area_geojson will be null. Skip it.
          if (!zone.area_geojson) {
            console.warn(`La zona con ID ${zone.id} no tiene geometría y será omitida.`)
            return null
          }
          return {
            ...zone,
            area: JSON.parse(zone.area_geojson),
          }
        } catch (parseError) {
          console.error(`Error al procesar la geometría para la zona ID ${zone.id}. Será omitida.`, parseError)
          return null // Exclude corrupted zone from the result
        }
      })
      .filter(Boolean) // Remove nulls from the array

    return NextResponse.json({ success: true, data: zones })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

// POST a new delivery zone
export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.area) {
        return NextResponse.json({ success: false, error: "El área de la zona es requerida." }, { status: 400 })
    }
    const { data, error } = await createDeliveryZone(body)

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 })
    }
    
    // The created data already has the area parsed correctly by the query
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
