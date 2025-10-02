import { type NextRequest, NextResponse } from "next/server"
import { users } from "@/lib/data/users"
import { successResponse, errorResponse } from "@/lib/api-response"
import type { User } from "@/lib/types"

// GET /api/users - Obtener todos los usuarios
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get("role")
    const status = searchParams.get("status")

    let filteredUsers = [...users]

    if (role) {
      filteredUsers = filteredUsers.filter((u) => u.role === role)
    }

    if (status) {
      filteredUsers = filteredUsers.filter((u) => u.status === status)
    }

    return NextResponse.json(successResponse(filteredUsers))
  } catch (error) {
    return NextResponse.json(errorResponse("Error al obtener usuarios"), {
      status: 500,
    })
  }
}

// POST /api/users - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, role } = body

    if (!name || !email || !phone || !role) {
      return NextResponse.json(errorResponse("Faltan campos requeridos"), {
        status: 400,
      })
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      role,
      status: "activo",
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)

    return NextResponse.json(successResponse(newUser, "Usuario creado exitosamente"), {
      status: 201,
    })
  } catch (error) {
    return NextResponse.json(errorResponse("Error al crear usuario"), {
      status: 500,
    })
  }
}
