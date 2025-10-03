import { db, executeQuery } from "@/lib/db/connection"
import type { ResultSetHeader, RowDataPacket } from "mysql2"

// ================== ORDERS ==================
const orderQueryFields = `
  o.id, o.order_number, o.customer_id, o.store_id, o.driver_id,
  o.delivery_address_id, o.status, o.subtotal, o.delivery_fee, o.tax, o.total,
  o.payment_method, o.payment_status, o.estimated_delivery_time,
  o.actual_delivery_time, o.distance_km, o.duration_minutes,
  o.special_instructions, o.created_at, o.updated_at,
  JSON_OBJECT('id', u.id, 'email', u.email, 'full_name', u.full_name, 'phone', u.phone) as customer_user,
  JSON_OBJECT('id', s.id,'name', s.name,'address', s.address,'phone', s.phone) as store,
  JSON_OBJECT('id', ca.id,'address_line1', ca.address_line1,'city', ca.city,'lat', ca.lat,'lng', ca.lng) as delivery_address
`

export async function getAllOrders() {
  const query = `
    SELECT ${orderQueryFields}
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN users u ON c.user_id = u.id
    JOIN stores s ON o.store_id = s.id
    JOIN customer_addresses ca ON o.delivery_address_id = ca.id
    ORDER BY o.created_at DESC
  `
  return executeQuery(query)
}

export async function getUsersByRole(user_id?: string){
    const query = `
    SELECT rol_id, type_user 
    FROM roles_user rs 
    WHERE rs.user_id = ? 
    `
const { data, error } = await executeQuery<RowDataPacket[]>(query, [user_id])
    if (error) return { data: null, error : error }
}


export async function getOrderById(orderId: number) {
  const query = `
    SELECT ${orderQueryFields}
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN users u ON c.user_id = u.id
    JOIN stores s ON o.store_id = s.id
    JOIN customer_addresses ca ON o.delivery_address_id = ca.id
    WHERE o.id = ?
  `
  const { data, error } = await executeQuery<RowDataPacket[]>(query, [orderId])
  if (error) return { data, error }

  const order = data?.[0]
    ? {
        ...data[0],
        customer_user: JSON.parse(data[0].customer_user),
        store: JSON.parse(data[0].store),
        delivery_address: JSON.parse(data[0].delivery_address),
      }
    : null

  return { data: order, error: null }
}

export async function createOrder(orderData: any) {
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    const orderQuery = `
      INSERT INTO orders (order_number, customer_id, store_id, delivery_address_id, status, subtotal, delivery_fee, tax, total, payment_method, special_instructions)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)
    `
    const [orderResult] = await connection.execute<ResultSetHeader>(orderQuery, [
      orderNumber,
      orderData.customer_id,
      orderData.store_id,
      orderData.delivery_address_id,
      orderData.subtotal,
      orderData.delivery_fee,
      orderData.tax,
      orderData.total,
      orderData.payment_method,
      orderData.special_instructions || null,
    ])

    const orderId = orderResult.insertId

    const itemsQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
      VALUES ?
    `
    const itemsValues = orderData.items.map((item: any) => [
      orderId,
      item.product_id,
      item.quantity,
      item.unit_price,
      item.subtotal,
    ])
    await connection.query(itemsQuery, [itemsValues])

    const trackingQuery = `
      INSERT INTO order_tracking (order_id, status, notes)
      VALUES (?, 'pending', 'Pedido creado')
    `
    await connection.execute(trackingQuery, [orderId])

    await connection.commit()
    return getOrderById(orderId)
  } catch (error) {
    await connection.rollback()
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { data: null, error: `Transaction failed: ${errorMessage}` }
  } finally {
    connection.release()
  }
}

export async function updateOrderStatus(orderId: number, status: string, notes?: string) {
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    await connection.execute("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?", [status, orderId])
    await connection.execute("INSERT INTO order_tracking (order_id, status, notes) VALUES (?, ?, ?)", [
      orderId,
      status,
      notes || null,
    ])

    await connection.commit()
    return getOrderById(orderId)
  } catch (error) {
    await connection.rollback()
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { data: null, error: `Transaction failed: ${errorMessage}` }
  } finally {
    connection.release()
  }
}

export async function assignOrderToDriver(orderId: number, driverId: number) {
  return updateOrderStatus(orderId, "assigned", `Pedido asignado al repartidor #${driverId}`)
}

