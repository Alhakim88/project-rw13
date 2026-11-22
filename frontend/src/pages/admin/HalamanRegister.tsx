import { useState, type FormEvent, type ChangeEvent } from "react";
import type { Pengguna } from "../data/pengguna";
import {
  type DataRegister,
  type FormRegisterErrors,
  validasiRegister,
} from "../data/register";
import { apiRegister } from "../../services/api";

type Props = {
  onRegisterBerhasil?: (data: DataRegister, pengguna: Pengguna) => void;
  onMasukKlik?: () => void;
};

type InfoToast = {
  teks: string;
  jenis: "sukses" | "gagal";
};

export default function HalamanRegister({
  onRegisterBerhasil,
  onMasukKlik,
}: Props) {
  // State form pendaftaran
  const [formData, setFormData] = useState<DataRegister>({
    fullName: "",
    nik: "",
    contact: "",
    password: "",
    confirmPassword: "",
  });

  // State toggle visibilitas password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State status & error
  const [errors, setErrors] = useState<FormRegisterErrors>({});
  const [toast, setToast] = useState<InfoToast | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  // Handler input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Untuk input NIK, hanya izinkan angka maksimal 16 karakter
    if (name === "nik") {
      const cleanVal = value.replace(/\D/g, "").slice(0, 16);
      setFormData((prev) => ({ ...prev, nik: cleanVal }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Bersihkan error field tersebut ketika diketik ulang
    if (errors[name as keyof FormRegisterErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handler form submit — kirim ke backend, password dienkripsi oleh server (bcrypt)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Validasi lokal terlebih dahulu
    const validationErrors = validasiRegister(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setToast({
        teks: "Harap periksa kembali isian formulir Anda.",
        jenis: "gagal",
      });
      return;
    }

    setIsLoading(true);
    setErrors({});
    setToast(null);

    try {
      // 2. Kirim ke API backend — server yang mengenkripsi password dengan bcrypt
      const hasil = await apiRegister({
        nama:     formData.fullName.trim(),
        nik:      formData.nik.trim(),
        contact:  formData.contact.trim(),
        password: formData.password,
      });

      // 3. Registrasi berhasil
      setIsLoading(false);
      setIsSuccess(true);
      setToast({
        teks: "Pendaftaran berhasil! Password otomatis dienkripsi dengan standar Bcrypt dan tersimpan di database MySQL.",
        jenis: "sukses",
      });

      // 4. Susun objek Pengguna dari respons server
      const emailAkun = formData.contact.includes("@")
        ? formData.contact
        : `${formData.nik}@rw13.desa.id`;

      const userId = typeof hasil.id === "number" ? hasil.id : Date.now();
      const penggunaBaru: Pengguna = {
        id:     userId,
        nama:   formData.fullName.trim(),
        email:  emailAkun,
        peran:  "warga",
        nik:    formData.nik.trim(),
        kontak: formData.contact.trim(),
      };

      // 5. Panggil callback setelah delay supaya user sempat membaca pesan sukses
      if (onRegisterBerhasil) {
        setTimeout(() => {
          onRegisterBerhasil(formData, penggunaBaru);
        }, 1800);
      }
    } catch (err: unknown) {
      // 6. Tangani error dari backend (mis. NIK sudah terdaftar)
      setIsLoading(false);
      const pesanError =
        err instanceof Error
          ? err.message
          : "Pendaftaran gagal. Periksa koneksi atau coba lagi.";
      setToast({ teks: pesanError, jenis: "gagal" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#12161f] text-[#e2e8f0] font-sans">
      {/* BEGIN: MainContainer */}
      <main className="w-full max-w-sm" data-purpose="login-wrapper">
        {/* BEGIN: HeaderSection */}
        <header className="flex items-center justify-center mb-6">
          <img
            alt="Logo Kota Patriot"
            className="w-12 h-14 object-contain mr-3 shrink-0"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmYdBmFX5wbkx_kvBQLdIcq9aScJgxOXDjIaIaG7rHeFWopBu-sNbjJeJaHiv2GWGEKcNjBIw9Q_ZZSQl2PSI22uHzUBYBNH739BMqPIgjeVxYmvLETaxbKGHG_1ZPTslyZ5mPr8QFmHC_IU5QbUIZ8LCFeJqZ1mmZfGnR2TKzqI7Wn8UbkhXC0s27GRld-O20jb4aMDJmlY6uUk42oNrAeN2z55eJDlvJPJQAjzaD2pcZIbCYe5U-"
          />
          <div className="flex flex-col text-left">
            <h1 className="text-base font-bold text-white tracking-wide uppercase leading-tight">
              REGISTRASI WARGA RW 13
            </h1>
            <p className="text-[10px] text-slate-400 font-medium leading-snug uppercase">
              KELURAHAN MARGAHAYU KECAMATAN BEKASI TIMUR
            </p>
            <p className="text-[10px] text-slate-400 leading-snug">
              Jl. Cendrawasih Raya No. 1 RT. 007 RW. 013
            </p>
          </div>
        </header>
        {/* END: HeaderSection */}

        {/* Toast Notifikasi */}
        {toast && !isSuccess && (
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

        {/* BEGIN: Register Form Card */}
        <div
          className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl"
          data-purpose="form-card"
        >
          <form className="space-y-4" id="registerForm" onSubmit={handleSubmit}>
            {/* Field 1: Nama Lengkap */}
            <div>
              <label
                className="block text-sm font-medium text-slate-300 mb-1"
                htmlFor="nameInput"
              >
                Nama Lengkap
              </label>
              <input
                className={`w-full px-3 py-2 bg-slate-800 border ${
                  errors.fullName ? "border-red-500" : "border-slate-700"
                } rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                id="nameInput"
                name="fullName"
                placeholder="Contoh: Sari Wulandari"
                required
                type="text"
                value={formData.fullName}
                onChange={handleChange}
              />
              {errors.fullName && (
                <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Field 2: NIK / No. KTP */}
            <div>
              <label
                className="block text-sm font-medium text-slate-300 mb-1"
                htmlFor="nikInput"
              >
                NIK / No. KTP
              </label>
              <input
                className={`w-full px-3 py-2 bg-slate-800 border ${
                  errors.nik ? "border-red-500" : "border-slate-700"
                } rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm tracking-wider`}
                id="nikInput"
                maxLength={16}
                name="nik"
                placeholder="16 digit Nomor Induk Kependudukan"
                required
                type="text"
                value={formData.nik}
                onChange={handleChange}
              />
              <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
                {errors.nik ? (
                  <p className="text-red-400">{errors.nik}</p>
                ) : (
                  <span>Harus 16 digit angka</span>
                )}
                <span>{formData.nik.length}/16</span>
              </div>
            </div>

            {/* Field 3: Email / No. WhatsApp */}
            <div>
              <label
                className="block text-sm font-medium text-slate-300 mb-1"
                htmlFor="contactInput"
              >
                Email / No. WhatsApp
              </label>
              <input
                className={`w-full px-3 py-2 bg-slate-800 border ${
                  errors.contact ? "border-red-500" : "border-slate-700"
                } rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm`}
                id="contactInput"
                name="contact"
                placeholder="nama@email.com atau 0812..."
                required
                type="text"
                value={formData.contact}
                onChange={handleChange}
              />
              {errors.contact && (
                <p className="text-red-400 text-xs mt-1">{errors.contact}</p>
              )}
            </div>

            {/* Field 4: Password */}
            <div>
              <label
                className="block text-sm font-medium text-slate-300 mb-1"
                htmlFor="passwordInput"
              >
                Password
              </label>
              <div className="flex items-center space-x-2">
                <input
                  className={`w-full px-3 py-2 bg-slate-800 border ${
                    errors.password ? "border-red-500" : "border-slate-700"
                  } rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm tracking-wider`}
                  id="passwordInput"
                  name="password"
                  placeholder="Buat password akun"
                  required
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  aria-label="Tampilkan atau sembunyikan password"
                  className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors shrink-0 ${
                    showPassword
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-200"
                  }`}
                  id="togglePasswordBtn"
                  onClick={togglePasswordVisibility}
                  type="button"
                >
                  {showPassword ? "Tutup" : "Lihat"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Field 5: Konfirmasi Password */}
            <div>
              <label
                className="block text-sm font-medium text-slate-300 mb-1"
                htmlFor="confirmPasswordInput"
              >
                Konfirmasi Password
              </label>
              <div className="flex items-center space-x-2">
                <input
                  className={`w-full px-3 py-2 bg-slate-800 border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-slate-700"
                  } rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm tracking-wider`}
                  id="confirmPasswordInput"
                  name="confirmPassword"
                  placeholder="Ulangi password"
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  aria-label="Tampilkan atau sembunyikan konfirmasi password"
                  className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors shrink-0 ${
                    showConfirmPassword
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 hover:bg-slate-600 text-slate-200"
                  }`}
                  onClick={toggleConfirmPasswordVisibility}
                  type="button"
                >
                  {showConfirmPassword ? "Tutup" : "Lihat"}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Tombol Submit */}
            <div className="pt-2 text-center">
              <button
                className="w-full sm:w-auto px-6 py-2 bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white font-medium text-sm rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto space-x-2"
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
                <span>{isLoading ? "Mendaftarkan..." : "Daftar Sekarang"}</span>
              </button>
            </div>
          </form>

          {/* Feedback / Success Message inspired by sample */}
          {isSuccess && (
            <div
              className="mt-5 text-center text-sm font-medium text-emerald-400 transition-opacity duration-300 bg-emerald-950/40 border border-emerald-800/60 rounded-lg p-3"
              data-purpose="notification-area"
              id="feedbackMessage"
            >
              <p className="font-semibold">✓ Pendaftaran berhasil!</p>
              <p className="text-xs text-emerald-300/80 mt-1">
                Akun Anda tersimpan di database RW 13.
              </p>
              <p className="text-xs text-emerald-300/60 mt-0.5">
                Password telah dienkripsi secara otomatis (bcrypt).
              </p>
              <p className="text-xs text-slate-400 mt-1 animate-pulse">
                Mengalihkan ke halaman login...
              </p>
            </div>
          )}

          {/* Navigasi Masuk */}
          <div className="mt-4 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            <p>
              Sudah punya akun?{" "}
              <button
                type="button"
                onClick={onMasukKlik}
                className="text-blue-400 hover:text-blue-300 font-semibold underline decoration-slate-600 underline-offset-2 transition-colors cursor-pointer"
              >
                Masuk di sini
              </button>
            </p>
          </div>
        </div>
        {/* END: Register Form Card */}

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
