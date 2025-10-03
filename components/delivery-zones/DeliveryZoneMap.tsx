/* eslint-disable no-undef */
"use client"

import {
  GoogleMap,
  useJsApiLoader,
  DrawingManager,
  Polygon,
  Circle,
} from "@react-google-maps/api"
import { useCallback, useState, useEffect, useRef } from "react"
import type { DeliveryZone } from "@/lib/types/database"

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
  zones: DeliveryZone[]
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
    // Optional: Auto-center map based on user's location
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

  useEffect(() => {
    if (mapRef.current && selectedZoneId) {
      const zone = zones.find(z => z.id === selectedZoneId)
      if (zone?.area.type === "Polygon") {
        const bounds = new google.maps.LatLngBounds()
        zone.area.coordinates[0].forEach(coord => {
          bounds.extend(new google.maps.LatLng(coord.lat, coord.lng))
        })
        mapRef.current.fitBounds(bounds)
      } else if (zone?.area.type === "Circle") {
        mapRef.current.setCenter(zone.area.coordinates)
        mapRef.current.setZoom(14) // Zoom level might need adjustment based on radius
      }
    }
  }, [selectedZoneId, zones])

  if (loadError) {
    return <div>Error al cargar el mapa. Verifica tu conexión y la clave de API.</div>
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
              drawingModes: [
                google.maps.drawing.OverlayType.POLYGON,
                google.maps.drawing.OverlayType.CIRCLE,
              ],
            },
            polygonOptions: {
              fillOpacity: 0.3,
              strokeWeight: 2,
              clickable: false,
              editable: true,
              zIndex: 1,
            },
            circleOptions: {
              fillOpacity: 0.3,
              strokeWeight: 2,
              clickable: false,
              editable: true,
              zIndex: 1,
            },
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

        if (zone.area.type === "Polygon") {
          return (
            <Polygon
              key={zone.id}
              paths={zone.area.coordinates[0]}
              options={options}
              onClick={() => onZoneClick(zone.id)}
            />
          )
        } else if (zone.area.type === "Circle") {
          return (
            <Circle
              key={zone.id}
              center={zone.area.coordinates}
              radius={zone.area.radius}
              options={options}
              onClick={() => onZoneClick(zone.id)}
            />
          )
        }
        return null
      })}
    </GoogleMap>
  ) : (
    <div>Cargando mapa...</div>
  )
}
