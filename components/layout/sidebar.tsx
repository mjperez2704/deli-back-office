"use client"

import { LayoutDashboard, Users, Package, ShoppingCart, Truck, Settings, MapPin } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Clientes",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Productos",
    href: "/products",
    icon: Package,
  },
  {
    title: "Pedidos",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Entregas",
    href: "/deliveries",
    icon: Truck,
  },
  {
    title: "Zonas de Entrega",
    href: "/delivery-zones",
    icon: MapPin,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-border px-6">
          <h1 className="text-xl font-bold text-white">DeliBackOffice</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-secondary text-white" : "text-muted-foreground hover:bg-secondary/50 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>

        {/* Settings at bottom */}
        <div className="border-t border-border p-4">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === "/settings"
                ? "bg-secondary text-white"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-white",
            )}
          >
            <Settings className="h-5 w-5" />
            Configuración
          </Link>
        </div>
      </div>
    </aside>
  )
}
