import { useState } from "react";
import HalamanWelcome from "./pages/admin/HalamanWelcome";
import HalamanLogin from "./pages/admin/HalamanLogin";
import HalamanRegister from "./pages/admin/HalamanRegister";
import BerandaUtama from "./pages/admin/BerandaUtama";
import HalamanDashboard from "./pages/admin/HalamanDashboard";
import type { ModuleId } from "./pages/admin/HalamanDashboard";
import type { Pengguna } from "./pages/data/pengguna";
import type { DataRegister } from "./pages/data/register";

export default function App() {
  // Alur Halaman:
  // 1. welcome -> login
  // 2. login -> register (jika belum punya akun)
  // 3. register -> login (setelah pendaftaran berhasil)
  // 4. login -> beranda (portal utama setelah otentikasi)
  // 5. beranda <-> dashboard (sistem administrasi kependudukan lengkap)
  const [currentPage, setCurrentPage] = useState<"welcome" | "login" | "register" | "beranda" | "dashboard">("welcome");
  const [penggunaAktif, setPenggunaAktif] = useState<Pengguna | null>(null);
  const [activeDashboardModule, setActiveDashboardModule] = useState<ModuleId>("data-kependudukan");

  const handleMasuk = (p: Pengguna) => {
    setPenggunaAktif(p);
    setCurrentPage("beranda");
  };

  const handleRegisterBerhasil = (data: DataRegister, p: Pengguna) => {
    void data;
    setPenggunaAktif(p);
    setCurrentPage("login");
  };

  const handleKeluar = () => {
    setPenggunaAktif(null);
    setCurrentPage("welcome");
  };

  // Navigasi ke Dashboard dengan modul spesifik
  const handleKeDashboard = (modul: ModuleId = "data-kependudukan") => {
    setActiveDashboardModule(modul);
    setCurrentPage("dashboard");
  };

  // 1. Tampilkan Halaman Welcome sebelum Halaman Login
  if (currentPage === "welcome") {
    return (
      <HalamanWelcome
        onLanjut={() => setCurrentPage("login")}
      />
    );
  }

  // 2. Tampilkan Halaman Register
  if (currentPage === "register") {
    return (
      <HalamanRegister
        onRegisterBerhasil={handleRegisterBerhasil}
        onMasukKlik={() => setCurrentPage("login")}
      />
    );
  }

  // 3. Tampilkan Halaman Dashboard Administrasi Lengkap
  if (currentPage === "dashboard") {
    return (
      <HalamanDashboard
        pengguna={penggunaAktif}
        onKeluar={handleKeluar}
        onKeBerandaUtama={() => setCurrentPage("beranda")}
        initialModule={activeDashboardModule}
      />
    );
  }

  // 4. Tampilkan Beranda Utama setelah login berhasil
  if (currentPage === "beranda") {
    return (
      <BerandaUtama
        pengguna={penggunaAktif}
        onKeluar={handleKeluar}
        onBukaDatabase={() => handleKeDashboard("data-kependudukan")}
        onBukaPelayanan={() => handleKeDashboard("administrasi-surat")}
      />
    );
  }

  // 5. Default: Halaman Login
  return (
    <HalamanLogin
      onMasuk={handleMasuk}
      onDaftar={() => setCurrentPage("register")}
    />
  );
}
