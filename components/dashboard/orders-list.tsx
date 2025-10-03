"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, MapPin, User } from "lucide-react"
import { useOrderUpdates } from "@/lib/hooks/use-order-updates"

interface Order {
  id: number
  order_number: string
  customer: {
    full_name: string
  }
  store: {
    name: string
  }
  status: string
  total: string
  created_at: string
  estimated_delivery_time?: string
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  preparing: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  ready: "bg-green-500/10 text-green-500 border-green-500/20",
  assigned: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  picked_up: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  in_transit: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  delivered: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "Preparando",
  ready: "Listo",
  assigned: "Asignado",
  picked_up: "Recogido",
  in_transit: "En Camino",
  delivered: "Entregado",
  cancelled: "Cancelado",
}

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { orderUpdate, isConnected } = useOrderUpdates()

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch("/api/orders")
        const data = await response.json()

        if (data.orders) {
          // Filtrar solo órdenes activas (no entregadas ni canceladas)
          const activeOrders = data.orders.filter((order: Order) => !["delivered", "cancelled"].includes(order.status))
          setOrders(activeOrders)
        }
      } catch (error) {
        console.error(" Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
    // Actualizar cada 30 segundos
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (orderUpdate) {
      setOrders((prev) =>
        prev.map((order) => (order.id === orderUpdate.order_id ? { ...order, status: orderUpdate.status } : order)),
      )
    }
  }, [orderUpdate])

  function getEstimatedTime(createdAt: string, estimatedDelivery?: string): number {
    if (estimatedDelivery) {
      const diff = new Date(estimatedDelivery).getTime() - Date.now()
      return Math.max(0, Math.round(diff / 60000)) // minutos
    }
    // Estimar 30 minutos por defecto
    const diff = new Date(createdAt).getTime() + 30 * 60000 - Date.now()
    return Math.max(0, Math.round(diff / 60000))
  }

  if (loading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Pedidos Activos</CardTitle>
          <CardDescription>Seguimiento en tiempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Cargando pedidos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pedidos Activos</CardTitle>
            <CardDescription>Seguimiento en tiempo real</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-yellow-500"}`} />
            <span className="text-xs text-muted-foreground">{isConnected ? "En Vivo" : "Modo Mock"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {orders.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No hay pedidos activos</p>
          </div>
        ) : (
          orders.slice(0, 5).map((order) => (
            <div key={order.id} className="flex items-start justify-between rounded-lg border p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">{order.order_number}</span>
                  <Badge variant="outline" className={statusColors[order.status]}>
                    {statusLabels[order.status] || order.status}
                  </Badge>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{order.customer.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{order.store.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>~{getEstimatedTime(order.created_at, order.estimated_delivery_time)} min</span>
                  </div>
                </div>

                <div className="text-lg font-bold">${Number.parseFloat(order.total).toFixed(2)}</div>
              </div>

              <Button size="sm" variant="outline">
                Ver Detalles
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
