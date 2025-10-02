import { type NextRequest, NextResponse } from "next/server"
import { orders } from "@/lib/data/orders"
import { users } from "@/lib/data/users"
import { products } from "@/lib/data/products"
import { deliveries } from "@/lib/data/deliveries"
import { successResponse, errorResponse } from "@/lib/api-response"

// GET /api/stats - Obtener estadísticas del dashboard
export async function GET(request: NextRequest) {
  try {
    const totalOrders = orders.length
    const activeDeliveries = deliveries.filter((d) => d.status === "en ruta").length
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const activeUsers = users.filter((u) => u.status === "activo").length

    const ordersByStatus = {
      pagado: orders.filter((o) => o.status === "pagado").length,
      enRuta: orders.filter((o) => o.status === "en ruta").length,
      entregado: orders.filter((o) => o.status === "entregado").length,
    }

    const stats = {
      totalOrders,
      activeDeliveries,
      totalRevenue,
      activeUsers,
      ordersByStatus,
      totalProducts: products.length,
      availableProducts: products.filter((p) => p.status === "disponible").length,
      totalDeliveryPersons: users.filter((u) => u.role === "repartidor").length,
      totalCustomers: users.filter((u) => u.role === "cliente").length,
    }

    return NextResponse.json(successResponse(stats))
  } catch (error) {
    return NextResponse.json(errorResponse("Error al obtener estadísticas"), {
      status: 500,
    })
  }
}
