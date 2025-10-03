"use client"

import { useEffect, useState } from "react"
import { useWebSocket } from "./use-websocket"

interface DriverLocation {
  driver_id: number
  lat: number
  lng: number
  order_id?: number
  speed?: number
  heading?: number
  timestamp: number
}

export function useDriverTracking(orderId?: number) {
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null)
  const { client, isConnected } = useWebSocket("/api/ws")

  useEffect(() => {
    if (!client || !isConnected) return

    // Suscribirse a actualizaciones de ubicación
    const handleLocationUpdate = (data: DriverLocation) => {
      // Si estamos rastreando una orden específica, filtrar por order_id
      if (orderId && data.order_id !== orderId) return

      setDriverLocation({
        ...data,
        timestamp: Date.now(),
      })
    }

    client.on("driver_location_update", handleLocationUpdate)

    // Suscribirse al canal apropiado
    if (orderId) {
      client.subscribe(`order:${orderId}`)
    } else {
      client.subscribe("backoffice")
    }

    return () => {
      client.off("driver_location_update", handleLocationUpdate)
      if (orderId) {
        client.unsubscribe(`order:${orderId}`)
      } else {
        client.unsubscribe("backoffice")
      }
    }
  }, [client, isConnected, orderId])

  return {
    driverLocation,
    isConnected,
  }
}
