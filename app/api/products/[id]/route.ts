import { type NextRequest, NextResponse } from "next/server"
import { products } from "@/lib/data/products"
import { successResponse, errorResponse } from "@/lib/api-response"

// GET /api/products/[id] - Obtener producto por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = products.find((p) => p.id === params.id)

    if (!product) {
      return NextResponse.json(errorResponse("Producto no encontrado"), {
        status: 404,
      })
    }

    return NextResponse.json(successResponse(product))
  } catch (error) {
    return NextResponse.json(errorResponse("Error al obtener producto"), {
      status: 500,
    })
  }
}

// PUT /api/products/[id] - Actualizar producto
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const productIndex = products.findIndex((p) => p.id === params.id)

    if (productIndex === -1) {
      return NextResponse.json(errorResponse("Producto no encontrado"), {
        status: 404,
      })
    }

    products[productIndex] = {
      ...products[productIndex],
      ...body,
      price: body.price ? Number.parseFloat(body.price) : products[productIndex].price,
    }

    return NextResponse.json(successResponse(products[productIndex], "Producto actualizado exitosamente"))
  } catch (error) {
    return NextResponse.json(errorResponse("Error al actualizar producto"), {
      status: 500,
    })
  }
}

// DELETE /api/products/[id] - Eliminar producto
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productIndex = products.findIndex((p) => p.id === params.id)

    if (productIndex === -1) {
      return NextResponse.json(errorResponse("Producto no encontrado"), {
        status: 404,
      })
    }

    products.splice(productIndex, 1)

    return NextResponse.json(successResponse(null, "Producto eliminado exitosamente"))
  } catch (error) {
    return NextResponse.json(errorResponse("Error al eliminar producto"), {
      status: 500,
    })
  }
}
