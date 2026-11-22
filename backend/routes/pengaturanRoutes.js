// routes/pengaturanRoutes.js
// CRUD konfigurasi sistem

const express = require("express");
const pool    = require("../config/db");
const { requireAdmin } = require("../middleware/auth");
const { requireAuth  } = require("../middleware/auth");

const router = express.Router();

// GET /api/pengaturan — semua konfigurasi (publik untuk frontend)
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute("SELECT kunci, nilai, deskripsi FROM pengaturan ORDER BY kunci");
    // Ubah array → objek { kunci: nilai }
    const obj = {};
    rows.forEach((r) => { obj[r.kunci] = r.nilai; });
    res.json({ success: true, data: obj, raw: rows });
  } catch (err) { next(err); }
});

// GET /api/pengaturan/:kunci
router.get("/:kunci", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM pengaturan WHERE kunci = ?", [req.params.kunci]);
    if (rows.length === 0) return res.status(404).json({ success: false, pesan: "Kunci tidak ditemukan." });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
});

// PUT /api/pengaturan/:kunci — ubah nilai (admin)
router.put("/:kunci", requireAdmin, async (req, res, next) => {
  try {
    const { nilai, deskripsi } = req.body;
    if (nilai === undefined) return res.status(400).json({ success: false, pesan: "Field 'nilai' wajib diisi." });

    // Upsert
    await pool.execute(
      `INSERT INTO pengaturan (kunci, nilai, deskripsi) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE nilai=VALUES(nilai), deskripsi=COALESCE(VALUES(deskripsi),deskripsi)`,
      [req.params.kunci, String(nilai), deskripsi || null]
    );
    res.json({ success: true, pesan: `Konfigurasi '${req.params.kunci}' berhasil diperbarui.` });
  } catch (err) { next(err); }
});

// DELETE /api/pengaturan/:kunci (admin)
router.delete("/:kunci", requireAdmin, async (req, res, next) => {
  try {
    const [result] = await pool.execute("DELETE FROM pengaturan WHERE kunci = ?", [req.params.kunci]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, pesan: "Kunci tidak ditemukan." });
    res.json({ success: true, pesan: `Konfigurasi '${req.params.kunci}' dihapus.` });
  } catch (err) { next(err); }
});

module.exports = router;
