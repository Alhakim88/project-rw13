# Panduan Setup Backend RW 13

## Prasyarat
- Node.js >= 18.0.0
- MySQL 8.0+ sudah terinstall dan berjalan
- XAMPP / MySQL Standalone / Docker MySQL

---

## Langkah Setup

### 1. Install Dependensi
```bash
cd backend
npm install
```

### 2. Buat Database di MySQL
Buka MySQL (via XAMPP phpMyAdmin, MySQL Workbench, atau terminal):

```sql
-- Jalankan sebagai root
SOURCE database/schema.sql;
SOURCE database/seed.sql;
SOURCE database/user.sql;
```

Atau via terminal:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
mysql -u root -p < database/user.sql
```

### 3. Konfigurasi Environment
```bash
# Salin file contoh
copy .env.example .env
```

Edit file `.env` sesuaikan dengan konfigurasi MySQL kamu:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rw13_db
DB_USER=rw13_app
DB_PASSWORD=<PASSWORD_DB>
JWT_SECRET=ganti-dengan-string-random-panjang
```

### 4. Jalankan Server
```bash
# Mode development (auto-restart saat ada perubahan)
npm run dev

# Mode production
npm start
```

Server berjalan di: **http://localhost:5000**

---

## Akun Default (Setelah Seed)

| Peran      | Email / Login         | Password     |
|------------|-----------------------|--------------|
| Admin      | admin@rw13.id         | <PASSWORD_ADMIN>   |
| Ketua RW   | ketuarw13@rw13.id     | <PASSWORD_ADMIN>   |
| Ketua RT 01| nurdin@rw13.id        | <PASSWORD_ADMIN>   |
| dst...     | (lihat seed.sql)      | <PASSWORD_ADMIN>   |

> ⚠️ **Ganti password** semua akun setelah deploy ke production!

---

## Endpoint API

| Method | Endpoint                   | Keterangan                  | Auth    |
|--------|----------------------------|-----------------------------|---------|
| GET    | /api/health                | Cek status server           | Tidak   |
| POST   | /api/auth/login            | Login                       | Tidak   |
| POST   | /api/auth/register         | Daftar akun warga baru      | Tidak   |
| GET    | /api/auth/profil           | Data profil sendiri         | Bearer  |
| GET    | /api/warga                 | Daftar warga (filter)       | Bearer  |
| GET    | /api/warga/statistik       | Statistik kependudukan      | Bearer  |
| GET    | /api/warga/:id             | Detail 1 warga              | Bearer  |
| POST   | /api/warga                 | Tambah warga                | Pengurus|
| PUT    | /api/warga/:id             | Edit data warga             | Pengurus|
| DELETE | /api/warga/:id             | Hapus warga                 | Admin   |
| GET    | /api/kelahiran             | Daftar kelahiran            | Bearer  |
| GET    | /api/kelahiran/statistik   | Statistik kelahiran         | Bearer  |
| POST   | /api/kelahiran             | Catat kelahiran             | Pengurus|
| PUT    | /api/kelahiran/:id         | Edit kelahiran              | Pengurus|
| DELETE | /api/kelahiran/:id         | Hapus kelahiran             | Pengurus|
| GET    | /api/kematian              | Daftar kematian             | Bearer  |
| GET    | /api/kematian/statistik    | Statistik kematian          | Bearer  |
| POST   | /api/kematian              | Catat kematian              | Pengurus|
| GET    | /api/mutasi/masuk          | Daftar mutasi masuk         | Bearer  |
| POST   | /api/mutasi/masuk          | Tambah mutasi masuk         | Pengurus|
| PUT    | /api/mutasi/masuk/:id      | Update status mutasi masuk  | Pengurus|
| GET    | /api/mutasi/keluar         | Daftar mutasi keluar        | Bearer  |
| POST   | /api/mutasi/keluar         | Tambah mutasi keluar        | Pengurus|
| GET    | /api/surat                 | Daftar permohonan surat     | Bearer  |
| GET    | /api/surat/statistik       | Statistik pelayanan surat   | Bearer  |
| POST   | /api/surat                 | Ajukan permohonan           | Bearer  |
| PATCH  | /api/surat/:id/status      | Ubah status surat           | Pengurus|
| GET    | /api/pengaturan            | Semua konfigurasi sistem    | Bearer  |
| PUT    | /api/pengaturan/:kunci     | Ubah konfigurasi            | Admin   |

---

## Contoh Request Login (curl)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"contact":"admin@rw13.id","password":"<PASSWORD_ADMIN>"}'
```

---

## Struktur Folder Backend

```
backend/
├── config/
│   └── db.js              # Koneksi MySQL pool
├── database/
│   ├── schema.sql          # Struktur tabel
│   ├── seed.sql            # Data awal (99 warga + pengguna)
│   └── user.sql            # User MySQL untuk aplikasi
├── middleware/
│   ├── auth.js             # Verifikasi JWT
│   └── errorHandler.js     # Global error handler
├── routes/
│   ├── authRoutes.js       # Login, Register, Profil
│   ├── wargaRoutes.js      # CRUD kependudukan
│   ├── kelahiranRoutes.js  # CRUD kelahiran
│   ├── kematianRoutes.js   # CRUD kematian
│   ├── mutasiRoutes.js     # CRUD mutasi masuk/keluar
│   ├── suratRoutes.js      # CRUD permohonan surat
│   └── pengaturanRoutes.js # CRUD konfigurasi sistem
├── .env                    # Konfigurasi (JANGAN di-commit)
├── .env.example            # Contoh konfigurasi
├── .gitignore
├── package.json
├── README.md
└── server.js               # Entry point
```
