import { type NextRequest, NextResponse } from "next/server"
import { getDbConnection, executeQuery } from "@/lib/db/connection"

// GET /api/stores/[id]/products - Obtener productos de una tienda
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const storeId = Number.parseInt(params.id)

    if (isNaN(storeId)) {
      return NextResponse.json({ error: "Invalid store ID" }, { status: 400 })
    }

    const { data: products, error } = await executeQuery(async () => {
      const sql = getDbConnection()
      return await sql`
        SELECT * FROM products 
        WHERE store_id = ${storeId} AND is_available = true
        ORDER BY category, name
      `
    })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error(" Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
