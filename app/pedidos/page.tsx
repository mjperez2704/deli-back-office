"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, User, CheckCircle, Truck } from "lucide-react"
import { mockOrders } from "@/lib/data/orders"
import { AssignDeliveryDialog } from "@/components/orders/assign-delivery-dialog"
import type { Order, OrderStatus } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string>("")
  const { toast } = useToast()

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAssignDelivery = (orderId: string, deliveryPersonId: string, deliveryPersonName: string) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              deliveryPersonId,
              deliveryPersonName,
              status: order.status === "pagado" ? ("en ruta" as OrderStatus) : order.status,
            }
          : order,
      ),
    )
    toast({
      title: "Repartidor asignado",
      description: `${deliveryPersonName} ha sido asignado al pedido #${orderId}`,
    })
  }

  const handleChangeStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
    toast({
      title: "Estado actualizado",
      description: `El pedido #${orderId} ahora está ${newStatus}`,
    })
  }

  const openAssignDialog = (orderId: string) => {
    setSelectedOrderId(orderId)
    setAssignDialogOpen(true)
  }

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      pagado: { label: "Pagado", className: "border-chart-2 text-chart-2 bg-chart-2/10" },
      "en ruta": { label: "En Ruta", className: "border-chart-4 text-chart-4 bg-chart-4/10" },
      entregado: { label: "Entregado", className: "border-primary text-primary bg-primary/10" },
    }
    const config = statusConfig[status]
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const selectedOrder = orders.find((o) => o.id === selectedOrderId)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">Gestión de Pedidos</h1>
        <p className="text-muted-foreground mt-2">Administra y asigna pedidos a repartidores</p>
      </div>

      <Card className="bg-card border-border">
        <div className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por número de pedido, cliente o estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground"
              />
            </div>
          </div>

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
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="border-border hover:bg-accent/50">
                  <TableCell className="font-medium text-foreground">#{order.id}</TableCell>
                  <TableCell className="text-foreground">{order.customerName}</TableCell>
                  <TableCell>
                    {order.deliveryPersonName ? (
                      <span className="text-foreground">{order.deliveryPersonName}</span>
                    ) : (
                      <span className="text-muted-foreground italic">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">{order.total.toFixed(2)} €</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-foreground max-w-xs truncate">{order.address}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-accent">
                          <MoreVertical className="h-4 w-4 text-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem
                          onClick={() => openAssignDialog(order.id)}
                          className="hover:bg-accent cursor-pointer"
                        >
                          <User className="mr-2 h-4 w-4" />
                          {order.deliveryPersonId ? "Reasignar" : "Asignar"} repartidor
                        </DropdownMenuItem>
                        {order.status === "pagado" && (
                          <DropdownMenuItem
                            onClick={() => handleChangeStatus(order.id, "en ruta")}
                            className="hover:bg-accent cursor-pointer"
                          >
                            <Truck className="mr-2 h-4 w-4" />
                            Marcar en ruta
                          </DropdownMenuItem>
                        )}
                        {order.status === "en ruta" && (
                          <DropdownMenuItem
                            onClick={() => handleChangeStatus(order.id, "entregado")}
                            className="hover:bg-accent cursor-pointer"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Marcar entregado
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No se encontraron pedidos</p>
            </div>
          )}
        </div>
      </Card>

      <AssignDeliveryDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        orderId={selectedOrderId}
        currentDeliveryPersonId={selectedOrder?.deliveryPersonId}
        onAssign={handleAssignDelivery}
      />
    </div>
  )
}
