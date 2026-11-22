import { useState } from "react";
import type { Pengguna } from "../data/pengguna";

type Props = {
  pengguna?: Pengguna | null;
  onKeluar?: () => void;
  onBukaDatabase?: () => void;
  onBukaPelayanan?: () => void;
};

type ModalType =
  | "database"
  | "rekap-penduduk"
  | "rekap-pendidikan"
  | "rekap-pekerjaan"
  | "rekap-usia"
  | "kelahiran"
  | "kematian"
  | "mutasi-masuk"
  | "mutasi-keluar"
  | "rt"
  | "pelayanan"
  | null;

type RTUnit = {
  id: string;
  nomor: string;
  status: "Online" | "Offline";
  ketua: string;
  kontak: string;
  jumlahKK: number;
  jumlahWarga: number;
};

// Data Unit RT 01 - 09 sesuai dengan sistem RW 13 Margahayu
const DATA_RT: RTUnit[] = [
  { id: "rt-01", nomor: "RT 01", status: "Online", ketua: "H. Syarifuddin", kontak: "0812-3456-0001", jumlahKK: 84, jumlahWarga: 298 },
  { id: "rt-02", nomor: "RT 02", status: "Online", ketua: "Andi Muh. Ikbal", kontak: "0813-4567-0002", jumlahKK: 76, jumlahWarga: 265 },
  { id: "rt-03", nomor: "RT 03", status: "Offline", ketua: "Mahadir, S.H.", kontak: "0815-6789-0003", jumlahKK: 92, jumlahWarga: 320 },
  { id: "rt-04", nomor: "RT 04", status: "Online", ketua: "Bambang Sudiro", kontak: "0812-7890-0004", jumlahKK: 68, jumlahWarga: 240 },
  { id: "rt-05", nomor: "RT 05", status: "Offline", ketua: "Abdul Rahman", kontak: "0813-8901-0005", jumlahKK: 80, jumlahWarga: 285 },
  { id: "rt-06", nomor: "RT 06", status: "Online", ketua: "Drs. Joko Prasetyo", kontak: "0816-9012-0006", jumlahKK: 88, jumlahWarga: 310 },
  { id: "rt-07", nomor: "RT 07", status: "Offline", ketua: "M. Rizky Pratama", kontak: "0812-0123-0007", jumlahKK: 72, jumlahWarga: 254 },
  { id: "rt-08", nomor: "RT 08", status: "Online", ketua: "Hendro Wibowo", kontak: "0813-1234-0008", jumlahKK: 95, jumlahWarga: 342 },
  { id: "rt-09", nomor: "RT 09", status: "Offline", ketua: "Gunawan Santoso", kontak: "0815-2345-0009", jumlahKK: 65, jumlahWarga: 228 },
];

