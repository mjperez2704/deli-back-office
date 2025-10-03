import { relations } from 'drizzle-orm';
import {
    mysqlTable,
    mysqlEnum,
    varchar,
    text,
    timestamp,
    boolean,
    int,
    decimal,
    json,
    bigint,
} from 'drizzle-orm/mysql-core';

// ========= TABLAS DE USUARIOS Y AUTENTICACIÓN =========

export const users = mysqlTable('users', {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone: varchar('phone', { length: 20 }),
    passwordHash: varchar('password_hash', { length: 255 }),
    role: mysqlEnum('role', ['customer', 'driver', 'admin']).notNull().default('customer'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
    customerProfile: one(customers, {
        fields: [users.id],
        references: [customers.userId],
    }),
    driverProfile: one(drivers, {
        fields: [users.id],
        references: [drivers.userId],
    }),
    orders: many(orders),
    addresses: many(customerAddresses),
}));


// ========= TABLAS DE TIENDAS Y PRODUCTOS =========

export const stores = mysqlTable('stores', {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    address: text('address'),
    phone: varchar('phone', { length: 20 }),
    latitude: decimal('latitude', { precision: 10, scale: 8 }),
    longitude: decimal('longitude', { precision: 11, scale: 8 }),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const storesRelations = relations(stores, ({ many }) => ({
    products: many(products),
    orders: many(orders),
}));

export const products = mysqlTable('products', {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    storeId: bigint('store_id', { mode: 'number' }).references(() => stores.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
    imageUrl: varchar('image_url', { length: 2048 }),
    isAvailable: boolean('is_available').default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const productsRelations = relations(products, ({ one }) => ({
    store: one(stores, {
        fields: [products.storeId],
        references: [stores.id],
    }),
}));


// ========= TABLAS DE CLIENTES Y DIRECCIONES =========

export const customers = mysqlTable('customers', {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const customersRelations = relations(customers, ({ one, many }) => ({
    user: one(users, {
        fields: [customers.userId],
        references: [users.id],
    }),
    addresses: many(customerAddresses),
}));

export const customerAddresses = mysqlTable('customer_addresses', {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    customerId: bigint('customer_id', { mode: 'number' }).references(() => customers.id, { onDelete: 'cascade' }),
    address: text('address').notNull(),
    reference: text('reference'),
    latitude: decimal('latitude', { precision: 10, scale: 8 }),
    longitude: decimal('longitude', { precision: 11, scale: 8 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});


// ========= TABLAS DE REPARTIDORES (DRIVERS) =========

export const drivers = mysqlTable('drivers', {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id, { onDelete: 'cascade' }),
    vehicleDetails: varchar('vehicle_details', { length: 255 }),
    currentLatitude: decimal('current_latitude', { precision: 10, scale: 8 }),
    currentLongitude: decimal('current_longitude', { precision: 11, scale: 8 }),
    status: mysqlEnum('status', ['offline', 'available', 'delivering', 'inactive']).notNull().default('offline'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const driversRelations = relations(drivers, ({ one, many }) => ({
    user: one(users, {
        fields: [drivers.userId],
        references: [users.id],
    }),
    orders: many(orders),
}));


// ========= TABLAS DE PEDIDOS (ORDERS) =========

export const orders = mysqlTable('orders', {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    customerId: bigint('customer_id', { mode: 'number' }).references(() => users.id),
    storeId: bigint('store_id', { mode: 'number' }).references(() => stores.id),
    driverId: bigint('driver_id', { mode: 'number' }).references(() => drivers.id),
    deliveryAddressId: bigint('delivery_address_id', { mode: 'number' }).references(() => customerAddresses.id),
    totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
    status: mysqlEnum('status', ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']).notNull().default('pending'),
    paymentMethod: mysqlEnum('payment_method', ['cash', 'credit_card', 'paypal']).notNull(),
    paymentStatus: mysqlEnum('payment_status', ['pending', 'paid', 'failed']).notNull().default('pending'),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
    customer: one(users, {
        fields: [orders.customerId],
        references: [users.id],
    }),
    store: one(stores, {
        fields: [orders.storeId],
        references: [stores.id],
    }),
    driver: one(drivers, {
        fields: [orders.driverId],
        references: [drivers.id],
    }),
    deliveryAddress: one(customerAddresses, {
        fields: [orders.deliveryAddressId],
        references: [customerAddresses.id],
    }),
    items: many(orderItems),
    trackingHistory: many(orderTracking),
    paymentTransactions: many(paymentTransactions),
}));

export const orderItems = mysqlTable('order_items', {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    orderId: bigint('order_id', { mode: 'number' }).references(() => orders.id, { onDelete: 'cascade' }),
    productId: bigint('product_id', { mode: 'number' }).references(() => products.id),
    quantity: int('quantity').notNull(),
    price: decimal('price', { precision: 10, scale: 2 }).notNull(),
});


// ========= TABLAS DE SOPORTE Y CONFIGURACIÓN =========

export const deliveryZones = mysqlTable('delivery_zones', {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    area: json('area').notNull(), // Para almacenar polígonos GeoJSON
});

export const orderTracking = mysqlTable('order_tracking', {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    orderId: bigint('order_id', { mode: 'number' }).references(() => orders.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 255 }).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const paymentTransactions = mysqlTable('payment_transactions', {
    id: bigint('id', { mode: 'number' }).autoincrement().primaryKey(),
    orderId: bigint('order_id', { mode: 'number' }).references(() => orders.id, { onDelete: 'cascade' }),
    gateway: varchar('gateway', { length: 50 }), // e.g., 'stripe', 'paypal'
    transactionId: varchar('transaction_id', { length: 255 }),
    amount: decimal('amount', { precision: 10, scale: 2 }),
    status: varchar('status', { length: 50 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
