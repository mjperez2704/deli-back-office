import { Suspense } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { OrderForm } from "@/components/orders/order-form"

export default function NewOrderPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Crear Nuevo Pedido</h1>
            <p className="text-muted-foreground">Rellena el formulario para registrar un nuevo pedido.</p>
          </div>

          <Suspense fallback={<div className="text-muted-foreground">Cargando formulario...</div>}>
            <OrderForm />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
