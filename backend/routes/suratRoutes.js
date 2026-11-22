// routes/suratRoutes.js
// CRUD permohonan surat warga

const express = require("express");
const pool    = require("../config/db");
const { requireAuth, requirePengurus } = require("../middleware/auth");

const router = express.Router();

// GET /api/surat?status=&rt=&page=&limit=
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { status, rt, jenis_surat, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let where = ["1=1"]; const vals = [];
    if (status)      { where.push("status = ?");             vals.push(status); }
    if (rt)          { where.push("rt_pemohon = ?");         vals.push(rt); }
    if (jenis_surat) { where.push("jenis_surat LIKE ?");     vals.push(`%${jenis_surat}%`); }
    const wh = where.join(" AND ");
    const [[{ total }]] = await pool.execute(`SELECT COUNT(*) AS total FROM permohonan_surat WHERE ${wh}`, vals);
    const [rows] = await pool.execute(
      `SELECT * FROM permohonan_surat WHERE ${wh} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...vals, Number(limit), offset]
    );
    res.json({ success: true, total: Number(total), data: rows });
  } catch (err) { next(err); }
});

// GET /api/surat/statistik
router.get("/statistik", requireAuth, async (req, res, next) => {
  try {
    const [[{ total }]]      = await pool.execute("SELECT COUNT(*) AS total FROM permohonan_surat");
    const [[{ menunggu }]]   = await pool.execute("SELECT COUNT(*) AS menunggu FROM permohonan_surat WHERE status IN ('Menunggu RT','Antrean RW')");
    const [[{ diproses }]]   = await pool.execute("SELECT COUNT(*) AS diproses FROM permohonan_surat WHERE status = 'Diproses'");
    const [[{ selesai }]]    = await pool.execute("SELECT COUNT(*) AS selesai FROM permohonan_surat WHERE status = 'Selesai'");
    const [per_jenis] = await pool.execute(
      "SELECT jenis_surat, COUNT(*) AS jumlah FROM permohonan_surat GROUP BY jenis_surat ORDER BY jumlah DESC"
    );
    res.json({ success: true, total: Number(total), menunggu: Number(menunggu), diproses: Number(diproses), selesai: Number(selesai), per_jenis });
  } catch (err) { next(err); }
});

// GET /api/surat/:id
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM permohonan_surat WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, pesan: "Data tidak ditemukan." });
    res.json({ success: true, data: rows[0] });
  } catch (err) { next(err); }
});

// POST /api/surat — ajukan permohonan baru
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { jenis_surat, nama_pemohon, nik_pemohon, rt_pemohon, keperluan } = req.body;
    if (!jenis_surat || !nama_pemohon || !rt_pemohon) {
      return res.status(400).json({ success: false, pesan: "Field wajib tidak lengkap." });
    }
    // Generate nomor permohonan
    const tahun = new Date().getFullYear();
    const kode  = jenis_surat.split("-")[0] || "SKD";
    const [[{ urut }]] = await pool.execute(
      "SELECT COUNT(*)+1 AS urut FROM permohonan_surat WHERE YEAR(created_at)=?", [tahun]
    );
    const noPerm = `RW13/${kode}/${tahun}/${String(urut).padStart(3,"0")}`;

    const [result] = await pool.execute(
      `INSERT INTO permohonan_surat (no_permohonan, jenis_surat, nama_pemohon, nik_pemohon, rt_pemohon, keperluan, status, tanggal_ajukan, pengguna_id)
       VALUES (?, ?, ?, ?, ?, ?, 'Menunggu RT', CURDATE(), ?)`,
      [noPerm, jenis_surat, nama_pemohon, nik_pemohon || null, rt_pemohon, keperluan || null, req.pengguna.id]
    );
    res.status(201).json({ success: true, pesan: "Permohonan surat berhasil diajukan.", id: result.insertId, no_permohonan: noPerm });
  } catch (err) { next(err); }
});

// PATCH /api/surat/:id/status — ubah status (pengurus)
router.patch("/:id/status", requirePengurus, async (req, res, next) => {
  try {
    const { status, catatan_admin, tanggal_selesai } = req.body;
    const statusValid = ["Menunggu RT","Antrean RW","Diproses","Selesai","Ditolak"];
    if (!status || !statusValid.includes(status)) {
      return res.status(400).json({ success: false, pesan: `Status harus salah satu dari: ${statusValid.join(", ")}` });
    }
    const [result] = await pool.execute(
      `UPDATE permohonan_surat SET status=?, catatan_admin=COALESCE(?,catatan_admin), tanggal_selesai=COALESCE(?,tanggal_selesai) WHERE id=?`,
      [status, catatan_admin || null, tanggal_selesai || null, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, pesan: "Data tidak ditemukan." });
    res.json({ success: true, pesan: `Status surat diubah menjadi "${status}".` });
  } catch (err) { next(err); }
});

// DELETE /api/surat/:id
router.delete("/:id", requirePengurus, async (req, res, next) => {
  try {
    const [result] = await pool.execute("DELETE FROM permohonan_surat WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, pesan: "Data tidak ditemukan." });
    res.json({ success: true, pesan: "Data permohonan surat dihapus." });
  } catch (err) { next(err); }
});

module.exports = router;
