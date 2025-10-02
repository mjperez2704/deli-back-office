import { WhatsAppConfig } from "@/components/whatsapp/whatsapp-config"

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Gestiona las integraciones y configuraciones del sistema</p>
      </div>

      <WhatsAppConfig />
    </div>
  )
}
