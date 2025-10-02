"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DeliveryCard } from "@/components/deliveries/delivery-card"
import { mockDeliveries } from "@/lib/data/deliveries"
import type { DeliveryTracking } from "@/lib/types"
import { Truck, CheckCircle, Clock } from "lucide-react"

export default function EntregasPage() {
  const [deliveries, setDeliveries] = useState<DeliveryTracking[]>(mockDeliveries)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Simular actualizaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setDeliveries((prev) =>
        prev.map((delivery) => {
          // Simular progreso aleatorio
          const newProgress = Math.min(delivery.progress + Math.floor(Math.random() * 5), 100)
          const remainingDistance = ((100 - newProgress) / 100) * 5
          const estimatedMinutes = Math.ceil(remainingDistance * 5)

          return {
            ...delivery,
            progress: newProgress,
            currentLocation: `A ${remainingDistance.toFixed(1)} km del destino`,
            estimatedTime: `${estimatedMinutes} min`,
          }
        }),
      )
      setLastUpdate(new Date())
    }, 5000) // Actualizar cada 5 segundos

    return () => clearInterval(interval)
  }, [])

  const activeDeliveries = deliveries.filter((d) => d.status === "en ruta")
  const completedToday = 24 // Simulado
  const averageTime = "28 min" // Simulado

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">Seguimiento de Entregas</h1>
        <p className="text-muted-foreground mt-2">
          Monitoreo en tiempo real de todas las entregas activas
          <span className="ml-2 text-xs">Última actualización: {lastUpdate.toLocaleTimeString()}</span>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Entregas Activas</p>
              <p className="text-3xl font-semibold text-foreground mt-2">{activeDeliveries.length}</p>
            </div>
            <div className="rounded-lg bg-chart-4/10 p-3">
              <Truck className="h-6 w-6 text-chart-4" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completadas Hoy</p>
              <p className="text-3xl font-semibold text-foreground mt-2">{completedToday}</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-3">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tiempo Promedio</p>
              <p className="text-3xl font-semibold text-foreground mt-2">{averageTime}</p>
            </div>
            <div className="rounded-lg bg-chart-2/10 p-3">
              <Clock className="h-6 w-6 text-chart-2" />
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Entregas en Curso</h2>
        <Badge variant="outline" className="border-primary text-primary bg-primary/10">
          Actualización automática
        </Badge>
      </div>

      {activeDeliveries.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeDeliveries.map((delivery) => (
            <DeliveryCard key={delivery.orderId} delivery={delivery} />
          ))}
        </div>
      ) : (
        <Card className="p-12 bg-card border-border">
          <div className="text-center">
            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No hay entregas activas</h3>
            <p className="text-muted-foreground">Todas las entregas han sido completadas</p>
          </div>
        </Card>
      )}
    </div>
  )
}
