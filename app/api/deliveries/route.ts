import { type NextRequest, NextResponse } from "next/server"
import { deliveries } from "@/lib/data/deliveries"
import { successResponse, errorResponse } from "@/lib/api-response"

// GET /api/deliveries - Obtener todas las entregas activas
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")

    let filteredDeliveries = [...deliveries]

    if (status) {
      filteredDeliveries = filteredDeliveries.filter((d) => d.status === status)
    }

    return NextResponse.json(successResponse(filteredDeliveries))
  } catch (error) {
    return NextResponse.json(errorResponse("Error al obtener entregas"), {
      status: 500,
    })
  }
}
