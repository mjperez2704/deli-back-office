// Tipos para mensajes WebSocket

export type WebSocketMessageType =
  | "driver_location_update"
  | "driver_status_change"
  | "order_status_update"
  | "order_assigned"
  | "new_order"
  | "ping"
  | "pong"
  | "subscribe"
  | "unsubscribe"

export interface WebSocketMessage {
  type: WebSocketMessageType
  payload: any
  timestamp: number
}

export interface DriverLocationUpdate {
  driver_id: number
  lat: number
  lng: number
  order_id?: number
  speed?: number
  heading?: number
}

export interface OrderStatusUpdate {
  order_id: number
  status: string
  driver_location?: {
    lat: number
    lng: number
  }
  estimated_arrival?: string
}

export interface SubscriptionMessage {
  channel: string
  id: number
}
