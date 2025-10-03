"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, CheckCircle, Clock, MapPin, Truck, Timer } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface Delivery {
  id: number
  order_id: string
  customer: string
  driver: string
  address: string
  distance: string
  estimated_time: string
  progress: number
  status: "En Ruta"
}

export function DeliveriesTracking() {
  const [stats, setStats] = useState({
    active: 3,
    completed: 24,
    avgTime: 28,
  })

  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - reemplazar con llamada a API real
    const mockDeliveries: Delivery[] = [
      {
        id: 1001,
        order_id: "#1001",
        customer: "Juan Pérez",
        driver: "María García",
        address: "Calle Mayor 123, Madrid",
        distance: "2.3 km",
        estimated_time: "15 min",
        progress: 65,
        status: "En Ruta",
      },
      {
        id: 1004,
        order_id: "#1004",
        customer: "Juan Pérez",
        driver: "María García",
        address: "Calle Mayor 123, Madrid",
        distance: "0.8 km",
        estimated_time: "8 min",
        progress: 85,
        status: "En Ruta",
      },
      {
        id: 1005,
        order_id: "#1005",
        customer: "Laura Fernández",
        driver: "Ana Martínez",
        address: "Paseo de la Castellana 200, Madrid",
        distance: "4.1 km",
        estimated_time: "22 min",
        progress: 40,
        status: "En Ruta",
      },
    ]
    setDeliveries(mockDeliveries)
    setLoading(false)
  }, [])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entregas Activas</p>
                <p className="text-4xl font-bold text-foreground">{stats.active}</p>
              </div>
              <div className="rounded-lg bg-orange-500/10 p-3">
                <Package className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completadas Hoy</p>
                <p className="text-4xl font-bold text-foreground">{stats.completed}</p>
              </div>
              <div className="rounded-lg bg-green-500/10 p-3">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                <p className="text-4xl font-bold text-foreground">{stats.avgTime} min</p>
              </div>
              <div className="rounded-lg bg-cyan-500/10 p-3">
                <Clock className="h-6 w-6 text-cyan-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Deliveries */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Entregas en Curso</h2>
          <Badge variant="outline" className="border-green-500 text-green-500">
            Actualización automática
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <p className="text-muted-foreground">Cargando entregas...</p>
          ) : (
            deliveries.map((delivery) => (
              <Card key={delivery.id} className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-foreground">Pedido {delivery.order_id}</h3>
                      <Badge variant="outline" className="border-orange-500 text-orange-500">
                        {delivery.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">{delivery.customer}</p>

                    {/* Driver Info */}
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{delivery.driver}</span>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{delivery.address}</span>
                    </div>

                    {/* Distance */}
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">A {delivery.distance} del destino</span>
                    </div>

                    {/* Estimated Time */}
                    <div className="flex items-center gap-2 text-sm">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      <span className="text-green-500">Llegada estimada: {delivery.estimated_time}</span>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progreso de entrega</span>
                        <span className="font-medium text-foreground">{delivery.progress}%</span>
                      </div>
                      <Progress value={delivery.progress} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
