import { Suspense } from "react"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { ActiveDrivers } from "@/components/dashboard/active-drivers"
import { Sidebar } from "@/components/layout/sidebar"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Resumen general de la plataforma de delivery</p>
          </div>

          {/* Stats Cards */}
          <Suspense fallback={<div>Cargando estadísticas...</div>}>
            <StatsOverview />
          </Suspense>

          {/* Recent Orders and Active Drivers */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Suspense fallback={<div>Cargando pedidos...</div>}>
              <RecentOrders />
            </Suspense>

            <Suspense fallback={<div>Cargando repartidores...</div>}>
              <ActiveDrivers />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}
