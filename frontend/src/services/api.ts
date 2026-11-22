// src/services/api.ts
// Layer komunikasi Frontend ↔ Backend RW 13
// Otentikasi, kependudukan, permohonan surat, dan sinkronisasi MySQL Workbench.
// Semua pembuatan akun dan penggantian password dienkripsi otomatis oleh server dengan Bcrypt.

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:5000/api";

// ─── Tipe respons umum ──────────────────────────────────────────────────────

export type ApiResponse<T = unknown> = {
  success: boolean;
  pesan?: string;
  data?: T;
  token?: string;
  pengguna?: PenggunaAPI;
  total?: number;
  id?: number;
  hash?: string;
  sqlQuery?: string;
  [key: string]: unknown;
};

export type PenggunaAPI = {
  id: number;
  nama: string;
  nik?: string | null;
  email?: string | null;
  no_hp?: string | null;
  peran: "admin" | "ketua_rw" | "ketua_rt" | "warga";
  rt?: string | null;
  aktif: number;
  created_at: string;
};

export type HealthStatus = {
  success: boolean;
  service: string;
  version: string;
  waktu: string;
  env: string;
  database: {
    connected: boolean;
    database: string;
    host: string;
    port: number;
    user: string;
    error?: string | null;
  };
};

// ─── Token & Session Management ─────────────────────────────────────────────

const TOKEN_KEY = "rw13_token";
const USER_KEY  = "rw13_user";

export function simpanSesi(token: string, pengguna: PenggunaAPI): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(pengguna));
}

export function ambilToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function ambilPengguna(): PenggunaAPI | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as PenggunaAPI; } catch { return null; }
}

export function hapusSesi(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function sudahLogin(): boolean {
  return Boolean(ambilToken() && ambilPengguna());
}

// ─── Helper fetch ───────────────────────────────────────────────────────────

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  butuhToken?: boolean;
};

async function request<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, butuhToken = false } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (butuhToken) {
    const token = ambilToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/${endpoint}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error(
      `Gagal terhubung ke backend server (${BASE_URL}). Pastikan backend aktif (npm run dev:backend).`
    );
  }

  let json: ApiResponse<T>;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new Error(`Respons tidak valid dari server (${res.status} ${res.statusText})`);
  }

  if (!res.ok && json.pesan) {
    throw new Error(json.pesan);
  }

  return json;
}

// ─── Sistem & Health Check ──────────────────────────────────────────────────

/** Cek status koneksi backend dan database MySQL */
export async function apiCekKoneksi(): Promise<HealthStatus> {
  const res = await fetch(`${BASE_URL}/health`);
  return (await res.json()) as HealthStatus;
}

// ─── Auth & Manajemen Akun ──────────────────────────────────────────────────

/**
 * Login ke backend.
 * Mengembalikan token JWT dan profil pengguna.
 */
export async function apiLogin(contact: string, password: string) {
  return request<PenggunaAPI>("auth/login", {
    method: "POST",
    body: { contact, password },
  });
}

/**
 * Registrasi akun baru.
 * Password otomatis dienkripsi dengan standar Bcrypt (cost 10) di server.
 */
export async function apiRegister(payload: {
  nama: string;
  nik: string;
  contact: string;
  password: string;
}) {
  return request<{ id: number }>("auth/register", {
    method: "POST",
    body: payload,
  });
}

/** Ambil profil pengguna yang sedang login */
export async function apiProfil() {
  return request<PenggunaAPI>("auth/profil", { butuhToken: true });
}

/** Ambil daftar seluruh akun (khusus admin/pengurus) */
export async function apiGetPengguna() {
  return request<PenggunaAPI[]>("auth/pengguna", { butuhToken: true });
}

/** Buat akun baru secara manual (admin) — password otomatis dienkripsi dengan Bcrypt */
export async function apiBuatAkun(payload: {
  nama: string;
  nik?: string;
  email?: string;
  no_hp?: string;
  password: string;
  peran: "admin" | "ketua_rw" | "ketua_rt" | "warga";
  rt?: string;
}) {
  return request<PenggunaAPI>("auth/buat-akun", {
    method: "POST",
    body: payload,
    butuhToken: true,
  });
}

