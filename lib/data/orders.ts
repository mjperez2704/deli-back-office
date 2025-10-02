import type { Order } from "@/lib/types"

export const mockOrders: Order[] = [
  {
    id: "1001",
    customerId: "1",
    customerName: "Juan Pérez",
    deliveryPersonId: "2",
    deliveryPersonName: "María García",
    items: [
      { productId: "1", productName: "Pizza Margarita", quantity: 2, price: 12.99 },
      { productId: "3", productName: "Coca-Cola 500ml", quantity: 2, price: 2.5 },
    ],
    total: 30.98,
    status: "en ruta",
    address: "Calle Mayor 123, Madrid",
    createdAt: "2024-03-15T14:30:00",
  },
  {
    id: "1002",
    customerId: "3",
    customerName: "Carlos López",
    deliveryPersonId: "4",
    deliveryPersonName: "Ana Martínez",
    items: [
      { productId: "2", productName: "Hamburguesa Deluxe", quantity: 1, price: 9.99 },
      { productId: "4", productName: "Tarta de Chocolate", quantity: 1, price: 5.99 },
    ],
    total: 15.98,
    status: "entregado",
    address: "Avenida Libertad 45, Madrid",
    createdAt: "2024-03-15T13:15:00",
  },
  {
    id: "1003",
    customerId: "5",
    customerName: "Pedro Sánchez",
    items: [
      { productId: "1", productName: "Pizza Margarita", quantity: 1, price: 12.99 },
      { productId: "6", productName: "Agua Mineral 1L", quantity: 1, price: 1.5 },
    ],
    total: 14.49,
    status: "pagado",
    address: "Plaza España 8, Madrid",
    createdAt: "2024-03-15T15:00:00",
  },
  {
    id: "1004",
    customerId: "1",
    customerName: "Juan Pérez",
    deliveryPersonId: "2",
    deliveryPersonName: "María García",
    items: [{ productId: "2", productName: "Hamburguesa Deluxe", quantity: 3, price: 9.99 }],
    total: 29.97,
    status: "en ruta",
    address: "Calle Mayor 123, Madrid",
    createdAt: "2024-03-15T14:45:00",
  },
]
