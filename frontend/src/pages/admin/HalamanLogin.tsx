import { useState, type FormEvent } from "react";
import type { Pengguna } from "../data/pengguna";
import { apiLogin, simpanSesi } from "../../services/api";

type Props = {
  onMasuk: (p: Pengguna) => void;
  onDaftar?: () => void;
  defaultIdentity?: string;
  defaultPassword?: string;
};

type FormErrors = {
  identity?: string;
  email?: string;
  password?: string;
};

type InfoToast = {
  teks: string;
  jenis: "sukses" | "gagal";
};

export default function HalamanLogin({
  onMasuk,
  onDaftar,
  defaultIdentity = "",
  defaultPassword = "",
}: Props) {
  // State untuk form input
  const [identity, setIdentity] = useState(defaultIdentity);
  const [password, setPassword] = useState(defaultPassword);
  const [showPassword, setShowPassword] = useState(false);

  // State untuk feedback & validasi
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<InfoToast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendOffline, setIsBackendOffline] = useState(false);

  // Fungsi toggle visibilitas password (Show / Hide)
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Fungsi validasi form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!identity.trim()) {
      newErrors.identity = "Email, No. HP, atau NIK wajib diisi";
      newErrors.email = "Email, No. HP, atau NIK wajib diisi";
    }

    if (!password) {
      newErrors.password = "Password wajib diisi";
    } else if (password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fungsi fallback login offline / demo jika backend belum berjalan
  const masukModeDemo = () => {
    const peranPengguna: "admin" | "warga" =
      identity.toLowerCase().includes("admin") ||
      identity === "sari@rw13.desa.id"
        ? "admin"
        : "warga";

    const dataPengguna: Pengguna = {
      id: 1,
      nama: identity.includes("@")
        ? identity.split("@")[0].replace(/[._]/g, " ").toUpperCase()
        : `Warga (${identity || "Tamu"})`,
      email: identity.includes("@") ? identity : `${identity || "demo"}@rw13.desa.id`,
      peran: peranPengguna,
      nik: /^\d+$/.test(identity.trim()) ? identity.trim() : undefined,
    };

    setToast({
      teks: "Berhasil masuk dalam Mode Demo (Offline).",
      jenis: "sukses",
    });

    setTimeout(() => {
      onMasuk(dataPengguna);
    }, 400);
  };

  // Fungsi penanganan submit login ke Backend API (MySQL rw13_db)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      setToast({
        teks: "Harap periksa kembali kolom input Anda.",
        jenis: "gagal",
      });
      return;
    }

    setIsLoading(true);
    setToast(null);
    setIsBackendOffline(false);

    try {
      // 1. Panggil API Login Backend (terkoneksi ke MySQL rw13_db dengan verifikasi Bcrypt)
      const res = await apiLogin(identity.trim(), password);

      if (res.success && res.token && res.pengguna) {
        // Simpan sesi JWT token & data pengguna di localStorage
        simpanSesi(res.token, res.pengguna);

        setToast({
          teks: `Login berhasil! Selamat datang, ${res.pengguna.nama}.`,
          jenis: "sukses",
        });

        // Mapping ke interface Pengguna
        const dataPengguna: Pengguna = {
          id: res.pengguna.id,
          nama: res.pengguna.nama,
          email: res.pengguna.email || `${res.pengguna.id}@rw13.desa.id`,
          peran: res.pengguna.peran === "admin" || res.pengguna.peran === "ketua_rw" || res.pengguna.peran === "ketua_rt"
            ? "admin"
            : "warga",
          nik: res.pengguna.nik || undefined,
          kontak: res.pengguna.no_hp || undefined,
        };

        setTimeout(() => {
          setIsLoading(false);
          onMasuk(dataPengguna);
        }, 500);
      } else {
        throw new Error(res.pesan || "Login gagal. Periksa kembali kontak dan password.");
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const pesanError = err instanceof Error ? err.message : "Terjadi kesalahan saat verifikasi login.";
      
      // Jika kegagalan karena backend belum aktif atau network error
      if (pesanError.includes("Failed to fetch") || pesanError.includes("Gagal terhubung")) {
        setIsBackendOffline(true);
        setToast({
          teks: "Backend server belum aktif atau MySQL belum berjalan. Anda dapat masuk dengan Mode Demo.",
          jenis: "gagal",
        });
      } else {
        setToast({
          teks: pesanError,
          jenis: "gagal",
        });
      }
    }
  };

  // Preset akun untuk mempermudah testing
  const isiKredensial = (idVal: string, passVal: string) => {
    setIdentity(idVal);
    setPassword(passVal);
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#12161f] text-[#e2e8f0] font-sans">
      {/* BEGIN: MainContainer */}
      <main className="w-full max-w-sm" data-purpose="login-wrapper">
        {/* BEGIN: HeaderSection */}
        <header className="flex items-center justify-center space-x-4 mb-6">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXKszIiHzXX4i4woVAAN8UMWVrVNV3uRsGgveH6r_I1SQDlWjzNkMJHpGnADfxSDHde_hYwuW4R-jlqXQqwtXWgF6Bxj0bvhBkq8OwHj8NMRQC_s_sOcWeVcCXZK87tpgU_yy-nFXe-wbOEv4oivWZwTElvIkUpXYaWk0eHqMkK_roQ-oL-jv98Adezk7eGXnhWgjKFEJehvDFsatD0StkW8kqmLCkXudeyNz1cP2dTo50dfcCNr56"
            alt="Logo Kota Patriot"
            className="w-12 h-14 object-contain shrink-0"
          />
          <div className="text-left">
            <h2 className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              DATA KEPENDUDUKAN RW 13
            </h2>
            <div className="text-xs font-normal text-slate-400 whitespace-nowrap mt-1">
              KELURAHAN MARGAHAYU KECAMATAN BEKASI TIMUR
            </div>
            <div className="text-xs text-slate-400 whitespace-nowrap">
              <span>Jl. Cendrawasih Raya No. 1 RT. 007 RW. 013</span>
            </div>
          </div>
        </header>
        {/* END: HeaderSection */}

        {/* Feedback / Toast Notification */}
        {toast && (
          <div
            className={`mb-4 px-4 py-2.5 rounded-lg text-xs font-medium border transition-all duration-300 flex items-center justify-between ${
              toast.jenis === "sukses"
                ? "bg-emerald-950/70 border-emerald-700/60 text-emerald-300"
                : "bg-red-950/70 border-red-700/60 text-red-300"
            }`}
          >
            <span>{toast.teks}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-white"
              aria-label="Tutup pesan"
            >
              ✕
            </button>
          </div>
        )}

        {/* Peringatan Backend Offline + Tombol Bypass Mode Demo */}
        {isBackendOffline && (
          <div className="mb-4 p-3 bg-amber-950/60 border border-amber-600/40 rounded-lg text-xs text-amber-200 text-center">
            <p className="mb-2">
              💡 Backend API (http://localhost:5000) belum terhubung ke MySQL.
            </p>
            <button
              type="button"
              onClick={masukModeDemo}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-xs transition-colors cursor-pointer"
            >
              ⚡ Lanjut Masuk Mode Demo (Offline)
            </button>
          </div>
        )}

        {/* BEGIN: LoginForm Card */}
        <div
          className="bg-[#1a202c] border border-slate-800 rounded-lg shadow-xl p-6 relative overflow-hidden"
          data-purpose="login-card"
        >
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-indigo-500"></div>

          {/* Form Title & Subtitle */}
          <div className="text-center mb-6">
            <h1 className="text-lg font-bold tracking-normal text-white">
              SISTEM INFORMASI RW 13
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Masuk dengan akun terdaftar di database MySQL
            </p>
          </div>

          {/* Form Element */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Identity Field (Email, No. HP, atau NIK) */}
            <div>
              <label
                htmlFor="identity"
                className="block text-xs font-medium text-slate-300 mb-1"
              >
                Email, No. HP, atau NIK
              </label>
              <input
                id="identity"
                name="identity"
                type="text"
                value={identity}
                onChange={(e) => {
                  setIdentity(e.target.value);
                  if (errors.identity) setErrors({ ...errors, identity: undefined });
                }}
                placeholder="misal: admin@rw13.id atau NIK 16 digit"
                className={`w-full px-3 py-2 bg-slate-900 border text-slate-100 placeholder-slate-500 text-xs rounded focus:outline-none focus:ring-1 transition-colors ${
                  errors.identity
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                }`}
                autoComplete="username"
              />
              {errors.identity && (
                <p className="text-red-400 text-xs mt-1">{errors.identity}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-300 mb-1"
              >
                Password (Enkripsi Bcrypt)
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  placeholder="Masukkan password Anda"
                  className={`w-full px-3 py-2 bg-slate-900 border text-slate-100 placeholder-slate-500 text-xs rounded focus:outline-none focus:ring-1 transition-colors pr-10 ${
                    errors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-slate-700 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    /* Eye Open Icon */
                    <svg
                      id="eyeOpenIcon"
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    /* Eye Closed Icon */
                    <svg
                      id="eyeClosedIcon"
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2 text-center" data-purpose="action-group">
              <button
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-sm rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto space-x-2 cursor-pointer"
                type="submit"
                disabled={isLoading}
              >
                {isLoading && (
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                <span>{isLoading ? "Memverifikasi..." : "Masuk"}</span>
              </button>
            </div>
          </form>

          {/* Quick Presets Kredensial */}
          <div className="mt-4 pt-3 border-t border-slate-800">
            <p className="text-[10px] text-slate-400 font-medium mb-1.5 text-center">
              Pilihan Akun Cepat (Tersinkron di MySQL):
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => isiKredensial("admin@rw13.id", "")}
                className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-blue-300 rounded border border-slate-700 text-left transition-colors cursor-pointer truncate"
                title="Admin RW 13 (<PASSWORD_ADMIN>)"
              >
                👑 <b>Admin</b>: admin@rw13.id
              </button>
              <button
                type="button"
                onClick={() => isiKredensial("ketuarw13@rw13.id", "")}
                className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-emerald-300 rounded border border-slate-700 text-left transition-colors cursor-pointer truncate"
                title="Ketua RW 13 (<PASSWORD_ADMIN>)"
              >
                🏛️ <b>Ketua RW</b>: ketuarw13...
              </button>
              <button
                type="button"
                onClick={() => isiKredensial("nurdin@rw13.id", "")}
                className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-teal-300 rounded border border-slate-700 text-left transition-colors cursor-pointer truncate"
                title="Ketua RT 01 (<PASSWORD_ADMIN>)"
              >
                🏘️ <b>Ketua RT 01</b>: nurdin...
              </button>
              <button
                type="button"
                onClick={() => isiKredensial("warga@rw13.id", "")}
                className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-amber-300 rounded border border-slate-700 text-left transition-colors cursor-pointer truncate"
                title="Warga Demo (<PASSWORD_WARGA>)"
              >
                👥 <b>Warga</b>: warga@rw13.id
              </button>
            </div>
          </div>

          {/* Feedback / Belum punya akun */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
            <p>
              Belum punya akun?{" "}
              <button
                type="button"
                onClick={onDaftar}
                className="text-blue-400 hover:text-blue-300 font-semibold underline decoration-slate-600 underline-offset-2 transition-colors cursor-pointer"
              >
                Daftar Akun Baru
              </button>
            </p>
          </div>
        </div>
        {/* END: LoginForm Card */}

        {/* Footer Note */}
        <footer className="mt-6 text-center text-xs text-slate-500">
          © 2026 Pengurus RW 13 Kel. Margahayu. Sistem Administrasi &amp; Data
          Kependudukan.
        </footer>
      </main>
      {/* END: MainContainer */}
    </div>
  );
}
