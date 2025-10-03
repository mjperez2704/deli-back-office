import { type NextRequest, NextResponse } from "next/server"

const mockGateways = [
  {
    id: 1,
    gateway_name: "stripe",
    is_active: false,
    public_key: null,
    secret_key: null,
    webhook_secret: null,
    config: null,
  },
  {
    id: 2,
    gateway_name: "paypal",
    is_active: false,
    public_key: null,
    secret_key: null,
    webhook_secret: null,
    config: null,
  },
  {
    id: 3,
    gateway_name: "mercadopago",
    is_active: false,
    public_key: null,
    secret_key: null,
    webhook_secret: null,
    config: null,
  },
]

// GET - Obtener configuración de pasarelas
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: mockGateways,
    })
  } catch (error) {
    console.error("Error fetching payment gateways:", error)
    return NextResponse.json({ success: false, error: "Error al obtener pasarelas de pago" }, { status: 500 })
  }
}

// PUT - Actualizar configuración de pasarela
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: Actualizar en base de datos (encriptar credenciales)
    return NextResponse.json({
      success: true,
      data: body,
    })
  } catch (error) {
    console.error("Error updating payment gateway:", error)
    return NextResponse.json({ success: false, error: "Error al actualizar pasarela" }, { status: 500 })
  }
}
