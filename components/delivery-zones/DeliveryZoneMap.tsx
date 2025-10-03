/* eslint-disable no-undef */
"use client"

import {
  GoogleMap,
  useJsApiLoader,
  DrawingManager,
  Polygon,
  Circle,
} from "@react-google-maps/api"
import { useCallback, useEffect, useRef } from "react"
import type { DeliveryZone } from "@/lib/types/database"

interface ZoneShape {
  type: "Polygon" | "Circle"
  coordinates: any
  radius?: number
}

// Update the DeliveryZone type to accept an array of shapes for its area
type MappedDeliveryZone = Omit<DeliveryZone, 'area'> & {
  area: ZoneShape[]
}

const containerStyle = {
  width: "100%",
  height: "100%",
}

const defaultCenter = {
  lat: 19.4326, // Mexico City
  lng: -99.1332,
}

interface DeliveryZoneMapProps {
  apiKey: string
  zones: MappedDeliveryZone[]
  selectedZoneId?: number | null
  onZoneClick: (zoneId: number) => void
  onPolygonComplete: (polygon: google.maps.Polygon) => void
  onCircleComplete: (circle: google.maps.Circle) => void
  isDrawing: boolean
}

export function DeliveryZoneMap({
  apiKey,
  zones = [],
  selectedZoneId,
  onZoneClick,
  onPolygonComplete,
  onCircleComplete,
  isDrawing,
}: DeliveryZoneMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ["drawing", "geometry"],
  })

  const mapRef = useRef<google.maps.Map | null>(null)

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    mapRef.current = mapInstance
    // Center map on user's location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        mapInstance.setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        mapInstance.setZoom(12)
      })
    }
  }, [])

  const onUnmount = useCallback(function callback() {
    mapRef.current = null
  }, [])

  // Auto-zoom to fit the selected zone's shapes
  useEffect(() => {
    if (mapRef.current && selectedZoneId) {
      const zone = zones.find(z => z.id === selectedZoneId)
      if (zone && zone.area.length > 0) {
        const bounds = new google.maps.LatLngBounds()
        zone.area.forEach(shape => {
          if (shape.type === "Polygon") {
            shape.coordinates[0].forEach((coord: { lat: number; lng: number }) => {
              bounds.extend(new google.maps.LatLng(coord.lat, coord.lng))
            })
          } else if (shape.type === "Circle") {
            // For circles, we can extend bounds by calculating the rough corners of a bounding box
            const center = new google.maps.LatLng(shape.coordinates.lat, shape.coordinates.lng)
            const circle = new google.maps.Circle({ center, radius: shape.radius })
            bounds.union(circle.getBounds()!)
          }
        })
        if (!bounds.isEmpty()) {
          mapRef.current.fitBounds(bounds)
        }
      }
    }
  }, [selectedZoneId, zones])

  if (loadError) {
    return <div>Error al cargar el mapa.</div>
  }

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={10}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {isDrawing && (
        <DrawingManager
          onPolygonComplete={onPolygonComplete}
          onCircleComplete={onCircleComplete}
          options={{
            drawingControl: true,
            drawingControlOptions: {
              position: google.maps.ControlPosition.TOP_CENTER,
              drawingModes: [google.maps.drawing.OverlayType.POLYGON, google.maps.drawing.OverlayType.CIRCLE],
            },
            polygonOptions: { fillOpacity: 0.3, strokeWeight: 2, clickable: false, editable: true, zIndex: 1 },
            circleOptions: { fillOpacity: 0.3, strokeWeight: 2, clickable: false, editable: true, zIndex: 1 },
          }}
        />
      )}

      {zones.map(zone => {
        const isSelected = zone.id === selectedZoneId
        const options = {
          fillColor: zone.color,
          fillOpacity: isSelected ? 0.5 : 0.2,
          strokeColor: zone.color,
          strokeOpacity: 1,
          strokeWeight: isSelected ? 3 : 1.5,
          clickable: true,
          zIndex: isSelected ? 2 : 1,
        }
        
        // A zone can now have multiple shapes, so we iterate through them
        return zone.area.map((shape, index) => {
          const key = `${zone.id}-${index}`
          if (shape.type === "Polygon") {
            return (
              <Polygon
                key={key}
                paths={shape.coordinates[0]}
                options={options}
                onClick={() => onZoneClick(zone.id)}
              />
            )
          } else if (shape.type === "Circle" && shape.radius) {
            return (
              <Circle
                key={key}
                center={shape.coordinates}
                radius={shape.radius}
                options={options}
                onClick={() => onZoneClick(zone.id)}
              />
            )
          }
          return null
        })
      })}
    </GoogleMap>
  ) : (
    <div>Cargando mapa...</div>
  )
}
