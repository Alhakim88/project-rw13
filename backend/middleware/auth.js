// middleware/auth.js
// Middleware verifikasi JWT untuk route yang dilindungi

const jwt = require("jsonwebtoken");

/**
 * Middleware: wajib login (semua peran)
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, pesan: "Token tidak ditemukan. Silakan login terlebih dahulu." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.pengguna = decoded; // { id, nama, peran, rt }
    next();
  } catch {
    return res.status(401).json({ success: false, pesan: "Token tidak valid atau sudah kedaluwarsa." });
  }
}

/**
 * Middleware: hanya admin atau ketua_rw
 */
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (!["admin", "ketua_rw"].includes(req.pengguna.peran)) {
      return res.status(403).json({ success: false, pesan: "Akses ditolak. Hanya admin/ketua RW." });
    }
    next();
  });
}

/**
 * Middleware: admin, ketua_rw, atau ketua_rt
 */
function requirePengurus(req, res, next) {
  requireAuth(req, res, () => {
    if (!["admin", "ketua_rw", "ketua_rt"].includes(req.pengguna.peran)) {
      return res.status(403).json({ success: false, pesan: "Akses ditolak. Hanya pengurus RW/RT." });
    }
    next();
  });
}

module.exports = { requireAuth, requireAdmin, requirePengurus };
