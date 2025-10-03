import mysql from "mysql2/promise"

// Configuración de la base de datos utilizando variables de entorno
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

let db: mysql.Pool

try {
  // Primero, intenta conectar usando las variables de entorno individuales
  if (dbConfig.host && dbConfig.user && dbConfig.database) {
    console.log("Creating database connection pool using individual variables...")
    db = mysql.createPool(dbConfig)
    console.log("Database connection pool created successfully.")
  } else if (process.env.DATABASE_URL) {
    // Si no, intenta con DATABASE_URL como fallback
    console.log("Creating database connection pool using DATABASE_URL...")
    db = mysql.createPool(process.env.DATABASE_URL)
    console.log("Database connection pool created successfully.")
  } else {
    // Si no hay credenciales, lanza un error
    throw new Error(
      "Database environment variables are not set. Please provide either DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, and DB_DATABASE."
    )
  }
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  console.error(" Error creating database connection pool:", errorMessage)
  // En un entorno de producción, podrías querer manejar este error de forma más elegante
  // pero para el desarrollo, es bueno que falle rápido si la BD no está disponible.
  throw new Error(`Error connecting to database: ${errorMessage}`)
}

// Exporta el pool de conexiones para usar en transacciones complejas
export { db }

/**
 * Función de utilidad para ejecutar consultas a la base de datos.
 * Maneja la obtención y liberación de conexiones del pool.
 * @param query La consulta SQL a ejecutar.
 * @param values Los valores a pasar a la consulta para prevenir inyección SQL.
 * @returns Un objeto con `data` o `error`.
 */
export async function executeQuery<T>(query: string, values: any[] = []): Promise<{ data: T | null; error: string | null }> {
  let connection: mysql.PoolConnection | null = null
  try {
    connection = await db.getConnection()
    const [results] = await connection.execute(query, values)
    return { data: results as T, error: null }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`DB_QUERY_ERROR: ${errorMessage}`, { query, values })
    return { data: null, error: `Database query failed: ${errorMessage}` }
  } finally {
    if (connection) {
      connection.release() // Libera la conexión de vuelta al pool
    }
  }
}
