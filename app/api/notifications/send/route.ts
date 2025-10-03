import { type NextRequest, NextResponse } from "next/server"
import { sendPushNotification, sendBulkPushNotifications } from "@/lib/services/notifications"

// POST /api/notifications/send - Enviar notificación push
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, user_ids, title, message, icon, data, actions } = body

    // Envío individual
    if (user_id) {
      const result = await sendPushNotification(user_id, {
        title,
        body: message,
        icon,
        data,
        actions,
      })

      return NextResponse.json({
        success: result,
        message: result ? "Notification sent successfully" : "Failed to send notification",
      })
    }

    // Envío masivo
    if (user_ids && Array.isArray(user_ids)) {
      const result = await sendBulkPushNotifications(user_ids, {
        title,
        body: message,
        icon,
        data,
        actions,
      })

      return NextResponse.json({
        success: true,
        summary: result,
      })
    }

    return NextResponse.json({ error: "user_id or user_ids is required" }, { status: 400 })
  } catch (error) {
    console.error(" Error sending notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
