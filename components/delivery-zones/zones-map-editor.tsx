"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, MapPin, Save, Trash2, Edit, X, PlusCircle } from "lucide-react"
import type { DeliveryZone, Area } from "@/lib/types/database"
import { DeliveryZoneMap } from "./DeliveryZoneMap"
import { Switch } from "@/components/ui/switch"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

export function ZonesMapEditor() {
  const { toast } = useToast()
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [selectedZone, setSelectedZone] = useState<Partial<DeliveryZone> | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchZones = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/delivery-zones")
      const data = await response.json()
      if (response.ok && data.success) {
        setZones(data.data || [])
      } else {
        toast({ title: "Error de Carga", description: data.error || "No se pudieron cargar las zonas.", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error de Conexión", description: "No se pudo comunicar con el servidor para obtener las zonas.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchZones()
  }, [fetchZones])

  const handleNewZoneClick = () => {
    setSelectedZone(null)
    setIsDrawing(true)
    toast({ title: "Modo de Dibujo Activado", description: "Dibuja un polígono o un círculo en el mapa para crear una nueva zona." })
  }

  const handleShapeComplete = (area: Area, shape: google.maps.Polygon | google.maps.Circle) => {
    setIsDrawing(false)
    shape.setMap(null) // Remove the temporary shape from the drawing manager
    setSelectedZone({
      name: "",
      description: "",
      delivery_fee: 0,
      minimum_order: 0,
      color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
      is_active: true,
      area,
    })
    toast({ title: "Forma Creada", description: "Rellena los detalles de la nueva zona y guárdala." })
  }

  const handlePolygonComplete = (polygon: google.maps.Polygon) => {
    const paths = polygon.getPath().getArray()
    const coordinates = paths.map(p => ({ lat: p.lat(), lng: p.lng() }))
    if (coordinates.length > 0) coordinates.push(coordinates[0]) // Close the loop
    handleShapeComplete({ type: "Polygon", coordinates: [coordinates] }, polygon)
  }

  const handleCircleComplete = (circle: google.maps.Circle) => {
    const center = circle.getCenter()!
    const radius = circle.getRadius()
    handleShapeComplete({ type: "Circle", coordinates: { lat: center.lat(), lng: center.lng() }, radius }, circle)
  }

  const handleSaveZone = async () => {
    if (!selectedZone || !selectedZone.name) {
      toast({ title: "Campo Requerido", description: "El nombre de la zona es obligatorio.", variant: "destructive" })
      return
    }
    if (!selectedZone.area) {
      toast({ title: "Área Requerida", description: "La zona debe tener un área definida en el mapa.", variant: "destructive" })
      return
    }

    setSubmitting(true)
    try {
      const url = selectedZone.id ? `/api/delivery-zones/${selectedZone.id}` : "/api/delivery-zones"
      const method = selectedZone.id ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedZone),
      })

      const result = await response.json()

      if (result.success) {
        toast({ title: "¡Éxito!", description: `Zona ${selectedZone.id ? "actualizada" : "guardada"} correctamente.` })
        fetchZones() // Refetch all zones to get the source of truth
        setSelectedZone(null)
      } else {
        toast({ title: "Error al Guardar", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error de Conexión", description: "No se pudo conectar con el servidor para guardar la zona.", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteZone = async (id: number) => {
    if (!confirm("¿Estás seguro? Esta acción no se puede deshacer.")) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/delivery-zones/${id}`, { method: "DELETE" })
      const result = await response.json()

      if (result.success) {
        toast({ title: "Eliminada", description: "La zona ha sido eliminada." })
        setZones(prev => prev.filter(z => z.id !== id))
        if (selectedZone?.id === id) {
          setSelectedZone(null)
        }
      } else {
        toast({ title: "Error al Eliminar", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error de Conexión", description: "No se pudo conectar con el servidor.", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSelectZone = (zoneId: number) => {
    const zoneToSelect = zones.find(z => z.id === zoneId)
    if (zoneToSelect) {
      setSelectedZone(zoneToSelect)
      setIsDrawing(false) // Cancel drawing mode if a zone is selected
    }
  }

  const handleCancel = () => {
    setSelectedZone(null)
    setIsDrawing(false)
  }

  const displayedZones = useMemo(() => {
    const existingZones = [...zones]
    if (selectedZone && !selectedZone.id) {
        // This is a new, unsaved zone. Add it to the map for preview.
        return [...existingZones, selectedZone as DeliveryZone];
    }
    return existingZones;
  }, [zones, selectedZone]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>Mapa de Zonas</span>
              </div>
              <Button onClick={handleNewZoneClick} size="sm" disabled={isDrawing || submitting}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Zona
              </Button>
            </CardTitle>
            <CardDescription>Dibuja polígonos o círculos para definir las áreas y sus costos de envío.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-[500px] w-full overflow-hidden rounded-lg border bg-muted">
              {GOOGLE_MAPS_API_KEY ? (
                <DeliveryZoneMap
                  apiKey={GOOGLE_MAPS_API_KEY}
                  zones={displayedZones}
                  selectedZoneId={selectedZone?.id}
                  onZoneClick={handleSelectZone}
                  onPolygonComplete={handlePolygonComplete}
                  onCircleComplete={handleCircleComplete}
                  isDrawing={isDrawing}
                />
              ) : (
                <div className="flex h-full items-center justify-center p-4 text-center">
                  <p className="text-destructive-foreground bg-destructive p-3 rounded-md">La clave de API de Google Maps no está configurada. Renombra la variable a NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en tu .env.local y reinicia el servidor.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Zonas Guardadas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="flex items-center justify-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cargando zonas...</div>
            ) : zones.length > 0 ? (
              <div className="space-y-2">
                {zones.map(zone => (
                  <div
                    key={zone.id}
                    className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all ${selectedZone?.id === zone.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => handleSelectZone(zone.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full border-2" style={{ backgroundColor: `${zone.color}80`, borderColor: zone.color }} />
                      <div>
                        <div className="font-medium">{zone.name}</div>
                        <Badge variant={zone.is_active ? "default" : "outline"}>{zone.is_active ? "Activa" : "Inactiva"}</Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div>Costo: ${zone.delivery_fee.toFixed(2)}</div>
                      <div>Mínimo: ${zone.minimum_order.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleSelectZone(zone.id); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); zone.id && handleDeleteZone(zone.id); }} disabled={submitting}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No hay zonas creadas. ¡Crea tu primera zona en el mapa!</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="lg:col-span-1 h-fit sticky top-6">
        <CardHeader>
          <CardTitle>Configuración de Zona</CardTitle>
          <CardDescription>Detalles de la zona seleccionada o de la nueva zona a crear.</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedZone ? (
            <div className="space-y-4">
                {isDrawing && <p className="text-sm text-center text-blue-500">Termina de dibujar en el mapa para continuar</p>}
                <div className="space-y-2">
                    <Label htmlFor="zone-name">Nombre</Label>
                    <Input id="zone-name" value={selectedZone.name || ""} onChange={e => setSelectedZone(p => p && {...p, name: e.target.value })} placeholder="Ej: Zona Centro" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="zone-description">Descripción (Opcional)</Label>
                    <Textarea id="zone-description" value={selectedZone.description || ""} onChange={e => setSelectedZone(p => p && {...p, description: e.target.value })} rows={2} placeholder="Ej: Cobertura en el primer cuadro de la ciudad" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="delivery-fee">Costo Envío</Label>
                    <Input id="delivery-fee" type="number" value={selectedZone.delivery_fee ?? 0} onChange={e => setSelectedZone(p => p && {...p, delivery_fee: Number(e.target.value) })} />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="minimum-order">Pedido Mínimo</Label>
                    <Input id="minimum-order" type="number" value={selectedZone.minimum_order ?? 0} onChange={e => setSelectedZone(p => p && {...p, minimum_order: Number(e.target.value) })} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="zone-color">Color</Label>
                    <Input id="zone-color" type="color" value={selectedZone.color || "#FF0000"} onChange={e => setSelectedZone(p => p && {...p, color: e.target.value })} className="w-full h-10 p-1" />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor="is_active" className="font-medium">¿Zona Activa?</Label>
                    <Switch id="is_active" checked={selectedZone.is_active} onCheckedChange={c => setSelectedZone(p => p && {...p, is_active: c })} />
                </div>
                <div className="flex flex-col gap-2 pt-2">
                    <Button onClick={handleSaveZone} disabled={submitting || !selectedZone.area} className="w-full">
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {selectedZone.id ? "Actualizar Zona" : "Guardar Nueva Zona"}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} className="w-full">
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                    </Button>
                </div>
            </div>
          ) : isDrawing ? (
            <div className="text-center py-10 text-muted-foreground">
                <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4"/>
                <p>Dibuja una forma en el mapa para configurar los detalles de la nueva zona.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <MapPin className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Selecciona una zona para editarla o crea una nueva.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
