"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Order, User, Store, Product, CustomerAddress } from "@/lib/types/database"

interface OrderFormProps {
  orderId?: number
}

interface OrderFormData {
  customer_id: string
  store_id: string
  delivery_address_id: string
  payment_method: string
  special_instructions: string
  items: { product_id: number; quantity: number; subtotal: number }[]
}

export function OrderForm({ orderId }: OrderFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(!!orderId)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<OrderFormData>>({
    customer_id: "",
    store_id: "",
    delivery_address_id: "",
    payment_method: "cash",
    special_instructions: "",
    items: [],
  })

  // Data for form dropdowns
  const [customers, setCustomers] = useState<User[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [customersRes, storesRes] = await Promise.all([
          fetch("/api/users?role=customer"),
          fetch("/api/stores"),
        ])
        const customersData = await customersRes.json()
        const storesData = await storesRes.json()

        if (customersData.success) {
          setCustomers(customersData.data)
        } else {
          toast({ title: "Error", description: "No se pudieron cargar los clientes.", variant: "destructive" })
        }

        if (storesData.success) {
          setStores(storesData.data)
        } else {
          toast({ title: "Error", description: "No se pudieron cargar las tiendas.", variant: "destructive" })
        }
      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar los datos iniciales del formulario.", variant: "destructive" })
      }
    }

    fetchInitialData()

    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId, toast])

  useEffect(() => {
    if (formData.customer_id) {
      fetchCustomerAddresses(formData.customer_id)
    } else {
      setAddresses([]) // Clear addresses if no customer is selected
    }
  }, [formData.customer_id])

  useEffect(() => {
    if (formData.store_id) {
      fetchStoreProducts(formData.store_id)
    } else {
      setProducts([]) // Clear products if no store is selected
    }
  }, [formData.store_id])

  const fetchOrderDetails = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      const result = await response.json()
      if (result.success) {
        const order: Order = result.data
        setFormData({
          customer_id: String(order.customer_id),
          store_id: String(order.store_id),
          delivery_address_id: String(order.delivery_address_id),
          payment_method: order.payment_method,
          special_instructions: order.special_instructions || "",
          items: (order.items || []).map((item: any) => ({ product_id: item.product_id, quantity: item.quantity, subtotal: item.price * item.quantity }))
        })
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudieron obtener los detalles del pedido.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomerAddresses = async (customerId: string) => {
    if (!customerId) return
    try {
      const res = await fetch(`/api/users/${customerId}/addresses`)
      const data = await res.json()
      if (data.success) {
        setAddresses(data.data)
      } else {
        toast({ title: "Error", description: "No se pudieron cargar las direcciones del cliente.", variant: "destructive" })
        setAddresses([])
      }
    } catch (e) {
      toast({ title: "Error", description: "Ocurrió un error al buscar las direcciones.", variant: "destructive" })
      setAddresses([])
    }
  }

  const fetchStoreProducts = async (storeId: string) => {
    if (!storeId) return
    try {
      const res = await fetch(`/api/stores/${storeId}/products`)
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      } else {
        setProducts([])
      }
    } catch (e) {
      setProducts([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = orderId ? `/api/orders/${orderId}` : "/api/orders"
      const method = orderId ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast({ title: "Éxito", description: `Pedido ${orderId ? "actualizado" : "creado"} correctamente.` })
        router.push("/orders")
        router.refresh()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Ocurrió un error inesperado.", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && orderId) {
    return <p className="text-muted-foreground">Cargando datos del pedido...</p>
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">{orderId ? "Editar" : "Crear"} Pedido</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customer_id">Cliente</Label>
              <Select name="customer_id" value={String(formData.customer_id)} onValueChange={(value) => setFormData({ ...formData, customer_id: value, delivery_address_id: '' })} required>
                <SelectTrigger><SelectValue placeholder="Seleccione un cliente..." /></SelectTrigger>
                <SelectContent>
                  {customers.length > 0 ? (
                    customers.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.full_name}</SelectItem>)
                  ) : (
                    <SelectItem value="" disabled>No hay clientes disponibles</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery_address_id">Dirección de Envío</Label>
              <Select name="delivery_address_id" value={String(formData.delivery_address_id)} onValueChange={(value) => setFormData({ ...formData, delivery_address_id: value })} required disabled={!formData.customer_id}>
                <SelectTrigger><SelectValue placeholder="Seleccione una dirección..." /></SelectTrigger>
                <SelectContent>
                  {addresses.length > 0 ? (
                    addresses.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.address_line1}, {a.city}</SelectItem>)
                  ) : (
                    <SelectItem value="" disabled>No hay direcciones para este cliente</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="store_id">Tienda</Label>
            <Select name="store_id" value={String(formData.store_id)} onValueChange={(value) => setFormData({ ...formData, store_id: value, items: [] })} required>
              <SelectTrigger><SelectValue placeholder="Seleccione una tienda..." /></SelectTrigger>
              <SelectContent>
                {stores.length > 0 ? (
                  stores.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)
                ) : (
                  <SelectItem value="" disabled>No hay tiendas disponibles</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Items Section - Simplified for now */}

          <div className="space-y-2">
            <Label htmlFor="special_instructions">Instrucciones Especiales</Label>
            <Textarea id="special_instructions" value={formData.special_instructions} onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })} placeholder="Ej: Dejar en recepción, tocar el timbre azul..." />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={submitting || !formData.customer_id || !formData.delivery_address_id || !formData.store_id}>
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : (orderId ? "Guardar Cambios" : "Crear Pedido")}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/orders")}>Cancelar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
