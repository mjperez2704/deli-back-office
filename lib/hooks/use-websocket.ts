"use client"

import { useEffect, useRef, useState } from "react"
import { WebSocketClient } from "@/lib/websocket/client"

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false)
  const clientRef = useRef<WebSocketClient | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    try {
      const client = new WebSocketClient(url)
      clientRef.current = client

      client.connect()

      // Verificar estado de conexión periódicamente
      const interval = setInterval(() => {
        const connected = client.isConnected()
        setIsConnected(connected)
      }, 2000)

      return () => {
        clearInterval(interval)
        client.disconnect()
      }
    } catch (err) {
      console.error(" Error initializing WebSocket:", err)
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }, [url])

  return {
    client: clientRef.current,
    isConnected,
    error,
  }
}
