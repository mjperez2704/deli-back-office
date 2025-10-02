import { NextResponse } from "next/server"
import { successResponse, errorResponse } from "@/lib/api-response"

// GET /api/whatsapp/status - Verificar configuración de WhatsApp
export async function GET() {
  try {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

    const isConfigured = !!(phoneNumberId && accessToken)

    return NextResponse.json(
      successResponse({
        configured: isConfigured,
        phoneNumberId: phoneNumberId ? `***${phoneNumberId.slice(-4)}` : null,
        hasAccessToken: !!accessToken,
      }),
    )
  } catch (error) {
    return NextResponse.json(errorResponse("Error al verificar configuración"), { status: 500 })
  }
}
