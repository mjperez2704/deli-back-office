"use client"

import { useEffect, useState } from "react"
import { useWebSocket } from "./use-websocket"
import type { OrderStatus } from "@/lib/types/database"

interface OrderUpdate {
  order_id: number
  status: OrderStatus
  driver_location?: {
    lat: number
    lng: number
  }
  estimated_arrival?: string
  timestamp: number
}

export function useOrderUpdates(orderId?: number) {
  const [orderUpdate, setOrderUpdate] = useState<OrderUpdate | null>(null)
  const [allUpdates, setAllUpdates] = useState<OrderUpdate[]>([])
  const { client, isConnected } = useWebSocket("/api/ws")

  useEffect(() => {
    if (!client || !isConnected) return

    const handleOrderUpdate = (data: OrderUpdate) => {
      // Si estamos rastreando una orden específica, filtrar por order_id
      if (orderId && data.order_id !== orderId) return

      const update = {
        ...data,
        timestamp: Date.now(),
      }

      setOrderUpdate(update)
      setAllUpdates((prev) => [update, ...prev].slice(0, 50)) // Mantener últimas 50 actualizaciones
    }

    client.on("order_status_update", handleOrderUpdate)

    // Suscribirse al canal apropiado
    if (orderId) {
      client.subscribe(`order:${orderId}`)
    } else {
      client.subscribe("backoffice")
    }

    return () => {
      client.off("order_status_update", handleOrderUpdate)
      if (orderId) {
        client.unsubscribe(`order:${orderId}`)
      } else {
        client.unsubscribe("backoffice")
      }
    }
  }, [client, isConnected, orderId])

  return {
    orderUpdate,
    allUpdates,
    isConnected,
  }
}
