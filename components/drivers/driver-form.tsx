"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface DriverFormProps {
  driverId?: string
}

interface DriverData {
  full_name: string
  phone: string
  email: string
  vehicle_type: string
  license_plate: string
}

export function DriverForm({ driverId }: DriverFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<DriverData>({
    full_name: "",
    phone: "",
    email: "",
    vehicle_type: "moto",
    license_plate: "",
  })

  useEffect(() => {
    if (driverId) {
      fetchDriver()
    }
  }, [driverId])

  const fetchDriver = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/drivers/${driverId}`)
      if (response.ok) {
        const driver = await response.json()
        setFormData({
          full_name: driver.full_name,
          phone: driver.phone,
          email: driver.email,
          vehicle_type: driver.vehicle_type,
          license_plate: driver.license_plate,
        })
      }
    } catch (error) {
      console.error("Error fetching driver:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = driverId ? `/api/drivers/${driverId}` : "/api/drivers"
      const method = driverId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/drivers")
        router.refresh()
      } else {
        alert("Error al guardar el repartidor")
      }
    } catch (error) {
      console.error("Error saving driver:", error)
      alert("Error al guardar el repartidor")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">{driverId ? "Editar" : "Nuevo"} Repartidor</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="full_name" className="text-foreground">
              Nombre Completo
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">
                Teléfono
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vehicle_type" className="text-foreground">
                Tipo de Vehículo
              </Label>
              <Select
                value={formData.vehicle_type}
                onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })}
              >
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moto">Moto</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="bicicleta">Bicicleta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_plate" className="text-foreground">
                Patente
              </Label>
              <Input
                id="license_plate"
                value={formData.license_plate}
                onChange={(e) => setFormData({ ...formData, license_plate: e.target.value })}
                required
                className="bg-background border-border text-foreground"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={submitting} className="bg-[#00ff00] text-black hover:bg-[#00dd00]">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Repartidor"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/drivers")}
              className="border-border hover:bg-muted"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
