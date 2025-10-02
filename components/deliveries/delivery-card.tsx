"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Clock, User, Package } from "lucide-react"
import type { DeliveryTracking } from "@/lib/types"

interface DeliveryCardProps {
  delivery: DeliveryTracking
}

export function DeliveryCard({ delivery }: DeliveryCardProps) {
  return (
    <Card className="p-6 bg-card border-border hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Pedido #{delivery.orderId}</h3>
          <p className="text-sm text-muted-foreground mt-1">{delivery.customerName}</p>
        </div>
        <Badge variant="outline" className="border-chart-4 text-chart-4 bg-chart-4/10">
          En Ruta
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">{delivery.deliveryPersonName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">{delivery.address}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">{delivery.currentLocation}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-primary font-medium">Llegada estimada: {delivery.estimatedTime}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progreso de entrega</span>
          <span className="text-foreground font-medium">{delivery.progress}%</span>
        </div>
        <Progress value={delivery.progress} className="h-2" />
      </div>
    </Card>
  )
}
