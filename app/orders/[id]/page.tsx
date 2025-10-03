import { Suspense } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { OrderForm } from "@/components/orders/order-form"

interface EditOrderPageProps {
  params: {
    id: string
  }
}

export default function EditOrderPage({ params }: EditOrderPageProps) {
  const orderId = Number(params.id)

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Pedido #{orderId}</h1>
            <p className="text-muted-foreground">Actualiza los detalles de este pedido.</p>
          </div>

          <Suspense fallback={<div className="text-muted-foreground">Cargando detalles del pedido...</div>}>
            <OrderForm orderId={orderId} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
