// Tipos TypeScript basados en el esquema de base de datos

export type UserRole = "CUSTOMER" | "DRIVER" | "ADMIN";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery" // <-- CORRECCIÓN: Añadido el estado que faltaba
  | "delivered"
  | "cancelled";

export interface User {
  id: number;
  email: string;
  password_hash?: string; // Es opcional porque no siempre lo queremos exponer
  full_name: string;
  phone: string | null;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface Driver {
  id: number;
  user_id: number;
  vehicle_type: string;
  license_plate: string | null;
  is_online: boolean;
  current_lat: number | null;
  current_lng: number | null;
  last_location_update: Date | null;
  rating: number;
  total_deliveries: number;
  created_at: Date;
  // Propiedad anidada que viene del JOIN en la consulta
  user: User; 
}

export interface CustomerAddress {
  id: number;
  user_id: number;
  label: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  lat: number;
  lng: number;
  is_default: boolean;
  created_at: Date;
}

export interface Store {
  id: number;
  name: string;
  description: string | null;
  address: string;
  lat: number;
  lng: number;
  phone: string | null;
  is_active: boolean;
  opening_time: string | null;
  closing_time: string | null;
  rating: number;
  created_at: Date;
}

export interface Product {
    id: number;
    sku: string | null;
    stock: number | null;
    store_id: number;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    category: string | null;
    is_available: boolean;
    created_at: Date;
}
  

// Interfaz Base del Pedido (tal como está en la tabla 'orders')
export interface BaseOrder {
  id: number;
  order_number: string;
  customer_id: number;
  store_id: number;
  driver_id: number | null;
  delivery_address_id: number;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  tax: number;
  total: number;
  payment_method: string;
  payment_status: string;
  estimated_delivery_time: Date | null;
  actual_delivery_time: Date | null;
  distance_km: number | null;
  duration_minutes: number | null;
  special_instructions: string | null;
  created_at: Date;
  updated_at: Date;
}

// CORRECCIÓN: Este es el tipo REAL que devuelve la API después de los JOINs
export interface Order extends BaseOrder {
    items: never[];
    customer_user: User;
    store: Store;
    driver: Driver | null;
    delivery_address: CustomerAddress;
}


export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  special_instructions: string | null;
  created_at: Date;
}

export interface OrderTracking {
  id: number;
  order_id: number;
  status: OrderStatus;
  lat: number | null;
  lng: number | null;
  notes: string | null;
  created_at: Date;
}

export interface Notification {
  id: number;
  user_id: number;
  order_id: number | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: Date;
}

// --- Tipos para Zonas de Entrega ---
export interface ZoneShape {
    type: "Polygon" | "Circle";
    coordinates: any;
    radius?: number;
}
export interface DeliveryZone {
  id: number;
  name: string;
  description: string | null;
  delivery_fee: number;
  minimum_order: number;
  is_active: boolean;
  color: string;
  area: ZoneShape[] | string; // Puede ser un array de objetos o un string JSON
  created_at: Date;
  updated_at: Date;
}

// --- Tipos para Pagos ---
export type PaymentGateway = "stripe" | "paypal" | "mercadopago";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";

export interface PaymentGatewayConfig {
  id: number;
  gateway_name: PaymentGateway;
  is_active: boolean;
  public_key: string | null;
  secret_key: string | null;
  webhook_secret: string | null;
  config: Record<string, any> | null;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentTransaction {
  id: number;
  order_id: number;
  gateway_name: PaymentGateway;
  transaction_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method_details: Record<string, any> | null;
  error_message: string | null;
  created_at: Date;
  updated_at: Date;
}
