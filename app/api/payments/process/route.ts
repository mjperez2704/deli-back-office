import { type NextRequest, NextResponse } from "next/server"
import { processPayment } from "@/lib/services/payment-gateways"
import type { PaymentGateway } from "@/lib/types/database"

// POST - Procesar pago
export async function POST(request: NextRequest) {
  try {
    const { orderId, gateway, amount, currency } = await request.json()

    if (!orderId || !gateway || !amount) {
      return NextResponse.json({ success: false, error: "Datos incompletos" }, { status: 400 })
    }

    const result = await processPayment(gateway as PaymentGateway, amount, currency || "USD", orderId)

    if (result.success) {
      // TODO: Guardar transacción en base de datos
      // await db.query('INSERT INTO payment_transactions ...')

      // TODO: Actualizar estado del pedido
      // await db.query('UPDATE orders SET payment_status = $1 WHERE id = $2', ['completed', orderId])

      return NextResponse.json({
        success: true,
        data: {
          transactionId: result.transactionId,
          status: "completed",
        },
      })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ success: false, error: "Error al procesar pago" }, { status: 500 })
  }
}
