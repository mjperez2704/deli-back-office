import { NextResponse } from "next/server"
import { getAddressesByUserId } from "@/lib/db/queries"

interface Params {
  id: string
}

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    const userId = Number(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 400 })
    }

    const { data, error } = await getAddressesByUserId(userId)

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
