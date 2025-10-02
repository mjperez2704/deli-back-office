"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreVertical, Edit, Trash2 } from "lucide-react"
import { mockProducts } from "@/lib/data/products"
import { ProductDialog } from "@/components/products/product-dialog"
import type { Product } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>()
  const { toast } = useToast()

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSaveProduct = (productData: Partial<Product>) => {
    if (selectedProduct) {
      setProducts(products.map((p) => (p.id === selectedProduct.id ? { ...p, ...productData } : p)))
      toast({
        title: "Producto actualizado",
        description: "Los cambios se han guardado correctamente",
      })
    } else {
      const newProduct: Product = {
        id: String(products.length + 1),
        ...productData,
        createdAt: new Date().toISOString().split("T")[0],
      } as Product
      setProducts([...products, newProduct])
      toast({
        title: "Producto creado",
        description: "El nuevo producto se ha añadido al catálogo",
      })
    }
    setSelectedProduct(undefined)
  }

  const handleDeleteProduct = (productId: string) => {
    setProducts(products.filter((p) => p.id !== productId))
    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado del catálogo",
      variant: "destructive",
    })
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setDialogOpen(true)
  }

  const handleNewProduct = () => {
    setSelectedProduct(undefined)
    setDialogOpen(true)
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      comida: "Comida",
      bebida: "Bebida",
      postre: "Postre",
      otro: "Otro",
    }
    return labels[category] || category
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Catálogo de Productos</h1>
          <p className="text-muted-foreground mt-2">Gestiona los productos disponibles en la plataforma</p>
        </div>
        <Button onClick={handleNewProduct} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <Card className="bg-card border-border">
        <div className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Producto</TableHead>
                <TableHead className="text-muted-foreground">Categoría</TableHead>
                <TableHead className="text-muted-foreground">Precio</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-muted-foreground">Descripción</TableHead>
                <TableHead className="text-right text-muted-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-border hover:bg-accent/50">
                  <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary text-primary bg-primary/10">
                      {getCategoryLabel(product.category)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">{product.price.toFixed(2)} €</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        product.status === "disponible"
                          ? "border-chart-4 text-chart-4 bg-chart-4/10"
                          : "border-destructive text-destructive bg-destructive/10"
                      }
                    >
                      {product.status === "disponible" ? "Disponible" : "Agotado"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {product.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-accent">
                          <MoreVertical className="h-4 w-4 text-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem
                          onClick={() => handleEditProduct(product)}
                          className="hover:bg-accent cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-destructive hover:bg-destructive/10 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredProducts.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No se encontraron productos</p>
            </div>
          )}
        </div>
      </Card>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />
    </div>
  )
}
