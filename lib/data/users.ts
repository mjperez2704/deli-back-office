import type { User } from "@/lib/types"

export const mockUsers: User[] = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan.perez@email.com",
    phone: "+34 612 345 678",
    role: "cliente",
    status: "activo",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "María García",
    email: "maria.garcia@email.com",
    phone: "+34 623 456 789",
    role: "repartidor",
    status: "activo",
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    name: "Carlos López",
    email: "carlos.lopez@email.com",
    phone: "+34 634 567 890",
    role: "cliente",
    status: "activo",
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    name: "Ana Martínez",
    email: "ana.martinez@email.com",
    phone: "+34 645 678 901",
    role: "repartidor",
    status: "activo",
    createdAt: "2024-02-10",
  },
  {
    id: "5",
    name: "Pedro Sánchez",
    email: "pedro.sanchez@email.com",
    phone: "+34 656 789 012",
    role: "cliente",
    status: "inactivo",
    createdAt: "2024-01-05",
  },
]
