# 📘 Panduan Sinkronisasi Database MySQL Workbench & Enkripsi Password RW 13

Dokumentasi ini menjelaskan konfigurasi, sinkronisasi folder backend-frontend, serta tata cara integrasi database **MySQL Workbench** dengan sistem **Enkripsi Password Otomatis (Bcrypt)** untuk Proyek Sistem Kependudukan RW 13 Margahayu, Bekasi Timur.

---

## 🏛️ Arsitektur Sinkronisasi Sistem

```
┌─────────────────────────────────┐
│     FRONTEND (React + Vite)     │  Port: 5173
│  - Halaman Register & Login     │  URL: http://localhost:5173
│  - Beranda & Dashboard RW 13    │
└────────────────┬────────────────┘
                 │ (REST API / JSON via JWT)
                 ▼
┌─────────────────────────────────┐
│     BACKEND (Express.js)        │  Port: 5000
│  - server.js                    │  URL: http://localhost:5000
│  - Enkripsi Bcrypt Otomatis     │  Proxy: /api -> :5000
│  - Connection Pool mysql2       │
└────────────────┬────────────────┘
                 │ (SQL Connection: port 3306)
                 ▼
┌─────────────────────────────────┐       ┌───────────────────────────────┐
│      DATABASE (MySQL Server)    │ ◄───► │        MYSQL WORKBENCH        │
│  - Database: rw13_db            │       │  - GUI Query & Visualizer     │
│  - 8 Tabel Utama                │       │  - ER Diagram Generator       │
│  - 99 Jiwa Sensus Terverifikasi │       │  - Import 1-Klik:             │
│  - Password Terenkripsi Bcrypt  │       │    rw13_workbench_setup.sql   │
└─────────────────────────────────┘       └───────────────────────────────┘
```

---

## ⚡ Langkah Cepat: 1-Klik Sinkronisasi MySQL Workbench

Database telah disiapkan dalam bentuk **Master Script SQL Mandiri** yang siap dijalankan dengan sekali klik di MySQL Workbench:

📁 **File Script:** `backend/database/rw13_workbench_setup.sql`

### Langkah-langkah di MySQL Workbench:
1. Buka aplikasi **MySQL Workbench**.
2. Masuk ke koneksi server lokal Anda (biasanya `Local instance MySQL80` atau `root`).
3. Tekan pintasan **`Ctrl + Shift + O`** (atau klik menu **File** ➔ **Open SQL Script...**).
4. Pilih file:
   ```
   backend/database/rw13_workbench_setup.sql
   ```
5. Klik ikon **Petir ⚡** (*Execute the selected portion*) di toolbar atas, atau tekan **`Ctrl + Shift + Enter`**.
6. Pada panel kiri (*Navigator Schemas*), klik kanan dan pilih **Refresh All**.
7. Anda akan melihat skema **`rw13_db`** telah terbentuk lengkap beserta 8 tabel dan seluruh 99 data sensus warga.

---

## 📊 Daftar Tabel yang Dibuat di MySQL

| No | Nama Tabel | Deskripsi | Jumlah Data Awal |
|---|---|---|---|
| 1 | `pengguna` | Akun pengguna (Admin, Ketua RW, Ketua RT, Warga) dengan password hash Bcrypt | 13 Akun |
| 2 | `warga` | Data sensus kependudukan lengkap 9 RT | 99 Jiwa |
| 3 | `kelahiran` | Pencatatan peristiwa kelahiran bayi | 6 Rekor |
| 4 | `kematian` | Pencatatan peristiwa warga meninggal | 2 Rekor |
| 5 | `mutasi_masuk` | Data warga baru pindah masuk ke RW 13 | 2 Berkas |
| 6 | `mutasi_keluar` | Data warga pindah keluar dari RW 13 | 2 Berkas |
| 7 | `permohonan_surat` | Pelayanan administrasi persuratan warga (SKD, SKTM, SKU, dll.) | 8 Berkas |
| 8 | `pengaturan` | Konfigurasi sistem posko RW 13 | 10 Baris |

---

## 🔐 Enkripsi Password Otomatis (Bcrypt)

Sesuai standar keamanan modern, **semua password disimpan dalam format hash satu arah Bcrypt** ($2b$10$...) dan tidak pernah disimpan dalam bentuk teks polos (*plaintext*).

