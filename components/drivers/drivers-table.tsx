"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, MapPin, Phone, Mail } from "lucide-react"
import Link from "next/link"

interface Driver {
  id: number
  full_name: string
  phone: string
  email: string
  vehicle_type: string
  license_plate: string
  is_online: boolean
  current_lat?: number
  current_lng?: number
  rating: number
  total_deliveries: number
}

export function DriversTable() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDrivers()
    const interval = setInterval(fetchDrivers, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDrivers = async () => {
    try {
      const response = await fetch("/api/drivers")
      if (response.ok) {
        const data = await response.json()
        setDrivers(data)
      }
    } catch (error) {
      console.error("Error fetching drivers:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? "bg-[#00ff00] text-black" : "bg-muted text-muted-foreground"
  }

  const getStatusText = (isOnline: boolean) => {
    return isOnline ? "En línea" : "Desconectado"
  }

  if (loading) {
    return <div className="text-muted-foreground">Cargando repartidores...</div>
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Todos los Repartidores</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {drivers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No hay repartidores registrados</p>
          ) : (
            drivers.map((driver) => (
              <div
                key={driver.id}
                className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-muted-foreground transition-colors"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">{driver.full_name}</h3>
                    <Badge className={getStatusColor(driver.is_online)}>{getStatusText(driver.is_online)}</Badge>
                    <span className="text-sm text-muted-foreground">
                      ⭐ {driver.rating.toFixed(1)} ({driver.total_deliveries} entregas)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {driver.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {driver.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {driver.vehicle_type} - {driver.license_plate}
                    </div>
                  </div>
                </div>

                <Link href={`/drivers/${driver.id}`}>
                  <Button variant="outline" size="sm" className="border-border hover:bg-muted bg-transparent">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
