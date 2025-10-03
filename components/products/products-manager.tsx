"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types/database"

const emptyProduct: Omit<Product, "id" | "created_at" | "updated_at"> = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  sku: "",
  image_url: "",
  store_id: 1, // Default store_id, you might want to make this dynamic
}

export function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Omit<Product, "created_at" | "updated_at"> | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const results = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProducts(results)
  }, [searchTerm, products])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      if (data.success) {
        setProducts(data.data)
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Could not fetch products.", variant: "destructive" })
    }
  }

  const handleSave = async () => {
    if (!selectedProduct) return

    const isUpdating = "id" in selectedProduct && selectedProduct.id
    const url = isUpdating ? `/api/products/${selectedProduct.id}` : "/api/products"
    const method = isUpdating ? "PUT" : "POST"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedProduct),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({ title: "Success", description: `Product ${isUpdating ? 'updated' : 'created'} successfully.` })
        fetchProducts() // Refresh the list
        setIsModalOpen(false)
        setSelectedProduct(null)
      } else {
        toast({ title: "Error", description: data.error || "Failed to save product.", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" })
      const data = await response.json()

      if (response.ok && data.success) {
        toast({ title: "Success", description: "Product deleted successfully." })
        fetchProducts() // Refresh the list
      } else {
        toast({ title: "Error", description: data.error || "Failed to delete product.", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" })
    }
  }

  const openModal = (product: Product | null = null) => {
    setSelectedProduct(product ? { ...product } : { ...emptyProduct, id: undefined })
    setIsModalOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Productos</CardTitle>
        <CardDescription>Añade, edita y elimina productos de tu inventario.</CardDescription>
        <div className="flex justify-between items-center pt-4">
          <Input
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={() => openModal()}>Añadir Producto</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img 
                    src={product.image_url || '/placeholder.jpg'} 
                    alt={product.name} 
                    className="h-12 w-12 object-cover rounded-md" 
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => openModal(product)}>Editar</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>Eliminar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Add/Edit Product Modal */}
        {isModalOpen && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{selectedProduct?.id ? "Editar" : "Añadir"} Producto</DialogTitle>
                <DialogDescription>
                  Completa los detalles del producto.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nombre</Label>
                  <Input id="name" value={selectedProduct?.name || ''} onChange={(e) => setSelectedProduct(p => p ? {...p, name: e.target.value} : null)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Descripción</Label>
                  <Textarea id="description" value={selectedProduct?.description || ''} onChange={(e) => setSelectedProduct(p => p ? {...p, description: e.target.value} : null)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Precio</Label>
                  <Input id="price" type="number" value={selectedProduct?.price || 0} onChange={(e) => setSelectedProduct(p => p ? {...p, price: parseFloat(e.target.value)} : null)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">Stock</Label>
                  <Input id="stock" type="number" value={selectedProduct?.stock || 0} onChange={(e) => setSelectedProduct(p => p ? {...p, stock: parseInt(e.target.value, 10)} : null)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sku" className="text-right">SKU</Label>
                  <Input id="sku" value={selectedProduct?.sku || ''} onChange={(e) => setSelectedProduct(p => p ? {...p, sku: e.target.value} : null)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image_url" className="text-right">URL de Imagen</Label>
                  <Input id="image_url" value={selectedProduct?.image_url || ''} onChange={(e) => setSelectedProduct(p => p ? {...p, image_url: e.target.value} : null)} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" onClick={handleSave}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

      </CardContent>
    </Card>
  )
}
