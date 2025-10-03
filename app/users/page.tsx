import { Suspense } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { UsersTable } from "@/components/users/users-table"

export default function UsersPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">Administra clientes y repartidores de la plataforma</p>
          </div>

          {/* Users Table */}
          <Suspense fallback={<div className="text-muted-foreground">Cargando usuarios...</div>}>
            <UsersTable />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
