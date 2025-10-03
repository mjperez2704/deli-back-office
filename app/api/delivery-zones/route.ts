import { NextResponse } from "next/server"
import {
  getAllDeliveryZones,
  createDeliveryZone,
} from "@/lib/db/queries"
import type { DeliveryZone } from "@/lib/types/database"

// GET all delivery zones
export async function GET() {
  try {
    const { data, error } = await getAllDeliveryZones()
    if (error) {
      if (error.toLowerCase().includes("doesn't exist")) {
        return NextResponse.json({ success: false, error: "La tabla 'delivery_zones' no fue encontrada. Por favor, ejecuta las migraciones de la base de datos." }, { status: 500 });
      }
      throw new Error(error)
    }

    const zones = (data as DeliveryZone[]).map((zone: DeliveryZone) => {
        try {
          if (!zone.area) {
            console.warn(`La zona con ID ${zone.id} no tiene geometría y será omitida.`)
            return null
          }
          return {
            ...zone,
            // The area is already an object from the query alias, no need to parse
            area: zone.area, 
          }
        } catch (parseError) {
          console.error(`Error al procesar la geometría para la zona ID ${zone.id}. Será omitida.`, parseError)
          return null 
        }
      })
      .filter(Boolean) 

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
    if (!body.area || (typeof body.area === 'string' && JSON.parse(body.area).length === 0)) {
        return NextResponse.json({ success: false, error: "El área de la zona es requerida y no puede estar vacía." }, { status: 400 })
    }
    
    // The `createDeliveryZone` function expects the `area` to be an object that it will stringify.
    // The frontend sends it as a string, so we ensure it's passed correctly.
    const zoneData = {
        ...body,
        area: typeof body.area === 'string' ? JSON.parse(body.area) : body.area
    };

    const { data, error } = await createDeliveryZone(zoneData)

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 })
    }
    
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    if (err instanceof SyntaxError) { // Catches JSON.parse errors
      return NextResponse.json({ success: false, error: "El formato del área enviada es inválido." }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
