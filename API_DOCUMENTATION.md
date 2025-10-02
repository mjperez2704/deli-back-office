# API Documentation - DeliBackOffice

API REST completa para gestionar la plataforma de delivery.

## Base URL
\`\`\`
http://localhost:3000/api
\`\`\`

## Autenticación
Actualmente la API no requiere autenticación. En producción se recomienda implementar JWT o API Keys.

---

## Usuarios

### GET /api/users
Obtener todos los usuarios con filtros opcionales.

**Query Parameters:**
- `role` (opcional): "cliente" | "repartidor"
- `status` (opcional): "activo" | "inactivo"

**Ejemplo:**
\`\`\`bash
curl http://localhost:3000/api/users?role=repartidor&status=activo
\`\`\`

### GET /api/users/[id]
Obtener un usuario específico por ID.

### POST /api/users
Crear un nuevo usuario.

**Body:**
\`\`\`json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+34 600 123 456",
  "role": "cliente"
}
\`\`\`

### PUT /api/users/[id]
Actualizar un usuario existente.

### DELETE /api/users/[id]
Eliminar un usuario.

---

## Productos

### GET /api/products
Obtener todos los productos con filtros opcionales.

**Query Parameters:**
- `category` (opcional): "comida" | "bebida" | "postre" | "otro"
- `status` (opcional): "disponible" | "agotado"

### GET /api/products/[id]
Obtener un producto específico por ID.

### POST /api/products
Crear un nuevo producto.

**Body:**
\`\`\`json
{
  "name": "Pizza Margarita",
  "price": 12.99,
  "category": "comida",
  "description": "Pizza clásica con tomate y mozzarella"
}
\`\`\`

### PUT /api/products/[id]
Actualizar un producto existente.

### DELETE /api/products/[id]
Eliminar un producto.

---

## Pedidos

### GET /api/orders
Obtener todos los pedidos con filtros opcionales.

**Query Parameters:**
- `status` (opcional): "pagado" | "en ruta" | "entregado"
- `customerId` (opcional): ID del cliente

### GET /api/orders/[id]
Obtener un pedido específico por ID.

### POST /api/orders
Crear un nuevo pedido.

**Body:**
\`\`\`json
{
  "customerId": "user-123",
  "customerName": "María García",
  "items": [
    {
      "productId": "prod-1",
      "productName": "Pizza Margarita",
      "quantity": 2,
      "price": 12.99
    }
  ],
  "address": "Calle Mayor 123, Madrid"
}
\`\`\`

### PUT /api/orders/[id]
Actualizar un pedido existente.

### DELETE /api/orders/[id]
Eliminar un pedido.

### POST /api/orders/[id]/assign
Asignar un repartidor a un pedido.

**Body:**
\`\`\`json
{
  "deliveryPersonId": "user-456"
}
\`\`\`

### PATCH /api/orders/[id]/status
Actualizar el estado de un pedido.

**Body:**
\`\`\`json
{
  "status": "entregado"
}
\`\`\`

---

## Entregas

### GET /api/deliveries
Obtener todas las entregas activas.

**Query Parameters:**
- `status` (opcional): "pagado" | "en ruta" | "entregado"

### GET /api/deliveries/[orderId]
Obtener el seguimiento de una entrega específica.

### PATCH /api/deliveries/[orderId]
Actualizar la ubicación y progreso de una entrega.

**Body:**
\`\`\`json
{
  "currentLocation": "Calle Alcalá 50",
  "progress": 75,
  "estimatedTime": "5 min"
}
\`\`\`

---

## Estadísticas

### GET /api/stats
Obtener estadísticas generales del dashboard.

**Respuesta:**
\`\`\`json
{
  "success": true,
  "data": {
    "totalOrders": 150,
    "activeDeliveries": 12,
    "totalRevenue": 4567.89,
    "activeUsers": 45,
    "ordersByStatus": {
      "pagado": 5,
      "enRuta": 12,
      "entregado": 133
    },
    "totalProducts": 28,
    "availableProducts": 25,
    "totalDeliveryPersons": 8,
    "totalCustomers": 37
  }
}
\`\`\`

---

## Formato de Respuesta

Todas las respuestas siguen este formato:

**Éxito:**
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa"
}
\`\`\`

**Error:**
\`\`\`json
{
  "success": false,
  "error": "Descripción del error"
}
\`\`\`

---

## Códigos de Estado HTTP

- `200 OK` - Solicitud exitosa
- `201 Created` - Recurso creado exitosamente
- `400 Bad Request` - Datos inválidos
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

---

## Ejemplos de Uso

### Crear un pedido desde el ecommerce
\`\`\`javascript
const response = await fetch('http://localhost:3000/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    customerId: 'user-123',
    customerName: 'María García',
    items: [
      {
        productId: 'prod-1',
        productName: 'Pizza Margarita',
        quantity: 2,
        price: 12.99
      }
    ],
    address: 'Calle Mayor 123, Madrid'
  })
})

const data = await response.json()
console.log(data)
\`\`\`

### Obtener productos disponibles
\`\`\`javascript
const response = await fetch('http://localhost:3000/api/products?status=disponible')
const data = await response.json()
console.log(data.data) // Array de productos
\`\`\`

### Seguimiento de entrega en tiempo real
\`\`\`javascript
const orderId = 'order-123'
const response = await fetch(`http://localhost:3000/api/deliveries/${orderId}`)
const data = await response.json()
console.log(data.data) // Información de seguimiento
