"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Package, ShoppingCart, TrendingUp } from "lucide-react"

interface Stats {
  totalCustomers: number
  customersChange: number
  activeProducts: number
  productsChange: number
  ordersToday: number
  ordersChange: number
  deliveriesInRoute: number
  deliveriesChange: number
}

export function StatsOverview() {
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    customersChange: 0,
    activeProducts: 0,
    productsChange: 0,
    ordersToday: 0,
    ordersChange: 0,
    deliveriesInRoute: 0,
    deliveriesChange: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch real data from APIs, now using the customers endpoint
        const [ordersRes, customersRes, productsRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/customers"),
          fetch("/api/products"),
        ]);

        const ordersData = await ordersRes.json()
        const customersData = await customersRes.json()
        const productsData = await productsRes.json()

        const orders = ordersData.data || []
        const customers = customersData.data || []
        const products = productsData.data || []

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const ordersToday = orders.filter((o: any) => {
          const orderDate = new Date(o.created_at)
          return orderDate >= today
        }).length

        const deliveriesInRoute = orders.filter((o: any) =>
          ["assigned", "picked_up", "in_transit"].includes(o.status),
        ).length

        const totalCustomers = customers.length
        const activeProducts = products.length

        // Set real stats, change percentages are set to 0 for now
        setStats({
          totalCustomers,
          customersChange: 0,
          activeProducts,
          productsChange: 0,
          ordersToday,
          ordersChange: 0,
          deliveriesInRoute,
          deliveriesChange: 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
        // En caso de error, muestra ceros para evitar datos falsos
        setStats({
            totalCustomers: 0,
            customersChange: 0,
            activeProducts: 0,
            productsChange: 0,
            ordersToday: 0,
            ordersChange: 0,
            deliveriesInRoute: 0,
            deliveriesChange: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Actualiza cada 30 segundos
    return () => clearInterval(interval)
  }, [])

  const statCards = [
    {
      title: "Total Clientes",
      value: stats.totalCustomers.toLocaleString(),
      change: stats.customersChange,
      icon: Users,
    },
    {
      title: "Productos Activos",
      value: stats.activeProducts,
      change: stats.productsChange,
      icon: Package,
    },
    {
      title: "Pedidos Hoy",
      value: stats.ordersToday,
      change: stats.ordersChange,
      icon: ShoppingCart,
    },
    {
      title: "Entregas en Ruta",
      value: stats.deliveriesInRoute,
      change: stats.deliveriesChange,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        const isPositive = stat.change >= 0

        return (
          <Card key={stat.title} className="border-border/50 bg-card">
            <CardContent className="p-6">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <div className="flex items-center gap-3">
                  <p className="text-4xl font-bold text-white">{loading ? "..." : stat.value}</p>
                  <Icon className={`h-8 w-8 ${isPositive ? "text-[#00ff00]" : "text-[#ff0000]"}`} />
                </div>
                <p className={`text-sm font-medium ${isPositive ? "text-gray-400" : "text-gray-400"}`}>
                  Actualizado en tiempo real
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
