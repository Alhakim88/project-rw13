// routes/mutasiRoutes.js
// CRUD mutasi masuk & keluar

const express = require("express");
const pool    = require("../config/db");
const { requireAuth, requirePengurus } = require("../middleware/auth");

const router = express.Router();

// ---- MUTASI MASUK ----

// GET /api/mutasi/masuk
router.get("/masuk", requireAuth, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let where = ["1=1"]; const vals = [];
    if (status) { where.push("status = ?"); vals.push(status); }
    const wh = where.join(" AND ");
    const [[{ total }]] = await pool.execute(`SELECT COUNT(*) AS total FROM mutasi_masuk WHERE ${wh}`, vals);
    const [rows] = await pool.execute(
      `SELECT * FROM mutasi_masuk WHERE ${wh} ORDER BY tanggal_masuk DESC LIMIT ? OFFSET ?`,
      [...vals, Number(limit), offset]
    );
    res.json({ success: true, total: Number(total), data: rows });
  } catch (err) { next(err); }
});

// POST /api/mutasi/masuk
router.post("/masuk", requirePengurus, async (req, res, next) => {
  try {
    const { nama, jumlah_jiwa, asal_alamat, rt_tujuan, tanggal_masuk, no_skpwni, status, keterangan } = req.body;
    if (!nama || !jumlah_jiwa || !asal_alamat || !rt_tujuan || !tanggal_masuk) {
      return res.status(400).json({ success: false, pesan: "Field wajib tidak lengkap." });
    }
    const [result] = await pool.execute(
      `INSERT INTO mutasi_masuk (nama, jumlah_jiwa, asal_alamat, rt_tujuan, tanggal_masuk, no_skpwni, status, keterangan, dicatat_oleh)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nama, Number(jumlah_jiwa), asal_alamat, rt_tujuan, tanggal_masuk, no_skpwni || null, status || "Proses", keterangan || null, req.pengguna.id]
    );
    res.status(201).json({ success: true, pesan: "Mutasi masuk berhasil dicatat.", id: result.insertId });
  } catch (err) { next(err); }
});

// PUT /api/mutasi/masuk/:id
router.put("/masuk/:id", requirePengurus, async (req, res, next) => {
  try {
    const { status, keterangan } = req.body;
    const [result] = await pool.execute(
      `UPDATE mutasi_masuk SET status=COALESCE(?,status), keterangan=COALESCE(?,keterangan) WHERE id = ?`,
      [status, keterangan, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, pesan: "Data tidak ditemukan." });
    res.json({ success: true, pesan: "Data mutasi masuk diperbarui." });
  } catch (err) { next(err); }
});

// DELETE /api/mutasi/masuk/:id
router.delete("/masuk/:id", requirePengurus, async (req, res, next) => {
  try {
    const [result] = await pool.execute("DELETE FROM mutasi_masuk WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, pesan: "Data tidak ditemukan." });
    res.json({ success: true, pesan: "Data mutasi masuk dihapus." });
  } catch (err) { next(err); }
});

// ---- MUTASI KELUAR ----

// GET /api/mutasi/keluar
router.get("/keluar", requireAuth, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let where = ["1=1"]; const vals = [];
    if (status) { where.push("status = ?"); vals.push(status); }
    const wh = where.join(" AND ");
    const [[{ total }]] = await pool.execute(`SELECT COUNT(*) AS total FROM mutasi_keluar WHERE ${wh}`, vals);
    const [rows] = await pool.execute(
      `SELECT * FROM mutasi_keluar WHERE ${wh} ORDER BY tanggal_keluar DESC LIMIT ? OFFSET ?`,
      [...vals, Number(limit), offset]
    );
    res.json({ success: true, total: Number(total), data: rows });
  } catch (err) { next(err); }
});

// POST /api/mutasi/keluar
router.post("/keluar", requirePengurus, async (req, res, next) => {
  try {
    const { nama, jumlah_jiwa, rt_asal, tujuan_alamat, tanggal_keluar, no_pengantar, status, keterangan } = req.body;
    if (!nama || !jumlah_jiwa || !rt_asal || !tujuan_alamat || !tanggal_keluar) {
      return res.status(400).json({ success: false, pesan: "Field wajib tidak lengkap." });
    }
    const [result] = await pool.execute(
      `INSERT INTO mutasi_keluar (nama, jumlah_jiwa, rt_asal, tujuan_alamat, tanggal_keluar, no_pengantar, status, keterangan, dicatat_oleh)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nama, Number(jumlah_jiwa), rt_asal, tujuan_alamat, tanggal_keluar, no_pengantar || null, status || "Proses Kelurahan", keterangan || null, req.pengguna.id]
    );
    res.status(201).json({ success: true, pesan: "Mutasi keluar berhasil dicatat.", id: result.insertId });
  } catch (err) { next(err); }
});

// PUT /api/mutasi/keluar/:id
router.put("/keluar/:id", requirePengurus, async (req, res, next) => {
  try {
    const { status, keterangan } = req.body;
    const [result] = await pool.execute(
      `UPDATE mutasi_keluar SET status=COALESCE(?,status), keterangan=COALESCE(?,keterangan) WHERE id = ?`,
      [status, keterangan, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, pesan: "Data tidak ditemukan." });
    res.json({ success: true, pesan: "Data mutasi keluar diperbarui." });
  } catch (err) { next(err); }
});

// DELETE /api/mutasi/keluar/:id
router.delete("/keluar/:id", requirePengurus, async (req, res, next) => {
  try {
    const [result] = await pool.execute("DELETE FROM mutasi_keluar WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, pesan: "Data tidak ditemukan." });
    res.json({ success: true, pesan: "Data mutasi keluar dihapus." });
  } catch (err) { next(err); }
});

module.exports = router;
