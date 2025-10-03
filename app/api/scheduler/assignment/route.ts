import { type NextRequest, NextResponse } from "next/server"
import { assignmentScheduler } from "@/lib/services/assignment-scheduler"

// POST /api/scheduler/assignment - Iniciar scheduler de asignación automática
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { interval_seconds = 30 } = body

    assignmentScheduler.start(interval_seconds)

    return NextResponse.json({
      success: true,
      message: "Assignment scheduler started",
      interval_seconds,
    })
  } catch (error) {
    console.error(" Error starting scheduler:", error)
    return NextResponse.json({ error: "Failed to start scheduler" }, { status: 500 })
  }
}

// DELETE /api/scheduler/assignment - Detener scheduler
export async function DELETE(request: NextRequest) {
  try {
    assignmentScheduler.stop()

    return NextResponse.json({
      success: true,
      message: "Assignment scheduler stopped",
    })
  } catch (error) {
    console.error(" Error stopping scheduler:", error)
    return NextResponse.json({ error: "Failed to stop scheduler" }, { status: 500 })
  }
}

// GET /api/scheduler/assignment - Verificar estado del scheduler
export async function GET(request: NextRequest) {
  try {
    const isActive = assignmentScheduler.isActive()

    return NextResponse.json({
      active: isActive,
      status: isActive ? "running" : "stopped",
    })
  } catch (error) {
    console.error(" Error checking scheduler status:", error)
    return NextResponse.json({ error: "Failed to check scheduler status" }, { status: 500 })
  }
}
