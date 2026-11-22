import { useState, useEffect } from "react";

type Props = {
  onLanjut: () => void;
  autoRedirect?: boolean;
};

export default function HalamanWelcome({
  onLanjut,
  autoRedirect = false,
}: Props) {
  const [progress, setProgress] = useState(45);
  const [statusText, setStatusText] = useState("Memverifikasi Sesi...");
  const [subtext, setSubtext] = useState("Mempersiapkan data administrasi RW 13...");
  const [isCompleted, setIsCompleted] = useState(false);

  // Animasi progress bar menyerupai script di code.html
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCompleted(true);
          setStatusText("Sesi Terverifikasi");
          setSubtext("Selamat datang kembali, siap menjelajahi data RW 13.");
          return 100;
        }
        const jump = Math.floor(Math.random() * 18) + 12;
        const next = Math.min(prev + jump, 100);
        if (next === 100) {
          setIsCompleted(true);
          setStatusText("Sesi Terverifikasi");
          setSubtext("Selamat datang kembali, siap menjelajahi data RW 13.");
        }
        return next;
      });
    }, 280);

    return () => clearInterval(interval);
  }, []);

  // Opsional auto-redirect ke halaman login jika diaktifkan
  useEffect(() => {
    if (isCompleted && autoRedirect) {
      const timer = setTimeout(() => {
        onLanjut();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, autoRedirect, onLanjut]);

  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center bg-[#090e17] text-slate-100 font-sans overflow-hidden p-4 select-none">
      {/* Definisi Keyframe Animasi Floating Emblem */}
      <style>{`
        @keyframes floatEmblem {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.03); }
        }
        .animate-float {
          animation: floatEmblem 3.6s ease-in-out infinite;
        }
      `}</style>

      {/* Dynamic Glowing Radial Ambient Lights */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center">
        <div className="w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
        <div
          className="absolute w-60 h-60 rounded-full bg-teal-400/10 blur-2xl animate-ping"
          style={{ animationDuration: "4s" }}
        />
      </div>

      {/* Top spacing */}
      <header className="w-full pt-4 text-center z-10" />

      {/* Center Stage: Emblem Aura & Floating Logo */}
      <main className="flex flex-col items-center justify-center my-auto z-10 w-full max-w-sm px-4 text-center">
        {/* Emblem Rings & Logo */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Pulsating / Orbiting Glow Rings */}
          <div
            className="absolute w-44 h-44 rounded-full border border-emerald-400/30 animate-spin"
            style={{ animationDuration: "16s" }}
          />
          <div
            className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-400/20 to-cyan-500/15 animate-pulse"
            style={{ animationDuration: "2.4s" }}
          />

          {/* Subtle Orbit Dots */}
          <div
            className="absolute w-48 h-48 rounded-full pointer-events-none animate-spin"
            style={{ animationDuration: "10s" }}
          >
            <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-sm ml-auto mr-4" />
          </div>

          {/* Elevated Card Ring Container with Float Animation */}
          <div
            className="relative w-36 h-36 flex items-center justify-center transition-all duration-700 ease-out animate-float"
            id="emblem-card"
          >
            <img
              alt="Logo Kota Patriot RW 13"
              className="w-32 h-auto object-contain drop-shadow-md select-none pointer-events-none"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuJzatn72zHGmFiTsh9-e60AZ0FybBDPJezNpAICA1oHUifKwCeUsbgOwo9YuRqHi3WePoutBTHfqLmNaF6gOBJwu_AT6LE_3-IM3CN5pFSWgFqM6fbiW2fDjDRAO48OSzGhQIV8fXFYrnseYZMBdCmdE3GL2tfJC7fNFtP336B9mE7JDgr-hFb9HRQTfALTDOSphAtLg4wkJg6htf2ObNhqY9amAlaQstBCT0icuz3mjuOed1BtYm"
            />
          </div>
        </div>

        {/* Typography & Slogans */}
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
            WELCOME
            <div className="text-xl sm:text-2xl font-semibold text-slate-200 mt-0.5">
              Rukun Warga 13
            </div>
          </h1>
          <p className="text-sm font-medium text-amber-400 italic mt-1">
            “Kita Bisa Ketika Bersama”
          </p>
        </div>

        {/* Status & Progress Indicators */}
        <div className="w-full bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 shadow-sm mb-6 flex flex-col items-center gap-2.5 transition-colors duration-300">
          <div className="flex items-center justify-between w-full text-xs">
            <span className="font-semibold text-slate-300">{statusText}</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                isCompleted
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-slate-700 text-slate-300"
              }`}
            >
              {progress}%
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-700/70 overflow-hidden relative">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
              id="progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            {subtext}
          </p>
        </div>

        {/* Action Button: Lanjut ke Halaman Login */}
        <button
          id="btn-continue"
          type="button"
          onClick={onLanjut}
          className={`w-full py-3.5 px-6 rounded-lg font-semibold text-sm shadow-md transition-all duration-200 transform active:scale-95 flex items-center justify-center gap-2 group cursor-pointer ${
            isCompleted
              ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50"
              : "bg-slate-700 hover:bg-slate-600 text-slate-200"
          }`}
        >
          <span>Login / Daftar</span>
          <svg
            className="w-4 h-4 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </main>

      {/* Civic Footer Note */}
      <footer className="mt-auto pb-4 z-10 w-full text-center px-4">
        <p className="text-xs text-slate-500">
          © 2026 Pengurus RW 13 Kel. Margahayu. Sistem Administrasi &amp; Data
          Kependudukan.
        </p>
      </footer>
    </div>
  );
}
