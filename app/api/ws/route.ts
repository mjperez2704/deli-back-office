import type { NextRequest } from "next/server"

// Endpoint WebSocket para conexiones en tiempo real
export async function GET(request: NextRequest) {
  // En producción, esto se manejaría con un servidor WebSocket dedicado
  // o usando servicios como Pusher, Ably, o Socket.io

  // Para desarrollo, retornamos información sobre cómo conectarse
  return new Response(
    JSON.stringify({
      message: "WebSocket endpoint",
      info: "Connect using WebSocket client to this endpoint",
      channels: {
        backoffice: "ws://localhost:3000/api/ws?channel=backoffice",
        driver: "ws://localhost:3000/api/ws?channel=driver:{driver_id}",
        customer: "ws://localhost:3000/api/ws?channel=customer:{customer_id}",
        order: "ws://localhost:3000/api/ws?channel=order:{order_id}",
      },
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  )
}
