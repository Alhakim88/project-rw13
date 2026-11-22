#!/usr/bin/env node
// scripts/buat-akun.js
// Pembuatan akun pengguna langsung ke MySQL dengan enkripsi Bcrypt otomatis.
//
// Penggunaan:
//   node scripts/buat-akun.js [nama] [nik] [contact/email] [password] [peran] [rt]

const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const nama = process.argv[2];
const nik = process.argv[3];
const contact = process.argv[4];
const password = process.argv[5];
const peran = process.argv[6] || "warga";
const rt = process.argv[7] || null;

if (!nama || !password) {
  console.log(
    "==================================================================",
  );
  console.log("👤 Pembuatan Akun Baru RW 13 (Enkripsi Bcrypt Otomatis)");
  console.log(
    "==================================================================",
  );
  console.log("Gunakan format:");
  console.log(
    "  node scripts/buat-akun.js <nama> <nik> <email_atau_nohp> <password> [peran] [rt]",
  );
  console.log("");
  console.log("Contoh:");
  console.log(
    '  node scripts/buat-akun.js "Asep Saepudin" "3216010101920005" "asep@rw13.id" "<PASSWORD_CONTOH>" "warga" "RT 03"',
  );
  console.log(
    '  node scripts/buat-akun.js "Admin Baru" "" "admin2@rw13.id" "AdminBaru2026!" "admin"',
  );
  console.log(
    "==================================================================",
  );
  process.exit(1);
}

(async () => {
  try {
    if (password.length < 6) {
      console.error("❌ Password minimal harus 6 karakter.");
      process.exit(1);
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact || "");
    const email = isEmail ? contact.trim() : null;
    const no_hp = isEmail ? null : contact ? contact.trim() : null;

    console.log("🔐 Mengenkrpsi password dengan Bcrypt cost 10...");
    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO pengguna (nama, nik, email, no_hp, password, peran, rt, aktif)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [nama.trim(), nik || null, email, no_hp, hash, peran, rt],
    );

    console.log("✅ Akun berhasil dibuat dan disimpan di MySQL!");
    console.log(`ID Pengguna  : ${result.insertId}`);
    console.log(`Nama         : ${nama}`);
    console.log(`Peran        : ${peran}`);
    console.log(`RT           : ${rt || "-"}`);
    console.log(`Login Kontak : ${contact || email || nik}`);
    console.log(`Password Hash: ${hash}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Gagal membuat akun:", err.message);
    process.exit(1);
  }
})();
