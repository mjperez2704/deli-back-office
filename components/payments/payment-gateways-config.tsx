"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { CreditCard, Check, X } from "lucide-react"
import type { PaymentGatewayConfig } from "@/lib/types/database"

export function PaymentGatewaysConfig() {
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>([])

  useEffect(() => {
    fetchGateways()
  }, [])

  const fetchGateways = async () => {
    try {
      const response = await fetch("/api/payment-gateways")
      const data = await response.json()
      if (data.success) {
        setGateways(data.data)
      }
    } catch (error) {
      console.error("Error fetching gateways:", error)
    }
  }

  const handleToggle = async (gateway: PaymentGatewayConfig) => {
    try {
      const response = await fetch("/api/payment-gateways", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...gateway,
          is_active: !gateway.is_active,
        }),
      })

      if (response.ok) {
        fetchGateways()
      }
    } catch (error) {
      console.error("Error updating gateway:", error)
    }
  }

  const gatewayInfo = {
    stripe: {
      name: "Stripe",
      description: "Acepta tarjetas de crédito y débito internacionalmente",
      logo: "💳",
    },
    paypal: {
      name: "PayPal",
      description: "Pagos con cuenta PayPal o tarjetas",
      logo: "🅿️",
    },
    mercadopago: {
      name: "Mercado Pago",
      description: "Pagos en América Latina",
      logo: "💵",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pasarelas de Pago
        </CardTitle>
        <CardDescription>Configura las pasarelas de pago disponibles para los clientes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {gateways.map((gateway) => {
            const info = gatewayInfo[gateway.gateway_name]
            return (
              <div key={gateway.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{info.logo}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{info.name}</h3>
                        {gateway.is_active ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{info.description}</p>

                      {gateway.is_active && (
                        <div className="mt-4 space-y-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Public Key</Label>
                              <Input
                                type="password"
                                placeholder="pk_..."
                                defaultValue={gateway.public_key || ""}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Secret Key</Label>
                              <Input
                                type="password"
                                placeholder="sk_..."
                                defaultValue={gateway.secret_key || ""}
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Guardar Credenciales
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <Switch checked={gateway.is_active} onCheckedChange={() => handleToggle(gateway)} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 rounded-lg border bg-muted/50 p-4">
          <h4 className="mb-2 text-sm font-medium">Notas de Seguridad:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Las credenciales se almacenan encriptadas en la base de datos</li>
            <li>• Usa variables de entorno en producción para mayor seguridad</li>
            <li>• Configura webhooks en cada pasarela para recibir notificaciones</li>
            <li>• Prueba en modo sandbox antes de activar en producción</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
