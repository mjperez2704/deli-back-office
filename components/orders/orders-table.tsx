"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MoreVertical, Truck, CheckCircle, Package } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import type { Order, User, Store, CustomerAddress } from "@/lib/types/database"
import { useRouter } from "next/navigation"

// Enhanced Order type for frontend
interface OrderUI extends Order {
  customer: Partial<User>
  store: Partial<Store>
  delivery_address: Partial<CustomerAddress>
  driver?: { full_name: string }
}

export function OrdersTable() {
  const [orders, setOrders] = useState<OrderUI[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchOrders()
    // Optional: set an interval to refresh orders periodically
    // const interval = setInterval(fetchOrders, 60000) // every minute
    // return () => clearInterval(interval)
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/orders")
      const result = await response.json()

      if (result.success) {
        setOrders(result.data)
      } else {
        toast({ title: "Error", description: result.error || "Could not fetch orders.", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected network error occurred.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.delivery_address?.address_line1?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [orders, searchTerm])

  const getStatusProps = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return { color: "border-yellow-500 text-yellow-500", icon: <Package className="h-4 w-4 mr-2" />, text: "Pendiente" }
      case "assigned":
        return { color: "border-blue-500 text-blue-500", icon: <Truck className="h-4 w-4 mr-2" />, text: "Asignado" }
      case "in_transit":
        return { color: "border-orange-500 text-orange-500", icon: <Truck className="h-4 w-4 mr-2 animate-pulse" />, text: "En Ruta" }
      case "delivered":
        return { color: "border-green-500 text-green-500", icon: <CheckCircle className="h-4 w-4 mr-2" />, text: "Entregado" }
      default:
        return { color: "border-gray-500 text-gray-500", icon: <Package className="h-4 w-4 mr-2" />, text: status.charAt(0).toUpperCase() + status.slice(1) }
    }
  }

  const handleAction = (action: string, orderId: number) => {
    // Implement actions like navigating to order details, assigning driver, etc.
    toast({ title: "Action", description: `${action} on order #${orderId}` })
    if (action === 'view_details') {
      router.push(`/orders/${orderId}`)
    }
    // Add more actions as needed
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por N° de pedido, cliente, estado o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background border-border"
            />
          </div>
          <Button onClick={() => router.push("/orders/new")} className="bg-primary text-primary-foreground">
            Crear Pedido
          </Button>
        </div>

        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Pedido</TableHead>
                <TableHead className="text-muted-foreground">Cliente</TableHead>
                <TableHead className="text-muted-foreground">Repartidor</TableHead>
                <TableHead className="text-muted-foreground">Total</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-muted-foreground">Dirección</TableHead>
                <TableHead className="text-right text-muted-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Cargando pedidos...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No se encontraron pedidos.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => {
                  const statusProps = getStatusProps(order.status)
                  return (
                    <TableRow key={order.id} className="border-border">
                      <TableCell className="font-medium text-foreground">{order.order_number}</TableCell>
                      <TableCell className="text-foreground">{order.customer?.full_name || "N/A"}</TableCell>
                      <TableCell className="text-foreground">
                        {order.driver?.full_name || <span className="italic text-muted-foreground">Sin asignar</span>}
                      </TableCell>
                      <TableCell className="text-foreground">${order.total}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`flex items-center ${statusProps.color}`}>
                          {statusProps.icon} {statusProps.text}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground truncate max-w-xs">{order.delivery_address?.address_line1 || "N/A"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-muted">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background border-border">
                            <DropdownMenuItem onClick={() => handleAction("view_details", order.id)}>Ver detalles</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction("assign_driver", order.id)}>Asignar repartidor</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction("track_order", order.id)}>Rastrear pedido</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
