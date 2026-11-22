import { Akun, Admin, Kasir, Warga } from "../models/akun";

export type Peran = "admin" | "kasir" | "warga";

// Bentuk data pengguna dari API (password tidak pernah dikirim ke browser)
export type Pengguna = {
  id: number;
  nama: string;
  email: string;
  peran: Peran;
  nik?: string;
  kontak?: string;
};

// Data biasa → objek class. Admin, Kasir, atau Warga dipilih dari peran.
export function keAkun(p: Pengguna): Akun {
  if (p.peran === "admin") {
    return new Admin(p.nama, p.email);
  }
  if (p.peran === "kasir") {
    return new Kasir(p.nama, p.email);
  }
  return new Warga(p.nama, p.email, p.nik || "", p.kontak);
}
