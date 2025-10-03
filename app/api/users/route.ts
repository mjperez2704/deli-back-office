import { NextResponse } from "next/server"
import { getUsersByRole } from "@/lib/db/queries"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type_user = searchParams.get("user_id")

    if (!type_user || isNaN(Number(type_user))) {
      return NextResponse.json({ success: false, error: "Role parameter is required" }, { status: 400 })
    }

    const {data: data, error: error } = await getUsersByRole(type_user)

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
