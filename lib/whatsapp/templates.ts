// Plantillas de mensajes de WhatsApp para notificaciones
// Estas plantillas deben ser creadas y aprobadas en WhatsApp Manager

export const WHATSAPP_TEMPLATES = {
  // Notificación de nuevo pedido al cliente
  ORDER_CREATED: {
    name: "order_created",
    description: "Confirmación de pedido creado",
    category: "utility",
    // Parámetros: {{1}} = número de pedido, {{2}} = total
    example: "Tu pedido #{{1}} ha sido confirmado por un total de ${{2}}. Te notificaremos cuando esté en camino.",
  },

  // Notificación de pedido en ruta
  ORDER_IN_TRANSIT: {
    name: "order_in_transit",
    description: "Pedido en camino",
    category: "utility",
    // Parámetros: {{1}} = número de pedido, {{2}} = nombre del repartidor
    example: "Tu pedido #{{1}} está en camino. {{2}} lo está llevando a tu dirección.",
  },

  // Notificación de pedido entregado
  ORDER_DELIVERED: {
    name: "order_delivered",
    description: "Pedido entregado",
    category: "utility",
    // Parámetros: {{1}} = número de pedido
    example: "Tu pedido #{{1}} ha sido entregado. ¡Gracias por tu compra!",
  },

  // Notificación a repartidor de nueva asignación
  DELIVERY_ASSIGNED: {
    name: "delivery_assigned",
    description: "Nueva entrega asignada a repartidor",
    category: "utility",
    // Parámetros: {{1}} = número de pedido, {{2}} = dirección
    example: "Nueva entrega asignada: Pedido #{{1}}. Dirección: {{2}}",
  },

  // Notificación de cambio de estado
  ORDER_STATUS_UPDATED: {
    name: "order_status_updated",
    description: "Actualización de estado del pedido",
    category: "utility",
    // Parámetros: {{1}} = número de pedido, {{2}} = nuevo estado
    example: "Actualización: Tu pedido #{{1}} ahora está {{2}}.",
  },
} as const

export type TemplateKey = keyof typeof WHATSAPP_TEMPLATES