// ================== CUSTOMERS ==================
export async function getAllCustomers() {
  const query = `
    SELECT c.id, c.user_id, c.notes, c.created_at, u.full_name, u.email, u.phone
    FROM customers c
    JOIN users u ON c.user_id = u.id
    ORDER BY u.full_name ASC
  `
  return executeQuery(query)
}

export async function getCustomerById(id: number) {
  const query = `
    SELECT c.id, c.user_id, c.notes, c.created_at, u.full_name, u.email, u.phone
    FROM customers c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?
  `
  const { data, error } = await executeQuery<RowDataPacket[]>(query, [id])
  return { data: data?.[0] || null, error }
}

export async function createCustomer(customerData: any) {
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    const [userResult] = await connection.execute<ResultSetHeader>(
      "INSERT INTO users (full_name, email, phone, role_id, password_hash) VALUES (?, ?, ?, 'customer', 'password_placeholder')",
      [customerData.full_name, customerData.email, customerData.phone]
    )
    const userId = userResult.insertId

    const [customerResult] = await connection.execute<ResultSetHeader>(
      "INSERT INTO customers (user_id, notes) VALUES (?, ?)",
      [userId, customerData.notes || null]
    )

    await connection.commit()
    return getCustomerById(customerResult.insertId)
  } catch (error) {
    await connection.rollback()
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { data: null, error: `Transaction failed: ${errorMessage}` }
  } finally {
    connection.release()
  }
}

export async function updateCustomer(id: number, customerData: any) {
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    const [rows] = await connection.execute<RowDataPacket[]>("SELECT user_id FROM customers WHERE id = ?", [id])
    if (rows.length === 0) throw new Error("Customer not found")
    const userId = rows[0].user_id

    // Update users table
    const userFields: string[] = []
    const userValues: any[] = []
    if (customerData.full_name) {
      userFields.push("full_name = ?")
      userValues.push(customerData.full_name)
    }
    if (customerData.email) {
      userFields.push("email = ?")
      userValues.push(customerData.email)
    }
    if (customerData.phone) {
      userFields.push("phone = ?")
      userValues.push(customerData.phone)
    }
    if (userFields.length > 0) {
      await connection.execute(`UPDATE users SET ${userFields.join(", ")}, updated_at = NOW() WHERE id = ?`, [
        ...userValues,
        userId,
      ])
    }

    // Update customers table
    if (customerData.notes) {
      await connection.execute("UPDATE customers SET notes = ? WHERE id = ?", [customerData.notes, id])
    }

    await connection.commit()
    return getCustomerById(id)
  } catch (error) {
    await connection.rollback()
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { data: null, error: `Transaction failed: ${errorMessage}` }
  } finally {
    connection.release()
  }
}

export async function deleteCustomer(id: number) {
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    const [rows] = await connection.execute<RowDataPacket[]>("SELECT user_id FROM customers WHERE id = ?", [id])
    if (rows.length === 0) {
      throw new Error("Customer not found")
    }
    const userId = rows[0].user_id

    // Deleting the user will cascade and delete the customer due to the foreign key constraint
    await connection.execute("DELETE FROM users WHERE id = ?", [userId])

    await connection.commit()
    return { data: { success: true }, error: null }
  } catch (error) {
    await connection.rollback()
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { data: null, error: `Transaction failed: ${errorMessage}` }
  } finally {
    connection.release()
  }
}


// ================== ADDRESSES ==================
export async function getAddressesByUserId(userId: number) {
  const query = "SELECT * FROM customer_addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC"
  return executeQuery(query, [userId])
}

