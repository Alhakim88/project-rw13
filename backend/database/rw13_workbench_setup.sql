-- ======================================================================================
-- PROYEK KEPENDUDUKAN RW 13 - KELURAHAN MARGAHAYU, KECAMATAN BEKASI TIMUR
-- FILE: rw13_workbench_setup.sql
-- DESKRIPSI: Master SQL Script untuk Inisialisasi Database via MySQL Workbench
--
-- CARA PENGGUNAAN DI MYSQL WORKBENCH:
-- 1. Buka MySQL Workbench dan lakukan koneksi ke Local MySQL Server (root atau admin).
-- 2. Klik menu File -> Open SQL Script... (atau tekan Ctrl + Shift + O).
-- 3. Pilih file ini: rw13_workbench_setup.sql
-- 4. Klik ikon Petir (⚡ Execute the selected portion / Ctrl + Shift + Enter).
-- 5. Refresh panel Schemas di sebelah kiri -> database 'rw13_db' siap digunakan!
--
-- KREDENSIAL DEFAULT APLIKASI:
-- - Admin RW 13  : email: admin@rw13.id     | password: <PASSWORD_ADMIN> (Enkripsi Bcrypt)
-- - Ketua RW 13  : email: ketuarw13@rw13.id | password: <PASSWORD_ADMIN> (Enkripsi Bcrypt)
-- - Ketua RT 01  : email: nurdin@rw13.id    | password: <PASSWORD_ADMIN> (Enkripsi Bcrypt)
-- - Ketua RT 02  : email: baco@rw13.id      | password: <PASSWORD_ADMIN> (Enkripsi Bcrypt)
-- - Ketua RT 03-09: [nama]@rw13.id          | password: <PASSWORD_ADMIN> (Enkripsi Bcrypt)
-- - Warga Demo   : email: warga@rw13.id     | password: <PASSWORD_WARGA> (Enkripsi Bcrypt)
-- - Warga Demo 2 : email: sari@rw13.desa.id | password: <PASSWORD_WARGA> (Enkripsi Bcrypt)
-- ======================================================================================

-- 1. PEMBUATAN DATABASE
CREATE DATABASE IF NOT EXISTS rw13_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE rw13_db;

-- 2. PEMBUATAN USER APLIKASI
CREATE USER IF NOT EXISTS 'rw13_app'@'localhost' IDENTIFIED BY '<PASSWORD_DB>';
CREATE USER IF NOT EXISTS 'rw13_app'@'%'         IDENTIFIED BY '<PASSWORD_DB>';
GRANT ALL PRIVILEGES ON rw13_db.* TO 'rw13_app'@'localhost';
GRANT ALL PRIVILEGES ON rw13_db.* TO 'rw13_app'@'%';
FLUSH PRIVILEGES;

-- Nonaktifkan pengecekan foreign key sementara untuk reset bersih
SET FOREIGN_KEY_CHECKS = 0;

-- ======================================================================================
-- 3. STRUKTUR TABEL
-- ======================================================================================

-- TABEL: pengguna (Autentikasi Pengurus & Warga dengan password Bcrypt)
DROP TABLE IF EXISTS pengguna;
CREATE TABLE pengguna (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama        VARCHAR(150) NOT NULL,
  nik         VARCHAR(16)  NULL UNIQUE COMMENT '16 digit NIK KTP',
  email       VARCHAR(150) NULL UNIQUE,
  no_hp       VARCHAR(20)  NULL,
  password    VARCHAR(255) NOT NULL COMMENT 'Hash Bcrypt $2b$10$...',
  peran       ENUM('admin','ketua_rw','ketua_rt','warga') NOT NULL DEFAULT 'warga',
  rt          VARCHAR(10)  NULL COMMENT 'Contoh: RT 01',
  aktif       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pengguna_email (email),
  INDEX idx_pengguna_nik (nik),
  INDEX idx_pengguna_nohp (no_hp)
) ENGINE=InnoDB;

-- TABEL: warga (Data Sensus 99 Jiwa Kependudukan)
DROP TABLE IF EXISTS warga;
CREATE TABLE warga (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  no            INT UNSIGNED NOT NULL COMMENT 'Nomor urut sensus',
  rw            VARCHAR(10)  NOT NULL DEFAULT 'RW 13',
  rt            VARCHAR(10)  NOT NULL COMMENT 'Contoh: RT 01',
  nama_rt       VARCHAR(100) NOT NULL COMMENT 'Nama ketua RT penanggung jawab',
  nama          VARCHAR(150) NOT NULL,
  shdk          ENUM('Kepala Keluarga','Istri','Anak','Orang Tua','Famili Lain') NOT NULL,
  gender        ENUM('L','P') NOT NULL,
  tempat_lahir  VARCHAR(100) NOT NULL,
  usia          TINYINT UNSIGNED NOT NULL,
  agama         VARCHAR(30)  NOT NULL DEFAULT 'Islam',
  pendidikan    VARCHAR(50)  NOT NULL,
  pekerjaan     VARCHAR(100) NOT NULL,
  kawin         ENUM('Kawin','Belum Kawin','Cerai Mati','Cerai Hidup') NOT NULL DEFAULT 'Belum Kawin',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_warga_rt (rt),
  INDEX idx_warga_gender (gender),
  INDEX idx_warga_shdk (shdk),
  INDEX idx_warga_pendidikan (pendidikan),
  INDEX idx_warga_pekerjaan (pekerjaan)
) ENGINE=InnoDB;

