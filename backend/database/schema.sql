-- =====================================================================
-- DATABASE SCHEMA - Sistem Informasi Kependudukan RW 13
-- Kelurahan Margahayu, Kecamatan Bekasi Timur, Kota Bekasi
-- =====================================================================

CREATE DATABASE IF NOT EXISTS rw13_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE rw13_db;

-- Nonaktifkan foreign key sementara selama setup
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- TABEL: pengguna (autentikasi & akun admin/warga)
-- =====================================================================
DROP TABLE IF EXISTS pengguna;
CREATE TABLE pengguna (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama        VARCHAR(150) NOT NULL,
  nik         VARCHAR(16)  NULL UNIQUE COMMENT '16 digit NIK KTP',
  email       VARCHAR(150) NULL UNIQUE,
  no_hp       VARCHAR(20)  NULL,
  password    VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt',
  peran       ENUM('admin','ketua_rw','ketua_rt','warga') NOT NULL DEFAULT 'warga',
  rt          VARCHAR(10)  NULL COMMENT 'Contoh: RT 01',
  aktif       TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================================
-- TABEL: warga (data kependudukan 99 jiwa)
-- =====================================================================
DROP TABLE IF EXISTS warga;
CREATE TABLE warga (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  no            INT UNSIGNED NOT NULL COMMENT 'Nomor urut sensus',
  rw            VARCHAR(10)  NOT NULL DEFAULT 'RW 13',
  rt            VARCHAR(10)  NOT NULL COMMENT 'Contoh: RT 01',
  nama_rt       VARCHAR(100) NOT NULL COMMENT 'Nama ketua RT',
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
  INDEX idx_rt (rt),
  INDEX idx_gender (gender),
  INDEX idx_pendidikan (pendidikan),
  INDEX idx_pekerjaan (pekerjaan)
) ENGINE=InnoDB;

-- =====================================================================
-- TABEL: kelahiran (peristiwa kelahiran)
-- =====================================================================
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
  INDEX idx_rt (rt),
  INDEX idx_tanggal (tanggal_lahir)
) ENGINE=InnoDB;

-- =====================================================================
-- TABEL: kematian (peristiwa kematian)
-- =====================================================================
DROP TABLE IF EXISTS kematian;
CREATE TABLE kematian (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama_almarhum   VARCHAR(150) NOT NULL,
  usia_meninggal  TINYINT UNSIGNED NOT NULL,
  tanggal_wafat   DATE         NOT NULL,
  penyebab        VARCHAR(200) NULL,
  rt              VARCHAR(10)  NOT NULL,
  nama_pelapor    VARCHAR(150) NOT NULL,
  lokasi_makam    VARCHAR(200) NULL DEFAULT 'TPU Margahayu',
  no_surat_kematian VARCHAR(50) NULL UNIQUE,
  keterangan      TEXT         NULL,
  dicatat_oleh    INT UNSIGNED NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dicatat_oleh) REFERENCES pengguna(id) ON DELETE SET NULL,
  INDEX idx_rt (rt),
  INDEX idx_tanggal (tanggal_wafat)
) ENGINE=InnoDB;

-- =====================================================================
-- TABEL: mutasi_masuk (penduduk pindah masuk)
-- =====================================================================
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
  FOREIGN KEY (dicatat_oleh) REFERENCES pengguna(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================================
-- TABEL: mutasi_keluar (penduduk pindah keluar)
-- =====================================================================
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
  FOREIGN KEY (dicatat_oleh) REFERENCES pengguna(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================================
-- TABEL: permohonan_surat (pelayanan persuratan)
-- =====================================================================
DROP TABLE IF EXISTS permohonan_surat;
CREATE TABLE permohonan_surat (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  no_permohonan   VARCHAR(50)  NOT NULL UNIQUE,
  jenis_surat     VARCHAR(100) NOT NULL COMMENT 'Contoh: SKD-01, SKTM-02, dst.',
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
  INDEX idx_status (status),
  INDEX idx_rt (rt_pemohon)
) ENGINE=InnoDB;

-- =====================================================================
-- TABEL: pengaturan (konfigurasi sistem)
-- =====================================================================
DROP TABLE IF EXISTS pengaturan;
CREATE TABLE pengaturan (
  kunci       VARCHAR(100) PRIMARY KEY,
  nilai       TEXT         NOT NULL,
  deskripsi   VARCHAR(255) NULL,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
