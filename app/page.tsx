import { Card } from "@/components/ui/card"
import { Users, Package, ShoppingCart, TrendingUp } from "lucide-react"

const stats = [
  {
    name: "Total Usuarios",
    value: "2,543",
    icon: Users,
    change: "+12.5%",
    changeType: "positive",
  },
  {
    name: "Productos Activos",
    value: "156",
    icon: Package,
    change: "+4.3%",
    changeType: "positive",
  },
  {
    name: "Pedidos Hoy",
    value: "89",
    icon: ShoppingCart,
    change: "+23.1%",
    changeType: "positive",
  },
  {
    name: "Entregas en Ruta",
    value: "12",
    icon: TrendingUp,
    change: "-5.2%",
    changeType: "negative",
  },
]

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Resumen general de la plataforma de delivery</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="text-3xl font-semibold text-foreground mt-2">{stat.value}</p>
                <p className={`text-sm mt-2 ${stat.changeType === "positive" ? "text-primary" : "text-destructive"}`}>
                  {stat.change} vs mes anterior
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Pedidos Recientes</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div>
                  <p className="font-medium text-foreground">Pedido #{1000 + i}</p>
                  <p className="text-sm text-muted-foreground">
                    Cliente {i} - Hace {i * 5} min
                  </p>
                </div>
                <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">En ruta</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-card border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Repartidores Activos</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                <div>
                  <p className="font-medium text-foreground">Repartidor {i}</p>
                  <p className="text-sm text-muted-foreground">{i} entregas completadas hoy</p>
                </div>
                <span className="rounded-full bg-chart-2/20 px-3 py-1 text-xs font-medium text-chart-2">
                  Disponible
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
