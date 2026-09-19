import mysql from "mysql2/promise";

// Pool koneksi ke database XAMPP (MySQL/MariaDB).
// Gunakan global agar tidak membuat pool baru setiap hot-reload di mode dev.
let pool = global._mysqlPool;

if (!pool) {
  pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "lms_sekolah",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
  });
  global._mysqlPool = pool;
}

/**
 * Helper query. Gunakan parameterized query (?) untuk mencegah SQL Injection.
 * @param {string} sql
 * @param {Array} params
 */
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export default pool;
