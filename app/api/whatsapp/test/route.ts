import { NextResponse } from "next/server"
import { getWhatsAppClient } from "@/lib/whatsapp/client"
import { successResponse, errorResponse } from "@/lib/api-response"

// POST /api/whatsapp/test - Probar conexión con WhatsApp
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phoneNumber, templateName } = body

    if (!phoneNumber || !templateName) {
      return NextResponse.json(errorResponse("Número de teléfono y nombre de plantilla requeridos"), { status: 400 })
    }

    const client = getWhatsAppClient()
    const result = await client.sendTemplate(phoneNumber, templateName, "es")

    return NextResponse.json(successResponse(result, "Mensaje de prueba enviado exitosamente"))
  } catch (error: any) {
    console.error("[WhatsApp Test] Error:", error)
    return NextResponse.json(errorResponse(error.message || "Error al enviar mensaje de prueba"), { status: 500 })
  }
}
