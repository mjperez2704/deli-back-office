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

export async function getAllOrders(status?: string) {
  let query = `
    SELECT ${orderQueryFields}
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN users u ON c.user_id = u.id
    JOIN stores s ON o.store_id = s.id
    JOIN customer_addresses ca ON o.delivery_address_id = ca.id
  `
  const values: any[] = []

  if (status) {
    query += ` WHERE o.status = ?`
    values.push(status)
  }

  query += ` ORDER BY o.created_at DESC`

  return executeQuery(query, values)
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

    // 1. Verificar que todos los productos existen y pertenecen a la tienda correcta
    const productIds = orderData.items.map((item: any) => item.productId)
    const [existingProducts] = await connection.execute<RowDataPacket[]>(
      `SELECT id, price FROM products WHERE id IN (${productIds.map(() => '?').join(',')}) AND store_id = ?`,
      [...productIds, orderData.storeId]
    )

    if (existingProducts.length !== productIds.length) {
      throw new Error('Algunos productos no existen o no pertenecen a la tienda seleccionada.')
    }

    // 2. Calcular el monto total del pedido
    let totalAmount = 0
    const productPriceMap = new Map(existingProducts.map(p => [p.id, p.price]))

    for (const item of orderData.items) {
      const price = productPriceMap.get(item.productId)
      if (price) {
        totalAmount += parseFloat(price) * item.quantity
      }
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    const orderQuery = `
      INSERT INTO orders (order_number, customer_id, store_id, delivery_address_id, status, subtotal, delivery_fee, tax, total, payment_method, special_instructions)
      VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)
    `
    const [orderResult] = await connection.execute<ResultSetHeader>(orderQuery, [
      orderNumber,
      orderData.customerId,
      orderData.storeId,
      orderData.deliveryAddressId,
      totalAmount.toFixed(2),
      orderData.delivery_fee || 0,
      orderData.tax || 0,
      (totalAmount + (orderData.delivery_fee || 0) + (orderData.tax || 0)).toFixed(2),
      orderData.paymentMethod,
      orderData.notes || null,
    ])

    const orderId = orderResult.insertId

    const itemsQuery = `
      INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal)
      VALUES ?
    `
    const itemsValues = orderData.items.map((item: any) => [
      orderId,
      item.productId,
      item.quantity,
      productPriceMap.get(item.productId),
      (parseFloat(productPriceMap.get(item.productId)) * item.quantity).toFixed(2),
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

  const { data, error }: any = await executeQuery<ResultSetHeader>(query, [
    name,
    description,
    delivery_fee,
    minimum_order,
    color,
    is_active,
    areaJson,
  ]);

  if (error) return { data: null, error };
  if (!data || !data.insertId) {
    return { data: null, error: "Failed to create delivery zone, no insertId returned." };
  }
  
  // After creation, we fetch the complete zone data to return to the client.
  return getDeliveryZoneById(data.insertId);
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
  if (!result) {
    return { data: null, error: "Failed to create notification." };
  }
  const selectQuery = "SELECT * FROM notifications WHERE id = ?"
  const { data: newData, error: newError } = await executeQuery<RowDataPacket[]>(selectQuery, [result.insertId])
  return { data: newData?.[0] || null, error: newError }
}

// ================== USERS ==================

export async function getUserById(id: number) {
  const query = "SELECT id, name, email, phone, role, createdAt, updatedAt FROM users WHERE id = ?";
  const { data, error } = await executeQuery<RowDataPacket[]>(query, [id]);
  return { data: data?.[0] || null, error };
}

export async function updateUser(id: number, userData: any) {
    const { name, email, phone, role } = userData;
    const query = "UPDATE users SET name = ?, email = ?, phone = ?, role = ? WHERE id = ?";
    const { error } = await executeQuery(query, [name, email, phone, role, id]);
    if (error) return { data: null, error };
    return getUserById(id);
}

export async function deleteUser(id: number) {
    const query = "DELETE FROM users WHERE id = ?";
    const { error } = await executeQuery(query, [id]);
    return { data: { success: !error }, error };
}

// ================== PRODUCTS ==================
export async function getAllProducts(storeId?: number) {
  let query = "SELECT * FROM products"
  const values: any[] = []

  if (storeId) {
    query += " WHERE store_id = ?"
    values.push(storeId)
  }

  query += " ORDER BY name ASC"
  return executeQuery(query, values)
}

export async function getProductById(productId: number) {
  const query = "SELECT * FROM products WHERE id = ?"
  const { data, error } = await executeQuery<RowDataPacket[]>(query, [productId])
  return { data: data?.[0] || null, error }
}

export async function createProduct(productData: any) {
  const { name, description, price, storeId, imageUrl, sku, stock, isAvailable } = productData
  const query = `
    INSERT INTO products (name, description, price, store_id, image_url, sku, stock, is_available)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `
  const { data: result, error } = await executeQuery<ResultSetHeader>(query, [
    name,
    description || null,
    price,
    storeId,
    imageUrl || null,
    sku || null,
    stock || null,
    isAvailable !== undefined ? isAvailable : true,
  ])

  if (error) return { data: null, error }
  if (!result) {
    return { data: null, error: "Failed to create product." };
  }
  return getProductById(result.insertId)
}

export async function updateProduct(productId: number, productData: any) {
  const fields: string[] = []
  const values: any[] = []

  for (const key in productData) {
    // Map camelCase to snake_case for database columns
    const dbColumn = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1_$2').toLowerCase()
    if (productData[key] !== undefined) {
      fields.push(`${dbColumn} = ?`)
      values.push(productData[key])
    }
  }

  if (fields.length === 0) {
    return { data: null, error: "No fields to update." }
  }

  const query = `UPDATE products SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`
  const { error } = await executeQuery(query, [...values, productId])

  if (error) return { data: null, error }
  return getProductById(productId)
}

export async function deleteProduct(productId: number) {
  const query = "DELETE FROM products WHERE id = ?"
  const { error } = await executeQuery(query, [productId])
  return { data: { success: !error }, error }
}


// ================== DELIVERIES ==================

export async function getDeliveries() {
  const query = `
    SELECT ${orderQueryFields}
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    JOIN users u ON c.user_id = u.id
    JOIN stores s ON o.store_id = s.id
    JOIN customer_addresses ca ON o.delivery_address_id = ca.id
    WHERE o.status IN ('out_for_delivery', 'delivered')
    ORDER BY o.updated_at DESC
  `;
  return executeQuery(query);
}

export async function getDeliveryTrackingByOrderId(orderId: number) {
  const query = "SELECT * FROM order_tracking WHERE order_id = ? ORDER BY createdAt DESC";
  return executeQuery(query, [orderId]);
}

// ================== STATS ==================

export async function getStats() {
    const connection = await db.getConnection();
    try {
        const [users] = await connection.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM users");
        const [customers] = await connection.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM customers");
        const [drivers] = await connection.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM drivers");
        const [orders] = await connection.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM orders");
        const [products] = await connection.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM products");
        const [stores] = await connection.execute<RowDataPacket[]>("SELECT COUNT(*) as count FROM stores");
        const [totalRevenueResult] = await connection.execute<RowDataPacket[]>("SELECT SUM(total) as total FROM orders WHERE payment_status = 'paid'");
        const [ordersByStatus] = await connection.execute<RowDataPacket[]>("SELECT status, COUNT(*) as count FROM orders GROUP BY status");

        const stats = {
            users: users[0].count,
            customers: customers[0].count,
            drivers: drivers[0].count,
            orders: orders[0].count,
            products: products[0].count,
            stores: stores[0].count,
            totalRevenue: totalRevenueResult[0].total || 0,
            ordersByStatus: ordersByStatus,
        };

        return { data: stats, error: null };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { data: null, error: `Failed to get stats: ${errorMessage}` };
    } finally {
        connection.release();
    }
}
