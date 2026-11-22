// routes/kematianRoutes.js
// CRUD data peristiwa kematian

const express = require("express");
const pool    = require("../config/db");
const { requireAuth, requirePengurus } = require("../middleware/auth");

const router = express.Router();

// GET /api/kematian?rt=&tahun=&page=&limit=
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { rt, tahun, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let where = ["1=1"]; const vals = [];
    if (rt)    { where.push("rt = ?");                   vals.push(rt); }
    if (tahun) { where.push("YEAR(tanggal_wafat) = ?");  vals.push(Number(tahun)); }
    const wh = where.join(" AND ");
    const [[{ total }]] = await pool.execute(`SELECT COUNT(*) AS total FROM kematian WHERE ${wh}`, vals);
    const [rows] = await pool.execute(
      `SELECT * FROM kematian WHERE ${wh} ORDER BY tanggal_wafat DESC LIMIT ? OFFSET ?`,
      [...vals, Number(limit), offset]
    );
    res.json({ success: true, total: Number(total), data: rows });
  } catch (err) { next(err); }
});

// GET /api/kematian/statistik
router.get("/statistik", requireAuth, async (req, res, next) => {
  try {
    const { tahun = new Date().getFullYear() } = req.query;
    const [[{ total }]] = await pool.execute(
      "SELECT COUNT(*) AS total FROM kematian WHERE YEAR(tanggal_wafat) = ?", [tahun]
    );
    const [per_bulan] = await pool.execute(
      `SELECT MONTH(tanggal_wafat) AS bulan, COUNT(*) AS jumlah
       FROM kematian WHERE YEAR(tanggal_wafat)=? GROUP BY bulan ORDER BY bulan`, [tahun]
    );
    res.json({ success: true, tahun: Number(tahun), total: Number(total), per_bulan });
  } catch (err) { next(err); }
});

// GET /api/kematian/:id
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM kematian WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, pesan: "Data tidak ditemukan." });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
});

// POST /api/kematian
router.post("/", requirePengurus, async (req, res, next) => {
  try {
    const { nama_almarhum, usia_meninggal, tanggal_wafat, penyebab, rt, nama_pelapor, lokasi_makam, no_surat_kematian, keterangan } = req.body;
    if (!nama_almarhum || !usia_meninggal || !tanggal_wafat || !rt || !nama_pelapor) {
      return res.status(400).json({ success: false, pesan: "Field wajib tidak lengkap." });
    }
    const [result] = await pool.execute(
      `INSERT INTO kematian (nama_almarhum, usia_meninggal, tanggal_wafat, penyebab, rt, nama_pelapor, lokasi_makam, no_surat_kematian, keterangan, dicatat_oleh)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nama_almarhum, Number(usia_meninggal), tanggal_wafat, penyebab || null, rt, nama_pelapor,
       lokasi_makam || "TPU Margahayu", no_surat_kematian || null, keterangan || null, req.pengguna.id]
    );
    res.status(201).json({ success: true, pesan: "Data kematian berhasil dicatat.", id: result.insertId });
  } catch (err) { next(err); }
});

// PUT /api/kematian/:id
router.put("/:id", requirePengurus, async (req, res, next) => {
  try {
    const { nama_almarhum, usia_meninggal, tanggal_wafat, penyebab, rt, nama_pelapor, lokasi_makam, keterangan } = req.body;
    const [result] = await pool.execute(
      `UPDATE kematian SET nama_almarhum=COALESCE(?,nama_almarhum), usia_meninggal=COALESCE(?,usia_meninggal),
        tanggal_wafat=COALESCE(?,tanggal_wafat), penyebab=COALESCE(?,penyebab), rt=COALESCE(?,rt),
        nama_pelapor=COALESCE(?,nama_pelapor), lokasi_makam=COALESCE(?,lokasi_makam), keterangan=COALESCE(?,keterangan)
       WHERE id = ?`,
      [nama_almarhum, usia_meninggal, tanggal_wafat, penyebab, rt, nama_pelapor, lokasi_makam, keterangan, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, pesan: "Data tidak ditemukan." });
    res.json({ success: true, pesan: "Data kematian berhasil diperbarui." });
  } catch (err) { next(err); }
});

// DELETE /api/kematian/:id
router.delete("/:id", requirePengurus, async (req, res, next) => {
  try {
    const [result] = await pool.execute("DELETE FROM kematian WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, pesan: "Data tidak ditemukan." });
    res.json({ success: true, pesan: "Data kematian berhasil dihapus." });
  } catch (err) { next(err); }
});

module.exports = router;
