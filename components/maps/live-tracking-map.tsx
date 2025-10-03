"use client"

import { useEffect, useState, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock } from "lucide-react";
import { useDriverTracking } from "@/lib/hooks/use-driver-tracking";

interface LiveTrackingMapProps {
  orderId: number;
  storeLocation: { lat: number; lng: number };
  deliveryLocation: { lat: number; lng: number };
  googleMapsApiKey: string;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

// Define libraries outside of the component to prevent re-creation
const libraries: ("places" | "drawing" | "geometry")[] = ["places"];

export function LiveTrackingMap({ orderId, storeLocation, deliveryLocation, googleMapsApiKey }: LiveTrackingMapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: googleMapsApiKey,
    libraries,
  });

  const { driverLocation, isConnected } = useDriverTracking(orderId);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<string>("");

  const center = useMemo(() => driverLocation || storeLocation, [driverLocation, storeLocation]);

  useEffect(() => {
    if (isLoaded && driverLocation) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: new google.maps.LatLng(driverLocation.lat, driverLocation.lng),
          destination: new google.maps.LatLng(deliveryLocation.lat, deliveryLocation.lng),
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
            const leg = result.routes[0].legs[0];
            if (leg.duration) {
              const arrivalTime = new Date(Date.now() + leg.duration.value * 1000);
              setEstimatedArrival(arrivalTime.toLocaleTimeString());
            }
          } else {
            console.error(`error fetching directions ${result}`);
          }
        }
      );
    }
  }, [isLoaded, driverLocation, deliveryLocation]);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Live Tracking</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-xs text-muted-foreground">{isConnected ? "Live" : "Offline"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={14}
          >
            {storeLocation && <Marker position={storeLocation} label="Store" />}
            {deliveryLocation && <Marker position={deliveryLocation} label="You" />}
            {driverLocation && <Marker position={driverLocation} label="Driver" icon={{ url: "/driver-icon.svg", scaledSize: new google.maps.Size(40, 40) }} />}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        </div>

        {directions && (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Distance</span>
              </div>
              <Badge variant="secondary">{directions.routes[0].legs[0].distance?.text}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Estimated Time</span>
              </div>
              <Badge variant="secondary">{directions.routes[0].legs[0].duration?.text}</Badge>
            </div>
            {estimatedArrival && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Arrival Time</span>
                </div>
                <Badge>{estimatedArrival}</Badge>
              </div>
            )}
          </div>
        )}

        {!driverLocation && (
          <div className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">Waiting for driver location...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
