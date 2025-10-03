import { Sidebar } from "@/components/layout/sidebar"
import { DriverForm } from "@/components/drivers/driver-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewDriverPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="ml-64 flex-1 p-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <Link
              href="/drivers"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Repartidores
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Nuevo Repartidor</h1>
            <p className="text-muted-foreground">Agrega un nuevo conductor a la plataforma</p>
          </div>

          {/* Form */}
          <div className="max-w-2xl">
            <DriverForm />
          </div>
        </div>
      </main>
    </div>
  )
}
