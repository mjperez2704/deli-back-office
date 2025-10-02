// WhatsApp Business Cloud API Client
// Documentación: https://developers.facebook.com/docs/whatsapp/cloud-api

export interface WhatsAppConfig {
  phoneNumberId: string
  accessToken: string
  apiVersion?: string
}

export interface WhatsAppMessage {
  to: string
  type: "template" | "text"
  template?: {
    name: string
    language: {
      code: string
    }
    components?: Array<{
      type: string
      parameters: Array<{
        type: string
        text: string
      }>
    }>
  }
  text?: {
    body: string
  }
}

export class WhatsAppClient {
  private config: WhatsAppConfig
  private baseUrl: string

  constructor(config: WhatsAppConfig) {
    this.config = {
      ...config,
      apiVersion: config.apiVersion || "v18.0",
    }
    this.baseUrl = `https://graph.facebook.com/${this.config.apiVersion}`
  }

  async sendMessage(message: WhatsAppMessage): Promise<any> {
    const url = `${this.baseUrl}/${this.config.phoneNumberId}/messages`

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          ...message,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`WhatsApp API Error: ${JSON.stringify(error)}`)
      }

      return await response.json()
    } catch (error) {
      console.error("[WhatsApp] Error sending message:", error)
      throw error
    }
  }

  // Enviar plantilla de mensaje
  async sendTemplate(
    to: string,
    templateName: string,
    languageCode = "es",
    parameters?: Array<{ type: string; text: string }>,
  ): Promise<any> {
    const message: WhatsAppMessage = {
      to,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
      },
    }

    if (parameters && parameters.length > 0) {
      message.template!.components = [
        {
          type: "body",
          parameters,
        },
      ]
    }

    return this.sendMessage(message)
  }

  // Enviar mensaje de texto simple (solo dentro de ventana de 24h)
  async sendText(to: string, text: string): Promise<any> {
    const message: WhatsAppMessage = {
      to,
      type: "text",
      text: {
        body: text,
      },
    }

    return this.sendMessage(message)
  }
}

// Singleton instance
let whatsappClient: WhatsAppClient | null = null

export function getWhatsAppClient(): WhatsAppClient {
  if (!whatsappClient) {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN

    if (!phoneNumberId || !accessToken) {
      throw new Error(
        "WhatsApp credentials not configured. Please set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN environment variables.",
      )
    }

    whatsappClient = new WhatsAppClient({
      phoneNumberId,
      accessToken,
    })
  }

  return whatsappClient
}
