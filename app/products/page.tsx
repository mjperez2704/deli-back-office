import { Suspense } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { ProductsManager } from "@/components/products/products-manager"

export default function ProductsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Catálogo de Productos</h1>
            <p className="text-muted-foreground">Gestiona los productos disponibles en la plataforma</p>
          </div>

          {/* Products Manager */}
          <Suspense fallback={<div className="text-muted-foreground">Cargando productos...</div>}>
            <ProductsManager />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
