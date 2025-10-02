# Guía Completa de Configuración de WhatsApp Business API

Esta guía te llevará paso a paso para configurar WhatsApp Business Cloud API en tu backoffice.

## Requisitos Previos

- Una cuenta de Facebook Business
- Un número de teléfono que no esté registrado en WhatsApp (personal o business)
- Acceso a Meta for Developers

## Paso 1: Crear Aplicación en Meta for Developers

1. Ve a [Meta for Developers](https://developers.facebook.com/)
2. Haz clic en "My Apps" en la esquina superior derecha
3. Selecciona "Create App"
4. Elige el tipo "Business"
5. Completa la información:
   - **App Name**: DeliBackOffice WhatsApp
   - **App Contact Email**: tu email
   - **Business Account**: Selecciona o crea una
6. Haz clic en "Create App"

## Paso 2: Agregar WhatsApp a tu Aplicación

1. En el dashboard de tu app, busca "WhatsApp" en los productos disponibles
2. Haz clic en "Set Up" en la tarjeta de WhatsApp
3. Selecciona tu Business Account
4. Haz clic en "Continue"

## Paso 3: Configurar Número de Teléfono

### Opción A: Usar Número de Prueba (Desarrollo)

Meta proporciona un número de prueba que puedes usar inmediatamente:

1. En la sección "API Setup", verás un número de prueba
2. Copia el **Phone Number ID** (lo necesitarás para las variables de entorno)
3. Agrega números de prueba en "To" (máximo 5 números para testing)

### Opción B: Usar tu Propio Número (Producción)

1. Ve a "Phone Numbers" en el menú lateral
2. Haz clic en "Add Phone Number"
3. Sigue el proceso de verificación:
   - Ingresa tu número de teléfono
   - Verifica mediante SMS o llamada
   - Acepta los términos y condiciones
4. Una vez verificado, copia el **Phone Number ID**

## Paso 4: Generar Access Token

### Token Temporal (24 horas - Solo para pruebas)

1. En "API Setup", verás un token temporal
2. Copia este token (válido por 24 horas)

### Token Permanente (Recomendado para producción)

1. Ve a "Settings" > "Business Settings" en tu cuenta de Facebook Business
2. Selecciona "System Users" en el menú lateral
3. Haz clic en "Add" para crear un nuevo System User:
   - **Name**: DeliBackOffice API
   - **Role**: Admin
4. Haz clic en "Create System User"
5. Selecciona el System User recién creado
6. Haz clic en "Generate New Token"
7. Selecciona tu app (DeliBackOffice WhatsApp)
8. Marca los siguientes permisos:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
9. Haz clic en "Generate Token"
10. **IMPORTANTE**: Copia y guarda este token de forma segura (no podrás verlo de nuevo)

## Paso 5: Configurar Variables de Entorno

1. En la raíz de tu proyecto, crea o edita el archivo `.env.local`:

\`\`\`env
# WhatsApp Business Cloud API
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
\`\`\`

2. Reemplaza los valores con tus credenciales reales
3. Reinicia tu servidor de desarrollo

## Paso 6: Crear Plantillas de Mensajes

Las plantillas deben ser aprobadas por Meta antes de usarlas. Este proceso puede tomar de minutos a horas.

### Acceder a Message Templates

1. Ve a [WhatsApp Manager](https://business.facebook.com/wa/manage/message-templates/)
2. Selecciona tu cuenta de WhatsApp Business
3. Haz clic en "Create Template"

### Crear Plantilla: order_created

1. **Template Name**: `order_created`
2. **Category**: Utility
3. **Languages**: Spanish
4. **Header**: Ninguno
5. **Body**:
\`\`\`
Tu pedido #{{1}} ha sido confirmado por un total de ${{2}}. Te notificaremos cuando esté en camino.
\`\`\`
6. **Footer**: Ninguno
7. **Buttons**: Ninguno
8. **Sample Content**:
   - {{1}}: ORD-12345
   - {{2}}: 150.00
9. Haz clic en "Submit"

### Crear Plantilla: order_in_transit

1. **Template Name**: `order_in_transit`
2. **Category**: Utility
3. **Languages**: Spanish
4. **Body**:
\`\`\`
Tu pedido #{{1}} está en camino. {{2}} lo está llevando a tu dirección.
\`\`\`
5. **Sample Content**:
   - {{1}}: ORD-12345
   - {{2}}: Juan Pérez
6. Haz clic en "Submit"

### Crear Plantilla: order_delivered

1. **Template Name**: `order_delivered`
2. **Category**: Utility
3. **Languages**: Spanish
4. **Body**:
\`\`\`
Tu pedido #{{1}} ha sido entregado. ¡Gracias por tu compra!
\`\`\`
5. **Sample Content**:
   - {{1}}: ORD-12345
6. Haz clic en "Submit"

### Crear Plantilla: delivery_assigned

1. **Template Name**: `delivery_assigned`
2. **Category**: Utility
3. **Languages**: Spanish
4. **Body**:
\`\`\`
Nueva entrega asignada: Pedido #{{1}}. Dirección: {{2}}
\`\`\`
5. **Sample Content**:
   - {{1}}: ORD-12345
   - {{2}}: Calle Principal 123, Ciudad
6. Haz clic en "Submit"

### Crear Plantilla: order_status_updated

1. **Template Name**: `order_status_updated`
2. **Category**: Utility
3. **Languages**: Spanish
4. **Body**:
\`\`\`
Actualización: Tu pedido #{{1}} ahora está {{2}}.
\`\`\`
5. **Sample Content**:
   - {{1}}: ORD-12345
   - {{2}}: en preparación
6. Haz clic en "Submit"

## Paso 7: Esperar Aprobación

1. Las plantillas aparecerán con estado "Pending"
2. Meta las revisará (usualmente toma 1-2 horas)
3. Recibirás una notificación cuando sean aprobadas
4. Una vez aprobadas, el estado cambiará a "Approved"

## Paso 8: Verificar Configuración

1. Inicia tu aplicación: `npm run dev`
2. Ve a [http://localhost:3000/configuracion](http://localhost:3000/configuracion)
3. Verifica que el estado muestre "Configurado"
4. Envía un mensaje de prueba:
   - Ingresa un número de WhatsApp (con código de país, sin +)
   - Ejemplo: `521234567890` para México
   - Selecciona una plantilla
   - Haz clic en "Enviar Mensaje de Prueba"
5. Verifica que el mensaje llegue al número de WhatsApp

## Paso 9: Configurar Webhooks (Opcional)

Para recibir respuestas de usuarios y actualizaciones de estado:

1. En tu app de Meta, ve a "WhatsApp" > "Configuration"
2. En "Webhook", haz clic en "Edit"
3. Ingresa tu Callback URL: `https://tu-dominio.com/api/whatsapp/webhook`
4. Ingresa un Verify Token (cualquier string secreto)
5. Suscríbete a los siguientes campos:
   - `messages`
   - `message_status`
6. Guarda los cambios

## Solución de Problemas

### Error: "Invalid phone number"
- Asegúrate de incluir el código de país sin el símbolo +
- Ejemplo correcto: `521234567890`
- Ejemplo incorrecto: `+52 123 456 7890`

### Error: "Template not found"
- Verifica que las plantillas estén aprobadas en WhatsApp Manager
- Asegúrate de usar los nombres exactos de las plantillas
- Espera unos minutos después de la aprobación

### Error: "Invalid access token"
- Verifica que el token esté correctamente copiado en `.env.local`
- Si usas un token temporal, genera uno permanente
- Reinicia el servidor después de cambiar las variables de entorno

### Las notificaciones no se envían
- Verifica los logs en la consola del servidor
- Asegúrate de que los usuarios tengan números de teléfono válidos
- Verifica que las plantillas estén aprobadas

## Límites y Consideraciones

### Límites de Mensajería

- **Tier 1** (nuevo): 1,000 conversaciones únicas en 24 horas
- **Tier 2**: 10,000 conversaciones únicas en 24 horas
- **Tier 3**: 100,000 conversaciones únicas en 24 horas
- **Tier 4**: Ilimitado

El tier aumenta automáticamente según el uso y la calidad de los mensajes.

### Ventana de Mensajería

- Puedes enviar mensajes de plantilla en cualquier momento
- Los mensajes de texto libre solo se pueden enviar dentro de las 24 horas después de que el usuario te escriba

### Costos

- Los primeros 1,000 mensajes al mes son gratuitos
- Después, el costo varía según el país
- Consulta [precios actualizados](https://developers.facebook.com/docs/whatsapp/pricing)

## Recursos Adicionales

- [Documentación oficial de WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Guía de inicio rápido](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Referencia de API](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)
- [Mejores prácticas](https://developers.facebook.com/docs/whatsapp/overview/best-practices)

## Soporte

Si tienes problemas con la configuración:
1. Revisa los logs del servidor para errores específicos
2. Consulta la documentación oficial de Meta
3. Verifica el estado de tus plantillas en WhatsApp Manager
4. Asegúrate de que tu cuenta de WhatsApp Business esté verificada
