// config/db.js
// Koneksi MySQL menggunakan connection pool
// Mendukung async/await via promise

const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || "localhost",
  port:               Number(process.env.DB_PORT) || 3306,
  database:           process.env.DB_NAME     || "rw13_db",
  user:               process.env.DB_USER     || "rw13_app",
  password:           process.env.DB_PASSWORD || "",
  waitForConnections: true,
  connectionLimit:    Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit:         0,
  timezone:           "+07:00",
  charset:            "utf8mb4",
});

let isConnected = false;
let lastError = null;

// Uji koneksi saat startup (tanpa crash process.exit agar server tetap bisa memberi respons informatif)
async function checkConnection() {
  try {
    const conn = await pool.getConnection();
    isConnected = true;
    lastError = null;
    console.log("✅ Database MySQL terhubung:", process.env.DB_NAME || "rw13_db");
    console.log(`📡 Host: ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 3306} | User: ${process.env.DB_USER || "rw13_app"}`);
    conn.release();
    return true;
  } catch (err) {
    isConnected = false;
    lastError = err.message;
    console.warn("⚠️  Peringatan: Belum dapat terhubung ke MySQL:", err.message);
    console.warn("💡 Tips:");
    console.warn("   1. Pastikan service MySQL aktif di port " + (process.env.DB_PORT || 3306) + " (XAMPP / MySQL Server).");
    console.warn("   2. Buka MySQL Workbench dan jalankan script: backend/database/rw13_workbench_setup.sql");
    console.warn("   3. Atau jalankan: npm run db:init pada folder backend untuk sinkronisasi otomatis.");
    return false;
  }
}

// Jalankan tes awal
checkConnection();

module.exports = pool;
module.exports.checkConnection = checkConnection;
module.exports.getStatus = () => ({
  connected: isConnected,
  database: process.env.DB_NAME || "rw13_db",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "rw13_app",
  error: lastError,
});
