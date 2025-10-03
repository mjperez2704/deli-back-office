"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Clock } from "lucide-react"
import { useDriverTracking } from "@/lib/hooks/use-driver-tracking"

interface LiveTrackingMapProps {
  orderId: number
  storeLocation: { lat: number; lng: number }
  deliveryLocation: { lat: number; lng: number }
}

export function LiveTrackingMap({ orderId, storeLocation, deliveryLocation }: LiveTrackingMapProps) {
  const { driverLocation, isConnected } = useDriverTracking(orderId)
  const [route, setRoute] = useState<any>(null)
  const [estimatedArrival, setEstimatedArrival] = useState<string>("")

  useEffect(() => {
    // Calcular ruta cuando hay ubicación del repartidor
    if (driverLocation) {
      fetchRoute()
    }
  }, [driverLocation])

  const fetchRoute = async () => {
    if (!driverLocation) return

    try {
      const response = await fetch("/api/google-maps/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: { lat: driverLocation.lat, lng: driverLocation.lng },
          destination: deliveryLocation,
        }),
      })

      const data = await response.json()
      if (data.route) {
        setRoute(data.route)

        // Calcular tiempo estimado de llegada
        const arrivalTime = new Date(Date.now() + data.route.duration.value * 1000)
        setEstimatedArrival(arrivalTime.toLocaleTimeString())
      }
    } catch (error) {
      console.error(" Error fetching route:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Live Tracking</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-xs text-muted-foreground">{isConnected ? "Live" : "Offline"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mapa - En producción usar Google Maps JavaScript API */}
        <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">Live Map View</p>
              <p className="text-xs text-muted-foreground">Google Maps integration ready</p>
            </div>
          </div>

          {/* Marcadores simulados */}
          <div className="absolute left-[20%] top-[30%]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <p className="mt-1 text-xs font-medium">Store</p>
          </div>

          {driverLocation && (
            <div className="absolute left-[50%] top-[50%]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                <Navigation className="h-5 w-5 text-white" />
              </div>
              <p className="mt-1 text-xs font-medium">Driver</p>
            </div>
          )}

          <div className="absolute right-[20%] bottom-[30%]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <p className="mt-1 text-xs font-medium">Delivery</p>
          </div>
        </div>

        {/* Información de tracking */}
        {route && driverLocation && (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Distance</span>
              </div>
              <Badge variant="secondary">{route.distance.text}</Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Estimated Time</span>
              </div>
              <Badge variant="secondary">{route.duration.text}</Badge>
            </div>

            {estimatedArrival && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Arrival Time</span>
                </div>
                <Badge>{estimatedArrival}</Badge>
              </div>
            )}
          </div>
        )}

        {!driverLocation && (
          <div className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">Waiting for driver location...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