-- TABEL: kelahiran (Peristiwa Kelahiran Bayi)
DROP TABLE IF EXISTS kelahiran;
CREATE TABLE kelahiran (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama_bayi       VARCHAR(150) NOT NULL,
  jenis_kelamin   ENUM('L','P') NOT NULL,
  tanggal_lahir   DATE         NOT NULL,
  tempat_lahir    VARCHAR(100) NOT NULL DEFAULT 'RS Mitra Keluarga Bekasi',
  rt              VARCHAR(10)  NOT NULL,
  nama_ayah       VARCHAR(150) NOT NULL,
  nama_ibu        VARCHAR(150) NOT NULL,
  nik_ayah        VARCHAR(16)  NULL,
  nik_ibu         VARCHAR(16)  NULL,
  no_akta         VARCHAR(50)  NULL UNIQUE,
  keterangan      TEXT         NULL,
  dicatat_oleh    INT UNSIGNED NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dicatat_oleh) REFERENCES pengguna(id) ON DELETE SET NULL,
  INDEX idx_kelahiran_rt (rt),
  INDEX idx_kelahiran_tanggal (tanggal_lahir)
) ENGINE=InnoDB;

-- TABEL: kematian (Peristiwa Kematian Warga)
DROP TABLE IF EXISTS kematian;
CREATE TABLE kematian (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama_almarhum     VARCHAR(150) NOT NULL,
  usia_meninggal    TINYINT UNSIGNED NOT NULL,
  tanggal_wafat     DATE         NOT NULL,
  penyebab          VARCHAR(200) NULL,
  rt                VARCHAR(10)  NOT NULL,
  nama_pelapor      VARCHAR(150) NOT NULL,
  lokasi_makam      VARCHAR(200) NULL DEFAULT 'TPU Margahayu, Bekasi',
  no_surat_kematian VARCHAR(50)  NULL UNIQUE,
  keterangan        TEXT         NULL,
  dicatat_oleh      INT UNSIGNED NULL,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dicatat_oleh) REFERENCES pengguna(id) ON DELETE SET NULL,
  INDEX idx_kematian_rt (rt),
  INDEX idx_kematian_tanggal (tanggal_wafat)
) ENGINE=InnoDB;

-- TABEL: mutasi_masuk (Warga Pindah Masuk ke RW 13)
DROP TABLE IF EXISTS mutasi_masuk;
CREATE TABLE mutasi_masuk (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama          VARCHAR(150) NOT NULL,
  jumlah_jiwa   TINYINT UNSIGNED NOT NULL DEFAULT 1,
  asal_alamat   VARCHAR(300) NOT NULL,
  rt_tujuan     VARCHAR(10)  NOT NULL,
  tanggal_masuk DATE         NOT NULL,
  no_skpwni     VARCHAR(50)  NULL UNIQUE,
  status        ENUM('Proses','Terverifikasi','Ditolak') NOT NULL DEFAULT 'Proses',
  keterangan    TEXT         NULL,
  dicatat_oleh  INT UNSIGNED NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dicatat_oleh) REFERENCES pengguna(id) ON DELETE SET NULL,
  INDEX idx_mutasi_masuk_rt (rt_tujuan)
) ENGINE=InnoDB;

-- TABEL: mutasi_keluar (Warga Pindah Keluar dari RW 13)
DROP TABLE IF EXISTS mutasi_keluar;
CREATE TABLE mutasi_keluar (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama            VARCHAR(150) NOT NULL,
  jumlah_jiwa     TINYINT UNSIGNED NOT NULL DEFAULT 1,
  rt_asal         VARCHAR(10)  NOT NULL,
  tujuan_alamat   VARCHAR(300) NOT NULL,
  tanggal_keluar  DATE         NOT NULL,
  no_pengantar    VARCHAR(50)  NULL UNIQUE,
  status          ENUM('Proses Kelurahan','Selesai','Ditolak') NOT NULL DEFAULT 'Proses Kelurahan',
  keterangan      TEXT         NULL,
  dicatat_oleh    INT UNSIGNED NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dicatat_oleh) REFERENCES pengguna(id) ON DELETE SET NULL,
  INDEX idx_mutasi_keluar_rt (rt_asal)
) ENGINE=InnoDB;

