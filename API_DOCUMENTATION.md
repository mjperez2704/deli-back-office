# API Documentation - DeliBackOffice

API REST completa para gestionar la plataforma de delivery.

## Base URL
```
http://localhost:3000/api
```

## Autenticación

Esta API utiliza autenticación basada en **JSON Web Tokens (JWT)**. Para acceder a las rutas protegidas, necesitas obtener un token de acceso y enviarlo en la cabecera `Authorization` de tus solicitudes.

**Flujo de Autenticación:**
1.  **Registra** un nuevo usuario cliente usando el endpoint `POST /auth/register`.
2.  **Inicia sesión** con las credenciales del usuario usando `POST /auth/login` para obtener un token JWT.
3.  **Envía el token** en las solicitudes a rutas protegidas con el formato `Authorization: Bearer <token>`.

---

### POST /auth/register
Crea un nuevo usuario con el rol de `customer`.

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan.perez@example.com",
  "password": "password123"
}
```
**Respuesta Exitosa (201 Created):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente."
}
```

---

### POST /auth/login
Autentica a un usuario y devuelve un token de acceso.

**Body:**
```json
{
  "email": "juan.perez@example.com",
  "password": "password123"
}
```
**Respuesta Exitosa (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Productos (Ruta Protegida)

### GET /api/products
Obtener todos los productos. Requiere autenticación.

**Headers:**
- `Authorization`: `Bearer <tu-token-jwt>`

**Ejemplo de Uso (JavaScript Fetch):**
```javascript
const token = "tu-token-jwt"; // Obtenido del login

async function getProducts() {
  const response = await fetch('http://localhost:3000/api/products', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  console.log(data);
}
```

---

## Pedidos (Ruta Protegida)

### POST /api/orders
Crear un nuevo pedido. Requiere autenticación.

**Headers:**
- `Authorization`: `Bearer <tu-token-jwt>`

**Body:**
```json
{
  "customerId": 1, // El ID del usuario autenticado
  "storeId": 1,
  "deliveryAddressId": 1,
  "totalAmount": 25.98,
  "paymentMethod": "credit_card",
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 12.99
    }
  ]
}
```

**Ejemplo de Uso (JavaScript Fetch):**
```javascript
const token = "tu-token-jwt"; // Obtenido del login

async function createOrder() {
  const orderData = {
    customerId: 1, // Asegúrate que este ID corresponde al usuario del token
    storeId: 1,
    deliveryAddressId: 1,
    totalAmount: 25.98,
    paymentMethod: "credit_card",
    items: [
      { productId: 1, quantity: 2, price: 12.99 }
    ]
  };

  const response = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData)
  });

  const result = await response.json();
  console.log(result);
}
```

---

## Flujo Completo de Ejemplo (Cliente)

Aquí tienes un ejemplo completo de cómo tu aplicación cliente puede interactuar con la API.

```javascript
// 1. Iniciar sesión para obtener el token
async function login(email, password) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  if (data.success) {
    return data.token;
  } else {
    throw new Error(data.error);
  }
}

// 2. Usar el token para obtener productos
async function fetchProducts(token) {
  const response = await fetch('http://localhost:3000/api/products', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.data; // Array de productos
}

// 3. Usar el token para crear un pedido
async function placeOrder(token, orderDetails) {
  const response = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderDetails)
  });
  return response.json();
}

// --- Ejecución del flujo ---
async function runTest() {
  try {
    console.log("Iniciando sesión...");
    const userToken = await login("juan.perez@example.com", "password123");
    console.log("Token obtenido:", userToken);

    console.log("\\nObteniendo productos...");
    const products = await fetchProducts(userToken);
    console.log("Productos recibidos:", products);

    console.log("\\nCreando un pedido...");
    const newOrderDetails = {
      customerId: 1, // ID del usuario logueado
      storeId: 1,
      deliveryAddressId: 1,
      totalAmount: products[0].price,
      paymentMethod: "cash",
      items: [{ productId: products[0].id, quantity: 1, price: products[0].price }]
    };
    const orderResult = await placeOrder(userToken, newOrderDetails);
    console.log("Respuesta del pedido:", orderResult);

  } catch (error) {
    console.error("Ocurrió un error en el flujo:", error.message);
  }
}

// Para probar, asegúrate de haber registrado un usuario primero.
// runTest();
```

---

## Otras Rutas

(La documentación para `/users`, `/deliveries`, `/stats`, etc., permanece igual pero las rutas relevantes ahora están protegidas como se especifica en el middleware).

---

## Formato de Respuesta y Códigos de Estado

(Esta sección no ha cambiado)
```
