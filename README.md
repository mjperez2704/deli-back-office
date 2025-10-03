# DeliveryHub - Sistema de Delivery Completo

Sistema completo de gestión de delivery similar a Rappi/Uber Eats con backoffice administrativo, asignación automática de pedidos, tracking en tiempo real, zonas de entrega configurables y múltiples pasarelas de pago.

## Características Principales

### 1. Backoffice/Dashboard Administrativo
- Vista general con estadísticas en tiempo real
- Monitoreo de pedidos activos
- Gestión de repartidores
- Mapa con ubicación de repartidores en tiempo real
- Feed de actividad reciente
- Panel de control de asignación automática
- **Administración de catálogo de productos**
- **Editor de zonas de entrega con mapas**
- **Configuración de pasarelas de pago**

### 2. API REST Completa
- **Pedidos**: Crear, listar, actualizar estado, asignar repartidor
- **Repartidores**: Gestión de ubicación y estado online/offline
- **Tiendas y Productos**: Catálogo completo con CRUD
- **Notificaciones**: Sistema de notificaciones push
- **Zonas de Entrega**: Definir áreas de cobertura con polígonos y círculos
- **Validación de Ubicación**: Verificar si cliente está en zona de cobertura
- **Pasarelas de Pago**: Stripe, PayPal y Mercado Pago

### 3. Sistema de WebSockets
- Tracking en tiempo real de repartidores
- Actualizaciones de estado de pedidos en vivo
- Conexiones simultáneas múltiples
- Reconexión automática
- Broadcast de ubicaciones a clientes

### 4. Asignación Automática de Pedidos
- Algoritmo inteligente que encuentra el repartidor más cercano disponible
- Criterios configurables (distancia máxima, rating mínimo)
- Scheduler automático cada 30 segundos
- Sistema de reasignación si repartidor no puede completar
- Notificaciones automáticas a repartidores y clientes
- Cálculo de distancia usando fórmula Haversine

### 5. Zonas de Entrega Configurables
- **Dibujar zonas en mapa** usando polígonos o círculos
- **Validación automática** de ubicación del cliente
- **Configuración por zona**:
  - Costo de envío personalizado
  - Pedido mínimo requerido
  - Color de identificación
- **API de verificación** para validar cobertura en tiempo real
- Algoritmo Ray Casting para polígonos
- Cálculo de distancia para círculos

### 6. Administración de Productos
- CRUD completo de productos
- Categorización de productos
- Gestión de disponibilidad
- Imágenes de productos
- Precios y descripciones
- Filtrado por tienda y categoría

### 7. Integración con Google Maps
- Cálculo de rutas optimizadas
- Geocodificación de direcciones
- Matriz de distancias
- Estimación de tiempos de entrega
- **Drawing Manager** para dibujar zonas en mapa
- Mock data para desarrollo sin API key

### 8. Pasarelas de Pago Múltiples
- **Stripe**: Tarjetas de crédito/débito internacionales
- **PayPal**: Pagos con cuenta PayPal o tarjetas
- **Mercado Pago**: Pagos en América Latina
- Configuración de credenciales desde el dashboard
- Activación/desactivación de pasarelas
- Registro de transacciones
- Webhooks preparados para notificaciones

### 9. Sistema de Notificaciones
- Notificaciones push a repartidores y clientes
- Notificaciones en tiempo real en el dashboard
- Centro de notificaciones con contador
- Preparado para integrar con FCM, OneSignal, etc.

## Estructura del Proyecto

