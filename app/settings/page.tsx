import { PaymentGatewaysConfig } from "@/components/payments/payment-gateways-config"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">Administra las pasarelas de pago y configuraciones del sistema</p>
        </div>
        <PaymentGatewaysConfig />
      </main>
    </div>
  )
}
