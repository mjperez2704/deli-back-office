import { type NextRequest, NextResponse } from "next/server"
import { orders } from "@/lib/data/orders"
import { successResponse, errorResponse } from "@/lib/api-response"

// GET /api/orders/[id] - Obtener pedido por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = orders.find((o) => o.id === params.id)

    if (!order) {
      return NextResponse.json(errorResponse("Pedido no encontrado"), {
        status: 404,
      })
    }

    return NextResponse.json(successResponse(order))
  } catch (error) {
    return NextResponse.json(errorResponse("Error al obtener pedido"), {
      status: 500,
    })
  }
}

// PUT /api/orders/[id] - Actualizar pedido
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const orderIndex = orders.findIndex((o) => o.id === params.id)

    if (orderIndex === -1) {
      return NextResponse.json(errorResponse("Pedido no encontrado"), {
        status: 404,
      })
    }

    orders[orderIndex] = {
      ...orders[orderIndex],
      ...body,
    }

    return NextResponse.json(successResponse(orders[orderIndex], "Pedido actualizado exitosamente"))
  } catch (error) {
    return NextResponse.json(errorResponse("Error al actualizar pedido"), {
      status: 500,
    })
  }
}

// DELETE /api/orders/[id] - Eliminar pedido
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderIndex = orders.findIndex((o) => o.id === params.id)

    if (orderIndex === -1) {
      return NextResponse.json(errorResponse("Pedido no encontrado"), {
        status: 404,
      })
    }

    orders.splice(orderIndex, 1)

    return NextResponse.json(successResponse(null, "Pedido eliminado exitosamente"))
  } catch (error) {
    return NextResponse.json(errorResponse("Error al eliminar pedido"), {
      status: 500,
    })
  }
}
