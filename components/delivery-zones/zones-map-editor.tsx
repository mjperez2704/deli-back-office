'use client';

import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, DrawingManager } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

// Estilos y configuración inicial del mapa
const containerStyle = {
    width: '100%',
    height: '70vh',
    borderRadius: '0.5rem',
};

const center = {
    lat: 20.659698, // Coordenadas centradas en Guadalajara, ajusta según tu necesidad
    lng: -103.349609,
};

// Definimos el tipo para nuestras zonas
interface DeliveryZone {
    id: number;
    name: string;
    area: string; // El área viene como un string JSON desde la BD
}

export function ZonesMapEditor() {
    const [zones, setZones] = useState<DeliveryZone[]>([]);
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        libraries: ['drawing', 'geometry'],
    });

    // Función para cargar las zonas desde la API
    const fetchZones = useCallback(async () => {
        try {
            const response = await fetch('/api/delivery-zones');
            if (!response.ok) throw new Error('Error al cargar las zonas');
            const data = await response.json();
            setZones(data.data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudieron cargar las zonas de entrega.',
                variant: 'destructive',
            });
        }
    }, []);

    useEffect(() => {
        fetchZones();
    }, [fetchZones]);

    // Manejador para cuando se completa el dibujo de un nuevo polígono
    const onPolygonComplete = async (polygon: google.maps.Polygon) => {
        const coordinates = polygon.getPath().getArray().map(latLng => [latLng.lng(), latLng.lat()]);

        // Para un polígono GeoJSON válido, el primer y último punto deben coincidir.
        coordinates.push(coordinates[0]);

        const newZonePayload = {
            name: `Nueva Zona ${zones.length + 1}`, // Nombre temporal
            area: {
                type: 'Polygon',
                coordinates: [coordinates],
            },
        };

        // Llamada a la API para guardar la nueva zona
        try {
            const response = await fetch('/api/delivery-zones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newZonePayload),
            });

            if (!response.ok) throw new Error('No se pudo guardar la zona.');

            toast({
                title: 'Éxito',
                description: 'Nueva zona de entrega creada.',
            });
            fetchZones(); // Recargamos las zonas para mostrar la nueva
        } catch (error) {
            toast({
                title: 'Error',
                description: (error as Error).message,
                variant: 'destructive',
            });
        }

        polygon.setMap(null); // Eliminamos el polígono del mapa una vez guardado
    };

    if (loadError) {
        return <div>Error al cargar el mapa. Asegúrate de que la clave de API de Google Maps sea correcta.</div>;
    }

    return isLoaded ? (
        <div className="space-y-4">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={12}
                options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                }}
            >
                {/* Dibuja todas las zonas existentes en el mapa */}
                {zones.map(zone => {
                    const area = JSON.parse(zone.area);
                    const paths = area.coordinates[0].map((coord: [number, number]) => ({ lat: coord[1], lng: coord[0] }));
                    return (
                        <Polygon
                            key={zone.id}
                            paths={paths}
                            options={{
                                fillColor: '#007BFF',
                                fillOpacity: 0.2,
                                strokeColor: '#007BFF',
                                strokeOpacity: 0.8,
                                strokeWeight: 2,
                                clickable: true,
                                draggable: false, // La edición de vértices se habilita con 'editable'
                                editable: true,
                            }}
                            // Aquí podrías agregar lógica para actualizar la zona cuando se edita
                            // onMouseUp={handlePolygonUpdate}
                        />
                    );
                })}

                {/* Componente de Google Maps para habilitar las herramientas de dibujo */}
                <DrawingManager
                    onPolygonComplete={onPolygonComplete}
                    options={{
                        drawingControl: true,
                        drawingControlOptions: {
                            position: window.google.maps.ControlPosition.TOP_CENTER,
                            drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
                        },
                        polygonOptions: {
                            fillColor: '#FFC107',
                            fillOpacity: 0.3,
                            strokeWeight: 2,
                            clickable: false,
                            editable: true,
                            zIndex: 1,
                        },
                    }}
                />
            </GoogleMap>
            <p className="text-sm text-muted-foreground">
                Usa la herramienta de polígono (□) en la parte superior del mapa para dibujar una nueva zona. Puedes arrastrar los puntos de las zonas existentes para editarlas.
            </p>
        </div>
    ) : <div>Cargando mapa...</div>;
}
