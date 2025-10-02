import { getWhatsAppClient } from "./client"
import { WHATSAPP_TEMPLATES } from "./templates"
import type { Order, User } from "@/lib/types"

// Servicio de notificaciones de WhatsApp
export class WhatsAppNotificationService {
  private client = getWhatsAppClient()

  // Formatear número de teléfono (remover caracteres especiales)
  private formatPhoneNumber(phone: string): string {
    // Remover espacios, guiones, paréntesis
    return phone.replace(/[\s\-$$$$]/g, "")
  }

  // Notificar creación de pedido al cliente
  async notifyOrderCreated(order: Order, customer: User): Promise<void> {
    if (!customer.phone) {
      console.warn("[WhatsApp] Customer has no phone number")
      return
    }

    try {
      await this.client.sendTemplate(
        this.formatPhoneNumber(customer.phone),
        WHATSAPP_TEMPLATES.ORDER_CREATED.name,
        "es",
        [
          { type: "text", text: order.id },
          { type: "text", text: `$${order.total.toFixed(2)}` },
        ],
      )
      console.log(`[WhatsApp] Order created notification sent to ${customer.name}`)
    } catch (error) {
      console.error("[WhatsApp] Failed to send order created notification:", error)
    }
  }

  // Notificar pedido en ruta al cliente
  async notifyOrderInTransit(order: Order, customer: User, deliveryPerson: User): Promise<void> {
    if (!customer.phone) {
      console.warn("[WhatsApp] Customer has no phone number")
      return
    }

    try {
      await this.client.sendTemplate(
        this.formatPhoneNumber(customer.phone),
        WHATSAPP_TEMPLATES.ORDER_IN_TRANSIT.name,
        "es",
        [
          { type: "text", text: order.id },
          { type: "text", text: deliveryPerson.name },
        ],
      )
      console.log(`[WhatsApp] Order in transit notification sent to ${customer.name}`)
    } catch (error) {
      console.error("[WhatsApp] Failed to send order in transit notification:", error)
    }
  }

  // Notificar pedido entregado al cliente
  async notifyOrderDelivered(order: Order, customer: User): Promise<void> {
    if (!customer.phone) {
      console.warn("[WhatsApp] Customer has no phone number")
      return
    }

    try {
      await this.client.sendTemplate(
        this.formatPhoneNumber(customer.phone),
        WHATSAPP_TEMPLATES.ORDER_DELIVERED.name,
        "es",
        [{ type: "text", text: order.id }],
      )
      console.log(`[WhatsApp] Order delivered notification sent to ${customer.name}`)
    } catch (error) {
      console.error("[WhatsApp] Failed to send order delivered notification:", error)
    }
  }

  // Notificar asignación de entrega al repartidor
  async notifyDeliveryAssigned(order: Order, deliveryPerson: User): Promise<void> {
    if (!deliveryPerson.phone) {
      console.warn("[WhatsApp] Delivery person has no phone number")
      return
    }

    try {
      await this.client.sendTemplate(
        this.formatPhoneNumber(deliveryPerson.phone),
        WHATSAPP_TEMPLATES.DELIVERY_ASSIGNED.name,
        "es",
        [
          { type: "text", text: order.id },
          { type: "text", text: order.deliveryAddress },
        ],
      )
      console.log(`[WhatsApp] Delivery assigned notification sent to ${deliveryPerson.name}`)
    } catch (error) {
      console.error("[WhatsApp] Failed to send delivery assigned notification:", error)
    }
  }

  // Notificar cambio de estado
  async notifyOrderStatusUpdated(order: Order, customer: User, newStatus: string): Promise<void> {
    if (!customer.phone) {
      console.warn("[WhatsApp] Customer has no phone number")
      return
    }

    const statusText =
      {
        pending: "pendiente",
        paid: "pagado",
        in_transit: "en camino",
        delivered: "entregado",
        cancelled: "cancelado",
      }[newStatus] || newStatus

    try {
      await this.client.sendTemplate(
        this.formatPhoneNumber(customer.phone),
        WHATSAPP_TEMPLATES.ORDER_STATUS_UPDATED.name,
        "es",
        [
          { type: "text", text: order.id },
          { type: "text", text: statusText },
        ],
      )
      console.log(`[WhatsApp] Order status updated notification sent to ${customer.name}`)
    } catch (error) {
      console.error("[WhatsApp] Failed to send order status updated notification:", error)
    }
  }
}

// Singleton instance
let notificationService: WhatsAppNotificationService | null = null

export function getWhatsAppNotificationService(): WhatsAppNotificationService {
  if (!notificationService) {
    notificationService = new WhatsAppNotificationService()
  }
  return notificationService
}
