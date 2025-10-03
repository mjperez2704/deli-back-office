import { type NextRequest, NextResponse } from "next/server"
import { checkDeliveryZoneCoverage, mockDeliveryZones } from "@/lib/services/delivery-zones"

// POST - Verificar si una ubicación está en zona de cobertura
export async function POST(request: NextRequest) {
  try {
    const { lat, lng } = await request.json()

    if (!lat || !lng) {
      return NextResponse.json({ success: false, error: "Latitud y longitud son requeridas" }, { status: 400 })
    }

    // TODO: Obtener zonas de la base de datos
    // const zones = await db.query('SELECT * FROM delivery_zones WHERE is_active = true')

    const result = checkDeliveryZoneCoverage({ lat, lng }, mockDeliveryZones)

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error checking delivery zone:", error)
    return NextResponse.json({ success: false, error: "Error al verificar zona de entrega" }, { status: 500 })
  }
}
