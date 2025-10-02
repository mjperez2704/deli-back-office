"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreVertical, Edit, Trash2 } from "lucide-react"
import { mockUsers } from "@/lib/data/users"
import { UserDialog } from "@/components/users/user-dialog"
import type { User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const { toast } = useToast()

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSaveUser = (userData: Partial<User>) => {
    if (selectedUser) {
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, ...userData } : u)))
      toast({
        title: "Usuario actualizado",
        description: "Los cambios se han guardado correctamente",
      })
    } else {
      const newUser: User = {
        id: String(users.length + 1),
        ...userData,
        createdAt: new Date().toISOString().split("T")[0],
      } as User
      setUsers([...users, newUser])
      toast({
        title: "Usuario creado",
        description: "El nuevo usuario se ha añadido correctamente",
      })
    }
    setSelectedUser(undefined)
  }

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId))
    toast({
      title: "Usuario eliminado",
      description: "El usuario ha sido eliminado del sistema",
      variant: "destructive",
    })
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setDialogOpen(true)
  }

  const handleNewUser = () => {
    setSelectedUser(undefined)
    setDialogOpen(true)
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-2">Administra clientes y repartidores de la plataforma</p>
        </div>
        <Button onClick={handleNewUser} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <Card className="bg-card border-border">
        <div className="p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground"
              />
            </div>
          </div>

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
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-border hover:bg-accent/50">
                  <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                  <TableCell className="text-foreground">{user.email}</TableCell>
                  <TableCell className="text-foreground">{user.phone}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.role === "repartidor"
                          ? "border-chart-2 text-chart-2 bg-chart-2/10"
                          : "border-primary text-primary bg-primary/10"
                      }
                    >
                      {user.role === "repartidor" ? "Repartidor" : "Cliente"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.status === "activo"
                          ? "border-chart-4 text-chart-4 bg-chart-4/10"
                          : "border-muted-foreground text-muted-foreground bg-muted"
                      }
                    >
                      {user.status === "activo" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-foreground">{user.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-accent">
                          <MoreVertical className="h-4 w-4 text-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border">
                        <DropdownMenuItem
                          onClick={() => handleEditUser(user)}
                          className="hover:bg-accent cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteUser(user.id)}
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

          {filteredUsers.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No se encontraron usuarios</p>
            </div>
          )}
        </div>
      </Card>

      <UserDialog open={dialogOpen} onOpenChange={setDialogOpen} user={selectedUser} onSave={handleSaveUser} />
    </div>
  )
}
