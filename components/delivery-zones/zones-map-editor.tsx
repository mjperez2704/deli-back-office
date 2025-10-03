"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, MapPin, Save, Trash2, Edit, X, PlusCircle, CheckCircle } from "lucide-react"
import type { DeliveryZone } from "@/lib/types/database"
import { DeliveryZoneMap } from "./DeliveryZoneMap"
import { Switch } from "@/components/ui/switch"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

interface ZoneShape {
  type: "Polygon" | "Circle"
  coordinates: any
  radius?: number
}

// Update the DeliveryZone type to reflect that `area` is an array of shapes
type EditableDeliveryZone = Omit<Partial<DeliveryZone>, 'area'> & {
  area: ZoneShape[]
};


export function ZonesMapEditor() {
  const { toast } = useToast()
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [selectedZone, setSelectedZone] = useState<EditableDeliveryZone | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Fetch zones from the API
  const fetchZones = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/delivery-zones")
      const data = await response.json()
      if (response.ok && data.success) {
        // Ensure area is parsed and is an array
        const parsedZones = data.data.map((zone: any) => {
          try {
            const area = JSON.parse(zone.area_geojson || '[]')
            return { ...zone, area: Array.isArray(area) ? area : [area] }
          } catch {
            return { ...zone, area: [] }
          }
        })
        setZones(parsedZones)
      } else {
        toast({ title: "Error de Carga", description: data.error || "No se pudieron cargar las zonas.", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error de Conexión", description: "No se pudo comunicar con el servidor.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchZones()
  }, [fetchZones])

  // Start a new zone or add shapes to an existing one
  const handleNewZoneClick = () => {
    setSelectedZone({
        name: "",
        description: "",
        delivery_fee: 0,
        minimum_order: 0,
        color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
        is_active: true,
        area: [], // Initialize with an empty array of shapes
    });
    setIsDrawing(true);
    toast({ title: "Modo de Dibujo Activado", description: "Dibuja una o más formas en el mapa." });
  }

  // Add a completed shape to the selected zone's area array
  const handleShapeComplete = (shapeData: ZoneShape, shape: google.maps.Polygon | google.maps.Circle) => {
    shape.setMap(null); // The shape is handled by the main map component
    setSelectedZone(prev => {
        if (!prev) return null;
        return {
            ...prev,
            area: [...prev.area, shapeData]
        };
    });
    toast({ title: "Forma Añadida", description: "Puedes dibujar otra forma o guardar la zona." });
  }

  const handlePolygonComplete = (polygon: google.maps.Polygon) => {
    const paths = polygon.getPath().getArray()
    const coordinates = paths.map(p => ({ lat: p.lat(), lng: p.lng() }))
    if (coordinates.length > 0) coordinates.push(coordinates[0])
    handleShapeComplete({ type: "Polygon", coordinates: [coordinates] }, polygon)
  }

  const handleCircleComplete = (circle: google.maps.Circle) => {
    const center = circle.getCenter()!
    const radius = circle.getRadius()
    handleShapeComplete({ type: "Circle", coordinates: { lat: center.lat(), lng: center.lng() }, radius }, circle)
  }

  const handleSaveZone = async () => {
    if (!selectedZone || !selectedZone.name) {
      toast({ title: "Campo Requerido", description: "El nombre es obligatorio.", variant: "destructive" });
      return;
    }
    if (!selectedZone.area || selectedZone.area.length === 0) {
      toast({ title: "Área Requerida", description: "La zona debe tener al menos una forma.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    // The body should match what the backend expects, which might be a stringified version of the area
    const payload = {
      ...selectedZone,
      area: JSON.stringify(selectedZone.area)
    };

    try {
      const url = selectedZone.id ? `/api/delivery-zones/${selectedZone.id}` : "/api/delivery-zones";
      const method = selectedZone.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        toast({ title: "¡Éxito!", description: `Zona ${selectedZone.id ? "actualizada" : "guardada"}.` });
        fetchZones();
        setSelectedZone(null);
        setIsDrawing(false);
      } else {
        toast({ title: "Error al Guardar", description: result.error, variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error de Conexión", description: "No se pudo guardar la zona.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }
  
  const handleRemoveShape = (index: number) => {
    setSelectedZone(prev => {
        if (!prev) return null;
        const newArea = prev.area.filter((_, i) => i !== index);
        return { ...prev, area: newArea };
    });
  }

  const handleSelectZone = (zoneId: number) => {
    const zoneToSelect = zones.find(z => z.id === zoneId)
    if (zoneToSelect) {
      // Ensure the area from the server is parsed correctly into an array
      const area = typeof zoneToSelect.area === 'string' ? JSON.parse(zoneToSelect.area) : zoneToSelect.area;
      setSelectedZone({ ...zoneToSelect, area: Array.isArray(area) ? area : [area].filter(Boolean) });
      setIsDrawing(false)
    }
  }
  
  const displayedZones = useMemo(() => {
    const existingZones = zones.map(z => ({
      ...z,
      area: typeof z.area === 'string' ? JSON.parse(z.area) : z.area
    }));
  
    if (selectedZone) {
      const index = existingZones.findIndex(z => z.id === selectedZone.id);
      const zoneForMap = {
        ...selectedZone,
        id: selectedZone.id || Date.now(), // temporary ID for new zones
        area: Array.isArray(selectedZone.area) ? selectedZone.area : [],
      };
      
      if (index > -1) {
        existingZones[index] = zoneForMap as DeliveryZone;
      } else {
        existingZones.push(zoneForMap as DeliveryZone);
      }
    }
    
    return existingZones;
  }, [zones, selectedZone]);
  

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2"><MapPin className="h-5 w-5" /><span>Mapa de Zonas</span></div>
              {!isDrawing ? (
                <Button onClick={handleNewZoneClick} size="sm" disabled={submitting}><PlusCircle className="mr-2 h-4 w-4" />Crear Nueva Zona</Button>
              ) : (
                <Button onClick={() => setIsDrawing(false)} size="sm" variant="secondary"><CheckCircle className="mr-2 h-4 w-4" />Finalizar Dibujo</Button>
              )}
            </CardTitle>
            <CardDescription>Dibuja múltiples polígonos o círculos para definir las áreas de una zona.</CardDescription>
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
                  <p className="text-destructive-foreground bg-destructive p-3 rounded-md">API Key de Google Maps no configurada.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Saved Zones List remains the same */}
      </div>

      <Card className="lg:col-span-1 h-fit sticky top-6">
        <CardHeader>
          <CardTitle>Configuración de Zona</CardTitle>
          <CardDescription>{selectedZone ? "Editando detalles de la zona." : "Selecciona o crea una zona."}</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedZone ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zone-name">Nombre</Label>
                <Input id="zone-name" value={selectedZone.name || ""} onChange={e => setSelectedZone(p => p && {...p, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Áreas Geográficas ({selectedZone.area?.length || 0})</Label>
                <div className="space-y-2 rounded-md border p-2 max-h-32 overflow-y-auto">
                    {selectedZone.area?.length > 0 ? selectedZone.area.map((shape, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-1 bg-muted rounded">
                            <span>{shape.type === 'Polygon' ? 'Polígono' : 'Círculo'} {index + 1}</span>
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveShape(index)}><Trash2 className="h-3 w-3"/></Button>
                        </div>
                    )) : <p className="text-xs text-center text-muted-foreground p-2">Aún no has dibujado ninguna forma.</p>}
                </div>
                {isDrawing && <Button onClick={() => setIsDrawing(true)} size="sm" variant="outline" className="w-full"><PlusCircle className="mr-2 h-4 w-4"/>Añadir otra forma</Button>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="delivery-fee">Costo Envío</Label><Input id="delivery-fee" type="number" value={selectedZone.delivery_fee ?? 0} onChange={e => setSelectedZone(p => p && {...p, delivery_fee: Number(e.target.value)})} /></div>
                <div className="space-y-2"><Label htmlFor="minimum-order">Pedido Mínimo</Label><Input id="minimum-order" type="number" value={selectedZone.minimum_order ?? 0} onChange={e => setSelectedZone(p => p && {...p, minimum_order: Number(e.target.value)})} /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="zone-color">Color</Label><Input id="zone-color" type="color" value={selectedZone.color || "#FF0000"} onChange={e => setSelectedZone(p => p && {...p, color: e.target.value })} className="w-full h-10 p-1" /></div>
              <div className="flex items-center justify-between rounded-lg border p-3"><Label htmlFor="is_active" className="font-medium">¿Zona Activa?</Label><Switch id="is_active" checked={!!selectedZone.is_active} onCheckedChange={c => setSelectedZone(p => p && {...p, is_active: c })} /></div>
              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={handleSaveZone} disabled={submitting || (selectedZone.area?.length || 0) === 0} className="w-full">
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {selectedZone.id ? "Actualizar Zona" : "Guardar Nueva Zona"}
                </Button>
                <Button variant="outline" onClick={() => { setSelectedZone(null); setIsDrawing(false); }} className="w-full"><X className="mr-2 h-4 w-4" />Cancelar</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <MapPin className="h-12 w-12 text-muted-foreground" /><p className="mt-4 text-muted-foreground">Selecciona una zona para editarla o crea una nueva.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}