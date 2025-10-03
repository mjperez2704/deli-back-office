"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation } from "lucide-react"
import { useDriverTracking } from "@/lib/hooks/use-driver-tracking"

interface Driver {
  id: number
  user: {
    full_name: string
  }
  current_lat: string
  current_lng: string
  is_online: boolean
  vehicle_type: string
  rating: string
}

export function DriversMap() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const { driverLocation, isConnected } = useDriverTracking()

  useEffect(() => {
    async function fetchDrivers() {
      try {
        const response = await fetch("/api/drivers")
        const data = await response.json()

        if (data.drivers) {
          setDrivers(data.drivers)
        }
      } catch (error) {
        console.error(" Error fetching drivers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDrivers()
    // Actualizar cada 15 segundos
    const interval = setInterval(fetchDrivers, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (driverLocation) {
      setDrivers((prev) =>
        prev.map((driver) =>
          driver.id === driverLocation.driver_id
            ? {
                ...driver,
                current_lat: driverLocation.lat.toString(),
                current_lng: driverLocation.lng.toString(),
              }
            : driver,
        ),
      )
    }
  }, [driverLocation])

  if (loading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Ubicación de Repartidores</CardTitle>
          <CardDescription>Seguimiento en tiempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Cargando repartidores...</p>
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
            <CardTitle>Ubicación de Repartidores</CardTitle>
            <CardDescription>Seguimiento en tiempo real</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-yellow-500"}`} />
            <span className="text-xs text-muted-foreground">{isConnected ? "En Vivo" : "Modo Mock"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mapa simulado - En producción usar Google Maps */}
        <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Vista de Mapa</p>
              <p className="text-xs text-muted-foreground">Integración con Google Maps lista</p>
            </div>
          </div>

          {/* Marcadores de repartidores simulados */}
          {drivers.slice(0, 5).map((driver, index) => (
            <div
              key={driver.id}
              className="absolute"
              style={{
                left: `${20 + index * 15}%`,
                top: `${30 + index * 10}%`,
              }}
            >
              <div className="relative">
                <Navigation className="h-6 w-6 text-primary" />
                <div
                  className={`absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-background ${
                    driver.is_online ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Lista de repartidores */}
        <div className="mt-4 space-y-2">
          {drivers.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <p className="text-sm text-muted-foreground">No hay repartidores disponibles</p>
            </div>
          ) : (
            drivers.map((driver) => (
              <div key={driver.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Navigation className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{driver.user.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {Number.parseFloat(driver.current_lat).toFixed(4)},{" "}
                      {Number.parseFloat(driver.current_lng).toFixed(4)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={driver.is_online ? "default" : "secondary"}>
                    {driver.is_online ? "En Línea" : "Fuera de Línea"}
                  </Badge>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ⭐ {Number.parseFloat(driver.rating).toFixed(1)} • {driver.vehicle_type}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
