"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Order {
  id: number
  order_number: string
  customer: {
    full_name: string
  }
  status: string
  created_at: string
}

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch("/api/orders")
        const data = await response.json()

        if (data.orders) {
          const activeOrders = data.orders
            .filter((order: Order) => !["delivered", "cancelled"].includes(order.status))
            .slice(0, 4)
          setOrders(activeOrders)
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
    const interval = setInterval(fetchOrders, 30000)
    return () => clearInterval(interval)
  }, [])

  function getTimeAgo(date: string): string {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    return `Hace ${minutes} min`
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Pedidos Recientes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : orders.length === 0 ? (
          <p className="text-muted-foreground">No hay pedidos recientes</p>
        ) : (
          orders.map((order, index) => (
            <div key={order.id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Pedido #{1001 + index}</p>
                <p className="text-sm text-muted-foreground">
                  {order.customer.full_name} - {getTimeAgo(order.created_at)}
                </p>
              </div>
              <span className="rounded-full bg-[#00ff00]/20 px-3 py-1 text-sm font-medium text-[#00ff00]">En ruta</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
