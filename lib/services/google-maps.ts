// Servicio de integración con Google Maps API

export interface RouteResult {
  distance: {
    text: string
    value: number // metros
  }
  duration: {
    text: string
    value: number // segundos
  }
  polyline: string
  steps: Array<{
    distance: { text: string; value: number }
    duration: { text: string; value: number }
    instruction: string
    start_location: { lat: number; lng: number }
    end_location: { lat: number; lng: number }
  }>
}

export interface GeocodingResult {
  lat: number
  lng: number
  formatted_address: string
  place_id?: string
}

/**
 * Calcula la ruta entre dos puntos usando Google Maps Directions API
 */
export async function calculateRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): Promise<RouteResult | null> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.warn(" Google Maps API key not configured, using mock data")
      return getMockRoute(origin, destination)
    }

    const url = new URL("https://maps.googleapis.com/maps/api/directions/json")
    url.searchParams.append("origin", `${origin.lat},${origin.lng}`)
    url.searchParams.append("destination", `${destination.lat},${destination.lng}`)
    url.searchParams.append("mode", "driving")
    url.searchParams.append("key", apiKey)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== "OK" || !data.routes || data.routes.length === 0) {
      console.error(" Google Maps API error:", data.status)
      return null
    }

    const route = data.routes[0]
    const leg = route.legs[0]

    return {
      distance: leg.distance,
      duration: leg.duration,
      polyline: route.overview_polyline.points,
      steps: leg.steps.map((step: any) => ({
        distance: step.distance,
        duration: step.duration,
        instruction: step.html_instructions.replace(/<[^>]*>/g, ""), // Remove HTML tags
        start_location: step.start_location,
        end_location: step.end_location,
      })),
    }
  } catch (error) {
    console.error(" Error calculating route:", error)
    return null
  }
}

/**
 * Convierte una dirección en coordenadas usando Google Maps Geocoding API
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.warn(" Google Maps API key not configured, using mock data")
      return getMockGeocode(address)
    }

    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json")
    url.searchParams.append("address", address)
    url.searchParams.append("key", apiKey)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.error(" Google Maps Geocoding API error:", data.status)
      return null
    }

    const result = data.results[0]

    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formatted_address: result.formatted_address,
      place_id: result.place_id,
    }
  } catch (error) {
    console.error(" Error geocoding address:", error)
    return null
  }
}

/**
 * Calcula la matriz de distancias entre múltiples orígenes y destinos
 */
export async function calculateDistanceMatrix(
  origins: Array<{ lat: number; lng: number }>,
  destinations: Array<{ lat: number; lng: number }>,
): Promise<Array<Array<{ distance: number; duration: number }>> | null> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.warn(" Google Maps API key not configured, using mock data")
      return getMockDistanceMatrix(origins, destinations)
    }

    const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json")
    url.searchParams.append("origins", origins.map((o) => `${o.lat},${o.lng}`).join("|"))
    url.searchParams.append("destinations", destinations.map((d) => `${d.lat},${d.lng}`).join("|"))
    url.searchParams.append("mode", "driving")
    url.searchParams.append("key", apiKey)

    const response = await fetch(url.toString())
    const data = await response.json()

    if (data.status !== "OK") {
      console.error(" Google Maps Distance Matrix API error:", data.status)
      return null
    }

    return data.rows.map((row: any) =>
      row.elements.map((element: any) => ({
        distance: element.distance.value,
        duration: element.duration.value,
      })),
    )
  } catch (error) {
    console.error(" Error calculating distance matrix:", error)
    return null
  }
}

// Mock functions para desarrollo sin API key
function getMockRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): RouteResult {
  const distance = Math.sqrt(Math.pow(destination.lat - origin.lat, 2) + Math.pow(destination.lng - origin.lng, 2))
  const distanceKm = distance * 111 // Aproximación
  const distanceMeters = Math.round(distanceKm * 1000)
  const durationSeconds = Math.round((distanceKm / 30) * 3600) // 30 km/h promedio

  return {
    distance: {
      text: `${distanceKm.toFixed(1)} km`,
      value: distanceMeters,
    },
    duration: {
      text: `${Math.round(durationSeconds / 60)} min`,
      value: durationSeconds,
    },
    polyline: "mock_polyline_encoded_string",
    steps: [
      {
        distance: { text: `${distanceKm.toFixed(1)} km`, value: distanceMeters },
        duration: { text: `${Math.round(durationSeconds / 60)} min`, value: durationSeconds },
        instruction: "Head to destination",
        start_location: origin,
        end_location: destination,
      },
    ],
  }
}

function getMockGeocode(address: string): GeocodingResult {
  return {
    lat: 19.432608 + Math.random() * 0.01,
    lng: -99.133209 + Math.random() * 0.01,
    formatted_address: address,
    place_id: "mock_place_id",
  }
}

function getMockDistanceMatrix(
  origins: Array<{ lat: number; lng: number }>,
  destinations: Array<{ lat: number; lng: number }>,
): Array<Array<{ distance: number; duration: number }>> {
  return origins.map((origin) =>
    destinations.map((destination) => {
      const distance = Math.sqrt(Math.pow(destination.lat - origin.lat, 2) + Math.pow(destination.lng - origin.lng, 2))
      const distanceKm = distance * 111
      const distanceMeters = Math.round(distanceKm * 1000)
      const durationSeconds = Math.round((distanceKm / 30) * 3600)

      return {
        distance: distanceMeters,
        duration: durationSeconds,
      }
    }),
  )
}