-- TABEL: permohonan_surat (Pelayanan Administrasi Persuratan Warga)
DROP TABLE IF EXISTS permohonan_surat;
CREATE TABLE permohonan_surat (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  no_permohonan   VARCHAR(50)  NOT NULL UNIQUE,
  jenis_surat     VARCHAR(100) NOT NULL COMMENT 'Contoh: SKD-01, SKTM-02, SKU-04, SPN-05, dll.',
  nama_pemohon    VARCHAR(150) NOT NULL,
  nik_pemohon     VARCHAR(16)  NULL,
  rt_pemohon      VARCHAR(10)  NOT NULL,
  keperluan       TEXT         NULL,
  status          ENUM('Menunggu RT','Antrean RW','Diproses','Selesai','Ditolak') NOT NULL DEFAULT 'Menunggu RT',
  tanggal_ajukan  DATE         NOT NULL,
  tanggal_selesai DATE         NULL,
  catatan_admin   TEXT         NULL,
  pengguna_id     INT UNSIGNED NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pengguna_id) REFERENCES pengguna(id) ON DELETE SET NULL,
  INDEX idx_surat_status (status),
  INDEX idx_surat_rt (rt_pemohon)
) ENGINE=InnoDB;

-- TABEL: pengaturan (Konfigurasi Global Sistem Dasbor)
DROP TABLE IF EXISTS pengaturan;
CREATE TABLE pengaturan (
  kunci       VARCHAR(100) PRIMARY KEY,
  nilai       TEXT         NOT NULL,
  deskripsi   VARCHAR(255) NULL,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- ======================================================================================
-- 4. INSERT DATA AWAL (SEED DATA LENGKAP)
-- ======================================================================================

-- PENGGUNA TERENKRIPSI (Bcrypt cost 10)
-- Hash Admin & Pengurus (Password '<PASSWORD_ADMIN>'): <HASH_ADMIN>
-- Hash Warga Demo       (Password '<PASSWORD_WARGA>'): <HASH_WARGA>
INSERT INTO pengguna (nama, nik, email, no_hp, password, peran, rt, aktif) VALUES
  ('Admin RW 13', NULL, 'admin@rw13.id', '0812-0000-1300',
   '<HASH_ADMIN>', 'admin', NULL, 1),
  ('Ketua RW 13 (H. Budiman)', '3216010101650001', 'ketuarw13@rw13.id', '0813-0000-1300',
   '<HASH_ADMIN>', 'ketua_rw', NULL, 1),
  ('Nurdin (Ketua RT 01)', '3216010101780001', 'nurdin@rw13.id', '0812-3456-0001',
   '<HASH_ADMIN>', 'ketua_rt', 'RT 01', 1),
  ('Baco Subagyo (Ketua RT 02)', '3216010101710002', 'baco@rw13.id', '0813-4567-0002',
   '<HASH_ADMIN>', 'ketua_rt', 'RT 02', 1),
  ('Ahmad Sanusi (Ketua RT 03)', '3216010101740003', 'ahmad@rw13.id', '0815-6789-0003',
   '<HASH_ADMIN>', 'ketua_rt', 'RT 03', 1),
  ('Imron Rosyadi (Ketua RT 04)', '3216010101800004', 'imron@rw13.id', '0812-7890-0004',
   '<HASH_ADMIN>', 'ketua_rt', 'RT 04', 1),
  ('Darman Suhendra (Ketua RT 05)', '3216010101760005', 'darman@rw13.id', '0813-8901-0005',
   '<HASH_ADMIN>', 'ketua_rt', 'RT 05', 1),
  ('Joko Widodo S. (Ketua RT 06)', '3216010101730006', 'joko@rw13.id', '0816-9012-0006',
   '<HASH_ADMIN>', 'ketua_rt', 'RT 06', 1),
  ('Suwowo Prapto (Ketua RT 07)', '3216010101700007', 'wowo@rw13.id', '0812-0123-0007',
   '<HASH_ADMIN>', 'ketua_rt', 'RT 07', 1),
  ('Tedi Hermawan (Ketua RT 08)', '3216010101810008', 'tedi@rw13.id', '0813-1234-0008',
   '<HASH_ADMIN>', 'ketua_rt', 'RT 08', 1),
  ('Dian Sastro Wardoyo (Ketua RT 09)', '3216010101790009', 'dian@rw13.id', '0815-2345-0009',
   '<HASH_ADMIN>', 'ketua_rt', 'RT 09', 1),
  ('Warga RW 13 Demo', '3216010101990001', 'warga@rw13.id', '0812-9999-0001',
   '<HASH_WARGA>', 'warga', 'RT 01', 1),
  ('Sari Wulandari', '3216010101990002', 'sari@rw13.desa.id', '0812-9999-0002',
   '<HASH_WARGA>', 'warga', 'RT 02', 1);

-- DATA WARGA (99 JIWA SENSUS RW 13 LENGKAP)
INSERT INTO warga (no, rw, rt, nama_rt, nama, shdk, gender, tempat_lahir, usia, agama, pendidikan, pekerjaan, kawin) VALUES
-- RT 01 (11 jiwa, Ketua: Nurdin)
(1,'RW 13','RT 01','Nurdin','Nurdin','Kepala Keluarga','L','Bekasi',48,'Islam','SLTA','Karyawan Swasta','Kawin'),
(2,'RW 13','RT 01','Nurdin','Siti Aisyah','Istri','P','Jakarta',45,'Islam','SLTA','Mengurus Rumah Tangga','Kawin'),
(3,'RW 13','RT 01','Nurdin','Muhammad Farhan','Anak','L','Bekasi',20,'Islam','Diploma/S1','Pelajar/Mahasiswa','Belum Kawin'),
(4,'RW 13','RT 01','Nurdin','H. Syarifuddin','Kepala Keluarga','L','Cirebon',62,'Islam','Diploma/S1','Pensiunan PNS','Kawin'),
(5,'RW 13','RT 01','Nurdin','Hj. Mariam','Istri','P','Bekasi',58,'Islam','SLTA','Mengurus Rumah Tangga','Kawin'),
(6,'RW 13','RT 01','Nurdin','Rahmat Hidayat','Anak','L','Bekasi',29,'Islam','Diploma/S1','Wiraswasta','Belum Kawin'),
(7,'RW 13','RT 01','Nurdin','Dewi Anggraini','Kepala Keluarga','P','Bogor',34,'Islam','SLTA','Karyawan Swasta','Kawin'),
(8,'RW 13','RT 01','Nurdin','Bambang Irawan','Kepala Keluarga','L','Solo',51,'Islam','SLTA','Pedagang','Kawin'),
(9,'RW 13','RT 01','Nurdin','Sri Wahyuni','Istri','P','Klaten',47,'Islam','SLTP','Pedagang','Kawin'),
(10,'RW 13','RT 01','Nurdin','Dimas Bagus','Anak','L','Bekasi',18,'Islam','SLTA','Pelajar/Mahasiswa','Belum Kawin'),
(11,'RW 13','RT 01','Nurdin','Nur Halimah','Anak','P','Bekasi',14,'Islam','SLTP','Pelajar','Belum Kawin'),
-- RT 02 (11 jiwa, Ketua: Baco)
(12,'RW 13','RT 02','Baco','Baco Subagyo','Kepala Keluarga','L','Makassar',55,'Islam','Diploma/S1','Wiraswasta','Kawin'),
(13,'RW 13','RT 02','Baco','Nurhasanah','Istri','P','Bekasi',50,'Islam','SLTA','Mengurus Rumah Tangga','Kawin'),
(14,'RW 13','RT 02','Baco','Andi Muh. Ikbal','Kepala Keluarga','L','Bekasi',36,'Islam','Diploma/S1','Karyawan Swasta','Kawin'),
(15,'RW 13','RT 02','Baco','drg. Fitriani','Istri','P','Bandung',33,'Islam','Diploma/S1','Tenaga Medis','Kawin'),
(16,'RW 13','RT 02','Baco','Alm. Rusli Wardana','Kepala Keluarga','L','Kuningan',72,'Islam','SLTA','Pensiunan','Cerai Mati'),
(17,'RW 13','RT 02','Baco','Endang Suhartini','Istri','P','Bekasi',68,'Islam','SLTP','Mengurus Rumah Tangga','Cerai Mati'),
(18,'RW 13','RT 02','Baco','Dedi Mulyadi','Kepala Keluarga','L','Purwakarta',42,'Islam','SLTA','Karyawan Swasta','Kawin'),
(19,'RW 13','RT 02','Baco','Ratna Komala','Istri','P','Subang',39,'Islam','SLTA','Wiraswasta','Kawin'),
(20,'RW 13','RT 02','Baco','Rizki Ananda','Anak','L','Bekasi',16,'Islam','SLTA','Pelajar','Belum Kawin'),
(21,'RW 13','RT 02','Baco','Tiara Kusuma','Anak','P','Bekasi',11,'Islam','SD','Pelajar','Belum Kawin'),
(22,'RW 13','RT 02','Baco','Ibu Warsiti','Orang Tua','P','Kuningan',76,'Islam','SD','Tidak Bekerja','Cerai Mati'),
-- RT 03 (11 jiwa, Ketua: Ahmad)
(23,'RW 13','RT 03','Ahmad','Ahmad Sanusi','Kepala Keluarga','L','Bekasi',52,'Islam','Diploma/S1','PNS','Kawin'),
(24,'RW 13','RT 03','Ahmad','Mahadir SH','Kepala Keluarga','L','Padang',49,'Islam','Diploma/S1','Advokat / Wiraswasta','Kawin'),
(25,'RW 13','RT 03','Ahmad','Elvira Rosa','Istri','P','Bukittinggi',44,'Islam','Diploma/S1','Guru / Pendidik','Kawin'),
(26,'RW 13','RT 03','Ahmad','Ahmad Fauzi','Kepala Keluarga','L','Bekasi',31,'Islam','Diploma/S1','Karyawan Swasta','Kawin'),
(27,'RW 13','RT 03','Ahmad','Nur Laila','Istri','P','Jakarta',28,'Islam','Diploma/S1','Karyawan Swasta','Kawin'),
(28,'RW 13','RT 03','Ahmad','M. Rayyan Al-Fatih','Anak','L','Bekasi',1,'Islam','Belum Sekolah','Belum Bekerja','Belum Kawin'),
(29,'RW 13','RT 03','Ahmad','Sunarto','Kepala Keluarga','L','Magelang',59,'Islam','SLTA','Wiraswasta','Kawin'),
(30,'RW 13','RT 03','Ahmad','Tri Astuti','Istri','P','Yogyakarta',54,'Islam','SLTA','Mengurus Rumah Tangga','Kawin'),
(31,'RW 13','RT 03','Ahmad','Bagas Prakoso','Anak','L','Bekasi',25,'Islam','Diploma/S1','Programmer','Belum Kawin'),
(32,'RW 13','RT 03','Ahmad','Dina Kartika','Anak','P','Bekasi',22,'Islam','Diploma/S1','Pelajar/Mahasiswa','Belum Kawin'),
(33,'RW 13','RT 03','Ahmad','Mbah Sarbini','Orang Tua','L','Magelang',81,'Islam','SD','Pensiunan','Cerai Mati'),
-- RT 04 (11 jiwa, Ketua: Imron)
(34,'RW 13','RT 04','Imron','Imron Rosyadi','Kepala Keluarga','L','Kudus',46,'Islam','SLTA','Pedagang Grosir','Kawin'),
(35,'RW 13','RT 04','Imron','Siti Aminah','Istri','P','Demak',42,'Islam','SLTA','Mengurus Rumah Tangga','Kawin'),
(36,'RW 13','RT 04','Imron','Karmila S.Pd','Kepala Keluarga','P','Ciamis',33,'Islam','Diploma/S1','Guru PPPK','Belum Kawin'),
(37,'RW 13','RT 04','Imron','Bambang Setyadi','Kepala Keluarga','L','Semarang',44,'Islam','Diploma/S1','Karyawan Swasta','Kawin'),
(38,'RW 13','RT 04','Imron','Wulan Dari','Istri','P','Jakarta',40,'Islam','Diploma/S1','Karyawan Swasta','Kawin'),
(39,'RW 13','RT 04','Imron','Aldo Setyadi','Anak','L','Jakarta',15,'Islam','SLTP','Pelajar','Belum Kawin'),
(40,'RW 13','RT 04','Imron','Alisa Setyadi','Anak','P','Jakarta',9,'Islam','SD','Pelajar','Belum Kawin'),
(41,'RW 13','RT 04','Imron','Wahyu Utomo','Kepala Keluarga','L','Boyolali',38,'Islam','SLTA','Pengemudi Logistik','Kawin'),
(42,'RW 13','RT 04','Imron','Rina Marlina','Istri','P','Sukabumi',35,'Islam','SLTA','Pedagang Online','Kawin'),
(43,'RW 13','RT 04','Imron','Gilang Ramadhan','Anak','L','Bekasi',12,'Islam','SD','Pelajar','Belum Kawin'),
(44,'RW 13','RT 04','Imron','Nenek Warsiah','Orang Tua','P','Boyolali',70,'Islam','SD','Tidak Bekerja','Cerai Mati'),
-- RT 05 (11 jiwa, Ketua: Darman)
(45,'RW 13','RT 05','Darman','Darman Suhendra','Kepala Keluarga','L','Tasikmalaya',50,'Islam','SLTA','Wiraswasta','Kawin'),
(46,'RW 13','RT 05','Darman','Ai Rohayati','Istri','P','Garut',46,'Islam','SLTA','Mengurus Rumah Tangga','Kawin'),
(47,'RW 13','RT 05','Darman','Abdul Rahman','Kepala Keluarga','L','Bekasi',54,'Islam','SLTP','Buruh Harian Lepas','Kawin'),
(48,'RW 13','RT 05','Darman','Kasmawati','Istri','P','Karawang',49,'Islam','SD','Mengurus Rumah Tangga','Kawin'),
(49,'RW 13','RT 05','Darman','Fikri Rahman','Anak','L','Bekasi',19,'Islam','SLTA','Mahasiswa KIP','Belum Kawin'),
(50,'RW 13','RT 05','Darman','Hadi Purnomo','Kepala Keluarga','L','Madiun',47,'Kristen','Diploma/S1','Karyawan Swasta','Kawin'),
(51,'RW 13','RT 05','Darman','Maria Kristina','Istri','P','Surabaya',43,'Kristen','Diploma/S1','Karyawan Swasta','Kawin'),
(52,'RW 13','RT 05','Darman','Samuel Purnomo','Anak','L','Bekasi',17,'Kristen','SLTA','Pelajar','Belum Kawin'),
(53,'RW 13','RT 05','Darman','Yohana Purnomo','Anak','P','Bekasi',13,'Kristen','SLTP','Pelajar','Belum Kawin'),
(54,'RW 13','RT 05','Darman','Opa Yulius','Orang Tua','L','Madiun',75,'Kristen','SLTA','Pensiunan','Cerai Mati'),
(55,'RW 13','RT 05','Darman','Dede Yusuf','Famili Lain','L','Tasikmalaya',24,'Islam','SLTA','Karyawan Toko','Belum Kawin'),
-- RT 06 (11 jiwa, Ketua: Joko)
(56,'RW 13','RT 06','Joko','Joko Widodo S.','Kepala Keluarga','L','Surakarta',53,'Islam','Diploma/S1','Karyawan BUMN','Kawin'),
(57,'RW 13','RT 06','Joko','Sri Rahayu','Istri','P','Klaten',49,'Islam','Diploma/S1','PNS Guru','Kawin'),
(58,'RW 13','RT 06','Joko','Ilyas Kurniawan','Kepala Keluarga','L','Tegal',35,'Islam','Diploma/S1','Teknisi Mesin','Kawin'),
(59,'RW 13','RT 06','Joko','Novi Astuti','Istri','P','Brebes',31,'Islam','SLTA','Mengurus Rumah Tangga','Kawin'),
(60,'RW 13','RT 06','Joko','Zahra Kurniawan','Anak','P','Bekasi',5,'Islam','TK','Belum Bekerja','Belum Kawin'),
(61,'RW 13','RT 06','Joko','Agus Salim','Kepala Keluarga','L','Padang',48,'Islam','SLTA','Pedagang Rumah Makan','Kawin'),
(62,'RW 13','RT 06','Joko','Salmawati','Istri','P','Solok',44,'Islam','SLTA','Pedagang','Kawin'),
(63,'RW 13','RT 06','Joko','Fauzan Salim','Anak','L','Bekasi',21,'Islam','Diploma/S1','Pelajar/Mahasiswa','Belum Kawin'),
(64,'RW 13','RT 06','Joko','Annisa Salim','Anak','P','Bekasi',16,'Islam','SLTA','Pelajar','Belum Kawin'),
(65,'RW 13','RT 06','Joko','Paman Rusdi','Famili Lain','L','Padang',39,'Islam','SLTA','Juru Masak','Belum Kawin'),
(66,'RW 13','RT 06','Joko','Eko Prasetyo','Anak','L','Bekasi',23,'Islam','Diploma/S1','Pegawai Bank','Belum Kawin'),
-- RT 07 (11 jiwa, Ketua: Wowo)
(67,'RW 13','RT 07','Wowo','Suwowo Prapto','Kepala Keluarga','L','Banyumas',56,'Islam','SLTA','Wiraswasta','Kawin'),
(68,'RW 13','RT 07','Wowo','Suhartati','Istri','P','Cilacap',52,'Islam','SLTA','Mengurus Rumah Tangga','Kawin'),
(69,'RW 13','RT 07','Wowo','Darmajid','Kepala Keluarga','L','Kebumen',60,'Islam','SLTA','Pensiunan Swasta','Cerai Mati'),
(70,'RW 13','RT 07','Wowo','Almh. Hj. Aminah','Istri','P','Bekasi',79,'Islam','SD','Mengurus Rumah Tangga','Cerai Mati'),
(71,'RW 13','RT 07','Wowo','Rizky Pratama','Kepala Keluarga','L','Bekasi',30,'Islam','Diploma/S1','Karyawan Swasta','Kawin'),
(72,'RW 13','RT 07','Wowo','Sarah Dwi Lestari','Istri','P','Bandung',27,'Islam','Diploma/S1','Karyawan Swasta','Kawin'),
(73,'RW 13','RT 07','Wowo','Aqeela Shaheen H.','Anak','P','Bekasi',1,'Islam','Belum Sekolah','Belum Bekerja','Belum Kawin'),
(74,'RW 13','RT 07','Wowo','Surya Saputra','Kepala Keluarga','L','Palembang',41,'Islam','Diploma/S1','Konsultan IT','Kawin'),
(75,'RW 13','RT 07','Wowo','Nita Oktaviani','Istri','P','Lampung',38,'Islam','Diploma/S1','Akuntan Swasta','Kawin'),
(76,'RW 13','RT 07','Wowo','Reyhan Saputra','Anak','L','Bekasi',10,'Islam','SD','Pelajar','Belum Kawin'),
(77,'RW 13','RT 07','Wowo','Oma Farida','Orang Tua','P','Palembang',71,'Islam','SLTA','Tidak Bekerja','Cerai Mati'),
-- RT 08 (11 jiwa, Ketua: Tedi)
(78,'RW 13','RT 08','Tedi','Tedi Hermawan','Kepala Keluarga','L','Bandung',45,'Islam','Diploma/S1','Wiraswasta Konstruksi','Kawin'),
(79,'RW 13','RT 08','Tedi','Lilis Suryani','Istri','P','Sumedang',41,'Islam','SLTA','Mengurus Rumah Tangga','Kawin'),
(80,'RW 13','RT 08','Tedi','Hendrawan Nugroho','Kepala Keluarga','L','Kudus',39,'Islam','Diploma/S1','Supervisor Pabrik','Kawin'),
(81,'RW 13','RT 08','Tedi','Retno Wulandari','Istri','P','Pati',36,'Islam','Diploma/S1','Guru Swasta','Kawin'),
(82,'RW 13','RT 08','Tedi','Danendra Nugroho','Anak','L','Bekasi',8,'Islam','SD','Pelajar','Belum Kawin'),
(83,'RW 13','RT 08','Tedi','Ali Adam','Kepala Keluarga','L','Bekasi',29,'Islam','Diploma/S1','Staf Perbankan','Belum Kawin'),
(84,'RW 13','RT 08','Tedi','Indah Permatasari','Anak','P','Bekasi',24,'Islam','Diploma/S1','Desainer Grafis','Belum Kawin'),
(85,'RW 13','RT 08','Tedi','Gunawan Santoso','Kepala Keluarga','L','Semarang',52,'Katolik','Diploma/S1','Manager Logistik','Kawin'),
(86,'RW 13','RT 08','Tedi','Theresia Linawati','Istri','P','Magelang',48,'Katolik','Diploma/S1','Bidan Swasta','Kawin'),
(87,'RW 13','RT 08','Tedi','Michael Santoso','Anak','L','Bekasi',19,'Katolik','Diploma/S1','Mahasiswa','Belum Kawin'),
(88,'RW 13','RT 08','Tedi','Clara Santoso','Anak','P','Bekasi',15,'Katolik','SLTA','Pelajar','Belum Kawin'),
-- RT 09 (11 jiwa, Ketua: Dian S)
(89,'RW 13','RT 09','Dian S','Dian Sastro Wardoyo','Kepala Keluarga','L','Yogyakarta',47,'Islam','Diploma/S1','Arsitek Lanskap','Kawin'),
(90,'RW 13','RT 09','Dian S','Maya Indriani','Istri','P','Jakarta',43,'Islam','Diploma/S1','Karyawan BUMN','Kawin'),
(91,'RW 13','RT 09','Dian S','Arya Wardoyo','Anak','L','Bekasi',18,'Islam','SLTA','Pelajar/Mahasiswa','Belum Kawin'),
(92,'RW 13','RT 09','Dian S','Nadya Wardoyo','Anak','P','Bekasi',14,'Islam','SLTP','Pelajar','Belum Kawin'),
(93,'RW 13','RT 09','Dian S','Bambang Sudibyo','Kepala Keluarga','L','Surabaya',63,'Islam','Diploma/S1','Pensiunan BUMN','Kawin'),
(94,'RW 13','RT 09','Dian S','Hartini Sudibyo','Istri','P','Malang',59,'Islam','Diploma/S1','Pensiunan Guru','Kawin'),
(95,'RW 13','RT 09','Dian S','Dr. Irfan Sudibyo','Anak','L','Surabaya',32,'Islam','Spesialis/S2','Dokter Umum','Belum Kawin'),
(96,'RW 13','RT 09','Dian S','Lukman Hakim','Kepala Keluarga','L','Bekasi',44,'Islam','SLTA','Wiraswasta Bengkel','Kawin'),
(97,'RW 13','RT 09','Dian S','Siti Rohmah','Istri','P','Bekasi',40,'Islam','SLTA','Mengurus Rumah Tangga','Kawin'),
(98,'RW 13','RT 09','Dian S','Hafidz Hakim','Anak','L','Bekasi',17,'Islam','SLTA','Pelajar','Belum Kawin'),
(99,'RW 13','RT 09','Dian S','Fatimah Hakim','Anak','P','Bekasi',11,'Islam','SD','Pelajar','Belum Kawin');

-- DATA KELAHIRAN
INSERT INTO kelahiran (nama_bayi, jenis_kelamin, tanggal_lahir, tempat_lahir, rt, nama_ayah, nama_ibu, no_akta) VALUES
('Aisyah Nur Ramadhani','P','2026-03-12','RS Mitra Keluarga Bekasi','RT 01','Ahmad Fauzi','Nur Laila','3216-LAH-2026-001'),
('Muhammad Rayyan Ghaisan','L','2026-02-28','RSIA Hermina Bekasi','RT 04','Bambang Setyadi','Wulan Dari','3216-LAH-2026-002'),
('Kanaya Putri Salsabila','P','2026-01-15','RS Mitra Keluarga Bekasi','RT 07','Rizky Pratama','Sarah Dwi Lestari','3216-LAH-2026-003'),
('Zaki Ibrahim Putra','L','2026-04-05','Puskesmas Margahayu','RT 02','Dedi Mulyadi','Ratna Komala','3216-LAH-2026-004'),
('Nayla Fitri Aulia','P','2026-05-20','RS Kartika Husada','RT 05','Hadi Purnomo','Maria Kristina','3216-LAH-2026-005'),
('Farrel Daniswara','L','2026-06-01','RS Mitra Keluarga Bekasi','RT 03','Mahadir SH','Elvira Rosa','3216-LAH-2026-006');

-- DATA KEMATIAN
INSERT INTO kematian (nama_almarhum, usia_meninggal, tanggal_wafat, penyebab, rt, nama_pelapor, lokasi_makam, no_surat_kematian) VALUES
('H. Syamsul Bahri',74,'2026-02-18','Sakit (Usia Lanjut)','RT 02','Endang Suhartini','TPU Padurenan, Bekasi','3216-MAT-2026-001'),
('Hj. Rohana Sukardi',68,'2026-01-04','Sakit (Jantung)','RT 05','Darman Suhendra','TPU Margahayu, Bekasi','3216-MAT-2026-002');

-- DATA MUTASI MASUK
INSERT INTO mutasi_masuk (nama, jumlah_jiwa, asal_alamat, rt_tujuan, tanggal_masuk, no_skpwni, status) VALUES
('Rendi Pratama & Keluarga', 3, 'Kec. Cibitung, Kab. Bekasi', 'RT 02', '2026-01-29', '3216/SKPWNI/2026/0129', 'Terverifikasi'),
('Suparman & Istri', 2, 'Kel. Jatibening, Kec. Pondok Gede', 'RT 05', '2026-03-15', '3216/SKPWNI/2026/0315', 'Proses');

-- DATA MUTASI KELUAR
INSERT INTO mutasi_keluar (nama, jumlah_jiwa, rt_asal, tujuan_alamat, tanggal_keluar, no_pengantar, status) VALUES
('Wahyu Hidayat', 1, 'RT 06', 'Kel. Pekayon Jaya, Bekasi Selatan', '2026-02-10', '475/RW13/02/2026', 'Proses Kelurahan'),
('Hendra Wijaya & Keluarga', 4, 'RT 03', 'Kab. Bogor, Jawa Barat', '2026-04-20', '475/RW13/04/2026', 'Selesai');

-- DATA PERMOHONAN SURAT
INSERT INTO permohonan_surat (no_permohonan, jenis_surat, nama_pemohon, nik_pemohon, rt_pemohon, keperluan, status, tanggal_ajukan) VALUES
('RW13/SKD/2026/001','SKD-01 (Surat Keterangan Domisili)','Rahmat Hidayat','3216010101970001','RT 01','Keperluan melamar kerja','Selesai','2026-01-10'),
('RW13/SKTM/2026/001','SKTM-02 (Keterangan Tidak Mampu)','Kasmawati','3216010101750001','RT 05','Pengajuan BPJS PBI','Selesai','2026-01-20'),
('RW13/SKD/2026/002','SKD-01 (Surat Keterangan Domisili)','Dimas Bagus','3216010102080001','RT 01','Keperluan pendaftaran kuliah','Antrean RW','2026-02-05'),
('RW13/SKCK/2026/001','SKCK-08 (Catatan Kelakuan Baik)','Bagas Prakoso','3216010102010001','RT 03','Melamar pekerjaan','Menunggu RT','2026-02-18'),
('RW13/SPN/2026/001','SPN-05 (Pengantar Nikah N1-N4)','Ahmad Fauzi','3216010101950001','RT 03','Pernikahan','Selesai','2026-03-01'),
('RW13/SKU/2026/001','SKU-04 (Keterangan Usaha / UMKM)','Bambang Irawan','3216010101750002','RT 01','Pengajuan KUR BRI','Diproses','2026-03-10'),
('RW13/SKD/2026/003','SKD-01 (Surat Keterangan Domisili)','Eko Prasetyo','3216010103030001','RT 06','Pembukaan rekening bank','Menunggu RT','2026-03-15'),
('RW13/SKK/2026/001','SKK-06 (Keterangan Kematian)','Endang Suhartini','3216010101580001','RT 02','Pengurusan warisan / notaris','Selesai','2026-02-19');

-- PENGATURAN SISTEM
INSERT INTO pengaturan (kunci, nilai, deskripsi) VALUES
('nama_rw',           'RW 13',                             'Nama RW'),
('kelurahan',         'Margahayu',                         'Nama Kelurahan'),
('kecamatan',         'Bekasi Timur',                      'Nama Kecamatan'),
('kota',              'Bekasi',                            'Nama Kota'),
('nama_ketua_rw',     'H. Budiman Santosa',                'Nama Ketua RW 13'),
('no_hp_ketua_rw',    '0812-0013-1300',                    'Nomor HP Ketua RW 13'),
('posko_sekretariat', 'Jl. Cendrawasih Raya No. 1 RT 07', 'Alamat Posko RW 13'),
('wa_pelayanan',      '0812-9988-1313',                    'Nomor WhatsApp Pelayanan Persuratan'),
('jumlah_rt',         '9',                                 'Jumlah RT dalam RW 13'),
('total_warga',       '99',                                'Total jiwa berdasarkan sensus terakhir');

-- ======================================================================================
-- 5. QUERY VERIFIKASI & RINGKASAN
-- ======================================================================================
SELECT 'pengguna' AS tabel, COUNT(*) AS total_baris FROM pengguna
UNION ALL
SELECT 'warga', COUNT(*) FROM warga
UNION ALL
SELECT 'kelahiran', COUNT(*) FROM kelahiran
UNION ALL
SELECT 'kematian', COUNT(*) FROM kematian
UNION ALL
SELECT 'mutasi_masuk', COUNT(*) FROM mutasi_masuk
UNION ALL
SELECT 'mutasi_keluar', COUNT(*) FROM mutasi_keluar
UNION ALL
SELECT 'permohonan_surat', COUNT(*) FROM permohonan_surat
UNION ALL
SELECT 'pengaturan', COUNT(*) FROM pengaturan;

-- Tampilkan daftar akun pengurus & warga
SELECT id, nama, email, no_hp, peran, rt, 'Bcrypt Enkripsi' AS status_password, aktif FROM pengguna;
