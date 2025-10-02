"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, CheckCircle2, XCircle, Send } from "lucide-react"
import { WHATSAPP_TEMPLATES } from "@/lib/whatsapp/templates"

export function WhatsAppConfig() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [testPhone, setTestPhone] = useState("")
  const [testTemplate, setTestTemplate] = useState("order_created")
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/whatsapp/status")
      const data = await response.json()
      setStatus(data.data)
    } catch (error) {
      console.error("Error checking WhatsApp status:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendTestMessage = async () => {
    if (!testPhone) {
      toast({
        title: "Error",
        description: "Por favor ingresa un número de teléfono",
        variant: "destructive",
      })
      return
    }

    setSending(true)
    try {
      const response = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: testPhone,
          templateName: testTemplate,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Mensaje enviado",
          description: "El mensaje de prueba se envió exitosamente",
        })
        setTestPhone("")
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al enviar mensaje",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al enviar mensaje de prueba",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return <div className="text-muted-foreground">Cargando configuración...</div>
  }

  return (
    <div className="space-y-6">
      {/* Estado de configuración */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-green-500" />
              <div>
                <CardTitle>WhatsApp Business API</CardTitle>
                <CardDescription>Estado de la integración</CardDescription>
              </div>
            </div>
            {status?.configured ? (
              <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Configurado
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="mr-1 h-3 w-3" />
                No configurado
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status?.configured ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone Number ID:</span>
                <span className="font-mono">{status.phoneNumberId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Access Token:</span>
                <span className="font-mono">{status.hasAccessToken ? "Configurado" : "No configurado"}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
              <p className="text-sm text-yellow-500">
                Para habilitar las notificaciones de WhatsApp, configura las siguientes variables de entorno:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li className="font-mono">WHATSAPP_PHONE_NUMBER_ID</li>
                <li className="font-mono">WHATSAPP_ACCESS_TOKEN</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plantillas disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas de Mensajes</CardTitle>
          <CardDescription>Plantillas configuradas para notificaciones automáticas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(WHATSAPP_TEMPLATES).map(([key, template]) => (
              <div key={key} className="flex items-start justify-between rounded-lg border border-border/50 p-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">{template.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  <p className="text-xs text-muted-foreground/70 italic">{template.example}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prueba de envío */}
      {status?.configured && (
        <Card>
          <CardHeader>
            <CardTitle>Enviar Mensaje de Prueba</CardTitle>
            <CardDescription>Prueba el envío de notificaciones a un número de WhatsApp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Número de teléfono (con código de país)</Label>
              <Input
                id="phone"
                placeholder="521234567890"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Ejemplo: 521234567890 (México), 34612345678 (España)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Plantilla</Label>
              <select
                id="template"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={testTemplate}
                onChange={(e) => setTestTemplate(e.target.value)}
              >
                {Object.entries(WHATSAPP_TEMPLATES).map(([key, template]) => (
                  <option key={key} value={template.name}>
                    {template.name} - {template.description}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={sendTestMessage} disabled={sending} className="w-full">
              <Send className="mr-2 h-4 w-4" />
              {sending ? "Enviando..." : "Enviar Mensaje de Prueba"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
