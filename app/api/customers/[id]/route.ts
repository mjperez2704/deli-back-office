import { NextResponse } from "next/server"
import {
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "@/lib/db/queries"

// GET a single customer by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const { data, error } = await getCustomerById(id)

    if (error) {
      throw new Error(error)
    }
    if (!data) {
        return NextResponse.json({ success: false, error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

// PUT (update) a customer
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id)
        const body = await request.json()
        const { data, error } = await updateCustomer(id, body)

        if (error) {
            return NextResponse.json({ success: false, error }, { status: 400 })
        }

        return NextResponse.json({ success: true, data })
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
    }
}

// DELETE a customer
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number(params.id)
        const { data, error } = await deleteCustomer(id)

        if (error) {
            return NextResponse.json({ success: false, error }, { status: 400 })
        }

        return NextResponse.json({ success: true, data })
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
    }
}
