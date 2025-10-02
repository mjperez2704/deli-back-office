"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockUsers } from "@/lib/data/users"

interface AssignDeliveryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  currentDeliveryPersonId?: string
  onAssign: (orderId: string, deliveryPersonId: string, deliveryPersonName: string) => void
}

export function AssignDeliveryDialog({
  open,
  onOpenChange,
  orderId,
  currentDeliveryPersonId,
  onAssign,
}: AssignDeliveryDialogProps) {
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState<string>(currentDeliveryPersonId || "")

  const deliveryPersons = mockUsers.filter((user) => user.role === "repartidor" && user.status === "activo")

  useEffect(() => {
    setSelectedDeliveryPerson(currentDeliveryPersonId || "")
  }, [currentDeliveryPersonId, open])

  const handleAssign = () => {
    if (selectedDeliveryPerson) {
      const deliveryPerson = deliveryPersons.find((dp) => dp.id === selectedDeliveryPerson)
      if (deliveryPerson) {
        onAssign(orderId, deliveryPerson.id, deliveryPerson.name)
        onOpenChange(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Asignar Repartidor</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Selecciona un repartidor disponible para este pedido
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="delivery-person" className="text-foreground">
              Repartidor
            </Label>
            <Select value={selectedDeliveryPerson} onValueChange={setSelectedDeliveryPerson}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Selecciona un repartidor" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {deliveryPersons.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border">
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={!selectedDeliveryPerson}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Asignar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
