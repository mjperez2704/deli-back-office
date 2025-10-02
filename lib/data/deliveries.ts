import type { DeliveryTracking } from "@/lib/types"

export const mockDeliveries: DeliveryTracking[] = [
  {
    orderId: "1001",
    deliveryPersonId: "2",
    deliveryPersonName: "María García",
    customerName: "Juan Pérez",
    address: "Calle Mayor 123, Madrid",
    status: "en ruta",
    estimatedTime: "15 min",
    currentLocation: "A 2.3 km del destino",
    progress: 65,
  },
  {
    orderId: "1004",
    deliveryPersonId: "2",
    deliveryPersonName: "María García",
    customerName: "Juan Pérez",
    address: "Calle Mayor 123, Madrid",
    status: "en ruta",
    estimatedTime: "8 min",
    currentLocation: "A 0.8 km del destino",
    progress: 85,
  },
  {
    orderId: "1005",
    deliveryPersonId: "4",
    deliveryPersonName: "Ana Martínez",
    customerName: "Laura Fernández",
    address: "Paseo de la Castellana 200, Madrid",
    status: "en ruta",
    estimatedTime: "22 min",
    currentLocation: "A 4.1 km del destino",
    progress: 40,
  },
]
