// routes/authRoutes.js
// Endpoint autentikasi: login, registrasi, profil, dan manajemen akun
// Semua pembuatan akun dan update password melakukan enkripsi otomatis (Bcrypt)

const express = require("express");
const bcrypt  = require("bcryptjs");
const jwt     = require("jsonwebtoken");
const pool    = require("../config/db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Helper untuk enkripsi password otomatis
async function enkripsiPassword(plainTextPassword) {
  const rounds = Number(process.env.BCRYPT_ROUNDS) || 10;
  return bcrypt.hash(plainTextPassword, rounds);
}

// -----------------------------------------------------------------------
// POST /api/auth/login
// Body: { contact, password }
// contact = email ATAU no_hp ATAU NIK
// -----------------------------------------------------------------------
router.post("/login", async (req, res, next) => {
  try {
    const { contact, password } = req.body;

    if (!contact || !password) {
      return res.status(400).json({ success: false, pesan: "Contact dan password wajib diisi." });
    }

    // Cari pengguna berdasarkan email, no_hp, atau NIK
    const [rows] = await pool.execute(
      `SELECT * FROM pengguna
       WHERE (email = ? OR no_hp = ? OR nik = ?) AND aktif = 1
       LIMIT 1`,
      [contact.trim(), contact.trim(), contact.trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, pesan: "Akun tidak ditemukan atau tidak aktif." });
    }

    const pengguna = rows[0];
    const cocok    = await bcrypt.compare(password, pengguna.password);

    if (!cocok) {
      return res.status(401).json({ success: false, pesan: "Password salah." });
    }

    // Buat JWT
    const token = jwt.sign(
      { id: pengguna.id, nama: pengguna.nama, peran: pengguna.peran, rt: pengguna.rt },
      process.env.JWT_SECRET || "rw13_secret_key_default",
      { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );

    // Jangan kirim field password
    const { password: _pw, ...dataPengguna } = pengguna;

    res.json({
      success: true,
      pesan:   "Login berhasil.",
      token,
      pengguna: dataPengguna,
    });
  } catch (err) {
    if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT") {
      return res.status(503).json({
        success: false,
        pesan: "Tidak dapat terhubung ke database MySQL. Pastikan service MySQL aktif di port 3306 atau periksa MySQL Workbench.",
      });
    }
    next(err);
  }
});

// -----------------------------------------------------------------------
// POST /api/auth/register
// Body: { nama, nik, contact, password }
// Otomatis mengenkripsi password dengan Bcrypt sebelum disimpan
// -----------------------------------------------------------------------
router.post("/register", async (req, res, next) => {
  try {
    const { nama, nik, contact, password } = req.body;

    if (!nama || !nik || !contact || !password) {
      return res.status(400).json({ success: false, pesan: "Semua field wajib diisi." });
    }

    // Validasi NIK
    if (!/^\d{16}$/.test(nik)) {
      return res.status(400).json({ success: false, pesan: "NIK harus 16 digit angka." });
    }

    // Validasi password
    if (password.length < 6) {
      return res.status(400).json({ success: false, pesan: "Password minimal 6 karakter." });
    }

    // Cek NIK sudah terdaftar
    const [cekNik] = await pool.execute(
      "SELECT id FROM pengguna WHERE nik = ? LIMIT 1",
      [nik]
    );
    if (cekNik.length > 0) {
      return res.status(409).json({ success: false, pesan: "NIK sudah terdaftar." });
    }

    // Tentukan email vs no_hp
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const email   = isEmail ? contact.trim() : null;
    const no_hp   = isEmail ? null           : contact.trim();

    // ENKRIPSI OTOMATIS: Bcrypt hash
    const hash = await enkripsiPassword(password);

    // Simpan ke database
    const [result] = await pool.execute(
      `INSERT INTO pengguna (nama, nik, email, no_hp, password, peran, aktif)
       VALUES (?, ?, ?, ?, ?, 'warga', 1)`,
      [nama.trim(), nik, email, no_hp, hash]
    );

    res.status(201).json({
      success:  true,
      pesan:    "Registrasi berhasil. Password telah otomatis dienkripsi dengan Bcrypt.",
      id:       result.insertId,
    });
  } catch (err) {
    if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT") {
      return res.status(503).json({
        success: false,
        pesan: "Tidak dapat terhubung ke database MySQL. Pastikan service MySQL aktif di port 3306 atau periksa MySQL Workbench.",
      });
    }
    next(err);
  }
});

// -----------------------------------------------------------------------
// GET /api/auth/profil (butuh token)
// -----------------------------------------------------------------------
router.get("/profil", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, nama, nik, email, no_hp, peran, rt, aktif, created_at FROM pengguna WHERE id = ?",
      [req.pengguna.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, pesan: "Pengguna tidak ditemukan." });
    }

    res.json({ success: true, pengguna: rows[0] });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// POST /api/auth/buat-akun (Khusus Admin / Ketua RW)
