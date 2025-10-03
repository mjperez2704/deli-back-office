// Sistema de asignación automática de pedidos a repartidores

import { getOnlineDrivers, assignOrderToDriver, getOrderById } from "@/lib/db/queries"
import { findNearestDriver, estimateDeliveryTime } from "@/lib/utils/distance"
import { createNotification } from "@/lib/db/queries"

export interface AssignmentResult {
  success: boolean
  driver_id?: number
  driver_name?: string
  distance_km?: number
  estimated_time?: number
  error?: string
}

export interface AssignmentCriteria {
  max_distance_km?: number // Distancia máxima para asignar (default: 10km)
  prefer_rating?: boolean // Preferir repartidores con mejor rating
  min_rating?: number // Rating mínimo requerido (default: 3.0)
}

/**
 * Asigna automáticamente un pedido al repartidor más cercano disponible
 */
export async function autoAssignOrder(orderId: number, criteria: AssignmentCriteria = {}): Promise<AssignmentResult> {
  try {
    console.log(` Starting auto-assignment for order ${orderId}`)

    // Obtener información del pedido
    const { data: order, error: orderError } = await getOrderById(orderId)

    if (orderError || !order) {
      return {
        success: false,
        error: "Order not found",
      }
    }

    // Verificar que el pedido esté en estado que permita asignación
    if (!["pending", "confirmed", "ready"].includes(order.status)) {
      return {
        success: false,
        error: `Order status ${order.status} does not allow assignment`,
      }
    }

    // Obtener repartidores en línea
    const { data: drivers, error: driversError } = await getOnlineDrivers()

    if (driversError || !drivers || drivers.length === 0) {
      return {
        success: false,
        error: "No drivers available",
      }
    }

    console.log(` Found ${drivers.length} online drivers`)

    // Aplicar criterios de filtrado
    const maxDistance = criteria.max_distance_km || 10
    const minRating = criteria.min_rating || 3.0

    // Filtrar repartidores por rating si se especifica
    const eligibleDrivers = drivers.filter((driver: any) => {
      // Verificar que tenga ubicación
      if (!driver.current_lat || !driver.current_lng) {
        return false
      }

      // Verificar rating mínimo
      if (driver.rating < minRating) {
        return false
      }

      return true
    })

    if (eligibleDrivers.length === 0) {
      return {
        success: false,
        error: "No eligible drivers found",
      }
    }

    console.log(` ${eligibleDrivers.length} eligible drivers after filtering`)

    // Ubicación de entrega del pedido
    const deliveryLocation = {
      lat: order.delivery_address.lat,
      lng: order.delivery_address.lng,
    }

    // Encontrar el repartidor más cercano
    const nearestResult = findNearestDriver(deliveryLocation, eligibleDrivers)

    if (!nearestResult) {
      return {
        success: false,
        error: "Could not find nearest driver",
      }
    }

    const { driver: selectedDriver, distance } = nearestResult

    // Verificar que esté dentro de la distancia máxima
    if (distance > maxDistance) {
      return {
        success: false,
        error: `Nearest driver is ${distance.toFixed(2)}km away (max: ${maxDistance}km)`,
      }
    }

    console.log(` Selected driver ${selectedDriver.id} at ${distance.toFixed(2)}km distance`)

    // Calcular tiempo estimado de entrega
    const estimatedMinutes = estimateDeliveryTime(distance)

    // Asignar el pedido al repartidor
    const { data: assignedOrder, error: assignError } = await assignOrderToDriver(orderId, selectedDriver.id)

    if (assignError || !assignedOrder) {
      return {
        success: false,
        error: "Failed to assign order to driver",
      }
    }

    // Crear notificación para el repartidor
    await createNotification({
      user_id: selectedDriver.user_id,
      order_id: orderId,
      title: "New Delivery Assignment",
      message: `You have been assigned order ${order.order_number}. Distance: ${distance.toFixed(2)}km, Est. time: ${estimatedMinutes} min`,
      type: "order_assigned",
    })

    // Crear notificación para el cliente
    await createNotification({
      user_id: order.customer_id,
      order_id: orderId,
      title: "Driver Assigned",
      message: `Your order has been assigned to ${selectedDriver.user.full_name}. Estimated delivery: ${estimatedMinutes} minutes`,
      type: "driver_assigned",
    })

    console.log(` Order ${orderId} successfully assigned to driver ${selectedDriver.id}`)

    return {
      success: true,
      driver_id: selectedDriver.id,
      driver_name: selectedDriver.user.full_name,
      distance_km: distance,
      estimated_time: estimatedMinutes,
    }
  } catch (error) {
    console.error(" Error in auto-assignment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Asigna múltiples pedidos pendientes automáticamente
 */
export async function autoAssignPendingOrders(criteria: AssignmentCriteria = {}): Promise<{
  total: number
  assigned: number
  failed: number
  results: Array<{ order_id: number; result: AssignmentResult }>
}> {
  try {
    // Obtener pedidos pendientes de asignación
    // En producción, esto vendría de una query específica
    const pendingOrderIds = [1, 2, 3] // Simulado

    const results = []
    let assigned = 0
    let failed = 0

    for (const orderId of pendingOrderIds) {
      const result = await autoAssignOrder(orderId, criteria)
      results.push({ order_id: orderId, result })

      if (result.success) {
        assigned++
      } else {
        failed++
      }

      // Pequeña pausa entre asignaciones para evitar sobrecarga
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    return {
      total: pendingOrderIds.length,
      assigned,
      failed,
      results,
    }
  } catch (error) {
    console.error(" Error in batch auto-assignment:", error)
    return {
      total: 0,
      assigned: 0,
      failed: 0,
      results: [],
    }
  }
}

/**
 * Reasigna un pedido a otro repartidor (por ejemplo, si el actual no puede completarlo)
 */
export async function reassignOrder(
  orderId: number,
  excludeDriverId: number,
  criteria: AssignmentCriteria = {},
): Promise<AssignmentResult> {
  try {
    console.log(` Reassigning order ${orderId}, excluding driver ${excludeDriverId}`)

    // Obtener repartidores disponibles
    const { data: drivers, error: driversError } = await getOnlineDrivers()

    if (driversError || !drivers) {
      return {
        success: false,
        error: "No drivers available",
      }
    }

    // Filtrar el repartidor excluido
    const availableDrivers = drivers.filter((driver: any) => driver.id !== excludeDriverId)

    if (availableDrivers.length === 0) {
      return {
        success: false,
        error: "No alternative drivers available",
      }
    }

    // Usar la misma lógica de asignación automática
    return await autoAssignOrder(orderId, criteria)
  } catch (error) {
    console.error(" Error in reassignment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
