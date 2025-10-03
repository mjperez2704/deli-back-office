import { type NextRequest, NextResponse } from "next/server"
import { createNotification } from "@/lib/db/queries"

// POST /api/notifications - Crear notificación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, order_id, title, message, type } = body

    if (!user_id || !title || !message || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: notification, error } = await createNotification({
      user_id,
      order_id,
      title,
      message,
      type,
    })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error(" Error creating notification:", error)
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}