// ================== DRIVERS ==================
export async function getAllDrivers() {
  const query = `
    SELECT d.*, u.full_name, u.email, u.phone
    FROM drivers d
    JOIN users u ON d.user_id = u.id
    ORDER BY u.full_name ASC
  `
  return executeQuery(query)
}

export async function getDriverById(driverId: number) {
  const query = `
    SELECT d.*, u.full_name, u.email, u.phone
    FROM drivers d
    JOIN users u ON d.user_id = u.id
    WHERE d.id = ?
  `
  const { data, error } = await executeQuery<RowDataPacket[]>(query, [driverId])
  return { data: data?.[0] || null, error }
}

export async function createDriver(driverData: any) {
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    const [userResult] = await connection.execute<ResultSetHeader>(
      "INSERT INTO users (full_name, email, phone, role_id, password_hash) VALUES (?, ?, ?, 'driver', 'password_placeholder')",
      [driverData.full_name, driverData.email, driverData.phone]
    )
    const userId = userResult.insertId

    const [driverResult] = await connection.execute<ResultSetHeader>(
      "INSERT INTO drivers (user_id, vehicle_type, license_plate) VALUES (?, ?, ?)",
      [userId, driverData.vehicle_type, driverData.license_plate]
    )

    await connection.commit()
    return getDriverById(driverResult.insertId)
  } catch (error) {
    await connection.rollback()
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { data: null, error: `Transaction failed: ${errorMessage}` }
  } finally {
    connection.release()
  }
}

export async function updateDriver(driverId: number, driverData: any) {
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    const [rows] = await connection.execute<RowDataPacket[]>("SELECT user_id FROM drivers WHERE id = ?", [driverId])
    if (rows.length === 0) throw new Error("Driver not found")

    const userId = rows[0].user_id

    const userFields: string[] = []
    const userValues: any[] = []
    if (driverData.full_name) {
      userFields.push("full_name = ?")
      userValues.push(driverData.full_name)
    }
    if (driverData.email) {
      userFields.push("email = ?")
      userValues.push(driverData.email)
    }
    if (driverData.phone) {
      userFields.push("phone = ?")
      userValues.push(driverData.phone)
    }
    if (userFields.length > 0) {
      await connection.execute(`UPDATE users SET ${userFields.join(", ")}, updated_at = NOW() WHERE id = ?`, [
        ...userValues,
        userId,
      ])
    }

    const driverFields: string[] = []
    const driverValues: any[] = []
    if (driverData.vehicle_type) {
      driverFields.push("vehicle_type = ?")
      driverValues.push(driverData.vehicle_type)
    }
    if (driverData.license_plate) {
      driverFields.push("license_plate = ?")
      driverValues.push(driverData.license_plate)
    }
    if (driverFields.length > 0) {
      await connection.execute(`UPDATE drivers SET ${driverFields.join(", ")} WHERE id = ?`, [...driverValues, driverId])
    }

    await connection.commit()
    return getDriverById(driverId)
  } catch (error) {
    await connection.rollback()
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { data: null, error: `Transaction failed: ${errorMessage}` }
  } finally {
    connection.release()
  }
}

export async function deleteDriver(driverId: number) {
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()

    const [rows] = await connection.execute<RowDataPacket[]>("SELECT user_id FROM drivers WHERE id = ?", [driverId])
    if (rows.length === 0) {
      throw new Error("Driver not found")
    }
    const userId = rows[0].user_id

    await connection.execute("DELETE FROM drivers WHERE id = ?", [driverId])
    await connection.execute("DELETE FROM users WHERE id = ?", [userId])

    await connection.commit()
    return { data: { success: true }, error: null }
  } catch (error) {
    await connection.rollback()
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { data: null, error: `Transaction failed: ${errorMessage}` }
  } finally {
    connection.release()
  }
}

