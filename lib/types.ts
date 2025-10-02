export type UserRole = "cliente" | "repartidor"
export type UserStatus = "activo" | "inactivo"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  createdAt: string
}

export type ProductCategory = "comida" | "bebida" | "postre" | "otro"
export type ProductStatus = "disponible" | "agotado"

export interface Product {
  id: string
  name: string
  price: number
  category: ProductCategory
  status: ProductStatus
  description?: string
  createdAt: string
}

export type OrderStatus = "pagado" | "en ruta" | "entregado"

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  deliveryPersonId?: string
  deliveryPersonName?: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  address: string
  createdAt: string
}

export interface DeliveryTracking {
  orderId: string
  deliveryPersonId: string
  deliveryPersonName: string
  customerName: string
  address: string
  status: OrderStatus
  estimatedTime: string
  currentLocation: string
  progress: number
}
