"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Order {
  id: number
  order_number: string
  customer_user: {
    full_name: string
  }
  status: string
  created_at: string
}

export function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecentOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/orders?status=pending") // Fetching pending orders as recent
      const data = await response.json()

      if (data.success) {
        setOrders((data.data || []).slice(0, 5)) // Take the first 5 recent orders
      } else {
        throw new Error(data.error || "Failed to fetch recent orders.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.")
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentOrders()
    const interval = setInterval(fetchRecentOrders, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  function getTimeAgo(date: string): string {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    if (minutes < 1) return "Ahora mismo";
    if (minutes === 1) return "Hace 1 min";
    return `Hace ${minutes} min`
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'confirmed': return 'secondary';
      case 'out_for_delivery': return 'success';
      default: return 'outline';
    }
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Pedidos Recientes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : error ? (
            <p className="text-red-500 text-sm">Error: {error}</p>
        ) : orders.length === 0 ? (
          <p className="text-muted-foreground">No hay pedidos recientes.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Pedido #{order.order_number}</p>
                <p className="text-sm text-muted-foreground">
                  {order.customer_user?.full_name || 'N/A'} - {getTimeAgo(order.created_at)}
                </p>
              </div>
              <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
