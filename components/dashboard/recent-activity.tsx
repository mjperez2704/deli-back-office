"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Package, Truck, User } from "lucide-react"
import { useOrderUpdates } from "@/lib/hooks/use-order-updates"

interface Activity {
  id: string
  type: string
  message: string
  timestamp: string
  status: string
  order_id?: number
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const { allUpdates, isConnected } = useOrderUpdates()

  useEffect(() => {
    if (allUpdates.length > 0) {
      const newActivities = allUpdates.map((update) => ({
        id: `${update.order_id}-${update.timestamp}`,
        type: "order",
        message: getActivityMessage(update.status, update.order_id),
        timestamp: getRelativeTime(update.timestamp),
        status: getActivityStatus(update.status),
        order_id: update.order_id,
      }))
      setActivities(newActivities.slice(0, 10))
    }
  }, [allUpdates])

  useEffect(() => {
    async function fetchInitialActivity() {
      try {
        const response = await fetch("/api/orders")
        const data = await response.json()

        if (data.orders) {
          // Convertir las últimas órdenes en actividades
          const recentOrders = data.orders
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10)

          const initialActivities = recentOrders.map((order: any) => ({
            id: `${order.id}-${order.status}`,
            type: "order",
            message: getActivityMessage(order.status, order.id),
            timestamp: getRelativeTime(new Date(order.created_at).getTime()),
            status: getActivityStatus(order.status),
            order_id: order.id,
          }))

          setActivities(initialActivities)
        }
      } catch (error) {
        console.error(" Error fetching initial activity:", error)
      }
    }

    fetchInitialActivity()
  }, [])

  function getActivityMessage(status: string, orderId: number): string {
    const messages: Record<string, string> = {
      pending: `Nuevo pedido #${orderId} recibido`,
      confirmed: `Pedido #${orderId} confirmado por la tienda`,
      preparing: `Pedido #${orderId} en preparación`,
      ready: `Pedido #${orderId} listo para recoger`,
      assigned: `Pedido #${orderId} asignado a repartidor`,
      picked_up: `Pedido #${orderId} recogido por repartidor`,
      in_transit: `Pedido #${orderId} en camino`,
      delivered: `Pedido #${orderId} entregado exitosamente`,
      cancelled: `Pedido #${orderId} cancelado`,
    }
    return messages[status] || `Pedido #${orderId} actualizado`
  }

  function getActivityStatus(status: string): string {
    if (["pending", "confirmed"].includes(status)) return "new"
    if (["delivered"].includes(status)) return "success"
    if (["cancelled"].includes(status)) return "warning"
    return "info"
  }

  function getRelativeTime(timestamp: number): string {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `hace ${days} día${days > 1 ? "s" : ""}`
    if (hours > 0) return `hace ${hours} hora${hours > 1 ? "s" : ""}`
    if (minutes > 0) return `hace ${minutes} min`
    return "ahora mismo"
  }

  const statusColors: Record<string, string> = {
    new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    success: "bg-green-500/10 text-green-500 border-green-500/20",
    info: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  }

  const statusLabels: Record<string, string> = {
    new: "Nuevo",
    success: "Completado",
    info: "Info",
    warning: "Advertencia",
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-5 w-5 text-muted-foreground" />
      case "delivery":
        return <Truck className="h-5 w-5 text-muted-foreground" />
      case "driver":
        return <User className="h-5 w-5 text-muted-foreground" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas actualizaciones de tus operaciones de entrega</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-yellow-500"}`} />
            <span className="text-xs text-muted-foreground">{isConnected ? "En Vivo" : "Modo Mock"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No hay actividad reciente</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 rounded-lg border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm leading-relaxed">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
                <Badge variant="outline" className={statusColors[activity.status]}>
                  {statusLabels[activity.status]}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
