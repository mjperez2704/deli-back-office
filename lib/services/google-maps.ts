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
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("Google Maps API key is not configured.");
    // En lugar de devolver datos mock, lanzamos un error para que el problema sea visible.
    throw new Error("Google Maps API key is not configured.");
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
    url.searchParams.append("origin", `${origin.lat},${origin.lng}`);
    url.searchParams.append("destination", `${destination.lat},${destination.lng}`);
    url.searchParams.append("mode", "driving");
    url.searchParams.append("key", apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== "OK" || !data.routes || data.routes.length === 0) {
      console.error("Google Maps API error:", data.status, data.error_message);
      return null;
    }

    const route = data.routes[0];
    const leg = route.legs[0];

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
    };
  } catch (error) {
    console.error("Error calculating route:", error);
    return null;
  }
}

/**
 * Convierte una dirección en coordenadas usando Google Maps Geocoding API
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("Google Maps API key is not configured.");
    throw new Error("Google Maps API key is not configured.");
  }
    
  try {
    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.append("address", address);
    url.searchParams.append("key", apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.error("Google Maps Geocoding API error:", data.status, data.error_message);
      return null;
    }

    const result = data.results[0];

    return {
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      formatted_address: result.formatted_address,
      place_id: result.place_id,
    };
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
}

/**
 * Calcula la matriz de distancias entre múltiples orígenes y destinos
 */
export async function calculateDistanceMatrix(
  origins: Array<{ lat: number; lng: number }>,
  destinations: Array<{ lat: number; lng: number }>,
): Promise<Array<Array<{ distance: number; duration: number }>> | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("Google Maps API key is not configured.");
    throw new Error("Google Maps API key is not configured.");
  }
    
  try {
    const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
    url.searchParams.append("origins", origins.map((o) => `${o.lat},${o.lng}`).join("|"));
    url.searchParams.append("destinations", destinations.map((d) => `${d.lat},${d.lng}`).join("|"));
    url.searchParams.append("mode", "driving");
    url.searchParams.append("key", apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== "OK") {
      console.error("Google Maps Distance Matrix API error:", data.status, data.error_message);
      return null;
    }

    return data.rows.map((row: any) =>
      row.elements.map((element: any) => ({
        distance: element.distance.value,
        duration: element.duration.value,
      })),
    );
  } catch (error) {
    console.error("Error calculating distance matrix:", error);
    return null;
  }
}
