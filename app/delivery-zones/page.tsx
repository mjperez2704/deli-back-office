import { Suspense } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { ZonesMapEditor } from "@/components/delivery-zones/zones-map-editor"

export default function DeliveryZonesPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Zonas de Entrega</h1>
            <p className="text-muted-foreground">Define las áreas de cobertura y costos de envío</p>
          </div>

          {/* Zones Map Editor */}
          <Suspense fallback={<div className="text-muted-foreground">Cargando mapa...</div>}>
            <ZonesMapEditor />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
