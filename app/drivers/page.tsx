import { Suspense } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { DriversTable } from "@/components/drivers/drivers-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function DriversPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Repartidores</h1>
              <p className="text-muted-foreground">Gestiona todos los conductores de la plataforma</p>
            </div>
            <Link href="/drivers/new">
              <Button className="bg-[#00ff00] text-black hover:bg-[#00dd00]">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Repartidor
              </Button>
            </Link>
          </div>

          {/* Drivers Table */}
          <Suspense fallback={<div className="text-muted-foreground">Cargando repartidores...</div>}>
            <DriversTable />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
