"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Driver {
  id: number
  full_name: string
  is_online: boolean
}

export function ActiveDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDrivers() {
      try {
        const response = await fetch("/api/drivers")
        const data = await response.json()

        if (data.drivers) {
          const activeDrivers = data.drivers.filter((d: Driver) => d.is_online).slice(0, 4)
          setDrivers(activeDrivers)
        }
      } catch (error) {
        console.error("Error fetching drivers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDrivers()
    const interval = setInterval(fetchDrivers, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Repartidores Activos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : drivers.length === 0 ? (
          <p className="text-muted-foreground">No hay repartidores activos</p>
        ) : (
          drivers.map((driver, index) => (
            <div key={driver.id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Repartidor {index + 1}</p>
                <p className="text-sm text-muted-foreground">{index + 1} entregas completadas hoy</p>
              </div>
              <span className="rounded-full bg-[#00ffff]/20 px-3 py-1 text-sm font-medium text-[#00ffff]">
                Disponible
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
