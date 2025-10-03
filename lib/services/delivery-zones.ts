import type { DeliveryZone, Area } from "@/lib/types/database"

// Función para verificar si un punto está dentro de un polígono (Ray Casting Algorithm)
function isPointInPolygon(point: { lat: number; lng: number }, polygon: { lat: number; lng: number }[]): boolean {
  let inside = false
  // Asegúrate de que el polígono tenga al menos 3 vértices
  if (polygon.length < 3) {
    return false
  }
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng
    const yi = polygon[i].lat
    const xj = polygon[j].lng
    const yj = polygon[j].lat

    const intersect = yi > point.lat !== yj > point.lat && point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
  }
  return inside
}

// Función para verificar si un punto está dentro de un círculo
function isPointInCircle(
  point: { lat: number; lng: number },
  center: { lat: number; lng: number },
  radiusKm: number,
): boolean {
  const R = 6371 // Radio de la Tierra en km
  const dLat = ((center.lat - point.lat) * Math.PI) / 180
  const dLng = ((center.lng - point.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point.lat * Math.PI) / 180) *
      Math.cos((center.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance <= radiusKm
}

// Verificar si una ubicación está dentro de alguna zona de entrega
export function checkDeliveryZoneCoverage(
  location: { lat: number; lng: number },
  zones: DeliveryZone[],
): {
  isInZone: boolean
  zone: DeliveryZone | null
  deliveryFee: number
  minimumOrder: number
} {
  const activeZones = zones.filter((z) => z.is_active)

  for (const zone of activeZones) {
    let isInside = false
    // El objeto 'area' es el JSON parseado que viene de la API
    const area = zone.area
      const type_area: string = area.type

    if (!area) continue // Si la zona no tiene un área definida, la saltamos

    if (area.type === "Polygon" && area.coordinates) {
      // Los polígonos de Google Maps tienen las coordenadas en un array anidado
      isInside = isPointInPolygon(location, area.coordinates[0])
    } else if (area.type === "Circle" && area.coordinates && area.radius != null) {
      // El radio viene en metros desde el frontend, lo convertimos a KM para el cálculo
      const radiusInKm = area.radius / 1000
      isInside = isPointInCircle(location, area.coordinates, radiusInKm)
    }

    if (isInside) {
      return {
        isInZone: true,
        zone,
        deliveryFee: zone.delivery_fee,
        minimumOrder: zone.minimum_order,
      }
    }
  }

  return {
    isInZone: false,
    zone: null,
    deliveryFee: 0,
    minimumOrder: 0,
  }
}

// Mock data para desarrollo actualizada al nuevo esquema
export const mockDeliveryZones: DeliveryZone[] = [
  {
    id: 1,
    name: "Zona Centro",
    description: "Centro de la ciudad",
    area: {
        type: "Polygon",
        coordinates: [[
            { lat: 19.432, lng: -99.133 },
            { lat: 19.435, lng: -99.128 },
            { lat: 19.428, lng: -99.125 },
            { lat: 19.425, lng: -99.13 },
            { lat: 19.432, lng: -99.133 }, // Coordenada de cierre
        ]]
    },
    delivery_fee: 30,
    minimum_order: 100,
    is_active: true,
    color: "#3B82F6",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: 2,
    name: "Zona Norte",
    description: "Área residencial norte",
    area: {
        type: "Circle",
        coordinates: { lat: 19.45, lng: -99.13 }, // Centro del círculo
        radius: 3000 // Radio en metros
    },
    delivery_fee: 50,
    minimum_order: 150,
    is_active: true,
    color: "#10B981",
    created_at: new Date(),
    updated_at: new Date(),
  },
]
