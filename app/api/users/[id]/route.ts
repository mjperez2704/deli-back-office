import { type NextRequest, NextResponse } from "next/server"
import { users } from "@/lib/data/users"
import { successResponse, errorResponse } from "@/lib/api-response"

// GET /api/users/[id] - Obtener usuario por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = users.find((u) => u.id === params.id)

    if (!user) {
      return NextResponse.json(errorResponse("Usuario no encontrado"), {
        status: 404,
      })
    }

    return NextResponse.json(successResponse(user))
  } catch (error) {
    return NextResponse.json(errorResponse("Error al obtener usuario"), {
      status: 500,
    })
  }
}

// PUT /api/users/[id] - Actualizar usuario
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const userIndex = users.findIndex((u) => u.id === params.id)

    if (userIndex === -1) {
      return NextResponse.json(errorResponse("Usuario no encontrado"), {
        status: 404,
      })
    }

    users[userIndex] = {
      ...users[userIndex],
      ...body,
    }

    return NextResponse.json(successResponse(users[userIndex], "Usuario actualizado exitosamente"))
  } catch (error) {
    return NextResponse.json(errorResponse("Error al actualizar usuario"), {
      status: 500,
    })
  }
}

// DELETE /api/users/[id] - Eliminar usuario
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userIndex = users.findIndex((u) => u.id === params.id)

    if (userIndex === -1) {
      return NextResponse.json(errorResponse("Usuario no encontrado"), {
        status: 404,
      })
    }

    users.splice(userIndex, 1)

    return NextResponse.json(successResponse(null, "Usuario eliminado exitosamente"))
  } catch (error) {
    return NextResponse.json(errorResponse("Error al eliminar usuario"), {
      status: 500,
    })
  }
}
