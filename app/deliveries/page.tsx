import { Suspense } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { DeliveriesTracking } from "@/components/deliveries/deliveries-tracking"

export default function DeliveriesPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Seguimiento de Entregas</h1>
              <p className="text-muted-foreground">Monitoreo en tiempo real de todas las entregas activas</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Última actualización: {new Date().toLocaleTimeString("es-ES")}
            </p>
          </div>

          {/* Deliveries Tracking */}
          <Suspense fallback={<div className="text-muted-foreground">Cargando entregas...</div>}>
            <DeliveriesTracking />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
