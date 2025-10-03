import mysql from "mysql2/promise";
import { drizzle } from 'drizzle-orm/mysql2';

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
};

let pool: mysql.Pool;

try {
  // Primero, intenta conectar usando las variables de entorno individuales
  if (dbConfig.host && dbConfig.user && dbConfig.database) {
    console.log("Creating database connection pool using individual variables...");
    pool = mysql.createPool(dbConfig);
    console.log("Database connection pool created successfully.");
  } else if (process.env.DATABASE_URL) {
    // Si no, intenta con DATABASE_URL como fallback
    console.log("Creating database connection pool using DATABASE_URL...");
    pool = mysql.createPool(process.env.DATABASE_URL);
    console.log("Database connection pool created successfully.");
  } else {
    // Si no hay credenciales, lanza un error
    throw new Error(
      "Database environment variables are not set. Please provide either DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD, and DB_DATABASE."
    );
  }
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(" Error creating database connection pool:", errorMessage);
  throw new Error(`Error connecting to database: ${errorMessage}`);
}

// Crea la instancia de Drizzle ORM a partir del pool de conexiones
const db = drizzle(pool);

// Exporta la instancia de Drizzle para usar en las consultas con el ORM
// y el pool de conexiones para usar en transacciones complejas o consultas directas si es necesario
export { db, pool };

/**
 * Función de utilidad para ejecutar consultas a la base de datos directamente.
 * Maneja la obtención y liberación de conexiones del pool.
 * @param query La consulta SQL a ejecutar.
 * @param values Los valores a pasar a la consulta para prevenir inyección SQL.
 * @returns Un objeto con `data` o `error`.
 */
export async function executeQuery<T>(query: string, values: any[] = []): Promise<{ data: T | null; error: string | null }> {
  let connection: mysql.PoolConnection | null = null;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(query, values);
    return { data: results as T, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`DB_QUERY_ERROR: ${errorMessage}`, { query, values });
    return { data: null, error: `Database query failed: ${errorMessage}` };
  } finally {
    if (connection) {
      connection.release(); // Libera la conexión de vuelta al pool
    }
  }
}
