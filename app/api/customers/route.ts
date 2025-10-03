import { NextResponse } from "next/server"
import { getAllCustomers, createCustomer } from "@/lib/db/queries"

// GET all customers
export async function GET() {
  try {
    const { data, error } = await getAllCustomers()
    if (error) {
      throw new Error(error)
    }
    return NextResponse.json({ success: true, data })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

// POST a new customer
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data, error } = await createCustomer(body)

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
