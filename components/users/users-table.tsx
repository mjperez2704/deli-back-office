"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface User {
  id: number
  name: string
  email: string
  phone: string
  role: "Cliente" | "Repartidor"
  status: "Activo" | "Inactivo"
  created_at: string
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - reemplazar con llamada a API real
    const mockUsers: User[] = [
      {
        id: 1,
        name: "Juan Pérez",
        email: "juan.perez@email.com",
        phone: "+34 612 345 678",
        role: "Cliente",
        status: "Activo",
        created_at: "2024-01-15",
      },
      {
        id: 2,
        name: "María García",
        email: "maria.garcia@email.com",
        phone: "+34 623 456 789",
        role: "Repartidor",
        status: "Activo",
        created_at: "2024-01-20",
      },
      {
        id: 3,
        name: "Carlos López",
        email: "carlos.lopez@email.com",
        phone: "+34 634 567 890",
        role: "Cliente",
        status: "Activo",
        created_at: "2024-02-01",
      },
      {
        id: 4,
        name: "Ana Martínez",
        email: "ana.martinez@email.com",
        phone: "+34 645 678 901",
        role: "Repartidor",
        status: "Activo",
        created_at: "2024-02-10",
      },
      {
        id: 5,
        name: "Pedro Sánchez",
        email: "pedro.sanchez@email.com",
        phone: "+34 656 789 012",
        role: "Cliente",
        status: "Inactivo",
        created_at: "2024-01-05",
      },
    ]
    setUsers(mockUsers)
    setLoading(false)
  }, [])

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        {/* Search and Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background border-border"
            />
          </div>
          <Button className="bg-[#00ff00] text-black hover:bg-[#00dd00]">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Nombre</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Teléfono</TableHead>
                <TableHead className="text-muted-foreground">Rol</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-muted-foreground">Fecha registro</TableHead>
                <TableHead className="text-right text-muted-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Cargando usuarios...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-border">
                    <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                    <TableCell className="text-foreground">{user.email}</TableCell>
                    <TableCell className="text-foreground">{user.phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.role === "Repartidor"
                            ? "border-cyan-500 text-cyan-500"
                            : "border-green-500 text-green-500"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.status === "Activo"
                            ? "border-orange-500 text-orange-500"
                            : "border-gray-500 text-gray-500"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground">{user.created_at}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Desactivar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
