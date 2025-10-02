# DeliBackOffice

Backoffice administrativo completo para plataforma de delivery con integración de WhatsApp Business API.

## Características

- **Gestión de Usuarios**: Administra clientes y repartidores con interfaz completa CRUD
- **Catálogo de Productos**: Gestiona productos con precios, categorías y disponibilidad
- **Gestión de Pedidos**: Vista completa de pedidos con estados y asignación de repartidores
- **Seguimiento en Tiempo Real**: Monitoreo de entregas con actualizaciones automáticas
- **Notificaciones WhatsApp**: Integración con WhatsApp Business Cloud API para notificaciones automáticas

## Tecnologías

- **Framework**: Next.js 15 con App Router
- **UI**: React 19, Tailwind CSS v4, shadcn/ui
- **Notificaciones**: WhatsApp Business Cloud API
- **TypeScript**: Tipado completo en toda la aplicación

## Instalación

1. Clona el repositorio:
\`\`\`bash
git clone <repository-url>
cd DeliBackOffice
\`\`\`

2. Instala las dependencias:
\`\`\`bash
npm install
\`\`\`

3. Configura las variables de entorno (ver sección siguiente)

4. Ejecuta el servidor de desarrollo:
\`\`\`bash
npm run dev
\`\`\`

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## Configuración de WhatsApp Business API

### Paso 1: Crear una cuenta de WhatsApp Business

1. Ve a [Meta for Developers](https://developers.facebook.com/)
2. Crea una aplicación de tipo "Business"
3. Agrega el producto "WhatsApp" a tu aplicación

### Paso 2: Obtener credenciales

1. En el panel de WhatsApp, ve a "API Setup"
2. Copia tu **Phone Number ID**
3. Genera un **Access Token** permanente:
   - Ve a "Settings" > "System Users"
   - Crea un nuevo System User
   - Genera un token con permisos de `whatsapp_business_messaging`

### Paso 3: Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

\`\`\`env
# WhatsApp Business Cloud API
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id
WHATSAPP_ACCESS_TOKEN=tu_access_token
\`\`\`

### Paso 4: Crear plantillas de mensajes

Las plantillas deben ser creadas y aprobadas en WhatsApp Manager antes de poder usarlas:

1. Ve a [WhatsApp Manager](https://business.facebook.com/wa/manage/message-templates/)
2. Crea las siguientes plantillas (nombres exactos):

#### order_created
- **Categoría**: Utility
- **Idioma**: Spanish
- **Contenido**: 
\`\`\`
Tu pedido #{{1}} ha sido confirmado por un total de ${{2}}. Te notificaremos cuando esté en camino.
\`\`\`

#### order_in_transit
- **Categoría**: Utility
- **Idioma**: Spanish
- **Contenido**:
\`\`\`
Tu pedido #{{1}} está en camino. {{2}} lo está llevando a tu dirección.
\`\`\`

#### order_delivered
- **Categoría**: Utility
- **Idioma**: Spanish
- **Contenido**:
\`\`\`
Tu pedido #{{1}} ha sido entregado. ¡Gracias por tu compra!
\`\`\`

#### delivery_assigned
- **Categoría**: Utility
- **Idioma**: Spanish
- **Contenido**:
\`\`\`
Nueva entrega asignada: Pedido #{{1}}. Dirección: {{2}}
\`\`\`

#### order_status_updated
- **Categoría**: Utility
- **Idioma**: Spanish
- **Contenido**:
\`\`\`
Actualización: Tu pedido #{{1}} ahora está {{2}}.
\`\`\`

### Paso 5: Verificar configuración

1. Ve a la sección "Configuración" en el backoffice
2. Verifica que el estado muestre "Configurado"
3. Envía un mensaje de prueba para confirmar que funciona

## API Endpoints

### Usuarios
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `GET /api/products/:id` - Obtener producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Pedidos
- `GET /api/orders` - Listar pedidos
- `POST /api/orders` - Crear pedido (envía notificación WhatsApp)
- `GET /api/orders/:id` - Obtener pedido
- `PUT /api/orders/:id` - Actualizar pedido
- `DELETE /api/orders/:id` - Eliminar pedido
- `POST /api/orders/:id/assign` - Asignar repartidor (envía notificaciones)
- `PATCH /api/orders/:id/status` - Actualizar estado (envía notificación)

### Entregas
- `GET /api/deliveries` - Listar entregas activas

### Estadísticas
- `GET /api/stats` - Obtener estadísticas del dashboard

### WhatsApp
- `GET /api/whatsapp/status` - Verificar configuración
- `POST /api/whatsapp/test` - Enviar mensaje de prueba

## Notificaciones Automáticas

El sistema envía notificaciones automáticas de WhatsApp en los siguientes eventos:

1. **Pedido Creado**: Se notifica al cliente cuando se crea un nuevo pedido
2. **Repartidor Asignado**: 
   - Se notifica al cliente que su pedido está en camino
   - Se notifica al repartidor de la nueva asignación
3. **Estado Actualizado**: Se notifica al cliente cuando cambia el estado del pedido
4. **Pedido Entregado**: Se notifica al cliente cuando se completa la entrega

## Estructura del Proyecto

\`\`\`
DeliBackOffice/
├── app/
│   ├── api/              # API Routes
│   ├── configuracion/    # Página de configuración
│   ├── entregas/         # Seguimiento de entregas
│   ├── pedidos/          # Gestión de pedidos
│   ├── productos/        # Catálogo de productos
│   ├── usuarios/         # Gestión de usuarios
│   └── page.tsx          # Dashboard principal
├── components/
│   ├── ui/               # Componentes de shadcn/ui
│   ├── whatsapp/         # Componentes de WhatsApp
│   └── sidebar.tsx       # Navegación lateral
├── lib/
│   ├── data/             # Datos mock (reemplazar con DB)
│   ├── whatsapp/         # Cliente y servicios de WhatsApp
│   ├── types.ts          # Tipos TypeScript
│   └── utils.ts          # Utilidades
└── README.md
\`\`\`

## Próximos Pasos

Para producción, considera:

1. **Base de Datos**: Reemplazar los datos mock con una base de datos real (PostgreSQL, MongoDB, etc.)
2. **Autenticación**: Implementar sistema de login y roles de usuario
3. **Webhooks**: Configurar webhooks de WhatsApp para recibir respuestas de usuarios
4. **Monitoreo**: Agregar logging y monitoreo de errores (Sentry, LogRocket, etc.)
5. **Rate Limiting**: Implementar límites de tasa para las APIs
6. **Testing**: Agregar tests unitarios e integración

## Soporte

Para problemas o preguntas sobre la integración de WhatsApp, consulta:
- [Documentación oficial de WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Guía de plantillas de mensajes](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates)

## Licencia

MIT