// Menambahkan akun pengguna baru secara manual dengan password otomatis terenkripsi
// Body: { nama, nik, email, no_hp, password, peran, rt }
// -----------------------------------------------------------------------
router.post("/buat-akun", requireAdmin, async (req, res, next) => {
  try {
    const { nama, nik, email, no_hp, password, peran = "warga", rt } = req.body;

    if (!nama || !password) {
      return res.status(400).json({ success: false, pesan: "Nama dan password wajib diisi." });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, pesan: "Password minimal 6 karakter." });
    }

    // Cek duplikasi email atau nik jika diberikan
    if (nik) {
      const [cekNik] = await pool.execute("SELECT id FROM pengguna WHERE nik = ? LIMIT 1", [nik]);
      if (cekNik.length > 0) {
        return res.status(409).json({ success: false, pesan: "NIK sudah terdaftar." });
      }
    }
    if (email) {
      const [cekEmail] = await pool.execute("SELECT id FROM pengguna WHERE email = ? LIMIT 1", [email]);
      if (cekEmail.length > 0) {
        return res.status(409).json({ success: false, pesan: "Email sudah terdaftar." });
      }
    }

    // ENKRIPSI OTOMATIS: Bcrypt hash
    const hash = await enkripsiPassword(password);

    const [result] = await pool.execute(
      `INSERT INTO pengguna (nama, nik, email, no_hp, password, peran, rt, aktif)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [nama.trim(), nik || null, email ? email.trim() : null, no_hp ? no_hp.trim() : null, hash, peran, rt || null]
    );

    res.status(201).json({
      success: true,
      pesan: `Akun untuk ${nama} berhasil dibuat. Password tersimpan dalam enkripsi Bcrypt.`,
      id: result.insertId,
      pengguna: {
        id: result.insertId,
        nama: nama.trim(),
        nik: nik || null,
        email: email || null,
        no_hp: no_hp || null,
        peran,
        rt: rt || null,
      },
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// GET /api/auth/pengguna (Khusus Admin / Ketua RW)
// Mengambil daftar seluruh akun terdaftar
// -----------------------------------------------------------------------
router.get("/pengguna", requireAdmin, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, nama, nik, email, no_hp, peran, rt, aktif, created_at, updated_at
       FROM pengguna ORDER BY id DESC`
    );
    res.json({ success: true, total: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// PUT /api/auth/pengguna/:id (Khusus Admin atau Pemilik Akun)
// Update informasi akun. Jika field 'password' diisi, OTOMATIS dienkripsi ulang dengan Bcrypt.
// -----------------------------------------------------------------------
router.put("/pengguna/:id", requireAuth, async (req, res, next) => {
  try {
    const targetId = Number(req.params.id);

    // Hanya admin yang bisa mengedit akun orang lain
    if (req.pengguna.id !== targetId && !["admin", "ketua_rw"].includes(req.pengguna.peran)) {
      return res.status(403).json({ success: false, pesan: "Akses ditolak." });
    }

    const { nama, email, no_hp, password, peran, rt, aktif } = req.body;

    const fields = [];
    const values = [];

    if (nama !== undefined)  { fields.push("nama = ?"); values.push(nama.trim()); }
    if (email !== undefined) { fields.push("email = ?"); values.push(email ? email.trim() : null); }
    if (no_hp !== undefined) { fields.push("no_hp = ?"); values.push(no_hp ? no_hp.trim() : null); }
    if (rt !== undefined)    { fields.push("rt = ?"); values.push(rt || null); }

    // Hanya admin yang boleh ubah peran dan status aktif
    if (["admin", "ketua_rw"].includes(req.pengguna.peran)) {
      if (peran !== undefined) { fields.push("peran = ?"); values.push(peran); }
      if (aktif !== undefined) { fields.push("aktif = ?"); values.push(Number(aktif)); }
    }

    // Jika ganti password: LAKUKAN ENKRIPSI OTOMATIS
    if (password && password.trim().length >= 6) {
      const hash = await enkripsiPassword(password);
      fields.push("password = ?");
      values.push(hash);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, pesan: "Tidak ada field yang diperbarui." });
    }

    values.push(targetId);

    const [result] = await pool.execute(
      `UPDATE pengguna SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, pesan: "Akun tidak ditemukan." });
    }

    res.json({
      success: true,
      pesan: "Data akun berhasil diperbarui" + (password ? " (password telah dienkripsi ulang)." : "."),
    });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// DELETE /api/auth/pengguna/:id (Khusus Admin)
// -----------------------------------------------------------------------
router.delete("/pengguna/:id", requireAdmin, async (req, res, next) => {
  try {
    const targetId = Number(req.params.id);
    if (req.pengguna.id === targetId) {
      return res.status(400).json({ success: false, pesan: "Tidak dapat menghapus akun Anda sendiri." });
    }

    const [result] = await pool.execute("DELETE FROM pengguna WHERE id = ?", [targetId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, pesan: "Akun tidak ditemukan." });
    }

    res.json({ success: true, pesan: "Akun berhasil dihapus." });
  } catch (err) {
    next(err);
  }
});

// -----------------------------------------------------------------------
// POST /api/auth/enkripsi-util (Utility untuk MySQL Workbench & Admin)
// Menerima plaintext password, mengembalikan hash Bcrypt dan query SQL siap paste
// -----------------------------------------------------------------------
router.post("/enkripsi-util", async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, pesan: "Password wajib diisi." });
    }

    const hash = await enkripsiPassword(password);
    const sqlQuery = `INSERT INTO pengguna (nama, nik, email, no_hp, password, peran, aktif) VALUES ('Nama Pengguna', '3216010000000000', 'user@rw13.id', '081200000000', '${hash}', 'warga', 1);`;

    res.json({
      success: true,
      input: password,
      hash,
      rounds: Number(process.env.BCRYPT_ROUNDS) || 10,
      sqlQuery,
      petunjuk: "Salin hash atau query SQL di atas untuk dimasukkan langsung melalui MySQL Workbench.",
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
