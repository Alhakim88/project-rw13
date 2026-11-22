#!/usr/bin/env node
// scripts/init-db.js
// Inisialisasi & Sinkronisasi Otomatis Database MySQL RW 13
// Membaca konfigurasi dari .env dan mengeksekusi rw13_workbench_setup.sql

const fs    = require("fs");
const path  = require("path");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function init() {
  console.log("==================================================================");
  console.log("🚀 INISIALISASI & SINKRONISASI DATABASE MYSQL RW 13");
  console.log("==================================================================");

  const dbConfig = {
    host:               process.env.DB_HOST || "localhost",
    port:               Number(process.env.DB_PORT) || 3306,
    user:               process.env.DB_USER || "root",
    password:           process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : "",
    multipleStatements: true,
  };

  console.log(`🔌 Menghubungkan ke MySQL di ${dbConfig.host}:${dbConfig.port} (user: ${dbConfig.user})...`);

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Berhasil terhubung ke MySQL Server!");
  } catch (err) {
    console.error("❌ Gagal terhubung ke MySQL Server:", err.message);
    console.log("\n💡 PANDUAN PEMECAHAN MASALAH:");
    console.log("1. Pastikan server MySQL sedang berjalan (XAMPP / MySQL Service / MySQL Workbench).");
    console.log("2. Periksa kecocokan password di file backend/.env:");
    console.log("   - Jika menggunakan root tanpa password: DB_USER=root & DB_PASSWORD=");
    console.log("   - Jika menggunakan password root: DB_USER=root & DB_PASSWORD=password_anda");
    console.log("3. Anda juga dapat langsung mengimpor file berikut di MySQL Workbench:");
    console.log("   📁 backend/database/rw13_workbench_setup.sql\n");
    process.exit(1);
  }

  try {
    // 1. Buat database jika belum ada
    const dbName = process.env.DB_NAME || "rw13_db";
    console.log(`📦 Memastikan database '${dbName}' tersedia...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.changeUser({ database: dbName });

    // 2. Baca file SQL Workbench Setup
    const sqlPath = path.join(__dirname, "../database/rw13_workbench_setup.sql");
    console.log(`📄 Membaca script database: ${sqlPath}`);
    const sqlContent = fs.readFileSync(sqlPath, "utf8");

    // Eksekusi script SQL
    console.log("⏳ Menjalankan migrasi tabel, relasi, dan data sensus RW 13...");
    await connection.query(sqlContent);
    console.log("✅ Skema dan data berhasil dimigrasikan!");

    // 3. Verifikasi jumlah data
    console.log("\n📊 HASIL VERIFIKASI TABEL:");
    const tables = ["pengguna", "warga", "kelahiran", "kematian", "mutasi_masuk", "mutasi_keluar", "permohonan_surat", "pengaturan"];
    for (const t of tables) {
      const [[{ count }]] = await connection.query(`SELECT COUNT(*) AS count FROM \`${t}\``);
      console.log(`   - ${t.padEnd(18)}: ${count} baris`);
    }

    // 4. Verifikasi enkripsi password pengguna
    console.log("\n🔐 VERIFIKASI ENKRIPSI PASSWORD BCRYPT:");
    const [users] = await connection.query("SELECT id, nama, email, password, peran FROM pengguna LIMIT 3");
    for (const u of users) {
      const isBcrypt = u.password.startsWith("$2b$") || u.password.startsWith("$2a$");
      const testPass = u.peran === "warga" ? "<PASSWORD_WARGA>" : "<PASSWORD_ADMIN>";
      const valid = await bcrypt.compare(testPass, u.password);
      console.log(`   - ${u.nama} (${u.email})`);
      console.log(`     Format Bcrypt: ${isBcrypt ? "✓ Valid ($2b$)" : "✗ Bukan Bcrypt"} | Verifikasi '${testPass}': ${valid ? "✓ Cocok" : "✗ Tidak cocok"}`);
    }

    console.log("\n==================================================================");
    console.log("🎉 SINKRONISASI SELESAI & SUKSES!");
    console.log("==================================================================");
    console.log("Koneksi MySQL Workbench:");
    console.log(`  Hostname : ${dbConfig.host}`);
    console.log(`  Port     : ${dbConfig.port}`);
    console.log(`  Database : ${dbName}`);
    console.log(`  Username : ${dbConfig.user} (atau rw13_app)`);
    console.log("==================================================================\n");
  } catch (err) {
    console.error("❌ Terjadi kesalahan saat migrasi:", err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

init();
