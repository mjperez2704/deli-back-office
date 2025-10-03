import { Suspense } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { OrdersTable } from "@/components/orders/orders-table"

export default function OrdersPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Pedidos</h1>
            <p className="text-muted-foreground">Administra y asigna pedidos a repartidores</p>
          </div>

          {/* Orders Table */}
          <Suspense fallback={<div className="text-muted-foreground">Cargando pedidos...</div>}>
            <OrdersTable />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