\`\`\`
├── app/
│   ├── api/
│   │   ├── orders/              # Endpoints de pedidos
│   │   ├── drivers/             # Endpoints de repartidores
│   │   ├── stores/              # Endpoints de tiendas
│   │   ├── products/            # Endpoints de productos (CRUD)
│   │   ├── delivery-zones/      # Endpoints de zonas de entrega
│   │   ├── payment-gateways/    # Configuración de pasarelas
│   │   ├── payments/            # Procesamiento de pagos
│   │   ├── notifications/       # Endpoints de notificaciones
│   │   ├── google-maps/         # Endpoints de Google Maps
│   │   ├── tracking/            # Endpoints de tracking
│   │   ├── scheduler/           # Control del scheduler
│   │   └── ws/                  # WebSocket endpoint
│   ├── orders/                  # Página de gestión de pedidos
│   ├── products/                # Página de administración de productos
│   ├── delivery-zones/          # Página de editor de zonas
│   ├── settings/                # Página de configuración de pagos
│   └── page.tsx                 # Dashboard principal
├── components/
│   ├── dashboard/               # Componentes del dashboard
│   ├── orders/                  # Componentes de pedidos
│   ├── products/                # Administrador de productos
│   ├── delivery-zones/          # Editor de zonas con mapa
│   ├── payments/                # Configuración de pasarelas
│   ├── maps/                    # Componentes de mapas
│   └── notifications/           # Centro de notificaciones
├── lib/
│   ├── db/                      # Conexión y queries de BD
│   ├── services/
│   │   ├── order-assignment.ts  # Asignación automática
│   │   ├── delivery-zones.ts    # Validación de zonas
│   │   ├── payment-gateways.ts  # Integración de pagos
│   │   ├── google-maps.ts       # Servicios de Google Maps
│   │   └── notifications.ts     # Notificaciones push
│   ├── websocket/               # Cliente y servidor WebSocket
│   ├── hooks/                   # React hooks personalizados
│   └── utils/                   # Utilidades
└── scripts/                     # Scripts SQL para BD
    ├── 01-create-tables.sql     # Tablas principales
    ├── 02-seed-data.sql         # Datos de prueba
    └── 03-delivery-zones-and-payments.sql  # Zonas y pagos
\`\`\`

## Configuración

### Variables de Entorno Requeridas

\`\`\`env
# Base de Datos (PostgreSQL/MySQL)
DATABASE_URL=postgresql://user:password@host:5432/database

# Google Maps API (opcional, usa mock data si no está configurado)
GOOGLE_MAPS_API_KEY=AIzaSyAhuswDC1EM7xFBzAhhq6_bSMDKACh2Av0

# Stripe (opcional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# PayPal (opcional)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Mercado Pago (opcional)
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_token

# Notificaciones Push (opcional)
FCM_SERVER_KEY=your_fcm_server_key
\`\`\`

### Instalación

1. Instalar dependencias:
\`\`\`bash
npm install
\`\`\`

2. Configurar base de datos:
   - Ejecutar scripts SQL en `scripts/` en orden:
     1. `01-create-tables.sql`
     2. `02-seed-data.sql`
     3. `03-delivery-zones-and-payments.sql`
   - O usar el panel de v0 para ejecutarlos automáticamente

3. Iniciar servidor de desarrollo:
\`\`\`bash
npm run dev
\`\`\`

## Uso

### Administrar Productos

1. Ir a **Productos** en el menú de navegación
2. Hacer clic en "Nuevo Producto"
3. Completar información: nombre, descripción, precio, categoría, imagen
4. Guardar producto
5. Editar o eliminar productos existentes desde la tabla

### Configurar Zonas de Entrega

1. Ir a **Zonas de Entrega** en el menú
2. Seleccionar "Dibujar Polígono" o "Dibujar Círculo"
3. Dibujar la zona en el mapa
4. Configurar:
   - Nombre de la zona
   - Costo de envío
   - Pedido mínimo
   - Color de identificación
5. Guardar zona

### Validar Ubicación del Cliente

La API valida automáticamente si la ubicación del cliente está en zona de cobertura:

\`\`\`javascript
// Desde la PWA del cliente
const response = await fetch('/api/delivery-zones/check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ lat: 19.432, lng: -99.133 })
})

const { data } = await response.json()
// data.isInZone: true/false
// data.zone: información de la zona
// data.deliveryFee: costo de envío
// data.minimumOrder: pedido mínimo
\`\`\`

### Configurar Pasarelas de Pago

1. Ir a **Configuración** (ícono de engranaje) → **Pasarelas de Pago**
2. Activar la pasarela deseada (Stripe, PayPal, Mercado Pago)
3. Ingresar credenciales (Public Key, Secret Key)
4. Guardar configuración
5. La pasarela estará disponible para procesar pagos

### Procesar Pagos

\`\`\`javascript
// Desde la PWA del cliente
const response = await fetch('/api/payments/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: 123,
    gateway: 'stripe', // 'paypal' o 'mercadopago'
    amount: 150.00,
    currency: 'USD'
  })
})
\`\`\`

### Iniciar Asignación Automática

Desde el dashboard, usar el panel "Auto-Assignment System" para:
- Activar/desactivar asignación automática
- Asignar pedidos pendientes manualmente
- Ver criterios de asignación

## API Endpoints Principales

### Pedidos
- `GET /api/orders` - Listar pedidos
- `POST /api/orders` - Crear pedido
- `GET /api/orders/[id]` - Obtener pedido
- `PATCH /api/orders/[id]` - Actualizar estado
- `POST /api/orders/[id]/assign` - Asignar repartidor
- `POST /api/orders/auto-assign` - Asignación automática

### Productos
- `GET /api/products` - Listar productos (filtros: store_id, category)
- `POST /api/products` - Crear producto
- `PUT /api/products/[id]` - Actualizar producto
- `DELETE /api/products/[id]` - Eliminar producto

### Zonas de Entrega
- `GET /api/delivery-zones` - Listar zonas
- `POST /api/delivery-zones` - Crear zona
- `GET /api/delivery-zones/[id]` - Obtener zona
- `PUT /api/delivery-zones/[id]` - Actualizar zona
- `DELETE /api/delivery-zones/[id]` - Eliminar zona
- `POST /api/delivery-zones/check` - Verificar cobertura

### Pasarelas de Pago
- `GET /api/payment-gateways` - Listar configuración
- `PUT /api/payment-gateways` - Actualizar configuración
- `POST /api/payments/process` - Procesar pago

### Repartidores
- `GET /api/drivers` - Listar repartidores online
- `POST /api/drivers/[id]/location` - Actualizar ubicación
- `POST /api/drivers/[id]/status` - Cambiar estado online/offline

### Google Maps
- `POST /api/google-maps/route` - Calcular ruta
- `POST /api/google-maps/geocode` - Geocodificar dirección

### Tracking
- `POST /api/tracking/driver` - Actualizar ubicación y broadcast
- `POST /api/tracking/order` - Actualizar estado y broadcast

## WebSocket

Conectar al endpoint `/api/ws` con canales:
- `backoffice` - Actualizaciones para el dashboard
- `driver:{id}` - Canal específico de repartidor
- `customer:{id}` - Canal específico de cliente
- `order:{id}` - Canal específico de pedido

## Arquitectura

### Base de Datos
- PostgreSQL/MySQL con esquema completo
- **Tablas principales**: users, drivers, orders, order_items, order_tracking, stores, products, customer_addresses, notifications
- **Nuevas tablas**: delivery_zones, payment_gateways, payment_transactions
- Índices optimizados para queries frecuentes

### Backend
- Next.js App Router con Route Handlers
- WebSocket para comunicación en tiempo real
- Servicios de negocio separados (asignación, zonas, pagos, notificaciones, maps)
- Scheduler para tareas automáticas

### Frontend
- React con Server Components
- Hooks personalizados para WebSocket
- Dashboard oscuro profesional
- Componentes reutilizables con shadcn/ui
- Mapas interactivos con Google Maps

## Flujo de Trabajo Completo

### 1. Cliente Hace un Pedido (PWA)
1. Cliente selecciona productos del catálogo
2. Ingresa dirección de entrega
3. Sistema valida si está en zona de cobertura
4. Calcula costo de envío según la zona
5. Verifica pedido mínimo
6. Cliente selecciona método de pago
7. Procesa pago con pasarela configurada
8. Crea pedido en estado "pending"

### 2. Asignación Automática (Backoffice)
1. Scheduler detecta pedido pendiente
2. Busca repartidores online
3. Calcula distancia a cada repartidor
4. Selecciona el más cercano disponible
5. Asigna pedido al repartidor
6. Envía notificación push al repartidor
7. Actualiza estado a "assigned"

### 3. Repartidor Acepta (App Móvil)
1. Repartidor recibe notificación
2. Ve detalles del pedido
3. Acepta pedido
4. Inicia tracking de ubicación en tiempo real
5. Actualiza estado a "picked_up"

### 4. Tracking en Tiempo Real
1. App móvil envía ubicación cada 5 segundos
2. API recibe ubicación y hace broadcast vía WebSocket
3. Backoffice muestra repartidor en mapa
4. PWA del cliente muestra ruta y tiempo estimado
5. Sistema calcula ETA usando Google Maps

### 5. Entrega Completada
1. Repartidor marca como "delivered"
2. Sistema registra tiempo real de entrega
3. Actualiza estadísticas del repartidor
4. Envía notificación al cliente
5. Solicita calificación

## Próximos Pasos

1. **Conectar Base de Datos Real**
   - Agregar integración Neon desde Project Settings
   - Ejecutar scripts SQL
   - Actualizar queries para usar conexión real

2. **Configurar Google Maps API**
   - Obtener API key de Google Cloud Console
   - Habilitar APIs: Maps JavaScript, Geocoding, Directions, Distance Matrix
   - Agregar variable de entorno `GOOGLE_MAPS_API_KEY`
   - Implementar Drawing Manager para zonas

3. **Integrar Pasarelas de Pago Reales**
   - Crear cuentas en Stripe, PayPal, Mercado Pago
   - Obtener credenciales de sandbox/test
   - Configurar webhooks para cada pasarela
   - Probar flujo completo de pago

4. **Integrar Notificaciones Push**
   - Configurar Firebase Cloud Messaging
   - Implementar service worker para PWA
   - Actualizar servicio de notificaciones
   - Probar notificaciones en dispositivos reales

5. **Desarrollar PWA para Clientes**
   - Crear interfaz de pedidos
   - Implementar tracking en tiempo real
   - Agregar manifest.json y service worker
   - Integrar pasarelas de pago en frontend

6. **Desarrollar App Móvil para Repartidores**
   - React Native o Flutter
   - Geolocalización en tiempo real
   - Notificaciones push nativas
   - Modo offline con sincronización

## Tecnologías Utilizadas

- **Framework**: Next.js 15 con App Router
- **UI**: React, Tailwind CSS v4, shadcn/ui
- **Base de Datos**: PostgreSQL/MySQL (Neon compatible)
- **Real-time**: WebSockets
- **Maps**: Google Maps API con Drawing Manager
- **Pagos**: Stripe, PayPal, Mercado Pago APIs
- **Notificaciones**: Push API (preparado para FCM)
- **TypeScript**: Type-safety completo

## Seguridad

- Credenciales de pasarelas encriptadas en BD
- Variables de entorno para keys sensibles
- Validación de ubicación server-side
- Autenticación requerida para endpoints críticos
- Rate limiting en APIs de pago
- Webhooks con verificación de firma

## Licencia

MIT
