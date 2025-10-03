// Cliente WebSocket para el frontend
"use client"

import type { WebSocketMessage } from "./types"

export class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private messageHandlers: Map<string, Set<(data: any) => void>> = new Map()
  private url: string
  private isIntentionallyClosed = false
  private useMock = true // Forzar uso de mock por defecto

  constructor(url: string) {
    this.url = url
    this.useMock = typeof window !== "undefined" && (process.env.NODE_ENV === "development" || !url.startsWith("ws"))
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log(" WebSocket already connected")
      return
    }

    this.isIntentionallyClosed = false

    if (this.useMock) {
      console.log(" Using mock WebSocket (no real server available)")
      this.setupMockWebSocket()
      return
    }

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log(" WebSocket connected")
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          this.handleMessage(message)
        } catch (error) {
          console.error(" Error parsing WebSocket message:", error)
        }
      }

      this.ws.onerror = (error) => {
        console.warn(" WebSocket error, switching to mock mode")
        this.useMock = true
        this.setupMockWebSocket()
      }

      this.ws.onclose = () => {
        console.log(" WebSocket disconnected")
        if (!this.isIntentionallyClosed && !this.useMock) {
          this.attemptReconnect()
        }
      }
    } catch (error) {
      console.warn(" Error creating WebSocket, using mock mode:", error)
      this.useMock = true
      this.setupMockWebSocket()
    }
  }

  private setupMockWebSocket() {
    // Mock WebSocket para desarrollo
    const mockWs = {
      readyState: 1, // OPEN
      send: (data: string) => {
        console.log(" Mock WebSocket send:", data)
      },
      close: () => {
        console.log(" Mock WebSocket closed")
      },
    }

    this.ws = mockWs as any

    console.log(" Mock WebSocket initialized")

    // Simular mensajes periódicos para demostración
    if (typeof window !== "undefined") {
      setInterval(() => {
        if (this.ws && !this.isIntentionallyClosed) {
          // Simular actualización de ubicación de repartidor
          this.handleMessage({
            type: "driver_location_update",
            payload: {
              driver_id: 1,
              lat: 19.432608 + (Math.random() - 0.5) * 0.01,
              lng: -99.133209 + (Math.random() - 0.5) * 0.01,
              order_id: 1,
              speed: 30 + Math.random() * 20,
              heading: Math.random() * 360,
            },
            timestamp: Date.now(),
          })
        }
      }, 5000) // Cada 5 segundos
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn(" Max reconnection attempts reached, switching to mock mode")
      this.useMock = true
      this.setupMockWebSocket()
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(` Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`)

    setTimeout(() => {
      this.connect()
    }, delay)
  }

  private handleMessage(message: WebSocketMessage) {
    const handlers = this.messageHandlers.get(message.type)
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message.payload)
        } catch (error) {
          console.error(" Error in message handler:", error)
        }
      })
    }
  }

  on(messageType: string, handler: (data: any) => void) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set())
    }
    this.messageHandlers.get(messageType)!.add(handler)
  }

  off(messageType: string, handler: (data: any) => void) {
    const handlers = this.messageHandlers.get(messageType)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  send(message: WebSocketMessage) {
    if (this.ws?.readyState === 1) {
      // WebSocket.OPEN = 1
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn(" WebSocket is not connected, message not sent")
    }
  }

  subscribe(channel: string, userId?: number) {
    this.send({
      type: "subscribe",
      payload: { channel, userId },
      timestamp: Date.now(),
    })
  }

  unsubscribe(channel: string, userId?: number) {
    this.send({
      type: "unsubscribe",
      payload: { channel, userId },
      timestamp: Date.now(),
    })
  }

  disconnect() {
    this.isIntentionallyClosed = true
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === 1 // WebSocket.OPEN = 1
  }
}