export default function BerandaUtama({
  pengguna,
  onKeluar,
  onBukaDatabase,
  onBukaPelayanan,
}: Props) {
  // State untuk modal aktif secara deklaratif
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedRT, setSelectedRT] = useState<RTUnit | null>(null);

  // State toast notifikasi
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // State pilihan surat pada unit RT
  const [jenisSuratTerpilih, setJenisSuratTerpilih] = useState("SKD-01 (Surat Keterangan Domisili)");

  // Fungsi memunculkan toast notifikasi
  const showToast = (pesan: string) => {
    setToastMessage(pesan);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Fungsi menutup modal
  const closeModal = () => {
    setActiveModal(null);
    setSelectedRT(null);
  };

  // Handler tombol DATABASE
  const handleDatabase = () => {
    if (onBukaDatabase) {
      onBukaDatabase();
      return;
    }
    setActiveModal("database");
  };

  // Handler DATA PELAYANAN di header
  const handleDataPelayanan = () => {
    if (onBukaPelayanan) {
      onBukaPelayanan();
      return;
    }
    setActiveModal("pelayanan");
  };

  // Handler klik kartu unit RT
  const handleKlikRT = (rt: RTUnit) => {
    setSelectedRT(rt);
    setActiveModal("rt");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0b1120] text-[#f1f5f9] font-sans selection:bg-rose-900 selection:text-white">
      {/* Toast Notifikasi Aksi */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-800 border-2 border-rose-500 rounded-xl shadow-2xl text-white text-xs font-semibold">
          <i className="fa-solid fa-circle-check text-emerald-400 text-sm"></i>
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* BEGIN: MainHeader */}
      <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Left: Official Emblem & Entity Details */}
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="relative shrink-0">
                <img
                  alt="Logo Resmi Kota Patriot Bekasi"
                  className="w-16 h-20 sm:w-20 sm:h-24 object-contain drop-shadow-md"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZNyROaaNCYbBaDxUmA7ZkW32vcfFKL1haDt8gc2pmFlajlv3XRQBwG-B595AoUR1HOAzt3C-pIgLLzCnOLqOhixdBHi5gbWnXLgf1OZNbkD8nv1hTLHlLB4UKkTDmJVVX4vV5e8IGGY-Wg4mZS203iS0TtOqIbWB0FgiXWgiHwbcXRZVr2tdqNdzQIT2wzJGZVJ4YlZdWqeHFokKk9JeQhywCnbyoIqiJ3YdYZ6keFuCkJ8b6SI11"
                />
              </div>
              <div>
                <h1 className="text-base sm:text-lg md:text-xl font-extrabold uppercase tracking-wide text-white leading-tight">
                  PEMERINTAH KOTA BEKASI RUKUN WARGA 13
                </h1>
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-rose-400 mt-0.5">
                  KELURAHAN MARGAHAYU
                </p>
                <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-slate-300">
                  KECAMATAN BEKASI TIMUR
                </p>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-1.5 font-normal">
                  <i className="fa-solid fa-location-dot text-rose-500"></i>
                  <span>Jl. Cendrawasih Raya No. 1 RT. 007 RW. 013</span>
                  <span className="text-slate-600 hidden sm:inline">|</span>
                  <span className="inline-flex items-center gap-1">
                    <i className="fa-solid fa-phone text-rose-500 text-[10px]"></i> 082299911002
                  </span>
                </p>
              </div>
            </div>

            {/* Right: Actions & User Quick Profile */}
            <div className="flex items-center flex-wrap justify-center gap-3">
              {/* Tombol Dasbor Administrasi Lengkap */}
              <button
                type="button"
                onClick={handleDatabase}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-emerald-700/80 hover:bg-emerald-600 active:bg-emerald-800 border-2 border-emerald-500 rounded-lg shadow-lg shadow-emerald-950/40 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
                title="Buka Dasbor Administrasi Lengkap RW 13"
              >
                <i className="fa-solid fa-gauge-high text-emerald-200"></i>
                <span>DASBOR RW 13</span>
              </button>

              {/* Data Pelayanan Action Button */}
              <button
                type="button"
                onClick={handleDataPelayanan}
                className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-white bg-rose-700/80 hover:bg-rose-600 active:bg-rose-800 border-2 border-rose-500 rounded-lg shadow-lg shadow-rose-950/40 transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <i className="fa-solid fa-bell-concierge text-rose-200"></i>
                <span>DATA PELAYANAN</span>
              </button>

              {/* User Menu & Sign Out */}
              <div className="flex items-center gap-2 pl-3 border-l border-slate-700">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-white">
                    {pengguna?.nama || "Ketua RW 13"}
                  </span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>{" "}
                    Online
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onKeluar}
                  aria-label="Keluar / Logout"
                  title="Keluar / Logout"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* END: MainHeader */}

      {/* BEGIN: MainContent */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Central Operations Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-8 lg:p-10 shadow-2xl space-y-12">
          {/* Badge Beranda Utama */}
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-rose-300 text-xs font-semibold uppercase tracking-wider">
              <i className="fa-solid fa-house text-[11px]"></i> Beranda Utama
            </div>
          </div>

          {/* BEGIN: SectionDataKependudukan */}
          <section className="space-y-6" data-purpose="section-data-kependudukan">
            {/* Section Header */}
            <div className="text-center space-y-1 border-b border-slate-800/80 pb-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-wide uppercase">
                DATA KEPENDUDUKAN
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Akses pangkalan data, tabulasi statistik penduduk, serta mutasi domisili warga RW 13
              </p>
            </div>

            {/* Buttons Rows Container */}
            <div className="space-y-4">
              {/* Row 1: General & Recapitulation Data (5 Items) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {/* 1. DATABASE */}
                <button
                  type="button"
                  onClick={handleDatabase}
                  className="group flex items-center justify-center gap-2.5 px-4 py-3.5 bg-rose-800/90 hover:bg-rose-700 active:bg-rose-900 text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wide shadow-md shadow-rose-950/40 border border-rose-700/60 transition duration-150 transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <i className="fa-solid fa-database text-rose-300 group-hover:scale-110 transition-transform"></i>
                  <span>DATABASE</span>
                </button>

                {/* 2. REKAP PENDUDUK */}
                <button
                  type="button"
                  onClick={() => setActiveModal("rekap-penduduk")}
                  className="group flex items-center justify-center gap-2.5 px-4 py-3.5 bg-rose-800/90 hover:bg-rose-700 active:bg-rose-900 text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wide shadow-md shadow-rose-950/40 border border-rose-700/60 transition duration-150 transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <i className="fa-solid fa-id-card text-rose-300 group-hover:scale-110 transition-transform"></i>
                  <span>REKAP PENDUDUK</span>
                </button>

                {/* 3. REKAP PENDIDIKAN */}
                <button
                  type="button"
                  onClick={() => setActiveModal("rekap-pendidikan")}
                  className="group flex items-center justify-center gap-2.5 px-4 py-3.5 bg-rose-800/90 hover:bg-rose-700 active:bg-rose-900 text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wide shadow-md shadow-rose-950/40 border border-rose-700/60 transition duration-150 transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <i className="fa-solid fa-graduation-cap text-rose-300 group-hover:scale-110 transition-transform"></i>
                  <span>REKAP PENDIDIKAN</span>
                </button>

                {/* 4. REKAP PEKERJAAN */}
                <button
                  type="button"
                  onClick={() => setActiveModal("rekap-pekerjaan")}
                  className="group flex items-center justify-center gap-2.5 px-4 py-3.5 bg-rose-800/90 hover:bg-rose-700 active:bg-rose-900 text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wide shadow-md shadow-rose-950/40 border border-rose-700/60 transition duration-150 transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <i className="fa-solid fa-briefcase text-rose-300 group-hover:scale-110 transition-transform"></i>
                  <span>REKAP PEKERJAAN</span>
                </button>

                {/* 5. REKAP USIA */}
                <button
                  type="button"
                  onClick={() => setActiveModal("rekap-usia")}
                  className="group flex items-center justify-center gap-2.5 px-4 py-3.5 bg-rose-800/90 hover:bg-rose-700 active:bg-rose-900 text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wide shadow-md shadow-rose-950/40 border border-rose-700/60 transition duration-150 transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <i className="fa-solid fa-chart-pie text-rose-300 group-hover:scale-110 transition-transform"></i>
                  <span>REKAP USIA</span>
                </button>
              </div>

              {/* Row 2: Vital Statistics & Mutation (4 Items - Centered Alignment) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 max-w-4xl mx-auto gap-3.5">
                {/* 1. DATA KELAHIRAN */}
                <button
                  type="button"
                  onClick={() => setActiveModal("kelahiran")}
                  className="group flex items-center justify-center gap-2.5 px-4 py-3.5 bg-rose-800/90 hover:bg-rose-700 active:bg-rose-900 text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wide shadow-md shadow-rose-950/40 border border-rose-700/60 transition duration-150 transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <i className="fa-solid fa-baby text-rose-300 group-hover:scale-110 transition-transform"></i>
                  <span>DATA KELAHIRAN</span>
                </button>

                {/* 2. DATA KEMATIAN */}
                <button
                  type="button"
                  onClick={() => setActiveModal("kematian")}
                  className="group flex items-center justify-center gap-2.5 px-4 py-3.5 bg-rose-800/90 hover:bg-rose-700 active:bg-rose-900 text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wide shadow-md shadow-rose-950/40 border border-rose-700/60 transition duration-150 transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <i className="fa-solid fa-book-skull text-rose-300 group-hover:scale-110 transition-transform"></i>
                  <span>DATA KEMATIAN</span>
                </button>

                {/* 3. MUTASI MASUK */}
                <button
                  type="button"
                  onClick={() => setActiveModal("mutasi-masuk")}
                  className="group flex items-center justify-center gap-2.5 px-4 py-3.5 bg-rose-800/90 hover:bg-rose-700 active:bg-rose-900 text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wide shadow-md shadow-rose-950/40 border border-rose-700/60 transition duration-150 transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <i className="fa-solid fa-user-plus text-rose-300 group-hover:scale-110 transition-transform"></i>
                  <span>MUTASI MASUK</span>
                </button>

                {/* 4. MUTASI KELUAR */}
                <button
                  type="button"
                  onClick={() => setActiveModal("mutasi-keluar")}
                  className="group flex items-center justify-center gap-2.5 px-4 py-3.5 bg-rose-800/90 hover:bg-rose-700 active:bg-rose-900 text-white rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wide shadow-md shadow-rose-950/40 border border-rose-700/60 transition duration-150 transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <i className="fa-solid fa-user-minus text-rose-300 group-hover:scale-110 transition-transform"></i>
                  <span>MUTASI KELUAR</span>
                </button>
              </div>
            </div>
          </section>
          {/* END: SectionDataKependudukan */}

          {/* Divider Decorative */}
          <div className="relative">
            <div aria-hidden="true" className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-900 px-3 text-xs uppercase text-slate-500 font-semibold tracking-widest">
                Wilayah Administrasi RT
              </span>
            </div>
          </div>

          {/* BEGIN: SectionFormatPersuratan */}
          <section className="space-y-6" data-purpose="section-format-persuratan">
            {/* Section Header */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold uppercase tracking-wider mb-1">
                <i className="fa-solid fa-envelope-open-text text-[11px]"></i> Blanko &amp; Pengantar
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-wide uppercase">
                FORMAT PERSURATAN
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Pilih unit Rukun Tetangga (RT) untuk mencetak berkas surat keterangan pengantar
              </p>
            </div>

            {/* 3x3 Grid Buttons for RT Units (RT 01 s/d RT 09) */}
            <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
              {DATA_RT.map((rt) => (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => handleKlikRT(rt)}
                  className="group flex flex-col items-center justify-center gap-1.5 px-4 py-3 bg-rose-900/80 hover:bg-rose-700 active:bg-rose-950 text-white rounded-xl border border-rose-800/80 shadow-md transition duration-150 transform hover:-translate-y-0.5 hover:shadow-rose-950/50 cursor-pointer text-center"
                >
                  <div className="flex items-center gap-2 font-extrabold text-base tracking-wider uppercase">
                    <i className="fa-solid fa-file-lines text-rose-300 text-sm group-hover:scale-110 transition-transform"></i>
                    <span>{rt.nomor}</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      rt.status === "Online"
                        ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400"
                        : "bg-slate-800/70 border-slate-700 text-slate-400"
                    } normal-case tracking-normal`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        rt.status === "Online" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                      }`}
                    ></span>{" "}
                    {rt.status}
                  </span>
                </button>
              ))}
            </div>
          </section>
          {/* END: SectionFormatPersuratan */}
        </div>
      </main>
      {/* END: MainContent */}

      {/* BEGIN: MainFooter */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-medium">
            © 2026 Pengurus RW 13 Kel. Margahayu. Sistem Administrasi &amp; Data Kependudukan.
          </p>
        </div>
      </footer>
      {/* END: MainFooter */}

      {/* MODAL DIALOG INTERAKTIF BERDASARKAN activeModal */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wide">
                {activeModal === "database" && "DATABASE KEPENDUDUKAN RW 13"}
                {activeModal === "rekap-penduduk" && "REKAPITULASI DATA PENDUDUK"}
                {activeModal === "rekap-pendidikan" && "REKAPITULASI TINGKAT PENDIDIKAN"}
                {activeModal === "rekap-pekerjaan" && "REKAPITULASI MATA PENCAHARIAN"}
                {activeModal === "rekap-usia" && "REKAPITULASI KELOMPOK USIA"}
                {activeModal === "kelahiran" && "DATA PERISTIWA KELAHIRAN"}
                {activeModal === "kematian" && "DATA PERISTIWA KEMATIAN"}
                {activeModal === "mutasi-masuk" && "MUTASI PENDUDUK MASUK"}
                {activeModal === "mutasi-keluar" && "MUTASI PENDUDUK KELUAR"}
                {activeModal === "pelayanan" && "PUSAT DATA PELAYANAN SURAT RW 13"}
                {activeModal === "rt" && selectedRT && `FORMAT PERSURATAN - ${selectedRT.nomor}`}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content - DATABASE */}
            {activeModal === "database" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-300">
                  Ringkasan Pangkalan Data Induk Kependudukan RW 13 Kelurahan Margahayu:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-xs text-slate-400">Total KK</span>
                    <div className="text-xl font-bold text-rose-400">720 KK</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-xs text-slate-400">Total Warga</span>
                    <div className="text-xl font-bold text-white">2.542 Jiwa</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-xs text-slate-400">Laki-Laki</span>
                    <div className="text-xl font-bold text-blue-400">1.280 Jiwa</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-xs text-slate-400">Perempuan</span>
                    <div className="text-xl font-bold text-pink-400">1.262 Jiwa</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400 bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                  Semua data terenkripsi dan tersinkronisasi otomatis dengan server Kependudukan Kelurahan Margahayu, Kecamatan Bekasi Timur.
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      showToast("Mengekspor data induk kependudukan format Excel...");
                      closeModal();
                    }}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Ekspor Data (Excel)
                  </button>
                </div>
              </div>
            )}

            {/* Modal Content - REKAP PENDUDUK */}
            {activeModal === "rekap-penduduk" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-300">
                  Statistik Demografi Penduduk Berdasarkan Jenis Kelamin & Keluarga:
                </p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Laki-Laki (50.3%)</span>
                      <span className="font-bold">1.280 Jiwa</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "50.3%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Perempuan (49.7%)</span>
                      <span className="font-bold">1.262 Jiwa</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-pink-500 h-2 rounded-full" style={{ width: "49.7%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Warga Ber-KTP Bekasi (92.5%)</span>
                      <span className="font-bold">2.351 Jiwa</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "92.5%" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Warga Non-Permanen / Kontrak (7.5%)</span>
                      <span className="font-bold">191 Jiwa</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: "7.5%" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Content - REKAP PENDIDIKAN */}
            {activeModal === "rekap-pendidikan" && (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="text-sm">Distribusi Jenjang Pendidikan Terakhir Warga RW 13:</p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-slate-400">SD / Sederajat</span>
                    <div className="text-base font-bold text-white mt-0.5">245 Jiwa (9.6%)</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-slate-400">SMP / Sederajat</span>
                    <div className="text-base font-bold text-white mt-0.5">410 Jiwa (16.1%)</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-slate-400">SMA / SMK / Sederajat</span>
                    <div className="text-base font-bold text-rose-400 mt-0.5">1.080 Jiwa (42.5%)</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-slate-400">Diploma (D1 - D3)</span>
                    <div className="text-base font-bold text-white mt-0.5">265 Jiwa (10.4%)</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-slate-400">Sarjana (S1 / Terapan)</span>
                    <div className="text-base font-bold text-emerald-400 mt-0.5">492 Jiwa (19.4%)</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-slate-400">Pascasarjana (S2 / S3)</span>
                    <div className="text-base font-bold text-blue-400 mt-0.5">50 Jiwa (2.0%)</div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Content - REKAP PEKERJAAN */}
            {activeModal === "rekap-pekerjaan" && (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="text-sm">Klasifikasi Profesi & Lapangan Usaha Warga RW 13:</p>
                <ul className="divide-y divide-slate-800 bg-slate-800/50 rounded-lg border border-slate-700/60 p-2">
                  <li className="py-2 flex justify-between">
                    <span>Karyawan Swasta</span>
                    <span className="font-bold text-white">930 Orang (36.6%)</span>
                  </li>
                  <li className="py-2 flex justify-between">
                    <span>Wiraswasta / UMKM / Pedagang</span>
                    <span className="font-bold text-white">480 Orang (18.9%)</span>
                  </li>
                  <li className="py-2 flex justify-between">
                    <span>Pegawai Negeri / ASN / BUMN</span>
                    <span className="font-bold text-white">165 Orang (6.5%)</span>
                  </li>
                  <li className="py-2 flex justify-between">
                    <span>TNI / POLRI</span>
                    <span className="font-bold text-white">45 Orang (1.8%)</span>
                  </li>
                  <li className="py-2 flex justify-between">
                    <span>Pelajar / Mahasiswa</span>
                    <span className="font-bold text-white">410 Orang (16.1%)</span>
                  </li>
                  <li className="py-2 flex justify-between">
                    <span>Ibu Rumah Tangga / Lainnya</span>
                    <span className="font-bold text-white">512 Orang (20.1%)</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Modal Content - REKAP USIA */}
            {activeModal === "rekap-usia" && (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="text-sm">Distribusi Penduduk Berdasarkan Kategori Rentang Usia:</p>
                <div className="space-y-2">
                  <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700 flex justify-between items-center">
                    <span>👶 Balita & Batita (0 - 4 Tahun)</span>
                    <span className="font-bold text-white">142 Jiwa (5.6%)</span>
                  </div>
                  <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700 flex justify-between items-center">
                    <span>🧒 Usia Anak-anak (5 - 11 Tahun)</span>
                    <span className="font-bold text-white">285 Jiwa (11.2%)</span>
                  </div>
                  <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700 flex justify-between items-center">
                    <span>🧑 Remaja (12 - 25 Tahun)</span>
                    <span className="font-bold text-white">590 Jiwa (23.2%)</span>
                  </div>
                  <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700 flex justify-between items-center">
                    <span>👨 Usia Produktif / Dewasa (26 - 59 Tahun)</span>
                    <span className="font-bold text-rose-400">1.340 Jiwa (52.7%)</span>
                  </div>
                  <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700 flex justify-between items-center">
                    <span>🧓 Usia Lanjut / Lansia (60+ Tahun)</span>
                    <span className="font-bold text-amber-400">185 Jiwa (7.3%)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Content - KELAHIRAN */}
            {activeModal === "kelahiran" && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex justify-between items-center">
                  <p className="text-sm">Pencatatan Kelahiran Baru Tahun Berjalan (2026):</p>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold">Total: 18 Bayi</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="p-2">Nama Bayi</th>
                        <th className="p-2">Tgl Lahir</th>
                        <th className="p-2">Wilayah</th>
                        <th className="p-2">Nama Orang Tua</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr>
                        <td className="p-2 font-semibold text-white">Aisyah Nur Ramadhani</td>
                        <td className="p-2">12 Mar 2026</td>
                        <td className="p-2">RT 01</td>
                        <td className="p-2">Ahmad Fauzi</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-white">Muhammad Rayyan Ghaisan</td>
                        <td className="p-2">28 Feb 2026</td>
                        <td className="p-2">RT 04</td>
                        <td className="p-2">Dian Nugraha</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-white">Kanaya Putri Salsabila</td>
                        <td className="p-2">15 Jan 2026</td>
                        <td className="p-2">RT 07</td>
                        <td className="p-2">Bambang Hendrawan</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    showToast("Membuka formulir pelaporan kelahiran bayi baru...");
                    closeModal();
                  }}
                  className="w-full mt-2 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg font-semibold cursor-pointer"
                >
                  + Catat Kelahiran Baru
                </button>
              </div>
            )}

            {/* Modal Content - KEMATIAN */}
            {activeModal === "kematian" && (
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex justify-between items-center">
                  <p className="text-sm">Pencatatan Berkas Wafat & Surat Kematian RW 13:</p>
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-bold">Total: 7 Warga</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="p-2">Nama Almarhum/ah</th>
                        <th className="p-2">Usia</th>
                        <th className="p-2">Tgl Wafat</th>
                        <th className="p-2">Pemakaman</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      <tr>
                        <td className="p-2 font-semibold text-white">H. Syamsul Bahri</td>
                        <td className="p-2">74 Th</td>
                        <td className="p-2">18 Feb 2026</td>
                        <td className="p-2">TPU Padurenan</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold text-white">Hj. Rohana Sukardi</td>
                        <td className="p-2">68 Th</td>
                        <td className="p-2">04 Jan 2026</td>
                        <td className="p-2">TPU Margahayu</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    showToast("Membuka formulir pencatatan surat keterangan kematian...");
                    closeModal();
                  }}
                  className="w-full mt-2 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg font-semibold cursor-pointer"
                >
                  + Buat Surat Keterangan Kematian
                </button>
              </div>
            )}

            {/* Modal Content - MUTASI MASUK */}
            {activeModal === "mutasi-masuk" && (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="text-sm">Penerimaan Penduduk Baru (SKPWNI) Masuk Domisili RW 13:</p>
                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 space-y-1.5">
                  <div className="flex justify-between font-bold text-white">
                    <span>Rendi Pratama & Keluarga (3 Jiwa)</span>
                    <span className="text-emerald-400">Terverifikasi</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Asal: Kec. Cibitung, Kab. Bekasi ➔ Menetap di RT 02 RW 13</div>
                  <div className="text-[11px] text-slate-400">SKPWNI No: 3216/SKPWNI/2026/0129</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    showToast("Membuka form pendaftaran mutasi warga masuk...");
                    closeModal();
                  }}
                  className="w-full mt-2 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg font-semibold cursor-pointer"
                >
                  + Daftarkan Mutasi Masuk
                </button>
              </div>
            )}

            {/* Modal Content - MUTASI KELUAR */}
            {activeModal === "mutasi-keluar" && (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="text-sm">Pengantar Pindah Domisili Keluar dari Wilayah RW 13:</p>
                <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 space-y-1.5">
                  <div className="flex justify-between font-bold text-white">
                    <span>Wahyu Hidayat (1 Jiwa)</span>
                    <span className="text-amber-400">Proses Kelurahan</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Asal: RT 06 RW 13 ➔ Tujuan: Kel. Pekayon Jaya, Bekasi Selatan</div>
                  <div className="text-[11px] text-slate-400">No. Pengantar: 475/RW13/02/2026</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    showToast("Membuka formulir permohonan surat pindah keluar...");
                    closeModal();
                  }}
                  className="w-full mt-2 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg font-semibold cursor-pointer"
                >
                  + Ajukan Pindah Keluar
                </button>
              </div>
            )}

            {/* Modal Content - PELAYANAN */}
            {activeModal === "pelayanan" && (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="text-sm">Rekapitulasi Layanan Persuratan Warga Bulan Ini:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-[11px] text-slate-400">Total Masuk</span>
                    <div className="text-lg font-bold text-white">48 Surat</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-[11px] text-slate-400">Menunggu RT</span>
                    <div className="text-lg font-bold text-amber-400">5 Berkas</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-[11px] text-slate-400">Antrean RW</span>
                    <div className="text-lg font-bold text-blue-400">8 Berkas</div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <span className="text-[11px] text-slate-400">Selesai Sah</span>
                    <div className="text-lg font-bold text-emerald-400">35 Berkas</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    showToast("Membuka antrean berkas pengajuan surat warga...");
                    closeModal();
                  }}
                  className="w-full mt-2 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg font-bold cursor-pointer"
                >
                  Lihat Semua Antrean Surat
                </button>
              </div>
            )}

            {/* Modal Content - FORMAT PERSURATAN RT */}
            {activeModal === "rt" && selectedRT && (
              <div className="space-y-4 text-xs text-slate-300">
                {/* Info Ringkas RT */}
                <div className="p-3.5 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{selectedRT.nomor} RW 13</span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        selectedRT.status === "Online"
                          ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400"
                          : "bg-slate-700/60 border-slate-600 text-slate-400"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          selectedRT.status === "Online" ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                        }`}
                      />
                      {selectedRT.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1 border-t border-slate-700/60">
                    <div>Ketua RT: <strong className="text-white">{selectedRT.ketua}</strong></div>
                    <div>Kontak/WA: <strong className="text-white">{selectedRT.kontak}</strong></div>
                    <div>Populasi KK: <strong className="text-white">{selectedRT.jumlahKK} KK</strong></div>
                    <div>Total Warga: <strong className="text-white">{selectedRT.jumlahWarga} Jiwa</strong></div>
                  </div>
                </div>

                {/* Pilihan Layanan Blanko Surat */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Pilih Jenis Surat Pengantar:
                  </label>
                  <select
                    value={jenisSuratTerpilih}
                    onChange={(e) => setJenisSuratTerpilih(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="SKD-01 (Surat Keterangan Domisili)">SKD-01: Surat Keterangan Domisili</option>
                    <option value="SKTM-02 (Keterangan Tidak Mampu)">SKTM-02: Keterangan Tidak Mampu (BPJS/Beasiswa)</option>
                    <option value="SP-KTP-03 (Pengantar KTP & KK Baru)">SP-KTP-03: Pengantar KTP / KK Baru</option>
                    <option value="SKU-04 (Keterangan Usaha / UMKM)">SKU-04: Keterangan Usaha / UMKM Mikro</option>
                    <option value="SPN-05 (Pengantar Nikah N1-N4)">SPN-05: Pengantar Pernikahan KUA / Capil</option>
                    <option value="SKK-06 (Keterangan Kematian)">SKK-06: Keterangan Kematian & Pemakaman</option>
                    <option value="SKP-07 (Surat Pindah Domisili)">SKP-07: Surat Keterangan Pindah Domisili</option>
                    <option value="SKCK-08 (Catatan Kelakuan Baik)">SKCK-08: Pengantar SKCK Polsek Bekasi Timur</option>
                  </select>
                </div>

                {/* Tombol Aksi Persuratan */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Format ${jenisSuratTerpilih} untuk ${selectedRT.nomor} berhasil diunduh (PDF)!`);
                      closeModal();
                    }}
                    className="flex-1 py-2.5 px-3 bg-rose-700 hover:bg-rose-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-file-pdf"></i>
                    <span>Cetak Blanko Surat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Permohonan surat ${selectedRT.nomor} telah diteruskan ke Ketua RT (${selectedRT.ketua}) via WhatsApp.`);
                      closeModal();
                    }}
                    className="flex-1 py-2.5 px-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-paper-plane"></i>
                    <span>Ajukan ke Ketua RT</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