### 1. Enkripsi Otomatis saat Registrasi / Buat Akun di Web
- Form pendaftaran pada **Halaman Register** dan fitur **Buat Akun Baru** pada Dasbor Admin secara otomatis memanggil backend untuk mengenkripsi password dengan salt cost 10 sebelum perintah `INSERT` dieksekusi ke MySQL.

### 2. Utilitas Generator Enkripsi untuk MySQL Workbench
Jika Anda ingin menambahkan akun langsung melalui query MySQL Workbench, Anda dapat menggunakan utilitas CLI berikut dari terminal:

```bash
# Masuk ke folder backend
cd backend

# Enkripsi password dan dapatkan query SQL instan
npm run db:hash "PasswordPilihanAnda123"
```

**Output Terminal:**
```sql
==================================================================
✅ ENKRIPSI PASSWORD BERHASIL (Bcrypt Cost 10)
==================================================================
Password Asli   : PasswordPilihanAnda123
Bcrypt Hash     : $2b$10$xYz... (hash aman)
==================================================================
📋 QUERY SQL UNTUK MYSQL WORKBENCH:

INSERT INTO pengguna (nama, nik, email, no_hp, password, peran, aktif)
VALUES ('Nama Pengguna', '3216010000000001', 'user@rw13.id', '0812-0000-0000', '$2b$10$xYz...', 'warga', 1);
```

### 3. Buat Akun Langsung via CLI Terminal
Anda juga dapat membuat akun langsung ke MySQL tanpa membuka web:
```bash
node scripts/buat-akun.js "Asep Saepudin" "3216010101920005" "asep@rw13.id" "<PASSWORD_CONTOH>" "warga" "RT 03"
```

---

## 👥 Akun Default untuk Login & Pengujian

Semua akun di bawah ini telah tersimpan di `rw13_db` dengan password yang telah di-hash menggunakan Bcrypt:

| Peran | Email / Kontak | Password Plaintext | Status Password di DB |
|---|---|---|---|
| **Admin Sistem** | `admin@rw13.id` | `<PASSWORD_ADMIN>` | `<HASH_DISEMBUNYIKAN>` (Terenkripsi) |
| **Ketua RW 13** | `ketuarw13@rw13.id` | `<PASSWORD_ADMIN>` | `<HASH_DISEMBUNYIKAN>` (Terenkripsi) |
| **Ketua RT 01** | `nurdin@rw13.id` | `<PASSWORD_ADMIN>` | `<HASH_DISEMBUNYIKAN>` (Terenkripsi) |
| **Ketua RT 02** | `baco@rw13.id` | `<PASSWORD_ADMIN>` | `<HASH_DISEMBUNYIKAN>` (Terenkripsi) |
| **Ketua RT 03 - 09** | `[nama]@rw13.id` | `<PASSWORD_ADMIN>` | `<HASH_DISEMBUNYIKAN>` (Terenkripsi) |
| **Warga Demo 1** | `warga@rw13.id` | `<PASSWORD_WARGA>` | `<HASH_DISEMBUNYIKAN>` (Terenkripsi) |
| **Warga Demo 2** | `sari@rw13.desa.id` | `<PASSWORD_WARGA>` | `<HASH_DISEMBUNYIKAN>` (Terenkripsi) |

---

## 🚀 Menjalankan Project

### 1. Inisialisasi Database via Script (Opsional selain Workbench)
```bash
npm run db:init
```

### 2. Jalankan Backend (API Express)
Buka terminal 1:
```bash
npm run dev:backend
```
Server berjalan di: `http://localhost:5000`

### 3. Jalankan Frontend (React + Vite)
Buka terminal 2:
```bash
npm run dev:frontend
```
Aplikasi berjalan di: `http://localhost:5173`

---

## 🛠️ Konfigurasi Environment (`backend/.env`)

Jika user MySQL Anda bukan `root` atau menggunakan password khusus, sesuaikan file `backend/.env`:

```env
# Koneksi MySQL Server
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rw13_db
DB_USER=root           # atau rw13_app
DB_PASSWORD=           # masukkan password root Anda jika ada
DB_CONNECTION_LIMIT=10

# Keamanan & JWT
JWT_SECRET=<ISI_SECRET_ANDA>
JWT_EXPIRES_IN=8h
BCRYPT_ROUNDS=10

# Port Backend
PORT=5000
NODE_ENV=development
```