/** Update data akun. Jika password disertakan, server otomatis mengenkripsi ulang dengan Bcrypt */
export async function apiUpdatePengguna(
  id: number,
  payload: {
    nama?: string;
    email?: string;
    no_hp?: string;
    password?: string;
    peran?: string;
    rt?: string;
    aktif?: number;
  }
) {
  return request(`auth/pengguna/${id}`, {
    method: "PUT",
    body: payload,
    butuhToken: true,
  });
}

/** Hapus akun pengguna (admin) */
export async function apiHapusPengguna(id: number) {
  return request(`auth/pengguna/${id}`, {
    method: "DELETE",
    butuhToken: true,
  });
}

/** Helper enkripsi password untuk keperluan MySQL Workbench */
export async function apiEnkripsiUtil(password: string) {
  return request<{ hash: string; sqlQuery: string }>("auth/enkripsi-util", {
    method: "POST",
    body: { password },
  });
}

// ─── Data Kependudukan (Warga) ──────────────────────────────────────────────

export async function apiGetWarga(params?: Record<string, string | number>) {
  const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
  return request(`warga${qs}`, { butuhToken: true });
}

export async function apiGetStatistikWarga() {
  return request("warga/statistik", { butuhToken: true });
}

export async function apiTambahWarga(data: Record<string, unknown>) {
  return request("warga", {
    method: "POST",
    body: data,
    butuhToken: true,
  });
}

export async function apiUpdateWarga(id: number, data: Record<string, unknown>) {
  return request(`warga/${id}`, {
    method: "PUT",
    body: data,
    butuhToken: true,
  });
}

export async function apiHapusWarga(id: number) {
  return request(`warga/${id}`, {
    method: "DELETE",
    butuhToken: true,
  });
}

// ─── Kelahiran & Kematian ───────────────────────────────────────────────────

export async function apiGetKelahiran(params?: Record<string, string | number>) {
  const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
  return request(`kelahiran${qs}`, { butuhToken: true });
}

export async function apiTambahKelahiran(data: Record<string, unknown>) {
  return request("kelahiran", {
    method: "POST",
    body: data,
    butuhToken: true,
  });
}

export async function apiGetKematian(params?: Record<string, string | number>) {
  const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
  return request(`kematian${qs}`, { butuhToken: true });
}

export async function apiTambahKematian(data: Record<string, unknown>) {
  return request("kematian", {
    method: "POST",
    body: data,
    butuhToken: true,
  });
}

// ─── Mutasi Warga (Masuk & Keluar) ──────────────────────────────────────────

export async function apiGetMutasiMasuk(params?: Record<string, string | number>) {
  const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
  return request(`mutasi/masuk${qs}`, { butuhToken: true });
}

export async function apiTambahMutasiMasuk(data: Record<string, unknown>) {
  return request("mutasi/masuk", {
    method: "POST",
    body: data,
    butuhToken: true,
  });
}

export async function apiGetMutasiKeluar(params?: Record<string, string | number>) {
  const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
  return request(`mutasi/keluar${qs}`, { butuhToken: true });
}

export async function apiTambahMutasiKeluar(data: Record<string, unknown>) {
  return request("mutasi/keluar", {
    method: "POST",
    body: data,
    butuhToken: true,
  });
}

// ─── Administrasi Surat ─────────────────────────────────────────────────────

export async function apiGetSurat(params?: Record<string, string | number>) {
  const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
  return request(`surat${qs}`, { butuhToken: true });
}

export async function apiAjukanSurat(data: Record<string, unknown>) {
  return request("surat", {
    method: "POST",
    body: data,
    butuhToken: true,
  });
}

export async function apiUpdateStatusSurat(id: number, data: { status: string; catatan_admin?: string }) {
  return request(`surat/${id}/status`, {
    method: "PATCH",
    body: data,
    butuhToken: true,
  });
}

// ─── Pengaturan Sistem ──────────────────────────────────────────────────────

export async function apiGetPengaturan() {
  return request("pengaturan", { butuhToken: true });
}

export async function apiUpdatePengaturan(kunci: string, nilai: string, deskripsi?: string) {
  return request(`pengaturan/${kunci}`, {
    method: "PUT",
    body: { nilai, deskripsi },
    butuhToken: true,
  });
}
