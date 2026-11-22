// routes/kelahiranRoutes.js
// CRUD data peristiwa kelahiran

const express = require("express");
const pool    = require("../config/db");
const { requireAuth, requirePengurus } = require("../middleware/auth");

const router = express.Router();

// GET /api/kelahiran?rt=RT01&tahun=2026&page=1&limit=20
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { rt, tahun, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where  = ["1=1"];
    const vals = [];

    if (rt)    { where.push("rt = ?");                        vals.push(rt); }
    if (tahun) { where.push("YEAR(tanggal_lahir) = ?");       vals.push(Number(tahun)); }

    const whereClause = where.join(" AND ");

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM kelahiran WHERE ${whereClause}`, vals
    );
    const [rows] = await pool.execute(
      `SELECT * FROM kelahiran WHERE ${whereClause} ORDER BY tanggal_lahir DESC LIMIT ? OFFSET ?`,
      [...vals, Number(limit), offset]
    );

    res.json({ success: true, total: Number(total), data: rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/kelahiran/statistik
router.get("/statistik", requireAuth, async (req, res, next) => {
  try {
    const { tahun = new Date().getFullYear() } = req.query;
    const [[{ total }]] = await pool.execute(
      "SELECT COUNT(*) AS total FROM kelahiran WHERE YEAR(tanggal_lahir) = ?", [tahun]
    );
    const [[{ laki_laki }]] = await pool.execute(
      "SELECT COUNT(*) AS laki_laki FROM kelahiran WHERE jenis_kelamin='L' AND YEAR(tanggal_lahir)=?", [tahun]
    );
    const [[{ perempuan }]] = await pool.execute(
      "SELECT COUNT(*) AS perempuan FROM kelahiran WHERE jenis_kelamin='P' AND YEAR(tanggal_lahir)=?", [tahun]
    );
    const [per_bulan] = await pool.execute(
      `SELECT MONTH(tanggal_lahir) AS bulan, COUNT(*) AS jumlah
       FROM kelahiran WHERE YEAR(tanggal_lahir)=?
       GROUP BY bulan ORDER BY bulan`, [tahun]
    );
    res.json({ success: true, tahun: Number(tahun), total: Number(total), laki_laki: Number(laki_laki), perempuan: Number(perempuan), per_bulan });
  } catch (err) {
    next(err);
  }
});

// GET /api/kelahiran/:id
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM kelahiran WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, pesan: "Data tidak ditemukan." });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
});

// POST /api/kelahiran
router.post("/", requirePengurus, async (req, res, next) => {
  try {
    const { nama_bayi, jenis_kelamin, tanggal_lahir, tempat_lahir, rt, nama_ayah, nama_ibu, nik_ayah, nik_ibu, no_akta, keterangan } = req.body;

    if (!nama_bayi || !jenis_kelamin || !tanggal_lahir || !rt || !nama_ayah || !nama_ibu) {
      return res.status(400).json({ success: false, pesan: "Field wajib tidak lengkap." });
    }

    const [result] = await pool.execute(
      `INSERT INTO kelahiran (nama_bayi, jenis_kelamin, tanggal_lahir, tempat_lahir, rt, nama_ayah, nama_ibu, nik_ayah, nik_ibu, no_akta, keterangan, dicatat_oleh)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nama_bayi, jenis_kelamin, tanggal_lahir, tempat_lahir || "RS Mitra Keluarga Bekasi", rt, nama_ayah, nama_ibu, nik_ayah || null, nik_ibu || null, no_akta || null, keterangan || null, req.pengguna.id]
    );
    res.status(201).json({ success: true, pesan: "Data kelahiran berhasil dicatat.", id: result.insertId });
  } catch (err) { next(err); }
});

// PUT /api/kelahiran/:id
router.put("/:id", requirePengurus, async (req, res, next) => {
  try {
    const { nama_bayi, jenis_kelamin, tanggal_lahir, tempat_lahir, rt, nama_ayah, nama_ibu, no_akta, keterangan } = req.body;
    const [result] = await pool.execute(
      `UPDATE kelahiran SET nama_bayi=COALESCE(?,nama_bayi), jenis_kelamin=COALESCE(?,jenis_kelamin),
        tanggal_lahir=COALESCE(?,tanggal_lahir), tempat_lahir=COALESCE(?,tempat_lahir),
        rt=COALESCE(?,rt), nama_ayah=COALESCE(?,nama_ayah), nama_ibu=COALESCE(?,nama_ibu),
        no_akta=COALESCE(?,no_akta), keterangan=COALESCE(?,keterangan)
       WHERE id = ?`,
      [nama_bayi, jenis_kelamin, tanggal_lahir, tempat_lahir, rt, nama_ayah, nama_ibu, no_akta, keterangan, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, pesan: "Data tidak ditemukan." });
    res.json({ success: true, pesan: "Data kelahiran berhasil diperbarui." });
  } catch (err) { next(err); }
});

// DELETE /api/kelahiran/:id
router.delete("/:id", requirePengurus, async (req, res, next) => {
  try {
    const [result] = await pool.execute("DELETE FROM kelahiran WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, pesan: "Data tidak ditemukan." });
    res.json({ success: true, pesan: "Data kelahiran berhasil dihapus." });
  } catch (err) { next(err); }
});

module.exports = router;
