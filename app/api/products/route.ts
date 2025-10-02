import { type NextRequest, NextResponse } from "next/server"
import { products } from "@/lib/data/products"
import { successResponse, errorResponse } from "@/lib/api-response"
import type { Product } from "@/lib/types"

// GET /api/products - Obtener todos los productos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get("category")
    const status = searchParams.get("status")

    let filteredProducts = [...products]

    if (category) {
      filteredProducts = filteredProducts.filter((p) => p.category === category)
    }

    if (status) {
      filteredProducts = filteredProducts.filter((p) => p.status === status)
    }

    return NextResponse.json(successResponse(filteredProducts))
  } catch (error) {
    return NextResponse.json(errorResponse("Error al obtener productos"), {
      status: 500,
    })
  }
}

// POST /api/products - Crear nuevo producto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, price, category, description } = body

    if (!name || !price || !category) {
      return NextResponse.json(errorResponse("Faltan campos requeridos"), {
        status: 400,
      })
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name,
      price: Number.parseFloat(price),
      category,
      status: "disponible",
      description,
      createdAt: new Date().toISOString(),
    }

    products.push(newProduct)

    return NextResponse.json(successResponse(newProduct, "Producto creado exitosamente"), {
      status: 201,
    })
  } catch (error) {
    return NextResponse.json(errorResponse("Error al crear producto"), {
      status: 500,
    })
  }
}
