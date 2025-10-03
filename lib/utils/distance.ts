// Utilidades para cálculo de distancias y rutas

export interface Location {
  lat: number
  lng: number
}

// Calcular distancia entre dos puntos usando fórmula de Haversine
export function calculateDistance(point1: Location, point2: Location): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = toRad(point2.lat - point1.lat)
  const dLng = toRad(point2.lng - point1.lng)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// Encontrar el repartidor más cercano a una ubicación
export function findNearestDriver(
  targetLocation: Location,
  drivers: Array<{ id: number; current_lat: number | null; current_lng: number | null; is_online: boolean }>,
) {
  const availableDrivers = drivers.filter(
    (driver) => driver.is_online && driver.current_lat !== null && driver.current_lng !== null,
  )

  if (availableDrivers.length === 0) {
    return null
  }

  let nearestDriver = availableDrivers[0]
  let minDistance = calculateDistance(targetLocation, {
    lat: nearestDriver.current_lat!,
    lng: nearestDriver.current_lng!,
  })

  for (const driver of availableDrivers.slice(1)) {
    const distance = calculateDistance(targetLocation, {
      lat: driver.current_lat!,
      lng: driver.current_lng!,
    })

    if (distance < minDistance) {
      minDistance = distance
      nearestDriver = driver
    }
  }

  return {
    driver: nearestDriver,
    distance: minDistance,
  }
}

// Estimar tiempo de entrega basado en distancia (velocidad promedio 30 km/h)
export function estimateDeliveryTime(distanceKm: number): number {
  const averageSpeedKmh = 30
  const timeInHours = distanceKm / averageSpeedKmh
  const timeInMinutes = Math.ceil(timeInHours * 60)

  // Agregar tiempo de preparación (15 minutos)
  return timeInMinutes + 15
}
