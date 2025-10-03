"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Driver {
  id: number
  full_name: string
  status: 'available' | 'delivering' | 'offline'; // Assuming these statuses exist
  // Add any other relevant properties from your actual driver data
}

export function ActiveDrivers() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActiveDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming your API can filter by an 'is_online' or similar query param
      const response = await fetch("/api/drivers?is_online=true")
      const data = await response.json()

      if (data.success) {
        setDrivers((data.data || []).slice(0, 5)) // Show top 5 active drivers
      } else {
        throw new Error(data.error || "Failed to fetch active drivers.")
      }
    } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.")
        console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActiveDrivers()
    const interval = setInterval(fetchActiveDrivers, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'delivering': return 'warning';
      default: return 'outline';
    }
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Repartidores Activos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-muted-foreground">Cargando...</p>
        ) : error ? (
            <p className="text-red-500 text-sm">Error: {error}</p>
        ) : drivers.length === 0 ? (
          <p className="text-muted-foreground">No hay repartidores activos en este momento.</p>
        ) : (
          drivers.map((driver) => (
            <div key={driver.id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{driver.full_name}</p>
                {/* Placeholder for real data if available */}
                <p className="text-sm text-muted-foreground">ID: {driver.id}</p>
              </div>
              <Badge variant={getStatusVariant(driver.status)}>{driver.status}</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
