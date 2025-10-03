import { Suspense } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { CustomersTable } from "@/components/customers/customers-table"

export default function CustomersPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Clientes</h1>
            <p className="text-muted-foreground">Administra los clientes de la plataforma.</p>
          </div>

          {/* Customers Table */}
          <Suspense fallback={<div className="text-muted-foreground">Cargando clientes...</div>}>
            <CustomersTable />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
