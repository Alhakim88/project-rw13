-- =====================================================================
-- USER & HAK AKSES MySQL untuk Aplikasi RW 13 & MySQL Workbench
-- Jalankan file ini satu kali di MySQL Workbench sebagai root / admin
-- =====================================================================

-- 1. Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS rw13_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Buat user aplikasi rw13_app untuk localhost dan host remote/workbench
CREATE USER IF NOT EXISTS 'rw13_app'@'localhost' IDENTIFIED BY '<PASSWORD_DB>';
CREATE USER IF NOT EXISTS 'rw13_app'@'%'         IDENTIFIED BY '<PASSWORD_DB>';

-- Berikan hak penuh pada database rw13_db
GRANT ALL PRIVILEGES ON rw13_db.* TO 'rw13_app'@'localhost';
GRANT ALL PRIVILEGES ON rw13_db.* TO 'rw13_app'@'%';

-- 3. Flush privileges agar perubahan segera berlaku
FLUSH PRIVILEGES;

-- 4. Verifikasi hak akses
SHOW GRANTS FOR 'rw13_app'@'localhost';
