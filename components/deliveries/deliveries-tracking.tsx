"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, CheckCircle, Clock, MapPin, Truck, Timer, AlertCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import type { Order } from "@/lib/types/database" // Import the full Order type

// We will use the Order type directly as it comes from the API
// No need for a separate 'Delivery' type if the API returns full order objects

export function DeliveriesTracking() {
  const [stats, setStats] = useState({
    active: 0,
    completedToday: 0,
    avgTime: 0, // Placeholder for now
  })
  const [deliveries, setDeliveries] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDeliveries = async () => {
    try {
      setError(null)
      const response = await fetch("/api/deliveries")
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`)
      }
      const data = await response.json()

      if (data.success) {
        const fetchedDeliveries: Order[] = data.data || []
        
        setDeliveries(fetchedDeliveries);
        
        // Update stats based on real data
        const active = fetchedDeliveries.filter(d => d.status === 'out_for_delivery').length
        const completedToday = fetchedDeliveries.filter(
            d => d.status === 'delivered' && d.actual_delivery_time && new Date(d.actual_delivery_time).toDateString() === new Date().toDateString()
        ).length
        
        setStats({ active, completedToday, avgTime: 28 }) // avgTime is still a placeholder

      } else {
        throw new Error(data.error || "Failed to fetch deliveries.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.")
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeliveries()
    const interval = setInterval(fetchDeliveries, 30000) // Auto-refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])
  
  // Calculate progress based on status (example logic)
  const getProgress = (status: Order['status']) => {
    const statusProgress: Record<string, number> = {
        'pending': 10,
        'confirmed': 25,
        'preparing': 50,
        'out_for_delivery': 75,
        'delivered': 100,
        'cancelled': 0,
    };
    return statusProgress[status] || 0;
  };


  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border bg-card"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Entregas Activas</p><p className="text-4xl font-bold text-foreground">{stats.active}</p></div><div className="rounded-lg bg-orange-500/10 p-3"><Package className="h-6 w-6 text-orange-500" /></div></div></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Completadas Hoy</p><p className="text-4xl font-bold text-foreground">{stats.completedToday}</p></div><div className="rounded-lg bg-green-500/10 p-3"><CheckCircle className="h-6 w-6 text-green-500" /></div></div></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Tiempo Promedio</p><p className="text-4xl font-bold text-foreground">{stats.avgTime} min</p></div><div className="rounded-lg bg-cyan-500/10 p-3"><Clock className="h-6 w-6 text-cyan-500" /></div></div></CardContent></Card>
      </div>

      {/* Active Deliveries */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Entregas en Curso</h2>
          <Badge variant="outline" className="border-green-500 text-green-500">Actualización automática</Badge>
        </div>

        {loading ? (<p className="text-muted-foreground">Cargando entregas...</p>)
        : error ? (<div className="flex flex-col items-center justify-center text-center text-red-500 border border-dashed border-red-500/50 rounded-lg p-8"><AlertCircle className="h-8 w-8 mb-2" /><p className="font-semibold">Error al Cargar Entregas</p><p className="text-sm">{error}</p></div>)
        : deliveries.length === 0 ? (<div className="text-center text-muted-foreground border border-dashed rounded-lg p-8"><p>No hay entregas activas en este momento.</p></div>)
        : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {deliveries.map((delivery) => (
              <Card key={delivery.id} className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-foreground">Pedido #{delivery.order_number}</h3>
                      <Badge variant="outline" className="border-orange-500 text-orange-500">{delivery.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{delivery.customer_id || 'Cliente no disponible'}</p>
                    <div className="flex items-center gap-2 text-sm"><Truck className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">{delivery.driver?.user.full_name || 'No asignado'}</span></div>
                    <div className="flex items-start gap-2 text-sm"><MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" /><span className="text-foreground">{delivery.delivery_address_id?.toString() || "Sin direccion de entrega" }</span></div>
                    <div className="flex items-center gap-2 text-sm"><Package className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">A {delivery.distance_km || 'N/A'} km del destino</span></div>
                    <div className="flex items-center gap-2 text-sm">
                        <Timer className="h-4 w-4 text-muted-foreground" />
                        <span className="text-green-500">
                            Llegada estimada: {delivery.estimated_delivery_time ? new Date(delivery.estimated_delivery_time).toLocaleTimeString() : 'N/A'}
                        </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progreso</span>
                        <span className="font-medium text-foreground">{getProgress(delivery.status)}%</span>
                      </div>
                      <Progress value={getProgress(delivery.status)} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
        )}
      </div>
    </div>
  )
}
