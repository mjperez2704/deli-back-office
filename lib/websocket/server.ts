// Servidor WebSocket para tracking en tiempo real
// Este código se ejecuta en el servidor

export class WebSocketServer {
  private clients: Map<string, Set<WebSocket>> = new Map()
  private driverConnections: Map<number, WebSocket> = new Map()
  private customerConnections: Map<number, WebSocket> = new Map()

  constructor() {
    console.log(" WebSocket server initialized")
  }

  // Registrar cliente en un canal
  subscribe(ws: WebSocket, channel: string, userId?: number) {
    if (!this.clients.has(channel)) {
      this.clients.set(channel, new Set())
    }
    this.clients.get(channel)!.add(ws)

    // Registrar conexión específica de repartidor o cliente
    if (channel.startsWith("driver:") && userId) {
      this.driverConnections.set(userId, ws)
    } else if (channel.startsWith("customer:") && userId) {
      this.customerConnections.set(userId, ws)
    }

    console.log(` Client subscribed to channel: ${channel}`)
  }

  // Desuscribir cliente de un canal
  unsubscribe(ws: WebSocket, channel: string, userId?: number) {
    const channelClients = this.clients.get(channel)
    if (channelClients) {
      channelClients.delete(ws)
      if (channelClients.size === 0) {
        this.clients.delete(channel)
      }
    }

    // Remover conexión específica
    if (channel.startsWith("driver:") && userId) {
      this.driverConnections.delete(userId)
    } else if (channel.startsWith("customer:") && userId) {
      this.customerConnections.delete(userId)
    }

    console.log(` Client unsubscribed from channel: ${channel}`)
  }

  // Broadcast a todos los clientes de un canal
  broadcast(channel: string, message: any) {
    const channelClients = this.clients.get(channel)
    if (!channelClients) return

    const messageStr = JSON.stringify(message)

    channelClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr)
      }
    })

    console.log(` Broadcasted to ${channelClients.size} clients in channel: ${channel}`)
  }

  // Enviar mensaje a un repartidor específico
  sendToDriver(driverId: number, message: any) {
    const ws = this.driverConnections.get(driverId)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
      console.log(` Message sent to driver ${driverId}`)
    }
  }

  // Enviar mensaje a un cliente específico
  sendToCustomer(customerId: number, message: any) {
    const ws = this.customerConnections.get(customerId)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
      console.log(` Message sent to customer ${customerId}`)
    }
  }

  // Broadcast a todos los clientes del backoffice
  broadcastToBackoffice(message: any) {
    this.broadcast("backoffice", message)
  }

  // Obtener estadísticas de conexiones
  getStats() {
    return {
      totalChannels: this.clients.size,
      totalConnections: Array.from(this.clients.values()).reduce((sum, set) => sum + set.size, 0),
      driversOnline: this.driverConnections.size,
      customersOnline: this.customerConnections.size,
    }
  }
}

// Instancia singleton del servidor WebSocket
export const wsServer = new WebSocketServer()
