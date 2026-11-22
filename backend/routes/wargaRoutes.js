// routes/wargaRoutes.js
// CRUD data kependudukan warga RW 13

const express = require("express");
const pool    = require("../config/db");
const { requireAuth, requireAdmin, requirePengurus } = require("../middleware/auth");

const router = express.Router();

// -----------------------------------------------------------------------
// GET /api/warga
// Query: ?rt=RT 01&gender=L&q=nama&page=1&limit=20
// -----------------------------------------------------------------------
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { rt, gender, pendidikan, pekerjaan, q, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where  = ["1=1"];
    const vals = [];

    if (rt)         { where.push("rt = ?");              vals.push(rt); }
    if (gender)     { where.push("gender = ?");          vals.push(gender); }
    if (pendidikan) { where.push("pendidikan = ?");      vals.push(pendidikan); }
    if (pekerjaan)  { where.push("pekerjaan LIKE ?");   vals.push(`%${pekerjaan}%`); }
    if (q)          { where.push("nama LIKE ?");         vals.push(`%${q}%`); }

    const whereClause = where.join(" AND ");

    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM warga WHERE ${whereClause}`,
      vals
    );

    const [rows] = await pool.execute(
      `SELECT * FROM warga WHERE ${whereClause} ORDER BY rt, no LIMIT ? OFFSET ?`,
      [...vals, Number(limit), offset]
    );

    res.json({
      success: true,
      total:   Number(total),
      halaman: Number(page),
      limit:   Number(limit),
      data:    rows,
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// GET /api/warga/statistik  — ringkasan data untuk dashboard
// -----------------------------------------------------------------------
router.get("/statistik", requireAuth, async (req, res, next) => {
  try {
    const [[{ total }]]    = await pool.execute("SELECT COUNT(*) AS total FROM warga");
    const [[{ laki }]]     = await pool.execute("SELECT COUNT(*) AS laki FROM warga WHERE gender='L'");
    const [[{ perempuan }]]= await pool.execute("SELECT COUNT(*) AS perempuan FROM warga WHERE gender='P'");
    const [[{ kk }]]       = await pool.execute("SELECT COUNT(*) AS kk FROM warga WHERE shdk='Kepala Keluarga'");

    // Distribusi RT
    const [perRT] = await pool.execute(
      `SELECT rt, COUNT(*) AS jumlah_warga,
              SUM(shdk='Kepala Keluarga') AS jumlah_kk
       FROM warga GROUP BY rt ORDER BY rt`
    );

    // Distribusi pendidikan
    const [pendidikan] = await pool.execute(
      `SELECT pendidikan, COUNT(*) AS jumlah FROM warga GROUP BY pendidikan ORDER BY jumlah DESC`
    );

    // Distribusi pekerjaan (top 10)
    const [pekerjaan] = await pool.execute(
      `SELECT pekerjaan, COUNT(*) AS jumlah FROM warga GROUP BY pekerjaan ORDER BY jumlah DESC LIMIT 10`
    );

    // Distribusi usia kelompok
    const [usia] = await pool.execute(
      `SELECT
         SUM(usia BETWEEN 0  AND  4)  AS balita,
         SUM(usia BETWEEN 5  AND 11)  AS anak,
         SUM(usia BETWEEN 12 AND 25)  AS remaja,
         SUM(usia BETWEEN 26 AND 59)  AS produktif,
         SUM(usia >= 60)              AS lansia
       FROM warga`
    );

    // Distribusi agama
    const [agama] = await pool.execute(
      `SELECT agama, COUNT(*) AS jumlah FROM warga GROUP BY agama ORDER BY jumlah DESC`
    );

    res.json({
      success: true,
      total:   Number(total),
      laki:    Number(laki),
      perempuan: Number(perempuan),
      kk:      Number(kk),
      per_rt:  perRT,
      pendidikan,
      pekerjaan,
      usia:    usia[0],
      agama,
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// GET /api/warga/:id
// -----------------------------------------------------------------------
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM warga WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, pesan: "Data warga tidak ditemukan." });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// POST /api/warga  — tambah warga baru (admin/pengurus)
// -----------------------------------------------------------------------
router.post("/", requirePengurus, async (req, res, next) => {
  try {
    const {
      rw = "RW 13", rt, nama_rt, nama, shdk, gender,
      tempat_lahir, usia, agama = "Islam", pendidikan, pekerjaan, kawin
    } = req.body;

    if (!rt || !nama || !shdk || !gender || !tempat_lahir || !usia || !pendidikan || !pekerjaan || !kawin) {
      return res.status(400).json({ success: false, pesan: "Field wajib tidak lengkap." });
    }

    // Ambil nomor urut berikutnya
    const [[{ maxNo }]] = await pool.execute("SELECT MAX(no) AS maxNo FROM warga");
    const noUrut = (maxNo || 0) + 1;

    const [result] = await pool.execute(
      `INSERT INTO warga (no, rw, rt, nama_rt, nama, shdk, gender, tempat_lahir, usia, agama, pendidikan, pekerjaan, kawin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [noUrut, rw, rt, nama_rt || "", nama, shdk, gender, tempat_lahir, Number(usia), agama, pendidikan, pekerjaan, kawin]
    );

    res.status(201).json({ success: true, pesan: "Data warga berhasil ditambahkan.", id: result.insertId });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// PUT /api/warga/:id  — perbarui data warga (admin/pengurus)
// -----------------------------------------------------------------------
router.put("/:id", requirePengurus, async (req, res, next) => {
  try {
    const { rt, nama_rt, nama, shdk, gender, tempat_lahir, usia, agama, pendidikan, pekerjaan, kawin } = req.body;

    const [result] = await pool.execute(
      `UPDATE warga SET rt=COALESCE(?,rt), nama_rt=COALESCE(?,nama_rt), nama=COALESCE(?,nama),
        shdk=COALESCE(?,shdk), gender=COALESCE(?,gender), tempat_lahir=COALESCE(?,tempat_lahir),
        usia=COALESCE(?,usia), agama=COALESCE(?,agama), pendidikan=COALESCE(?,pendidikan),
        pekerjaan=COALESCE(?,pekerjaan), kawin=COALESCE(?,kawin)
       WHERE id = ?`,
      [rt, nama_rt, nama, shdk, gender, tempat_lahir, usia, agama, pendidikan, pekerjaan, kawin, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, pesan: "Data warga tidak ditemukan." });
    }

    res.json({ success: true, pesan: "Data warga berhasil diperbarui." });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// DELETE /api/warga/:id  — hapus warga (admin only)
// -----------------------------------------------------------------------
router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const [result] = await pool.execute("DELETE FROM warga WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, pesan: "Data warga tidak ditemukan." });
    }

    res.json({ success: true, pesan: "Data warga berhasil dihapus." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
