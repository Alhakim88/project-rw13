// server.js — Entry point Backend RW 13
// Express + MySQL (rw13_db)

const express = require("express");
const cors    = require("cors");
require("dotenv").config();

// Import koneksi DB
const db = require("./config/db");

// Import routes
const authRoutes       = require("./routes/authRoutes");
const wargaRoutes      = require("./routes/wargaRoutes");
const kelahiranRoutes  = require("./routes/kelahiranRoutes");
const kematianRoutes   = require("./routes/kematianRoutes");
const mutasiRoutes     = require("./routes/mutasiRoutes");
const suratRoutes      = require("./routes/suratRoutes");
const pengaturanRoutes = require("./routes/pengaturanRoutes");

// Import middleware error
const { errorHandler, notFound } = require("./middleware/errorHandler");

// -----------------------------------------------------------------------
const app = express();

// --- CORS ---
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",").map((s) => s.trim());
app.use(cors({
  origin: (origin, cb) => {
    // Izinkan tanpa origin (Postman/curl) atau origin yang terdaftar
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin tidak diizinkan → ${origin}`));
  },
  methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
}));

// --- Body parsers ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------------------------------------------------
// ROUTES
// -----------------------------------------------------------------------

// Health check (tidak butuh auth)
app.get("/api/health", (_req, res) => {
  const dbStatus = typeof db.getStatus === "function" ? db.getStatus() : { connected: false };
  res.json({
    success: true,
    service: "Backend RW 13 — Kelurahan Margahayu, Bekasi Timur",
    version: "1.0.0",
    waktu:   new Date().toISOString(),
    env:     process.env.NODE_ENV || "development",
    database: dbStatus,
  });
});

// Auth (login, register, profil)
app.use("/api/auth", authRoutes);

// Kependudukan
app.use("/api/warga",      wargaRoutes);
app.use("/api/kelahiran",  kelahiranRoutes);
app.use("/api/kematian",   kematianRoutes);
app.use("/api/mutasi",     mutasiRoutes);

// Pelayanan surat
app.use("/api/surat",      suratRoutes);

// Pengaturan sistem
app.use("/api/pengaturan", pengaturanRoutes);

// -----------------------------------------------------------------------
// Error handlers (harus paling bawah)
// -----------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// -----------------------------------------------------------------------
// START SERVER
// -----------------------------------------------------------------------
const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log("=".repeat(60));
  console.log(`🏘️  Backend Sistem RW 13 berjalan di http://localhost:${PORT}`);
  console.log(`📋  Mode      : ${process.env.NODE_ENV || "development"}`);
  console.log(`🗄️  Database  : ${process.env.DB_NAME || "rw13_db"} @ ${process.env.DB_HOST || "localhost"}`);
  console.log("=".repeat(60));
  console.log("Endpoint tersedia:");
  console.log("  GET  /api/health");
  console.log("  POST /api/auth/login");
  console.log("  POST /api/auth/register");
  console.log("  GET  /api/auth/profil");
  console.log("  GET  /api/warga");
  console.log("  GET  /api/warga/statistik");
  console.log("  GET  /api/kelahiran");
  console.log("  GET  /api/kematian");
  console.log("  GET  /api/mutasi/masuk");
  console.log("  GET  /api/mutasi/keluar");
  console.log("  GET  /api/surat");
  console.log("  GET  /api/pengaturan");
  console.log("=".repeat(60));
});
