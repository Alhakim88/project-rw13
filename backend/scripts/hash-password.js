#!/usr/bin/env node
// scripts/hash-password.js
// Utilitas enkripsi password otomatis menggunakan Bcrypt (cost 10)
// Menghasilkan hash aman dan query SQL siap paste untuk MySQL Workbench.
//
// Penggunaan:
//   node scripts/hash-password.js "PasswordAnda123"
//   node scripts/hash-password.js "PasswordAnda123" "Nama Lengkap" "email@rw13.id" "admin"

const bcrypt = require("bcryptjs");

const rawPassword = process.argv[2];
const nama        = process.argv[3] || "Nama Pengguna";
const email       = process.argv[4] || "user@rw13.id";
const peran       = process.argv[5] || "warga";
const nik         = process.argv[6] || "3216010000000001";

if (!rawPassword) {
  console.log("==================================================================");
  console.log("🔑 RW 13 — Generator Enkripsi Password Bcrypt & MySQL Workbench");
  console.log("==================================================================");
  console.log("Gunakan perintah berikut untuk mengenkripsi password:");
  console.log("  node scripts/hash-password.js <password_plaintext> [nama] [email] [peran] [nik]");
  console.log("");
  console.log("Contoh:");
  console.log('  node scripts/hash-password.js "<PASSWORD_ADMIN>"');
  console.log('  node scripts/hash-password.js "RahasiaKu123" "Budi Santoso" "budi@rw13.id" "warga" "3216010101900001"');
  console.log("==================================================================");
  process.exit(1);
}

(async () => {
  try {
    const rounds = 10;
    const hash = await bcrypt.hash(rawPassword, rounds);

    console.log("");
    console.log("==================================================================");
    console.log("✅ ENKRIPSI PASSWORD BERHASIL (Bcrypt Cost 10)");
    console.log("==================================================================");
    console.log(`Password Asli   : ${rawPassword}`);
    console.log(`Bcrypt Hash     : ${hash}`);
    console.log(`Algoritma       : Blowfish ($2b) 10 Rounds Salt`);
    console.log("==================================================================");
    console.log("📋 QUERY SQL UNTUK MYSQL WORKBENCH:");
    console.log("");
    console.log("-- 1. Insert Pengguna Baru:");
    console.log(`INSERT INTO pengguna (nama, nik, email, no_hp, password, peran, aktif)`);
    console.log(`VALUES ('${nama}', '${nik}', '${email}', '0812-0000-0000', '${hash}', '${peran}', 1);`);
    console.log("");
    console.log("-- 2. Update Password Pengguna yang Sudah Ada:");
    console.log(`UPDATE pengguna SET password = '${hash}' WHERE email = '${email}';`);
    console.log("==================================================================");
  } catch (err) {
    console.error("❌ Gagal mengenkripsi:", err.message);
    process.exit(1);
  }
})();
