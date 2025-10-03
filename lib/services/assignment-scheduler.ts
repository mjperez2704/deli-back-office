// Scheduler para asignación automática periódica de pedidos

export class AssignmentScheduler {
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false

  /**
   * Inicia el scheduler para asignar pedidos automáticamente cada X segundos
   */
  start(intervalSeconds = 30) {
    if (this.isRunning) {
      console.log(" Assignment scheduler is already running")
      return
    }

    console.log(` Starting assignment scheduler (interval: ${intervalSeconds}s)`)

    this.isRunning = true

    // Ejecutar inmediatamente
    this.runAssignment()

    // Luego ejecutar periódicamente
    this.intervalId = setInterval(() => {
      this.runAssignment()
    }, intervalSeconds * 1000)
  }

  /**
   * Detiene el scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log(" Assignment scheduler stopped")
  }

  /**
   * Ejecuta el proceso de asignación
   */
  private async runAssignment() {
    try {
      console.log(" Running automatic assignment...")

      // Importar dinámicamente para evitar problemas de dependencias circulares
      const { autoAssignPendingOrders } = await import("./order-assignment")

      const result = await autoAssignPendingOrders({
        max_distance_km: 10,
        min_rating: 3.0,
      })

      console.log(
        ` Assignment completed: ${result.assigned} assigned, ${result.failed} failed out of ${result.total} orders`,
      )
    } catch (error) {
      console.error(" Error in scheduled assignment:", error)
    }
  }

  /**
   * Verifica si el scheduler está corriendo
   */
  isActive(): boolean {
    return this.isRunning
  }
}

// Instancia singleton del scheduler
export const assignmentScheduler = new AssignmentScheduler()