export async function getOnlineDrivers() {
  const query = `
    SELECT d.*, JSON_OBJECT('id', u.id,'full_name', u.full_name,'email', u.email,'phone', u.phone) as user
    FROM drivers d
    JOIN users u ON d.user_id = u.id
    WHERE d.is_online = true
    ORDER BY d.last_location_update DESC
  `
  const { data, error } = await executeQuery<RowDataPacket[]>(query)
  if (error) return { data: null, error }

  const drivers = data?.map((driver: any) => ({
    ...driver,
    user: JSON.parse(driver.user),
  }))
  return { data: drivers, error: null }
}

export async function updateDriverLocation(driverId: number, lat: number, lng: number) {
  return executeQuery("UPDATE drivers SET current_lat = ?, current_lng = ?, last_location_update = NOW() WHERE id = ?", [
    lat,
    lng,
    driverId,
  ])
}

export async function setDriverOnlineStatus(driverId: number, isOnline: boolean) {
  return executeQuery("UPDATE drivers SET is_online = ?, last_location_update = NOW() WHERE id = ?", [isOnline, driverId])
}

// ================== DELIVERY ZONES ==================

// The 'area' column now stores the GeoJSON object as a string.
// The frontend expects a property 'area_geojson' to parse.
// We alias 'area' to 'area_geojson' to match the frontend's expectation without changing the API route.
export async function getAllDeliveryZones() {
  const query = "SELECT *, area as area_geojson FROM delivery_zones";
  return executeQuery(query);
}

export async function getDeliveryZoneById(id: number) {
  const query = "SELECT *, area as area_geojson FROM delivery_zones WHERE id = ?";
  const { data, error } = await executeQuery<RowDataPacket[]>(query, [id]);
  if (error) return { data: null, error };

  // The API route will parse the 'area_geojson' string.
  const zone = data?.[0] || null;
  return { data: zone, error: null };
}

export async function createDeliveryZone(zoneData: any) {
  const { name, description, delivery_fee, minimum_order, color, is_active, area } = zoneData;

  // The 'area' object from the frontend is stringified and stored in the 'area' column.
  const areaJson = JSON.stringify(area);

  const query = `
    INSERT INTO delivery_zones (name, description, delivery_fee, minimum_order, color, is_active, area)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const { data: {insertId}, error }: any = await executeQuery<ResultSetHeader>(query, [
    name,
    description,
    delivery_fee,
    minimum_order,
    color,
    is_active,
    areaJson,
  ]);

  if (error) return { data: null, error };
  // After creation, we fetch the complete zone data to return to the client.
  return getDeliveryZoneById(insertId);
}

export async function updateDeliveryZone(id: number, zoneData: any) {
  const { name, description, delivery_fee, minimum_order, color, is_active, area } = zoneData;

  // The 'area' object from the frontend is stringified for storage.
  const areaJson = JSON.stringify(area);

  const query = `
    UPDATE delivery_zones
    SET name = ?, description = ?, delivery_fee = ?, minimum_order = ?, color = ?, is_active = ?, area = ?
    WHERE id = ?
  `;

  const { error } = await executeQuery(query, [
    name,
    description,
    delivery_fee,
    minimum_order,
    color,
    is_active,
    areaJson,
    id,
  ]);

  if (error) return { data: null, error };
  // After update, we fetch the complete zone data to return to the client.
  return getDeliveryZoneById(id);
}

export async function deleteDeliveryZone(id: number) {
  const { error } = await executeQuery("DELETE FROM delivery_zones WHERE id = ?", [id]);
  return { data: { success: !error }, error };
}


// ================== NOTIFICATIONS ==================
export async function createNotification(data: any) {
  const insertQuery =
    "INSERT INTO notifications (user_id, order_id, title, message, type) VALUES (?, ?, ?, ?, ?)"
  const { data: result, error } = await executeQuery<ResultSetHeader>(insertQuery, [
    data.user_id,
    data.order_id || null,
    data.title,
    data.message,
    data.type,
  ])
  if (error) return { data: null, error }

  const selectQuery = "SELECT * FROM notifications WHERE id = ?"
  const { data: newData, error: newError } = await executeQuery<RowDataPacket[]>(selectQuery, [result?.insertId])
  return { data: newData?.[0] || null, error: newError }
}
