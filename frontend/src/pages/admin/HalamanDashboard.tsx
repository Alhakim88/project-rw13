import { useState, useMemo, useEffect } from "react";
import type { Pengguna } from "../data/pengguna";
import { INITIAL_WARGA_DATA } from "../data/wargaData";
import type { WargaRecord } from "../data/wargaData";
import {
  apiGetWarga,
  apiCekKoneksi,
  apiBuatAkun,
  apiEnkripsiUtil,
  ambilToken,
} from "../../services/api";

export type ModuleId =
  | "dashboard-utama"
  | "data-kependudukan"
  | "administrasi-surat"
  | "data-kelahiran"
  | "data-kematian"
  | "mutasi-masuk"
  | "mutasi-keluar"
  | "pengaturan"
  | "login";

export type HalamanDashboardProps = {
  pengguna?: Pengguna | null;
  onKeluar?: () => void;
  onKeBerandaUtama?: () => void;
  initialModule?: ModuleId;
};

// Tipe data permohonan surat masuk
type PermohonanSurat = {
  id: string;
  noReg: string;
  tglMasuk: string;
  nik: string;
  pemohon: string;
  rt: string;
  layananKode: string;
  layananNama: string;
  keperluan: string;
  status: "rt" | "rw" | "selesai" | "pending";
  statusText: string;
};

// Tipe data kelahiran
type KelahiranRecord = {
  id: number;
  namaBayi: string;
  gender: "Laki-Laki" | "Perempuan";
  tglLahir: string;
  orangTua: string;
  rt: string;
  statusAkta: string;
};

// Tipe data kematian
type KematianRecord = {
  id: number;
  nama: string;
  nik: string;
  tglMeninggal: string;
  usia: string;
  rt: string;
  lokasiMakam: string;
  statusSurat: string;
  noReg?: string;
  penyebab?: string;
  tempatMeninggal?: string;
};

// Tipe data mutasi masuk
type MutasiMasukRecord = {
  id: number;
  namaKK: string;
  asal: string;
  tujuan: string;
  jumlahJiwa: string;
  status: string;
};

// Tipe data mutasi keluar
type MutasiKeluarRecord = {
  id: number;
  nama: string;
  rtAsal: string;
  tujuan: string;
  alasan: string;
  status: string;
};

// Data Awal Permohonan Surat Masuk
const INITIAL_SURAT_DATA: PermohonanSurat[] = [
  {
    id: "1",
    noReg: "RW13-2026-0341",
    tglMasuk: "24 Mar 2026",
    nik: "3275031405620001",
    pemohon: "H. Syarifuddin",
    rt: "RT 01",
    layananKode: "SKD-01",
    layananNama: "Ket. Domisili Tinggal",
    keperluan: "Kelengkapan Berkas Pendaftaran Haji Reguler",
    status: "selesai",
    statusText: "Selesai / Terbit",
  },
  {
    id: "2",
    noReg: "RW13-2026-0342",
    tglMasuk: "24 Mar 2026",
    nik: "3275030807750004",
    pemohon: "Mahadir SH",
    rt: "RT 03",
    layananKode: "SKU-04",
    layananNama: "Ket. Usaha Mandiri",
    keperluan: "Pengajuan Tambahan Modal Usaha Kuliner BJB",
    status: "rw",
    statusText: "Verifikasi RW",
  },
  {
    id: "3",
    noReg: "RW13-2026-0343",
    tglMasuk: "23 Mar 2026",
    nik: "3275032109880007",
    pemohon: "Andi Muh. Ikbal",
    rt: "RT 02",
    layananKode: "SP-KTP-03",
    layananNama: "Pembaruan KK & e-KTP",
    keperluan: "Pembaruan Data Keluarga Baru Menikah",
    status: "rt",
    statusText: "Menunggu RT",
  },
  {
    id: "4",
    noReg: "RW13-2026-0344",
    tglMasuk: "23 Mar 2026",
    nik: "3275030403700009",
    pemohon: "Abdul Rahman",
    rt: "RT 05",
    layananKode: "SKTM-02",
    layananNama: "Ket. Tidak Mampu",
    keperluan: "Syarat KIP Kuliah Jalur Prestasi Anak",
    status: "selesai",
    statusText: "Selesai / Terbit",
  },
  {
    id: "5",
    noReg: "RW13-2026-0345",
    tglMasuk: "22 Mar 2026",
    nik: "3275034912920002",
    pemohon: "Karmila S.Pd",
    rt: "RT 04",
    layananKode: "SKCK-08",
    layananNama: "Catatan Berkelakuan Baik",
    keperluan: "Pemberkasan PPPK Guru Kemendikbud",
    status: "rw",
    statusText: "Verifikasi RW",
  },
  {
    id: "6",
    noReg: "RW13-2026-0346",
    tglMasuk: "22 Mar 2026",
    nik: "3275031102650005",
    pemohon: "Darmajid",
    rt: "RT 07",
    layananKode: "SKK-06",
    layananNama: "Keterangan Kematian",
    keperluan: "Pelaporan Meninggal Dunia Almh. Ny. Aminah",
    status: "selesai",
    statusText: "Selesai / Terbit",
  },
  {
    id: "7",
    noReg: "RW13-2026-0347",
    tglMasuk: "21 Mar 2026",
    nik: "3275031704900008",
    pemohon: "Ilyas Kurniawan",
    rt: "RT 06",
    layananKode: "SKP-07",
    layananNama: "Pindah Domisili Keluar",
    keperluan: "Pindah Domisili ke Kec. Cikarang Selatan",
    status: "pending",
    statusText: "Menunggu Berkas",
  },
  {
    id: "8",
    noReg: "RW13-2026-0348",
    tglMasuk: "20 Mar 2026",
    nik: "3275031911960003",
    pemohon: "Ali Adam",
    rt: "RT 08",
    layananKode: "SPN-05",
    layananNama: "Pengantar Nikah (N1-N4)",
    keperluan: "Pendaftaran Nikah di KUA Bekasi Timur",
    status: "selesai",
    statusText: "Selesai / Terbit",
  },
];

// Data Awal Kelahiran
const INITIAL_KELAHIRAN_DATA: KelahiranRecord[] = [
  {
    id: 1,
    namaBayi: "Muhammad Rayyan Al-Fatih",
    gender: "Laki-Laki",
    tglLahir: "18 Mar 2026",
    orangTua: "Ahmad Fauzi & Nur Laila",
    rt: "RT 03",
    statusAkta: "Terbit Akta",
  },
  {
    id: 2,
    namaBayi: "Aqeela Shaheen Humaira",
    gender: "Perempuan",
    tglLahir: "12 Mar 2026",
    orangTua: "Rizky Pratama & Sarah D.",
    rt: "RT 07",
    statusAkta: "Verifikasi Capil",
  },
];

// Data Awal Kematian
const INITIAL_KEMATIAN_DATA: KematianRecord[] = [
  {
    id: 1,
    nama: "Almh. Hj. Aminah binti Hasan",
    nik: "3275035502470001",
    tglMeninggal: "21 Mar 2026",
    usia: "79 Tahun",
    rt: "RT 07",
    lokasiMakam: "TPU Padurenan, Bekasi",
    statusSurat: "Selesai / Terbit",
    noReg: "RW13-SKK-2026-0007",
    penyebab: "Penyakit Usia Lanjut (Geriatri)",
    tempatMeninggal: "Rumah Duka",
  },
  {
    id: 2,
    nama: "Alm. Bpk. Rusli Wardana",
    nik: "3275031208530006",
    tglMeninggal: "14 Mar 2026",
    usia: "72 Tahun",
    rt: "RT 02",
    lokasiMakam: "TPU Perwira Bekasi Utara",
    statusSurat: "Selesai / Terbit",
    noReg: "RW13-SKK-2026-0006",
    penyebab: "Serangan Jantung",
    tempatMeninggal: "RSUD dr. Chasbullah",
  },
];

// Data Awal Mutasi Masuk
const INITIAL_MUTASI_MASUK: MutasiMasukRecord[] = [
  {
    id: 1,
    namaKK: "Bambang Setyadi",
    asal: "Kec. Duren Sawit, Jakarta Timur",
    tujuan: "RT 04 / Blok B3 No. 12",
    jumlahJiwa: "4 Orang",
    status: "Disetujui Ketua RW",
  },
  {
    id: 2,
    namaKK: "Hendrawan Nugroho",
    asal: "Kec. Tambun Selatan, Kab. Bekasi",
    tujuan: "RT 08 / Blok E1 No. 04",
    jumlahJiwa: "3 Orang",
    status: "Menunggu Tinjauan RT",
  },
];

// Data Awal Mutasi Keluar
const INITIAL_MUTASI_KELUAR: MutasiKeluarRecord[] = [
  {
    id: 1,
    nama: "Ilyas Kurniawan",
    rtAsal: "RT 06",
    tujuan: "Kec. Cikarang Selatan, Kab. Bekasi",
    alasan: "Tugas Pekerjaan / Mutasi Kantor",
    status: "Menunggu Berkas KK Asli",
  },
  {
    id: 2,
    nama: "Dewi Anggraini",
    rtAsal: "RT 01",
    tujuan: "Kec. Cibinong, Kab. Bogor",
    alasan: "Mengikuti Suami / Rumah Sendiri",
    status: "Selesai / Terbit",
  },
];

export default function HalamanDashboard({
  pengguna,
  onKeluar,
  onKeBerandaUtama,
  initialModule = "data-kependudukan",
}: HalamanDashboardProps) {
  // Navigation & UI States
  const [activeModule, setActiveModule] = useState<ModuleId>(initialModule);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(
    "✓ Sukses! Sistem Dasbor RW 13 Margahayu Aktif & Terverifikasi."
  );

  // Warga Database States
  const [wargaList, setWargaList] = useState<WargaRecord[]>(INITIAL_WARGA_DATA);
  const [wargaSearch, setWargaSearch] = useState("");
  const [selectedRT, setSelectedRT] = useState("");
  const [selectedSHDK, setSelectedSHDK] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedKawin, setSelectedKawin] = useState("");
  const [wargaPage, setWargaPage] = useState(1);
  const wargaPageSize = 15;

  // Database MySQL & Akun Management States
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [dbInfo, setDbInfo] = useState<string>("Memeriksa sinkronisasi MySQL...");

  // Form Pembuatan Akun Baru (Enkripsi Otomatis)
  const [newAkunNama, setNewAkunNama] = useState("");
  const [newAkunNik, setNewAkunNik] = useState("");
  const [newAkunContact, setNewAkunContact] = useState("");
  const [newAkunPassword, setNewAkunPassword] = useState("");
  const [newAkunPeran, setNewAkunPeran] = useState<"admin" | "ketua_rw" | "ketua_rt" | "warga">("warga");
  const [newAkunRt, setNewAkunRt] = useState("RT 01");
  const [newAkunLoading, setNewAkunLoading] = useState(false);
  const [newAkunMsg, setNewAkunMsg] = useState<{ text: string; sukses: boolean } | null>(null);

  // Generator Bcrypt untuk MySQL Workbench
  const [genPassInput, setGenPassInput] = useState("");
  const [genPassResult, setGenPassResult] = useState<{ hash: string; sqlQuery: string } | null>(null);
  const [genPassLoading, setGenPassLoading] = useState(false);

  // Sinkronisasi data live dari MySQL Backend
  useEffect(() => {
    let mounted = true;
    apiCekKoneksi()
      .then((status) => {
        if (!mounted) return;
        if (status.database && status.database.connected) {
          setDbConnected(true);
          setDbInfo(`✓ MySQL Terhubung (${status.database.database} @ ${status.database.host}:${status.database.port})`);
          if (ambilToken()) {
            apiGetWarga({ limit: 150 })
              .then((res) => {
                if (mounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
                  setWargaList(res.data as WargaRecord[]);
                }
              })
              .catch(() => {});
          }
        } else {
          setDbConnected(false);
          setDbInfo("⚠️ MySQL belum terhubung. Menggunakan data lokal (Offline).");
        }
      })
      .catch(() => {
        if (!mounted) return;
        setDbConnected(false);
        setDbInfo("⚠️ Backend offline (http://localhost:5000). Menggunakan data lokal.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Selected Warga for Detail & Edit
  const [detailWarga, setDetailWarga] = useState<WargaRecord | null>(null);
  const [isTambahWargaOpen, setIsTambahWargaOpen] = useState(false);

  // Surat States
  const [suratList, setSuratList] = useState<PermohonanSurat[]>(INITIAL_SURAT_DATA);
  const [suratSearch, setSuratSearch] = useState("");
  const [suratStatusFilter, setSuratStatusFilter] = useState("");
  const [suratRTFilter, setSuratRTFilter] = useState("");
  const [isAjukanSuratOpen, setIsAjukanSuratOpen] = useState(false);
  const [selectedLayananKode, setSelectedLayananKode] = useState("SKD-01");

  // Kelahiran States
  const [kelahiranList, setKelahiranList] = useState<KelahiranRecord[]>(INITIAL_KELAHIRAN_DATA);
  const [isLaporKelahiranOpen, setIsLaporKelahiranOpen] = useState(false);

  // Kematian States
  const [kematianList, setKematianList] = useState<KematianRecord[]>(INITIAL_KEMATIAN_DATA);
  const [isLaporKematianOpen, setIsLaporKematianOpen] = useState(false);
  const [previewSuratJalan, setPreviewSuratJalan] = useState<KematianRecord | null>(null);
  const [berkasKematian, setBerkasKematian] = useState<KematianRecord | null>(null);

  // Mutasi Keluar States
  const [mutasiKeluarList, setMutasiKeluarList] = useState<MutasiKeluarRecord[]>(INITIAL_MUTASI_KELUAR);
  const [isMutasiKeluarOpen, setIsMutasiKeluarOpen] = useState(false);

  // Settings States
  const [ketuaNama, setKetuaNama] = useState("Drs. H. M. Syarifuddin, M.Si");
  const [poskoAlamat, setPoskoAlamat] = useState("Jl. Cendrawasih Raya No. 1 RT. 007 RW. 013, Margahayu, Bekasi Timur");
  const [waPelayanan, setWaPelayanan] = useState("0822-9991-1002");
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [saveSettingNotif, setSaveSettingNotif] = useState(false);

  // Helper untuk menampilkan toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Kalkulasi Statistik Warga secara dinamis
  const totalWarga = wargaList.length;
  const totalKK = useMemo(() => wargaList.filter((w) => w.shdk === "Kepala Keluarga").length, [wargaList]);
  const totalLaki = useMemo(() => wargaList.filter((w) => w.gender === "L").length, [wargaList]);
  const totalPerempuan = useMemo(() => wargaList.filter((w) => w.gender === "P").length, [wargaList]);

  // Filter Data Warga
  const filteredWarga = useMemo(() => {
    return wargaList.filter((w) => {
      if (selectedRT && w.rt !== `RT ${selectedRT}`) return false;
      if (selectedSHDK && w.shdk !== selectedSHDK) return false;
      if (selectedGender && w.gender !== selectedGender) return false;
      if (selectedKawin && w.kawin !== selectedKawin) return false;
      if (wargaSearch) {
        const query = wargaSearch.toLowerCase();
        const cocokNama = w.nama.toLowerCase().includes(query);
        const cocokLahir = w.tempatLahir.toLowerCase().includes(query);
        const cocokKerja = w.pekerjaan.toLowerCase().includes(query);
        if (!cocokNama && !cocokLahir && !cocokKerja) return false;
      }
      return true;
    });
  }, [wargaList, selectedRT, selectedSHDK, selectedGender, selectedKawin, wargaSearch]);

  // Paginated Data Warga
  const totalWargaPages = Math.max(1, Math.ceil(filteredWarga.length / wargaPageSize));
  const currentWargaData = useMemo(() => {
    const start = (wargaPage - 1) * wargaPageSize;
    return filteredWarga.slice(start, start + wargaPageSize);
  }, [filteredWarga, wargaPage]);

  // Filter Data Surat Masuk
  const filteredSurat = useMemo(() => {
    return suratList.filter((s) => {
      if (suratStatusFilter && s.status !== suratStatusFilter) return false;
      if (suratRTFilter && s.rt !== `RT ${suratRTFilter}`) return false;
      if (suratSearch) {
        const query = suratSearch.toLowerCase();
        const matchPemohon = s.pemohon.toLowerCase().includes(query);
        const matchNIK = s.nik.toLowerCase().includes(query);
        const matchNoReg = s.noReg.toLowerCase().includes(query);
        if (!matchPemohon && !matchNIK && !matchNoReg) return false;
      }
      return true;
    });
  }, [suratList, suratStatusFilter, suratRTFilter, suratSearch]);

  // Handlers untuk Tambah Warga
  const handleTambahWarga = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const nama = (formData.get("nama") as string)?.trim() || "Warga Baru";
    const rt = (formData.get("rt") as string) || "RT 01";
    const gender = (formData.get("gender") as "L" | "P") || "L";
    const tempatLahir = (formData.get("tempatLahir") as string)?.trim() || "Bekasi";
    const usiaVal = parseInt(formData.get("usia") as string, 10) || 28;
    const agama = (formData.get("agama") as string) || "Islam";
    const pendidikan = (formData.get("pendidikan") as string) || "SLTA";
    const pekerjaan = (formData.get("pekerjaan") as string)?.trim() || "Karyawan Swasta";
    const kawin = (formData.get("kawin") as WargaRecord["kawin"]) || "Kawin";
    const shdk = (formData.get("shdk") as WargaRecord["shdk"]) || "Kepala Keluarga";

    const rtMap: Record<string, string> = {
      "RT 01": "Nurdin",
      "RT 02": "Baco",
      "RT 03": "Ahmad",
      "RT 04": "Imron",
      "RT 05": "Darman",
      "RT 06": "Joko",
      "RT 07": "Wowo",
      "RT 08": "Tedi",
      "RT 09": "Dian S",
    };

    const newRecord: WargaRecord = {
      no: wargaList.length + 1,
      rw: "RW 13",
      rt,
      namaRt: rtMap[rt] || "Pengurus RT",
      nama,
      shdk,
      gender,
      tempatLahir,
      usia: usiaVal,
      agama,
      pendidikan,
      pekerjaan,
      kawin,
    };

    setWargaList([newRecord, ...wargaList]);
    setIsTambahWargaOpen(false);
    triggerToast(`✓ Sukses! Warga an. ${nama} (${rt} / RW 13) berhasil disimpan ke Database.`);
  };

  // Handler Hapus Warga
  const handleHapusWarga = (no: number) => {
    const item = wargaList.find((w) => w.no === no);
    if (!item) return;
    if (window.confirm(`Apakah Anda yakin ingin menghapus data warga #${no} (${item.nama})?`)) {
      setWargaList(wargaList.filter((w) => w.no !== no));
      triggerToast(`Data warga an. ${item.nama} telah dihapus.`);
    }
  };

  // Handler Edit Warga
  const handleEditWarga = (no: number) => {
    const item = wargaList.find((w) => w.no === no);
    if (!item) return;
    const newName = window.prompt("Ubah Nama Lengkap Warga:", item.nama);
    if (newName && newName.trim() && newName.trim() !== item.nama) {
      setWargaList(
        wargaList.map((w) => (w.no === no ? { ...w, nama: newName.trim() } : w))
      );
      triggerToast(`Data warga #${no} berhasil diperbarui menjadi ${newName.trim()}.`);
    }
  };

  // Handler Lapor Kelahiran
  const handleLaporKelahiran = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const namaBayi = (formData.get("namaBayi") as string)?.trim() || "Bayi Baru";
    const gender = (formData.get("gender") as "Laki-Laki" | "Perempuan") || "Laki-Laki";
    const orangTua = (formData.get("orangTua") as string)?.trim() || "Orang Tua";
    const rt = (formData.get("rt") as string) || "RT 03";

    const newBayi: KelahiranRecord = {
      id: kelahiranList.length + 1,
      namaBayi,
      gender,
      tglLahir: "Hari ini, 2026",
      orangTua,
      rt,
      statusAkta: "Verifikasi Capil",
    };

    setKelahiranList([newBayi, ...kelahiranList]);
    setIsLaporKelahiranOpen(false);
    triggerToast(`✓ Sukses! Kelahiran ${namaBayi} tercatat dan didaftarkan ke sistem Akta RW 13.`);
  };

  // Handler Lapor Kematian
  const handleLaporKematian = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const nama = (formData.get("nama") as string)?.trim() || "Almarhum / Almarhumah";
    const nik = (formData.get("nik") as string)?.trim() || "327503xxxxxxx";
    const usia = (formData.get("usia") as string)?.trim() || "70 Tahun";
    const rt = (formData.get("rt") as string) || "RT 07";
    const lokasiMakam = (formData.get("lokasiMakam") as string) || "TPU Padurenan, Bekasi";

    const newKematian: KematianRecord = {
      id: kematianList.length + 1,
      nama,
      nik,
      tglMeninggal: "Hari ini, 2026",
      usia,
      rt,
      lokasiMakam,
      statusSurat: "Selesai / Terbit",
      noReg: `RW13-SKK-2026-000${kematianList.length + 1}`,
      penyebab: "Usia Lanjut",
      tempatMeninggal: "Rumah Duka",
    };

    setKematianList([newKematian, ...kematianList]);
    setIsLaporKematianOpen(false);
    triggerToast(`✓ Sukses! Pelaporan kematian ${nama} telah disimpan & pengantar pemakaman diterbitkan.`);
  };

  // Handler Ajukan Surat Baru
  const handleAjukanSurat = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const pemohon = (formData.get("pemohon") as string)?.trim() || "Pemohon";
    const nik = (formData.get("nik") as string)?.trim() || "327503xxxxxxx";
    const rt = (formData.get("rt") as string) || "RT 01";
    const layananKode = (formData.get("layananKode") as string) || "SKD-01";
    const keperluan = (formData.get("keperluan") as string)?.trim() || "Pengantar Dokumen";

    const layananMap: Record<string, string> = {
      "SKD-01": "Ket. Domisili Tinggal",
      "SKTM-02": "Ket. Tidak Mampu",
      "SP-KTP-03": "Pembaruan KK & KTP",
      "SKU-04": "Ket. Usaha Mandiri",
      "SPN-05": "Pengantar Nikah (N1-N4)",
      "SKK-06": "Keterangan Kematian",
      "SKP-07": "Pindah Domisili Keluar",
      "SKCK-08": "Catatan Berkelakuan Baik",
    };

    const newSurat: PermohonanSurat = {
      id: String(suratList.length + 1),
      noReg: `RW13-2026-034${suratList.length + 1}`,
      tglMasuk: "Hari ini, 2026",
      nik,
      pemohon,
      rt,
      layananKode,
      layananNama: layananMap[layananKode] || "Surat Keterangan",
      keperluan,
      status: "rw",
      statusText: "Verifikasi RW",
    };

    setSuratList([newSurat, ...suratList]);
    setIsAjukanSuratOpen(false);
    triggerToast(`✓ Permohonan surat pengantar an. ${pemohon} (${layananKode}) berhasil diajukan.`);
  };

  // Handler Ajukan Mutasi Keluar
  const handleAjukanMutasiKeluar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const nama = (formData.get("nama") as string)?.trim() || "Pemohon Pindah";
    const rtAsal = (formData.get("rtAsal") as string) || "RT 01";
    const tujuan = (formData.get("tujuan") as string)?.trim() || "Luar Kota Bekasi";
    const alasan = (formData.get("alasan") as string) || "Tugas Pekerjaan";

    const newMutasi: MutasiKeluarRecord = {
      id: mutasiKeluarList.length + 1,
      nama,
      rtAsal,
      tujuan,
      alasan,
      status: "Selesai / Terbit",
    };

    setMutasiKeluarList([newMutasi, ...mutasiKeluarList]);
    setIsMutasiKeluarOpen(false);
    triggerToast(`✓ Permohonan mutasi pindah an. ${nama} disimpan & SKPWNI diterbitkan.`);
  };

  // Handler Simpan Pengaturan
  const handleSimpanPengaturan = () => {
    setSaveSettingNotif(true);
    triggerToast("✓ Pengaturan sistem dan profil Ketua RW 13 berhasil diperbarui!");
    setTimeout(() => {
      setSaveSettingNotif(false);
    }, 3500);
  };

  // Handler Ganti Tema Tampilan
  const handleSwitchTheme = (mode: "dark" | "light") => {
    setThemeMode(mode);
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    triggerToast(`✓ Beralih ke Mode ${mode === "dark" ? "Gelap" : "Terang"} berhasil disimpan.`);
  };

  // Handler Buat Akun Baru (Password Otomatis Terenkripsi Bcrypt di MySQL)
  const handleBuatAkunBaru = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAkunNama.trim() || !newAkunPassword.trim()) {
      setNewAkunMsg({ text: "Nama dan Password wajib diisi.", sukses: false });
      return;
    }
    if (newAkunPassword.length < 6) {
      setNewAkunMsg({ text: "Password minimal 6 karakter.", sukses: false });
      return;
    }

    setNewAkunLoading(true);
    setNewAkunMsg(null);

    try {
      await apiBuatAkun({
        nama: newAkunNama.trim(),
        nik: newAkunNik.trim() || undefined,
        email: newAkunContact.includes("@") ? newAkunContact.trim() : undefined,
        no_hp: !newAkunContact.includes("@") && newAkunContact.trim() ? newAkunContact.trim() : undefined,
        password: newAkunPassword,
        peran: newAkunPeran,
        rt: newAkunPeran === "ketua_rt" ? newAkunRt : undefined,
      });

      setNewAkunLoading(false);
      setNewAkunMsg({
        text: `✓ Akun ${newAkunNama} (${newAkunPeran}) berhasil dibuat! Password otomatis dienkripsi dengan standar Bcrypt dan tersimpan di MySQL rw13_db.`,
        sukses: true,
      });
      triggerToast(`✓ Akun ${newAkunNama} berhasil didaftarkan ke MySQL.`);
      setNewAkunNama("");
      setNewAkunNik("");
      setNewAkunContact("");
      setNewAkunPassword("");
    } catch (err: unknown) {
      setNewAkunLoading(false);
      const msg = err instanceof Error ? err.message : "Gagal membuat akun.";
      setNewAkunMsg({ text: msg, sukses: false });
    }
  };

  // Handler Generate Bcrypt Hash untuk MySQL Workbench
  const handleGenerateBcrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genPassInput.trim()) return;

    setGenPassLoading(true);
    try {
      const res = await apiEnkripsiUtil(genPassInput.trim());
      setGenPassLoading(false);
      if (res.success && res.hash) {
        setGenPassResult({
          hash: res.hash as string,
          sqlQuery: (res.sqlQuery as string) || `UPDATE pengguna SET password = '${res.hash}' WHERE id = 1;`,
        });
        triggerToast("✓ Hash Bcrypt dan Query MySQL Workbench berhasil dibuat!");
      }
    } catch {
      setGenPassLoading(false);
      triggerToast("⚠️ Pastikan backend server aktif untuk menjalankan generator Bcrypt.");
    }
  };

  return (
    <div className={`min-h-screen ${themeMode === "dark" ? "bg-[#0b1120] text-[#f1f5f9]" : "bg-[#f8fafc] text-[#0f172a]"} font-sans antialiased transition-colors duration-200`}>
      {/* ======================================================== */}
      {/* 1. TOP HEADER APP BAR */}
      {/* ======================================================== */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${themeMode === "dark" ? "bg-[#0e1628]/95 border-slate-800" : "bg-white/95 border-slate-200"} backdrop-blur-md border-b shadow-md transition-colors`}>
        <div className="min-h-20 py-2 w-full px-4 sm:px-6 md:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Hamburger Toggle Sidebar */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-white transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm cursor-pointer border border-emerald-500/30"
              title="Buka / Tutup Sidebar"
              type="button"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo Kota Bekasi */}
            <div className="w-12 h-12 flex items-center justify-center shrink-0 bg-transparent">
              <img
                alt="Logo Kota Bekasi"
                className="h-12 w-auto object-contain shrink-0 drop-shadow-md"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmJjSRav97oZCGrDOBLZiRK4HHWhESu8ZWzTu623TWx749yu3S-TD5ZlcuBrsZkgqwEPSoh-qnyvrUusA1IeRy38YWsDMoW83HZ-cTb4SWcwoo4JKzDPPhfOsn8Q1JYBpxNiuz_-RZGbcPWkgzzglGotiTqoNUEPBy1AThvSdQUDGMj2HSmV8scW_XMiM-_gbPlKWoPu_WnIXJQVG9bgl1OkIckTaD0DsuFHCiCrHrh7JFiXNADanY"
                style={{ maxHeight: "48px", width: "auto" }}
              />
            </div>

            {/* Title & Organization Info */}
            <div className="flex flex-col">
              <h1 className={`text-sm md:text-base font-bold ${themeMode === "dark" ? "text-white" : "text-slate-900"} tracking-wide uppercase leading-tight`}>
                PEMERINTAH KOTA BEKASI RUKUN WARGA 13
              </h1>
              <span className="text-xs md:text-sm font-bold text-rose-500 tracking-wide uppercase leading-tight">
                KELURAHAN MARGAHAYU, KECAMATAN BEKASI TIMUR
              </span>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap mt-0.5">
                <span>
                  <span className="material-symbols-outlined text-[13px] inline align-middle text-rose-500 mr-1">location_on</span>
                  Jl. Cendrawasih Raya No. 1 RT. 007 RW. 013
                </span>
                <span className="hidden sm:inline">•</span>
                <span>
                  <span className="material-symbols-outlined text-[13px] inline align-middle text-emerald-500 mr-1">call</span>
                  Telp: {waPelayanan}
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-3">
            <div className={`hidden md:flex flex-col items-end px-3 py-1 ${themeMode === "dark" ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"} border rounded-lg shadow-sm leading-tight`}>
              <span className="text-[12px] font-bold text-white">
                {pengguna ? pengguna.nama : "Ketua RW 13"}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Online
              </span>
            </div>

            {/* Quick button to go back to Beranda Utama */}
            {onKeBerandaUtama && (
              <button
                type="button"
                onClick={onKeBerandaUtama}
                title="Buka Beranda Utama"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">dashboard_customize</span>
                <span>Portal Utama</span>
              </button>
            )}

            {/* Logout Trigger Button */}
            <button
              type="button"
              onClick={() => setActiveModule("login")}
              title="Keluar Sesi"
              className="w-9 h-9 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white flex items-center justify-center transition-colors border border-rose-500/30 shadow-sm cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. SUCCESS FLOATING TOAST NOTIFICATION */}
      {/* ======================================================== */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 p-4 bg-slate-900 border-2 border-emerald-500 rounded-xl shadow-2xl transition-all duration-300 transform scale-100 max-w-md">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <div className="flex flex-col">
            <h4 className="text-xs font-bold text-white">Notifikasi Sistem Administrasi</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-snug">{toastMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer ml-auto"
            title="Tutup Notifikasi"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SIDEBAR NAVIGATION PANEL */}
      {/* ======================================================== */}
      <aside
        className={`fixed left-0 top-20 bottom-0 w-64 ${themeMode === "dark" ? "bg-[#0f172a] border-slate-800" : "bg-white border-slate-200"} border-r shadow-xl z-40 flex flex-col justify-between py-4 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-2">
          <div className="px-4 pb-2 flex items-center justify-between border-b border-slate-800/40">
            <div className="flex items-center gap-2">
              <button
                className="p-1 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
                onClick={() => setIsSidebarOpen(false)}
                title="Sembunyikan Sidebar"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">menu_open</span>
              </button>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                Menu Administrasi RW 13
              </span>
            </div>
          </div>

          <nav className="flex flex-col gap-1 px-2.5">
            {/* 1. Beranda Utama */}
            <button
              type="button"
              onClick={() => {
                if (onKeBerandaUtama) {
                  onKeBerandaUtama();
                } else {
                  setActiveModule("dashboard-utama");
                }
              }}
              className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeModule === "dashboard-utama"
                  ? "bg-emerald-600 text-white font-bold shadow-md"
                  : "text-slate-400 hover:bg-slate-800 hover:text-emerald-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">home</span>
                <span>Beranda Utama</span>
              </div>
              <span className={`w-1.5 h-4 rounded-full bg-white transition-opacity ${activeModule === "dashboard-utama" ? "opacity-100" : "opacity-0"}`}></span>
            </button>

            {/* 2. Database Kependudukan */}
            <button
              type="button"
              onClick={() => setActiveModule("data-kependudukan")}
              className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeModule === "data-kependudukan"
                  ? "bg-emerald-600 text-white font-bold shadow-md"
                  : "text-slate-400 hover:bg-slate-800 hover:text-emerald-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">group</span>
                <span>Database Kependudukan</span>
              </div>
              <span className={`w-1.5 h-4 rounded-full bg-white transition-opacity ${activeModule === "data-kependudukan" ? "opacity-100" : "opacity-0"}`}></span>
            </button>

            {/* 3. Pelayanan Surat */}
            <button
              type="button"
              onClick={() => setActiveModule("administrasi-surat")}
              className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeModule === "administrasi-surat"
                  ? "bg-emerald-600 text-white font-bold shadow-md"
                  : "text-slate-400 hover:bg-slate-800 hover:text-emerald-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">description</span>
                <span>Pelayanan Surat</span>
              </div>
              <span className={`w-1.5 h-4 rounded-full bg-white transition-opacity ${activeModule === "administrasi-surat" ? "opacity-100" : "opacity-0"}`}></span>
            </button>

            {/* 4. Data Kelahiran */}
            <button
              type="button"
              onClick={() => setActiveModule("data-kelahiran")}
              className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeModule === "data-kelahiran"
                  ? "bg-emerald-600 text-white font-bold shadow-md"
                  : "text-slate-400 hover:bg-slate-800 hover:text-emerald-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">child_care</span>
                <span>Data Kelahiran</span>
              </div>
              <span className={`w-1.5 h-4 rounded-full bg-white transition-opacity ${activeModule === "data-kelahiran" ? "opacity-100" : "opacity-0"}`}></span>
            </button>

            {/* 5. Data Kematian */}
            <button
              type="button"
              onClick={() => setActiveModule("data-kematian")}
              className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeModule === "data-kematian"
                  ? "bg-emerald-600 text-white font-bold shadow-md"
                  : "text-slate-400 hover:bg-slate-800 hover:text-emerald-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">sentiment_dissatisfied</span>
                <span>Data Kematian</span>
              </div>
              <span className={`w-1.5 h-4 rounded-full bg-white transition-opacity ${activeModule === "data-kematian" ? "opacity-100" : "opacity-0"}`}></span>
            </button>

            {/* 6. Mutasi Masuk */}
            <button
              type="button"
              onClick={() => setActiveModule("mutasi-masuk")}
              className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeModule === "mutasi-masuk"
                  ? "bg-emerald-600 text-white font-bold shadow-md"
                  : "text-slate-400 hover:bg-slate-800 hover:text-emerald-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">person_add</span>
                <span>Mutasi Masuk</span>
              </div>
              <span className={`w-1.5 h-4 rounded-full bg-white transition-opacity ${activeModule === "mutasi-masuk" ? "opacity-100" : "opacity-0"}`}></span>
            </button>

            {/* 7. Mutasi Keluar */}
            <button
              type="button"
              onClick={() => setActiveModule("mutasi-keluar")}
              className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeModule === "mutasi-keluar"
                  ? "bg-emerald-600 text-white font-bold shadow-md"
                  : "text-slate-400 hover:bg-slate-800 hover:text-emerald-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">person_remove</span>
                <span>Mutasi Keluar</span>
              </div>
              <span className={`w-1.5 h-4 rounded-full bg-white transition-opacity ${activeModule === "mutasi-keluar" ? "opacity-100" : "opacity-0"}`}></span>
            </button>

            {/* 8. Pengaturan */}
            <button
              type="button"
              onClick={() => setActiveModule("pengaturan")}
              className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                activeModule === "pengaturan"
                  ? "bg-emerald-600 text-white font-bold shadow-md"
                  : "text-slate-400 hover:bg-slate-800 hover:text-emerald-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">settings</span>
                <span>Pengaturan</span>
              </div>
              <span className={`w-1.5 h-4 rounded-full bg-white transition-opacity ${activeModule === "pengaturan" ? "opacity-100" : "opacity-0"}`}></span>
            </button>

            {/* 9. Keluar Sesi */}
            <button
              type="button"
              onClick={() => setActiveModule("login")}
              className={`group flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer text-rose-400 hover:bg-rose-500/20 ${
                activeModule === "login" ? "bg-rose-500/30 font-bold border border-rose-500/50" : ""
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">logout</span>
                <span>Keluar</span>
              </div>
              <span className={`w-1.5 h-4 rounded-full bg-rose-500 transition-opacity ${activeModule === "login" ? "opacity-100" : "opacity-0"}`}></span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="px-4 py-2 border-t border-slate-800/40 text-[10px] text-slate-500">
          <span>Kel. Margahayu • Bekasi Timur</span>
          <div className="text-[9px] text-slate-600">Versi Sistem 2.4.0 (2026)</div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 4. MAIN CONTENT AREA */}
      {/* ======================================================== */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "lg:pl-64" : "pl-0"
        } w-full min-w-0 flex-1 overflow-x-hidden`}
      >
        <main className="w-full min-w-0 pt-24 px-4 sm:px-6 md:px-8 pb-12 min-h-[calc(100vh-80px)]">
          {/* Identity Header Bar */}
          <section className="w-full bg-[#1e293b] text-[#f8fafc] border border-slate-700/60 rounded-xl shadow-md p-4 mb-6 flex flex-col xl:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full xl:w-auto">
              <div className="w-12 h-12 shrink-0 flex items-center justify-center bg-transparent">
                <img
                  alt="Logo Kota Bekasi"
                  className="h-10 w-auto object-contain shrink-0"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmJjSRav97oZCGrDOBLZiRK4HHWhESu8ZWzTu623TWx749yu3S-TD5ZlcuBrsZkgqwEPSoh-qnyvrUusA1IeRy38YWsDMoW83HZ-cTb4SWcwoo4JKzDPPhfOsn8Q1JYBpxNiuz_-RZGbcPWkgzzglGotiTqoNUEPBy1AThvSdQUDGMj2HSmV8scW_XMiM-_gbPlKWoPu_WnIXJQVG9bgl1OkIckTaD0DsuFHCiCrHrh7JFiXNADanY"
                  style={{ maxHeight: "40px", width: "auto" }}
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Pemerintah Kota Bekasi</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs uppercase tracking-wider text-slate-300 font-bold">Rukun Warga 13</span>
                </div>
                <h2 className="text-base sm:text-lg text-white font-bold leading-tight">
                  SEKRETARIAT POSKO PERSURATAN &amp; ADMINISTRASI
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {poskoAlamat} | Telp/WA: {waPelayanan}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full xl:w-auto justify-end flex-wrap">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Cetak Halaman</span>
              </button>
            </div>
          </section>

          {/* ======================================================== */}
          {/* MODULE: DATABASE KEPENDUDUKAN */}
          {/* ======================================================== */}
          {activeModule === "data-kependudukan" && (
            <div>
              {/* Hero Banner */}
              <section className="w-full bg-[#1e293b] border border-slate-700/60 rounded-xl shadow-sm p-6 mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="max-w-3xl flex flex-col">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full w-fit mb-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[16px]">badge</span>
                    <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                      DATA REGISTRASI KEPENDUDUKAN
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    DATABASE KEPENDUDUKAN
                  </h1>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    Pangkalan data lengkap seluruh warga RT 01 s/d RT 09 Kelurahan Margahayu, Bekasi Timur.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto">
                  <button
                    onClick={() => setIsTambahWargaOpen(true)}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-all ring-2 ring-emerald-400 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    <span>+ TAMBAH WARGA</span>
                  </button>
                  <button
                    onClick={() => triggerToast("Mengekspor 99 data warga ke format Excel/CSV...")}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-700"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>Export Excel / CSV</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer border border-slate-700"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">print</span>
                    <span>Cetak Rekap</span>
                  </button>
                </div>
              </section>

              {/* 4 Metric KPI Cards */}
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#1e293b] border border-slate-700/60 rounded-xl p-4 shadow-sm flex flex-col justify-between border-l-4 border-l-emerald-500">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">TOTAL TERDATA (RW 13)</span>
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <span className="material-symbols-outlined text-[22px]">groups</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white leading-none">{totalWarga}</span>
                    <span className="text-xs text-slate-400">Jiwa</span>
                  </div>
                  <div className="mt-3 pt-2 text-xs text-emerald-400 font-semibold flex items-center gap-1 border-t border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    9 Rukun Tetangga (RT 01 - RT 09)
                  </div>
                </div>

                <div className="bg-[#1e293b] border border-slate-700/60 rounded-xl p-4 shadow-sm flex flex-col justify-between border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">KEPALA KELUARGA (KK)</span>
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <span className="material-symbols-outlined text-[22px]">home</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-400 leading-none">{totalKK}</span>
                    <span className="text-xs text-slate-400">KK</span>
                  </div>
                  <div className="mt-3 pt-2 text-xs text-slate-400 border-t border-slate-800">
                    {totalKK} Kepala Keluarga terdaftar
                  </div>
                </div>

                <div className="bg-[#1e293b] border border-slate-700/60 rounded-xl p-4 shadow-sm flex flex-col justify-between border-l-4 border-l-emerald-500">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">LAKI-LAKI</span>
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <span className="material-symbols-outlined text-[22px]">male</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-emerald-400 leading-none">{totalLaki}</span>
                    <span className="text-xs text-slate-400">Orang</span>
                  </div>
                  <div className="mt-3 pt-2 text-xs text-emerald-400 font-semibold border-t border-slate-800">
                    {totalWarga > 0 ? ((totalLaki / totalWarga) * 100).toFixed(1) : 0}% dari seluruh warga
                  </div>
                </div>

                <div className="bg-[#1e293b] border border-slate-700/60 rounded-xl p-4 shadow-sm flex flex-col justify-between border-l-4 border-l-amber-500">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">PEREMPUAN</span>
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                      <span className="material-symbols-outlined text-[22px]">female</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-amber-400 leading-none">{totalPerempuan}</span>
                    <span className="text-xs text-slate-400">Orang</span>
                  </div>
                  <div className="mt-3 pt-2 text-xs text-amber-400 font-semibold border-t border-slate-800">
                    {totalWarga > 0 ? ((totalPerempuan / totalWarga) * 100).toFixed(1) : 0}% dari seluruh warga
                  </div>
                </div>
              </section>

              {/* RT Filter Pills & Search Tools */}
              <section className="bg-[#1e293b] border border-slate-700/60 rounded-xl shadow-sm p-4 mb-6">
                <div className="mb-4 pb-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[20px]">filter_alt</span>
                    <span className="uppercase tracking-wider text-white font-bold text-xs">
                      Filter Pangkalan Wilayah RT:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {["", "01", "02", "03", "04", "05", "06", "07", "08", "09"].map((rt) => (
                      <button
                        key={rt || "all"}
                        type="button"
                        onClick={() => {
                          setSelectedRT(rt);
                          setWargaPage(1);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedRT === rt
                            ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                        }`}
                      >
                        {rt === "" ? "Semua RT" : `RT ${rt}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search & Filter Dropdowns */}
                <div className="flex flex-wrap items-center gap-3 w-full mb-4">
                  <div className="flex-1 min-w-[240px] relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                      value={wargaSearch}
                      onChange={(e) => {
                        setWargaSearch(e.target.value);
                        setWargaPage(1);
                      }}
                      className="w-full h-11 pl-10 pr-4 bg-[#0f172a] text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-700 placeholder-slate-500"
                      placeholder="Cari berdasarkan Nama Warga, Tempat Lahir, atau Pekerjaan..."
                      type="text"
                    />
                  </div>

                  <div className="w-full sm:w-auto min-w-[150px]">
                    <select
                      value={selectedSHDK}
                      onChange={(e) => {
                        setSelectedSHDK(e.target.value);
                        setWargaPage(1);
                      }}
                      className="w-full h-11 px-3 bg-[#0f172a] text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-700"
                    >
                      <option value="">Semua SHDK</option>
                      <option value="Kepala Keluarga">Kepala Keluarga</option>
                      <option value="Istri">Istri</option>
                      <option value="Anak">Anak</option>
                      <option value="Orang Tua">Orang Tua</option>
                      <option value="Famili Lain">Famili Lain</option>
                    </select>
                  </div>

                  <div className="w-full sm:w-auto min-w-[150px]">
                    <select
                      value={selectedGender}
                      onChange={(e) => {
                        setSelectedGender(e.target.value);
                        setWargaPage(1);
                      }}
                      className="w-full h-11 px-3 bg-[#0f172a] text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-700"
                    >
                      <option value="">Semua Jenis Kelamin</option>
                      <option value="L">Laki-Laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  <div className="w-full sm:w-auto min-w-[150px]">
                    <select
                      value={selectedKawin}
                      onChange={(e) => {
                        setSelectedKawin(e.target.value);
                        setWargaPage(1);
                      }}
                      className="w-full h-11 px-3 bg-[#0f172a] text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-700"
                    >
                      <option value="">Semua Status Nikah</option>
                      <option value="Kawin">Kawin</option>
                      <option value="Belum Kawin">Belum Kawin</option>
                      <option value="Cerai Mati">Cerai Mati</option>
                      <option value="Cerai Hidup">Cerai Hidup</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setWargaSearch("");
                      setSelectedRT("");
                      setSelectedSHDK("");
                      setSelectedGender("");
                      setSelectedKawin("");
                      setWargaPage(1);
                    }}
                    className="h-11 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center justify-center transition-colors border border-slate-700 cursor-pointer"
                    title="Reset Semua Filter"
                  >
                    <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                  </button>
                </div>

                {/* Table Data Warga */}
                <div className="w-full overflow-x-auto rounded-xl border border-slate-700/60">
                  <table className="w-full min-w-[900px] text-left text-xs">
                    <thead className="bg-slate-900 text-slate-300 font-bold whitespace-nowrap border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3 text-center w-10 uppercase tracking-wider">NO</th>
                        <th className="py-3 px-3 text-center uppercase tracking-wider">RW</th>
                        <th className="py-3 px-3 text-center uppercase tracking-wider">RT</th>
                        <th className="py-3 px-3 uppercase tracking-wider">NAMA RT</th>
                        <th className="py-3 px-3 min-w-[170px] uppercase tracking-wider">NAMA LENGKAP</th>
                        <th className="py-3 px-3 uppercase tracking-wider">SHDK</th>
                        <th className="py-3 px-3 text-center uppercase tracking-wider">L/P</th>
                        <th className="py-3 px-3 uppercase tracking-wider">TEMPAT LAHIR</th>
                        <th className="py-3 px-3 text-center uppercase tracking-wider">USIA</th>
                        <th className="py-3 px-3 uppercase tracking-wider">AGAMA</th>
                        <th className="py-3 px-3 uppercase tracking-wider">PENDIDIKAN</th>
                        <th className="py-3 px-3 uppercase tracking-wider">PEKERJAAN</th>
                        <th className="py-3 px-3 uppercase tracking-wider">STATUS KAWIN</th>
                        <th className="py-3 px-3 text-center min-w-[120px] uppercase tracking-wider">AKSI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {currentWargaData.length === 0 ? (
                        <tr>
                          <td colSpan={14} className="py-8 text-center text-slate-400">
                            Tidak ada data warga yang cocok dengan kriteria pencarian / filter.
                          </td>
                        </tr>
                      ) : (
                        currentWargaData.map((w, idx) => {
                          const rowNum = (wargaPage - 1) * wargaPageSize + idx + 1;
                          return (
                            <tr
                              key={w.no}
                              className={`hover:bg-slate-800/60 transition-colors ${
                                idx % 2 === 1 ? "bg-slate-900/30" : "bg-transparent"
                              }`}
                            >
                              <td className="py-3 px-3 text-center font-bold text-slate-400">{rowNum}</td>
                              <td className="py-3 px-3 text-center whitespace-nowrap">{w.rw}</td>
                              <td className="py-3 px-3 text-center">
                                <span className="px-2 py-0.5 rounded font-bold bg-slate-800 text-white text-[11px]">
                                  {w.rt}
                                </span>
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap text-slate-400">{w.namaRt}</td>
                              <td className="py-3 px-3 font-bold text-white">{w.nama}</td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                {w.shdk === "Kepala Keluarga" ? (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-400">
                                    KK
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300">
                                    {w.shdk}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                    w.gender === "L"
                                      ? "bg-emerald-500/20 text-emerald-400"
                                      : "bg-amber-500/20 text-amber-400"
                                  }`}
                                >
                                  {w.gender}
                                </span>
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">{w.tempatLahir}</td>
                              <td className="py-3 px-3 text-center font-bold">{w.usia}</td>
                              <td className="py-3 px-3">{w.agama}</td>
                              <td className="py-3 px-3">{w.pendidikan}</td>
                              <td className="py-3 px-3 max-w-[130px] truncate" title={w.pekerjaan}>
                                {w.pekerjaan}
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">{w.kawin}</td>
                              <td className="py-3 px-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setDetailWarga(w)}
                                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 cursor-pointer"
                                    title="Lihat Detail"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleEditWarga(w.no)}
                                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 cursor-pointer"
                                    title="Ubah Data"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleHapusWarga(w.no)}
                                    className="p-1 rounded bg-slate-800 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
                                    title="Hapus Data"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-800">
                  <div className="text-xs text-slate-400">
                    Menampilkan{" "}
                    <span className="font-bold text-white">
                      {filteredWarga.length === 0 ? 0 : (wargaPage - 1) * wargaPageSize + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-bold text-white">
                      {Math.min(wargaPage * wargaPageSize, filteredWarga.length)}
                    </span>{" "}
                    dari <span className="font-bold text-white">{filteredWarga.length}</span> total data warga
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap justify-center">
                    <button
                      type="button"
                      onClick={() => setWargaPage((p) => Math.max(1, p - 1))}
                      disabled={wargaPage <= 1}
                      className={`px-3 py-1 rounded text-xs font-bold ${
                        wargaPage <= 1
                          ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                      }`}
                    >
                      Sebelumnya
                    </button>

                    {Array.from({ length: totalWargaPages }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setWargaPage(num)}
                        className={`w-8 h-8 rounded text-xs font-bold transition-all cursor-pointer ${
                          num === wargaPage
                            ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                        }`}
                      >
                        {num}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setWargaPage((p) => Math.min(totalWargaPages, p + 1))}
                      disabled={wargaPage >= totalWargaPages}
                      className={`px-3 py-1 rounded text-xs font-bold ${
                        wargaPage >= totalWargaPages
                          ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                      }`}
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE: PELAYANAN SURAT (ADMINISTRASI SURAT) */}
          {/* ======================================================== */}
          {activeModule === "administrasi-surat" && (
            <div>
              <section className="w-full bg-[#1e293b] border border-slate-700/60 rounded-xl shadow-sm p-6 mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="max-w-3xl flex flex-col">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full w-fit mb-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[16px]">verified</span>
                    <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                      Pusat Layanan &amp; Format Persuratan Warga
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    DATA PELAYANAN &amp; PENGAJUAN SURAT RW 13
                  </h1>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    Sistem otomasi pencatatan surat keterangan pengantar RT/RW, validasi kelayakan berkas warga terpadu, dan pelacakan digital status pengantar dokumen ke Kantor Kelurahan Margahayu.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto">
                  <button
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
                    onClick={() => setIsAjukanSuratOpen(true)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">post_add</span>
                    <span>+ Ajukan Surat Baru</span>
                  </button>
                  <button
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-700"
                    onClick={() => window.print()}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">print</span>
                    <span>Cetak Rekap Pelayanan</span>
                  </button>
                  <button
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-colors cursor-pointer"
                    onClick={() => triggerToast("Mengunduh Format Blanko Surat RW 13 Margahayu...")}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>Unduh Blanko (PDF)</span>
                  </button>
                </div>
              </section>

              {/* 4 Stats Surat */}
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#1e293b] border border-slate-700/60 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Total Pengajuan Bulan Ini</span>
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <span className="material-symbols-outlined text-[22px]">inbox</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white leading-none">48</span>
                    <span className="text-xs text-slate-400">Surat Masuk</span>
                  </div>
                  <div className="mt-3 pt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-bold border-t border-slate-800">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span> +12% dibanding bulan lalu
                  </div>
                </div>

                <div className="bg-[#1e293b] border border-slate-700/60 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">Menunggu Validasi RT</span>
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                      <span className="material-symbols-outlined text-[22px]">pending_actions</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-amber-400 leading-none">5</span>
                    <span className="text-xs text-slate-400">Menunggu RT</span>
                  </div>
                  <div className="mt-3 pt-2 text-xs text-slate-400 border-t border-slate-800">
                    RT 02 (2), RT 05 (1), RT 09 (2)
                  </div>
                </div>

                <div className="bg-[#1e293b] border border-slate-700/60 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">Siap Tanda Tangan RW</span>
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-300">
                      <span className="material-symbols-outlined text-[22px]">draw</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white leading-none">8</span>
                    <span className="text-xs text-slate-400">Antrean RW</span>
                  </div>
                  <div className="mt-3 pt-2 text-xs text-slate-400 border-t border-slate-800">
                    Validasi digital e-Sign RW 13
                  </div>
                </div>

                <div className="bg-[#1e293b] border border-slate-700/60 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Selesai Diterbitkan</span>
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <span className="material-symbols-outlined text-[22px]">verified_user</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-emerald-400 leading-none">35</span>
                    <span className="text-xs text-slate-400">Dokumen Sah</span>
                  </div>
                  <div className="mt-3 pt-2 flex items-center gap-1.5 text-xs text-emerald-400 border-t border-slate-800">
                    <span className="material-symbols-outlined text-[16px]">qr_code_2</span> Format cetak ber-QR Verifikasi
                  </div>
                </div>
              </section>

              {/* 8 Catalog Cards */}
              <section className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Katalog Jenis Layanan Pengantar Surat</h2>
                    <p className="text-xs text-slate-400">Pilih jenis blanko surat yang akan diproses langsung ke sistem register RW 13</p>
                  </div>
                  <span className="text-xs px-3 py-1 bg-slate-800 rounded-full text-blue-400 font-bold self-start sm:self-auto border border-slate-700">
                    8 Format Tersedia
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { kode: "SKD-01", title: "Surat Keterangan Domisili", desc: "Legalisasi tempat tinggal tetap maupun tinggal sementara warga di Margahayu.", icon: "location_home" },
                    { kode: "SKTM-02", title: "Keterangan Tidak Mampu", desc: "Keperluan beasiswa anak sekolah, rujukan BPJS PBI, & bantuan sosial Dinsos.", icon: "volunteer_activism" },
                    { kode: "SP-KTP-03", title: "Pengantar KTP & KK Baru", desc: "Penggantian KTP rusak/hilang, rekam biometrik 17+, atau penambahan anggota KK.", icon: "badge" },
                    { kode: "SKU-04", title: "Keterangan Usaha / UMKM", desc: "Surat legalitas usaha rumahan, pengajuan KUR perbankan, dan izin NIB mikro.", icon: "storefront" },
                    { kode: "SPN-05", title: "Pengantar Nikah (N1-N4)", desc: "Persyaratan kelengkapan pendaftaran pernikahan KUA Bekasi Timur / Capil.", icon: "favorite" },
                    { kode: "SKK-06", title: "Keterangan Kematian", desc: "Penerbitan akta kematian Disdukcapil & pengurusan pemakaman TPU Padurenan.", icon: "inventory_2" },
                    { kode: "SKP-07", title: "Surat Pindah Domisili", desc: "Pengantar SKPWNI warga keluar domisili RW 13 ke kelurahan / kabupaten lain.", icon: "transfer_within_a_station" },
                    { kode: "SKCK-08", title: "Catatan Kelakuan Baik", desc: "Pengantar penerbitan SKCK Polsek Bekasi Timur untuk melamar pekerjaan/BUMN.", icon: "verified" },
                  ].map((card) => (
                    <div
                      key={card.kode}
                      className="bg-[#1e293b] border border-slate-700/60 rounded-xl p-4 shadow-sm hover:border-emerald-500/60 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {card.kode}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-[18px]">{card.icon}</span>
                          </div>
                        </div>
                        <h3 className="text-sm font-bold text-white">{card.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-snug">{card.desc}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLayananKode(card.kode);
                          setIsAjukanSuratOpen(true);
                        }}
                        className="mt-4 w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        <span>Buat Pengantar</span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Table Permohonan Surat Masuk */}
              <section className="bg-[#1e293b] border border-slate-700/60 rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Daftar Permohonan Surat Masuk</h2>
                    <p className="text-xs text-slate-400">Pencatatan real-time berkas permohonan dari RT 01 sampai dengan RT 09 RW 13</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">Terakhir diperbarui:</span>
                    <span className="font-bold text-white bg-slate-800 px-2 py-1 rounded">Hari ini, 10:45 WIB</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 mb-4">
                  <div className="lg:col-span-6 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                      value={suratSearch}
                      onChange={(e) => setSuratSearch(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 bg-[#0f172a] text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-700"
                      placeholder="Cari Nama Pemohon, NIK, atau Nomor Registrasi..."
                      type="text"
                    />
                  </div>

                  <div className="lg:col-span-3">
                    <select
                      value={suratStatusFilter}
                      onChange={(e) => setSuratStatusFilter(e.target.value)}
                      className="w-full h-10 px-3 bg-[#0f172a] text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-700"
                    >
                      <option value="">Semua Status Pengajuan</option>
                      <option value="rt">Menunggu Validasi RT</option>
                      <option value="rw">Verifikasi / TTD RW</option>
                      <option value="selesai">Selesai / Terbit</option>
                      <option value="pending">Menunggu Berkas</option>
                    </select>
                  </div>

                  <div className="lg:col-span-3">
                    <select
                      value={suratRTFilter}
                      onChange={(e) => setSuratRTFilter(e.target.value)}
                      className="w-full h-10 px-3 bg-[#0f172a] text-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-700"
                    >
                      <option value="">Semua RT (01-09)</option>
                      {["01", "02", "03", "04", "05", "06", "07", "08", "09"].map((rt) => (
                        <option key={rt} value={rt}>
                          RT {rt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="w-full overflow-x-auto rounded-xl border border-slate-700/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3 text-center w-12">No</th>
                        <th className="py-3 px-3">No. Registrasi</th>
                        <th className="py-3 px-3">Tgl Masuk</th>
                        <th className="py-3 px-3">NIK &amp; Pemohon</th>
                        <th className="py-3 px-3">Wilayah</th>
                        <th className="py-3 px-3">Layanan Surat</th>
                        <th className="py-3 px-3">Keperluan</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-center">Aksi Dokumen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {filteredSurat.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-6 text-center text-slate-400">
                            Tidak ada permohonan surat yang cocok.
                          </td>
                        </tr>
                      ) : (
                        filteredSurat.map((item, idx) => (
                          <tr key={item.id} className="hover:bg-slate-800/60 transition-colors">
                            <td className="py-3 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-3 px-3 font-mono font-bold text-emerald-400">{item.noReg}</td>
                            <td className="py-3 px-3 whitespace-nowrap text-slate-400">{item.tglMasuk}</td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-white">{item.pemohon}</div>
                              <div className="font-mono text-slate-400">{item.nik}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded font-bold bg-slate-800 text-white text-[11px]">
                                {item.rt}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-blue-400">{item.layananKode}</span>
                              <div className="text-slate-300">{item.layananNama}</div>
                            </td>
                            <td className="py-3 px-3 max-w-xs truncate text-slate-400" title={item.keperluan}>
                              {item.keperluan}
                            </td>
                            <td className="py-3 px-3">
                              {item.status === "selesai" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400">
                                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Selesai / Terbit
                                </span>
                              ) : item.status === "rw" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400">
                                  <span className="material-symbols-outlined text-[14px]">draw</span> Verifikasi RW
                                </span>
                              ) : item.status === "rt" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400">
                                  <span className="material-symbols-outlined text-[14px]">hourglass_empty</span> Menunggu RT
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400">
                                  <span className="material-symbols-outlined text-[14px]">attachment</span> Menunggu Berkas
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => window.print()}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                  title="Cetak Surat"
                                >
                                  <span className="material-symbols-outlined text-[14px]">print</span>
                                  <span>Cetak</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => triggerToast(`Melihat berkas permohonan ${item.noReg}...`)}
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold cursor-pointer"
                                  title="Detail"
                                >
                                  Detail
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* SOP Persuratan */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700/60 shadow-sm flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Pengantar Pengurus RT</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-snug">
                      Warga melampirkan berkas fisik/scan fotokopi KTP dan KK kepada Ketua RT masing-masing untuk validasi awal.
                    </p>
                  </div>
                </div>

                <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700/60 shadow-sm flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Verifikasi &amp; TTD RW 13</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-snug">
                      Sekretariat RW 13 mencocokkan identitas dengan basis data sensus kependudukan dan menerbitkan QR legalisir resmi.
                    </p>
                  </div>
                </div>

                <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-700/60 shadow-sm flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Penerusan ke Kelurahan</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-snug">
                      Surat pengantar siap dicetak atau diunduh warga guna diteruskan ke loket PTSP Kantor Kelurahan Margahayu.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE: DATA KELAHIRAN */}
          {/* ======================================================== */}
          {activeModule === "data-kelahiran" && (
            <div>
              <section className="w-full bg-[#1e293b] border border-slate-700/60 rounded-xl shadow-sm p-6 mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="max-w-3xl flex flex-col">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full w-fit mb-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[16px]">child_care</span>
                    <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                      Registrasi Kelahiran &amp; Balita RW 13
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    DATA KELAHIRAN WARGA RW 13
                  </h1>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    Pencatatan bayi lahir baru, monitoring posyandu balita RW 13, integrasi pengajuan Akta Kelahiran Disdukcapil Kota Bekasi dan penambahan otomatis pada Kartu Keluarga (KK).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    onClick={() => setIsLaporKelahiranOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer ring-2 ring-emerald-400"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    <span>Lapor Kelahiran Baru</span>
                  </button>
                  <button
                    onClick={() => triggerToast("Mengekspor rekap agenda Posyandu Balita RW 13...")}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-700"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>Rekap Posyandu</span>
                  </button>
                </div>
              </section>

              {/* Stats Kelahiran */}
              <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#1e293b] border border-slate-700/60 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs uppercase tracking-wider font-bold">Total Kelahiran 2026</span>
                    <span className="material-symbols-outlined text-emerald-400 text-[24px]">baby_changing_station</span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{kelahiranList.length + 22}</span>
                    <span className="text-xs text-slate-400">Bayi Tercatat</span>
                  </div>
                  <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span> 100% Memiliki NIK
                  </p>
                </div>

                <div className="bg-[#1e293b] border border-slate-700/60 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs uppercase tracking-wider font-bold text-blue-400">Bayi Laki-Laki</span>
                    <span className="material-symbols-outlined text-blue-400 text-[24px]">male</span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-400">13</span>
                    <span className="text-xs text-slate-400">Anak</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">54% dari total kelahiran</p>
                </div>

                <div className="bg-[#1e293b] border border-slate-700/60 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs uppercase tracking-wider font-bold text-amber-400">Bayi Perempuan</span>
                    <span className="material-symbols-outlined text-amber-400 text-[24px]">female</span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-amber-400">11</span>
                    <span className="text-xs text-slate-400">Anak</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">46% dari total kelahiran</p>
                </div>

                <div className="bg-[#1e293b] border border-slate-700/60 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs uppercase tracking-wider font-bold">Proses Akta Capil</span>
                    <span className="material-symbols-outlined text-emerald-400 text-[24px]">hourglass_top</span>
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-emerald-400">4</span>
                    <span className="text-xs text-slate-400">Sedang Diproses</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Pengajuan minggu ini</p>
                </div>
              </section>

              {/* Table Kelahiran */}
              <section className="bg-[#1e293b] border border-slate-700/60 rounded-xl shadow-sm p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">Daftar Registrasi Kelahiran Baru (2026)</h2>
                    <p className="text-xs text-slate-400">Data pencatatan surat keterangan lahir dari bidan/RS dan pengantar RT</p>
                  </div>
                  <span className="text-xs px-3 py-1 bg-slate-800 rounded-full text-emerald-400 font-bold border border-slate-700">
                    Terupdate Terkini
                  </span>
                </div>

                <div className="w-full overflow-x-auto rounded-xl border border-slate-700/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3">No</th>
                        <th className="py-3 px-3">Nama Bayi</th>
                        <th className="py-3 px-3">Jenis Kelamin</th>
                        <th className="py-3 px-3">Tgl Lahir</th>
                        <th className="py-3 px-3">Nama Orang Tua</th>
                        <th className="py-3 px-3">RT</th>
                        <th className="py-3 px-3">Status Akta Lahir</th>
                        <th className="py-3 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {kelahiranList.map((k, idx) => (
                        <tr key={k.id} className="hover:bg-slate-800/60 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-3 font-bold text-white">{k.namaBayi}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                k.gender === "Laki-Laki"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-amber-500/20 text-amber-400"
                              }`}
                            >
                              {k.gender}
                            </span>
                          </td>
                          <td className="py-3 px-3">{k.tglLahir}</td>
                          <td className="py-3 px-3">{k.orangTua}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 bg-slate-800 rounded font-bold text-white text-[11px]">
                              {k.rt}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2.5 py-1 rounded-full font-bold text-[11px] bg-emerald-500/20 text-emerald-400">
                              {k.statusAkta}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => triggerToast(`Detail data bayi an. ${k.namaBayi}`)}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold text-slate-200 cursor-pointer"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE: DATA KEMATIAN */}
          {/* ======================================================== */}
          {activeModule === "data-kematian" && (
            <div>
              <section className="w-full bg-[#1e293b] border border-slate-700/60 rounded-xl shadow-sm p-6 mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="max-w-3xl flex flex-col">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-full w-fit mb-2">
                    <span className="material-symbols-outlined text-rose-400 text-[16px]">sentiment_dissatisfied</span>
                    <span className="text-xs uppercase tracking-wider text-rose-400 font-bold">
                      Pelayanan Duka Cita &amp; Pemakaman
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    DATA KEMATIAN WARGA RW 13
                  </h1>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    Pencatatan data warga meninggal dunia, penerbitan surat pengantar kematian untuk Disdukcapil Kota Bekasi, administrasi makam TPU Padurenan, dan pembaruan berkas KK.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
                    type="button"
                    onClick={() => setIsLaporKematianOpen(true)}
                  >
                    <span className="material-symbols-outlined text-[18px]">add_task</span>
                    <span>Lapor Kematian</span>
                  </button>
                  <button
                    onClick={() => {
                      if (kematianList.length > 0) {
                        setPreviewSuratJalan(kematianList[0]);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md ring-2 ring-emerald-400 transition-all cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">print</span>
                    <span>Cetak Surat Jalan Jenazah</span>
                  </button>
                </div>
              </section>

              {/* Stats Kematian */}
              <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#1e293b] border border-slate-700/60 rounded-xl p-4 shadow-sm border-l-4 border-l-rose-500">
                  <span className="text-xs uppercase font-bold text-slate-400">Total Meninggal (2026)</span>
                  <div className="text-3xl font-bold text-white mt-2">
                    {kematianList.length + 4} <span className="text-xs font-normal text-slate-400">Jiwa</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Margahayu RW 13</p>
                </div>

                <div className="bg-[#1e293b] border border-slate-700/60 rounded-xl p-4 shadow-sm border-l-4 border-l-emerald-500">
                  <span className="text-xs uppercase font-bold text-slate-400">Akta Kematian Selesai</span>
                  <div className="text-3xl font-bold text-emerald-400 mt-2">
                    5 <span className="text-xs font-normal text-slate-400">Berkas</span>
                  </div>
                  <p className="text-xs text-emerald-400 mt-1">Diterbitkan Disdukcapil</p>
                </div>

                <div className="bg-[#1e293b] border border-slate-700/60 rounded-xl p-4 shadow-sm border-l-4 border-l-amber-500">
                  <span className="text-xs uppercase font-bold text-slate-400">Lokasi TPU Padurenan</span>
                  <div className="text-3xl font-bold text-amber-400 mt-2">
                    100% <span className="text-xs font-normal text-slate-400">Terdokumentasi</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Blok Pemakaman Terdata</p>
                </div>
              </section>

              {/* Table Kematian */}
              <section className="bg-[#1e293b] border border-slate-700/60 rounded-xl shadow-sm p-4 mb-6">
                <h3 className="text-base font-bold text-white mb-3">Daftar Riwayat Pelaporan Warga Meninggal</h3>
                <div className="w-full overflow-x-auto rounded-xl border border-slate-700/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3">No</th>
                        <th className="py-3 px-3">Nama Almarhum / Almarhumah</th>
                        <th className="py-3 px-3">NIK</th>
                        <th className="py-3 px-3">Tgl Meninggal</th>
                        <th className="py-3 px-3">Usia</th>
                        <th className="py-3 px-3">RT</th>
                        <th className="py-3 px-3">Lokasi Pemakaman</th>
                        <th className="py-3 px-3">Status Surat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {kematianList.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-800/60 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-3 font-bold text-white">{item.nama}</td>
                          <td className="py-3 px-3 font-mono text-slate-400">{item.nik}</td>
                          <td className="py-3 px-3">{item.tglMeninggal}</td>
                          <td className="py-3 px-3">{item.usia}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 bg-slate-800 rounded font-bold text-white text-[11px]">
                              {item.rt}
                            </span>
                          </td>
                          <td className="py-3 px-3">{item.lokasiMakam}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400">
                                {item.statusSurat}
                              </span>
                              <button
                                type="button"
                                onClick={() => setPreviewSuratJalan(item)}
                                title="Cetak Surat Kematian & Jalan"
                                className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-400 transition-all border border-slate-700 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">print</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setBerkasKematian(item)}
                                title="Lihat Berkas"
                                className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 hover:text-white text-blue-400 transition-all border border-slate-700 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE: MUTASI MASUK */}
          {/* ======================================================== */}
          {activeModule === "mutasi-masuk" && (
            <div>
              <section className="w-full bg-[#1e293b] border border-slate-700/60 rounded-xl shadow-sm p-6 mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="max-w-3xl flex flex-col">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full w-fit mb-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[16px]">person_add</span>
                    <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                      Registrasi Penduduk Masuk
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    DATA MUTASI MASUK WARGA RW 13
                  </h1>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    Penerimaan dan registrasi administrasi kependudukan warga yang pindah tempat tinggal ke wilayah RW 13 dari kelurahan lain, antar kecamatan, maupun luar Kota Bekasi.
                  </p>
                </div>
                <button
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer ring-2 ring-emerald-400"
                  type="button"
                  onClick={() => setIsTambahWargaOpen(true)}
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Registrasi Warga Baru</span>
                </button>
              </section>

              <div className="bg-[#1e293b] border border-slate-700/60 rounded-xl p-4 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white">Daftar Berkas Mutasi Masuk (Verifikasi SKPWNI)</h3>
                  <span className="text-xs font-bold px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                    14 Berkas Bulan Ini
                  </span>
                </div>
                <div className="w-full overflow-x-auto rounded-xl border border-slate-700/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3">No</th>
                        <th className="py-3 px-3">Nama Kepala Keluarga</th>
                        <th className="py-3 px-3">Asal Daerah (SKPWNI)</th>
                        <th className="py-3 px-3">Tujuan Penempatan</th>
                        <th className="py-3 px-3">Jumlah Jiwa</th>
                        <th className="py-3 px-3">Status Validasi RW</th>
                        <th className="py-3 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {INITIAL_MUTASI_MASUK.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-800/60 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-400">{m.id}</td>
                          <td className="py-3 px-3 font-bold text-white">{m.namaKK}</td>
                          <td className="py-3 px-3">{m.asal}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 bg-slate-800 rounded font-bold text-white text-[11px]">
                              {m.tujuan}
                            </span>
                          </td>
                          <td className="py-3 px-3">{m.jumlahJiwa}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                m.id === 1 ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {m.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded font-bold cursor-pointer"
                              type="button"
                              onClick={() => setIsTambahWargaOpen(true)}
                            >
                              {m.id === 1 ? "Validasi" : "Periksa"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE: MUTASI KELUAR */}
          {/* ======================================================== */}
          {activeModule === "mutasi-keluar" && (
            <div>
              <section className="w-full bg-[#1e293b] border border-slate-700/60 rounded-xl shadow-sm p-6 mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="max-w-3xl flex flex-col">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full w-fit mb-2">
                    <span className="material-symbols-outlined text-blue-400 text-[16px]">person_remove</span>
                    <span className="text-xs uppercase tracking-wider text-blue-400 font-bold">
                      Layanan SKPWNI Keluar
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    DATA MUTASI KELUAR WARGA RW 13
                  </h1>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    Pengurusan surat pengantar pindah domisili antar rukun warga, antar kelurahan, maupun kepindahan ke luar kota/provinsi beserta pencabutan data aktif sensus.
                  </p>
                </div>
                <button
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer ring-2 ring-emerald-400"
                  type="button"
                  onClick={() => setIsMutasiKeluarOpen(true)}
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Ajukan Pindah Keluar</span>
                </button>
              </section>

              <div className="bg-[#1e293b] border border-slate-700/60 rounded-xl p-4 shadow-sm mb-6">
                <h3 className="text-base font-bold text-white mb-3">Daftar Pengajuan Surat Keterangan Pindah (SKPWNI)</h3>
                <div className="w-full overflow-x-auto rounded-xl border border-slate-700/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-3 text-center w-12">No</th>
                        <th className="py-3 px-3">Nama Pemohon</th>
                        <th className="py-3 px-3">RT Asal</th>
                        <th className="py-3 px-3">Alamat Tujuan Pindah</th>
                        <th className="py-3 px-3">Alasan Kepindahan</th>
                        <th className="py-3 px-3">Status Surat</th>
                        <th className="py-3 px-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {mutasiKeluarList.map((mk, idx) => (
                        <tr key={mk.id} className="hover:bg-slate-800/60 transition-colors">
                          <td className="py-3 px-3 text-center font-bold text-slate-400">{idx + 1}</td>
                          <td className="py-3 px-3 font-bold text-white">{mk.nama}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 bg-slate-800 rounded font-bold text-white text-[11px]">
                              {mk.rtAsal}
                            </span>
                          </td>
                          <td className="py-3 px-3">{mk.tujuan}</td>
                          <td className="py-3 px-3">{mk.alasan}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                mk.status.includes("Selesai")
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-slate-800 text-slate-300"
                              }`}
                            >
                              {mk.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => window.print()}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">print</span>
                                <span>Cetak SKPWNI</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsMutasiKeluarOpen(true)}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                              >
                                Detail
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE: BERANDA (DASHBOARD UTAMA) */}
          {/* ======================================================== */}
          {activeModule === "dashboard-utama" && (
            <div>
              <section className="w-full bg-[#1e293b] border border-slate-700/60 rounded-xl shadow-sm p-6 mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="max-w-3xl flex flex-col">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full w-fit mb-2">
                    <span className="material-symbols-outlined text-emerald-400 text-[16px]">home</span>
                    <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Portal Utama RW 13</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    BERANDA ADMINISTRASI RW 13 MARGAHAYU
                  </h1>
                  <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                    Selamat datang di dasbor sentral digital Rukun Warga 13. Pantau seluruh dinamika warga, percepatan pelayanan surat, sensus penduduk, dan pelaporan lingkungan secara terintegrasi.
                  </p>
                </div>
                {onKeBerandaUtama && (
                  <button
                    type="button"
                    onClick={onKeBerandaUtama}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer ring-2 ring-emerald-400"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    <span>Buka Portal Beranda Lengkap</span>
                  </button>
                )}
              </section>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div
                  onClick={() => setActiveModule("administrasi-surat")}
                  className="bg-[#1e293b] p-4 rounded-xl shadow-sm border border-slate-700/60 hover:border-emerald-500/60 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[28px]">mark_email_unread</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Pelayanan Cepat Warga</h4>
                      <p className="text-xs text-slate-400">Pengantar RT/RW digital otomatis</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveModule("data-kependudukan")}
                  className="bg-[#1e293b] p-4 rounded-xl shadow-sm border border-slate-700/60 hover:border-emerald-500/60 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[28px]">shield</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Validasi &amp; Legalitas</h4>
                      <p className="text-xs text-slate-400">Dilengkapi QR Code terverifikasi</p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveModule("data-kependudukan")}
                  className="bg-[#1e293b] p-4 rounded-xl shadow-sm border border-slate-700/60 hover:border-emerald-500/60 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[28px]">sync_saved_locally</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Data Real-Time Sensus</h4>
                      <p className="text-xs text-slate-400">Sinkronisasi RT 01 - RT 09 2026</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE: PENGATURAN */}
          {/* ======================================================== */}
          {activeModule === "pengaturan" && (
            <div>
              <section className="w-full bg-[#1e293b] border border-slate-700/60 rounded-xl shadow-sm p-6 mb-6">
                <div className="max-w-2xl">
                  <h2 className="text-xl font-bold text-white mb-1">Pengaturan Sistem Dasbor RW 13</h2>
                  <p className="text-xs text-slate-400 mb-6">
                    Kelola identitas posko sekretariat, nomor kontak darurat pelayanan, dan preferensi tema tampilan.
                  </p>

                  <div className="space-y-4">
                    {/* Foto Profil */}
                    <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-800 mb-2">
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-2">
                        Foto Profil / Pas Foto Pengurus
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative w-20 h-20 rounded-full bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                          <span className="material-symbols-outlined text-[40px] text-emerald-400">account_circle</span>
                        </div>
                        <div className="flex-1 flex flex-col justify-center gap-1.5 w-full">
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-sm">
                              <span className="material-symbols-outlined text-[16px]">upload</span>
                              <span>Unggah Foto Baru</span>
                              <input accept="image/png, image/jpeg, image/jpg" className="hidden" type="file" />
                            </label>
                            <button
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                              type="button"
                              onClick={() => triggerToast("Foto profil telah dihapus.")}
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                              <span>Hapus</span>
                            </button>
                          </div>
                          <p className="text-xs text-slate-500">Format JPG, PNG (Maksimal 2 MB). Disarankan rasio 1:1.</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                        Nama Ketua RW 13
                      </label>
                      <input
                        className="w-full h-11 px-4 rounded-lg bg-[#0f172a] border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        type="text"
                        value={ketuaNama}
                        onChange={(e) => setKetuaNama(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                        Alamat Sekretariat Posko
                      </label>
                      <input
                        className="w-full h-11 px-4 rounded-lg bg-[#0f172a] border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        type="text"
                        value={poskoAlamat}
                        onChange={(e) => setPoskoAlamat(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                        No. WhatsApp Pelayanan Surat
                      </label>
                      <input
                        className="w-full h-11 px-4 rounded-lg bg-[#0f172a] border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        type="text"
                        value={waPelayanan}
                        onChange={(e) => setWaPelayanan(e.target.value)}
                      />
                    </div>

                    {/* Mode Gelap / Terang Switcher */}
                    <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                          <span className="material-symbols-outlined text-[22px]">light_mode</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">Tema Tampilan / Mode Layar</h4>
                          <p className="text-xs text-slate-400">Sesuaikan tampilan dasbor dengan pencahayaan lingkungan kerja</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="Mode Terang"
                          onClick={() => handleSwitchTheme("light")}
                          className={`w-10 h-10 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                            themeMode === "light"
                              ? "bg-emerald-600 text-white border-2 border-emerald-400 shadow-sm"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-400"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">light_mode</span>
                        </button>
                        <button
                          type="button"
                          title="Mode Gelap"
                          onClick={() => handleSwitchTheme("dark")}
                          className={`w-10 h-10 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                            themeMode === "dark"
                              ? "bg-emerald-600 text-white border-2 border-emerald-400 shadow-sm"
                              : "bg-slate-800 hover:bg-slate-700 text-slate-400"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">dark_mode</span>
                        </button>
                      </div>
                    </div>

                    {/* Simpan Button */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                        type="button"
                        onClick={handleSimpanPengaturan}
                      >
                        <span className="material-symbols-outlined text-[18px]">save</span>
                        <span>Simpan Perubahan</span>
                      </button>

                      {saveSettingNotif && (
                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-semibold">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Perubahan telah berhasil disimpan!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION: INTEGRASI MYSQL WORKBENCH & STATUS KONEKSI */}
              <section className="w-full bg-[#1e293b] border border-slate-700/60 rounded-xl shadow-sm p-6 mb-6">
                <div className="max-w-3xl">
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-400">database</span>
                        <span>Sinkronisasi Database MySQL Workbench</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Status koneksi backend dengan basis data MySQL rw13_db dan petunjuk integrasi MySQL Workbench.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        dbConnected
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${dbConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`}></span>
                        <span>{dbConnected ? "MySQL Terhubung" : "MySQL Standby / Offline"}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-800 space-y-3 text-xs mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Database Name:</span>
                        <code className="text-emerald-400 font-mono font-bold">rw13_db</code>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Host / Port:</span>
                        <code className="text-slate-200 font-mono">127.0.0.1:3306</code>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">User Aplikasi / Hak Akses:</span>
                        <code className="text-blue-300 font-mono">rw13_app (atau root)</code>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">File SQL Master Workbench:</span>
                        <code className="text-amber-300 font-mono">rw13_workbench_setup.sql</code>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-800 text-slate-300">
                      <span>Status Sistem: </span>
                      <span className="text-slate-200 font-medium">{dbInfo}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-950/30 border border-blue-800/40 rounded-xl text-xs text-blue-200 space-y-1.5">
                    <p className="font-bold flex items-center gap-1 text-blue-300">
                      <span className="material-symbols-outlined text-[16px]">info</span>
                      <span>Cara Sinkronisasi via MySQL Workbench:</span>
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300 ml-1">
                      <li>Buka <b>MySQL Workbench</b> lalu pilih koneksi MySQL lokal Anda.</li>
                      <li>Tekan <kbd className="px-1.5 py-0.5 bg-slate-800 rounded font-mono text-[10px]">Ctrl + Shift + O</kbd> dan buka file <code className="text-blue-300 font-mono">backend/database/rw13_workbench_setup.sql</code>.</li>
                      <li>Klik tombol <b>Petir ⚡ (Execute)</b> untuk mengeksekusi tabel dan sensus 99 warga.</li>
                      <li>Database <code className="text-emerald-300">rw13_db</code> dan akun dengan password Bcrypt siap digunakan!</li>
                    </ol>
                  </div>
                </div>
              </section>

              {/* SECTION: PEMBUATAN AKUN BARU DENGAN ENKRIPSI OTOMATIS */}
              <section className="w-full bg-[#1e293b] border border-slate-700/60 rounded-xl shadow-sm p-6 mb-6">
                <div className="max-w-2xl">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-emerald-400">lock</span>
                    <span>Pembuatan Akun Baru (Enkripsi Bcrypt Otomatis)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Setiap pembuatan akun melalui form ini akan <b>secara otomatis dienkripsi dengan standar keamanan Bcrypt (cost 10)</b> sebelum disimpan ke MySQL, sehingga password tidak tersimpan dalam bentuk teks polos.
                  </p>

                  <form onSubmit={handleBuatAkunBaru} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                          Nama Lengkap *
                        </label>
                        <input
                          type="text"
                          required
                          value={newAkunNama}
                          onChange={(e) => setNewAkunNama(e.target.value)}
                          placeholder="misal: Bambang Sudibyo"
                          className="w-full h-10 px-3 rounded-lg bg-[#0f172a] border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                          NIK KTP (16 Digit)
                        </label>
                        <input
                          type="text"
                          maxLength={16}
                          value={newAkunNik}
                          onChange={(e) => setNewAkunNik(e.target.value.replace(/\D/g, ""))}
                          placeholder="misal: 3216010101900001"
                          className="w-full h-10 px-3 rounded-lg bg-[#0f172a] border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                          Email atau No. HP *
                        </label>
                        <input
                          type="text"
                          required
                          value={newAkunContact}
                          onChange={(e) => setNewAkunContact(e.target.value)}
                          placeholder="misal: bambang@rw13.id"
                          className="w-full h-10 px-3 rounded-lg bg-[#0f172a] border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                          Password (Min. 6 Karakter) *
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={newAkunPassword}
                          onChange={(e) => setNewAkunPassword(e.target.value)}
                          placeholder="Password untuk akun"
                          className="w-full h-10 px-3 rounded-lg bg-[#0f172a] border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                          Peran / Hak Akses
                        </label>
                        <select
                          value={newAkunPeran}
                          onChange={(e) => setNewAkunPeran(e.target.value as "admin" | "ketua_rw" | "ketua_rt" | "warga")}
                          className="w-full h-10 px-3 rounded-lg bg-[#0f172a] border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="warga">Warga Biasa</option>
                          <option value="ketua_rt">Ketua RT</option>
                          <option value="ketua_rw">Ketua RW</option>
                          <option value="admin">Administrator Sistem</option>
                        </select>
                      </div>

                      {newAkunPeran === "ketua_rt" && (
                        <div>
                          <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                            RT Naungan
                          </label>
                          <select
                            value={newAkunRt}
                            onChange={(e) => setNewAkunRt(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-[#0f172a] border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            {Array.from({ length: 9 }, (_, i) => `RT 0${i + 1}`).map((rt) => (
                              <option key={rt} value={rt}>{rt}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {newAkunMsg && (
                      <div className={`p-3 rounded-lg text-xs font-medium ${
                        newAkunMsg.sukses
                          ? "bg-emerald-950/70 text-emerald-300 border border-emerald-700/60"
                          : "bg-red-950/70 text-red-300 border border-red-700/60"
                      }`}>
                        {newAkunMsg.text}
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={newAkunLoading}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        <span>{newAkunLoading ? "Menyimpan & Mengenkripsi..." : "Buat Akun Terenkripsi"}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </section>

              {/* SECTION: GENERATOR HASH BCRYPT UNTUK MYSQL WORKBENCH */}
              <section className="w-full bg-[#1e293b] border border-slate-700/60 rounded-xl shadow-sm p-6 mb-6">
                <div className="max-w-2xl">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-purple-400">key</span>
                    <span>Utilitas Generator Hash Bcrypt untuk MySQL Workbench</span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Gunakan utilitas ini jika Anda ingin memasukkan akun baru secara manual melalui antarmuka query MySQL Workbench.
                  </p>

                  <form onSubmit={handleGenerateBcrypt} className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                    <input
                      type="text"
                      placeholder="Ketik password yang ingin dienkripsi..."
                      value={genPassInput}
                      onChange={(e) => setGenPassInput(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg bg-[#0f172a] border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={genPassLoading || !genPassInput.trim()}
                      className="w-full sm:w-auto px-5 h-10 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">enhanced_encryption</span>
                      <span>Enkripsi Password</span>
                    </button>
                  </form>

                  {genPassResult && (
                    <div className="p-4 bg-[#0f172a] border border-purple-500/30 rounded-xl text-xs space-y-3 font-mono">
                      <div>
                        <span className="text-purple-300 block text-[11px] font-sans font-bold uppercase mb-1">
                          Hash Bcrypt (Blowfish cost 10):
                        </span>
                        <div className="p-2 bg-slate-900 rounded border border-slate-800 text-emerald-400 break-all select-all">
                          {genPassResult.hash}
                        </div>
                      </div>

                      <div>
                        <span className="text-purple-300 block text-[11px] font-sans font-bold uppercase mb-1">
                          Query SQL Siap Paste ke MySQL Workbench:
                        </span>
                        <div className="p-2 bg-slate-900 rounded border border-slate-800 text-blue-300 break-all select-all text-[11px]">
                          {genPassResult.sqlQuery}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* ======================================================== */}
          {/* MODULE: LOGIN / KONFIRMASI KELUAR */}
          {/* ======================================================== */}
          {activeModule === "login" && (
            <div>
              <section className="w-full bg-[#1e293b] border border-slate-700/60 rounded-xl shadow-md p-8 mb-6 text-center py-16 max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[32px]">logout</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Konfirmasi Keluar Sistem Administrasi</h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                  Apakah Anda yakin ingin mengakhiri sesi administrasi RW 13 ini? Anda perlu memasukkan kredensial login kembali untuk mengakses data sensus kependudukan.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    className="px-6 py-2.5 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
                    onClick={() => setActiveModule("data-kependudukan")}
                    type="button"
                  >
                    Batal
                  </button>
                  <button
                    className="px-6 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    onClick={() => {
                      if (onKeluar) {
                        onKeluar();
                      } else {
                        triggerToast("Sesi administrasi telah ditutup.");
                      }
                    }}
                    type="button"
                  >
                    Ya, Keluar Akun
                  </button>
                </div>
              </section>
            </div>
          )}
        </main>

        {/* ======================================================== */}
        {/* 5. FOOTER */}
        {/* ======================================================== */}
        <footer className={`w-full ${themeMode === "dark" ? "bg-[#0f172a] border-slate-800" : "bg-white border-slate-200"} py-4 px-6 md:px-8 border-t transition-colors`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-slate-400 text-xs">
            <span>© 2026 Pengurus RW 13 Kel. Margahayu. Sistem Administrasi &amp; Data Kependudukan.</span>
            <span className="text-blue-400 font-bold">Kecamatan Bekasi Timur • Kota Bekasi</span>
          </div>
        </footer>
      </div>

      {/* ======================================================== */}
      {/* 6. MODAL: TAMBAH WARGA BARU */}
      {/* ======================================================== */}
      {isTambahWargaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f172a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">person_add</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">+ Formulir Registrasi Data Warga Baru RW 13</h3>
                  <p className="text-xs text-slate-400">Pencatatan data kependudukan Kelurahan Margahayu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTambahWargaOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleTambahWarga} className="flex flex-col flex-1 overflow-y-auto p-6 space-y-4 text-slate-200">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs text-emerald-400">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">verified</span>
                  <span>Data Warga Baru diverifikasi otomatis sesuai NIK KTP-el Kemendagri.</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 font-bold text-[10px] uppercase">
                  Terverifikasi
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nama Lengkap Warga *</label>
                  <input
                    name="nama"
                    required
                    type="text"
                    defaultValue="MUHAMMAD RIZKY PRATAMA, S.T."
                    className="w-full h-10 px-3 bg-[#0f172a] border border-emerald-500/50 rounded-lg text-xs text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">NIK (16 Digit) *</label>
                  <input
                    name="nik"
                    required
                    maxLength={16}
                    type="text"
                    defaultValue="3275011806940003"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Wilayah RT Domisili *</label>
                  <select
                    name="rt"
                    required
                    defaultValue="RT 03"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {["01", "02", "03", "04", "05", "06", "07", "08", "09"].map((rt) => (
                      <option key={rt} value={`RT ${rt}`}>
                        RT {rt} / RW 13
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Jenis Kelamin *</label>
                  <select
                    name="gender"
                    required
                    defaultValue="L"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Tempat Lahir *</label>
                  <input
                    name="tempatLahir"
                    required
                    type="text"
                    defaultValue="Bekasi"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Usia (Tahun) *</label>
                  <input
                    name="usia"
                    required
                    type="number"
                    defaultValue={31}
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Agama *</label>
                  <select
                    name="agama"
                    required
                    defaultValue="Islam"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Pendidikan Terakhir *</label>
                  <select
                    name="pendidikan"
                    required
                    defaultValue="Diploma/S1"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Diploma/S1">Diploma / S1</option>
                    <option value="SLTA">SLTA / SMA / SMK</option>
                    <option value="SLTP">SLTP / SMP</option>
                    <option value="SD">SD</option>
                    <option value="Spesialis/S2">S2 / S3</option>
                    <option value="Belum Sekolah">Belum / Tidak Sekolah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Pekerjaan *</label>
                  <input
                    name="pekerjaan"
                    required
                    type="text"
                    defaultValue="Karyawan Swasta"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Status Perkawinan *</label>
                  <select
                    name="kawin"
                    required
                    defaultValue="Kawin"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Kawin">Kawin</option>
                    <option value="Belum Kawin">Belum Kawin</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Status Hubungan Keluarga (SHDK) *
                  </label>
                  <select
                    name="shdk"
                    required
                    defaultValue="Kepala Keluarga"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Kepala Keluarga">Kepala Keluarga</option>
                    <option value="Istri">Istri</option>
                    <option value="Anak">Anak</option>
                    <option value="Orang Tua">Orang Tua</option>
                    <option value="Famili Lain">Famili Lain</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsTambahWargaOpen(false)}
                  className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer ring-2 ring-emerald-400"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Simpan Data Warga Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. MODAL: DETAIL WARGA */}
      {/* ======================================================== */}
      {detailWarga && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f172a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">badge</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Detail Data Warga RW 13</h3>
                  <p className="text-xs text-slate-400">Pangkalan Data Sensus Margahayu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailWarga(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-3 text-slate-200 overflow-y-auto text-xs">
              <div className="p-3 bg-[#0f172a] rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-bold">Nama Lengkap</div>
                <div className="text-base font-bold text-white mt-0.5">{detailWarga.nama}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-800/60 rounded-lg">
                  <span className="text-slate-400 font-bold block">Wilayah:</span>
                  {detailWarga.rw} / {detailWarga.rt} ({detailWarga.namaRt})
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-lg">
                  <span className="text-slate-400 font-bold block">Status SHDK:</span>
                  {detailWarga.shdk}
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-lg">
                  <span className="text-slate-400 font-bold block">Jenis Kelamin:</span>
                  {detailWarga.gender === "L" ? "Laki-Laki" : "Perempuan"}
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-lg">
                  <span className="text-slate-400 font-bold block">Usia:</span>
                  {detailWarga.usia} Tahun
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-lg">
                  <span className="text-slate-400 font-bold block">Tempat Lahir:</span>
                  {detailWarga.tempatLahir}
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-lg">
                  <span className="text-slate-400 font-bold block">Agama:</span>
                  {detailWarga.agama}
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-lg">
                  <span className="text-slate-400 font-bold block">Pendidikan:</span>
                  {detailWarga.pendidikan}
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-lg">
                  <span className="text-slate-400 font-bold block">Status Nikah:</span>
                  {detailWarga.kawin}
                </div>
              </div>

              <div className="p-2.5 bg-slate-800/60 rounded-lg">
                <span className="text-slate-400 font-bold block">Pekerjaan:</span>
                {detailWarga.pekerjaan}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-[#0f172a] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setDetailWarga(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. MODAL: LAPOR KELAHIRAN */}
      {/* ======================================================== */}
      {isLaporKelahiranOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f172a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">child_care</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Formulir Lapor Kelahiran Warga RW 13</h3>
                  <p className="text-xs text-slate-400">Registrasi bayi &amp; integrasi Akta Kelahiran</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLaporKelahiranOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleLaporKelahiran} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nama Lengkap Bayi *</label>
                  <input
                    name="namaBayi"
                    required
                    type="text"
                    placeholder="Contoh: Muhammad Rayyan Al-Fatih"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-emerald-500/50 rounded-lg text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Jenis Kelamin *</label>
                  <select
                    name="gender"
                    required
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Laki-Laki">Laki-Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Wilayah RT *</label>
                  <select
                    name="rt"
                    required
                    defaultValue="RT 03"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {["01", "02", "03", "04", "05", "06", "07", "08", "09"].map((rt) => (
                      <option key={rt} value={`RT ${rt}`}>
                        RT {rt} / RW 13
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nama Orang Tua Kandung *</label>
                  <input
                    name="orangTua"
                    required
                    type="text"
                    placeholder="Contoh: Ahmad Fauzi & Nur Laila"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsLaporKelahiranOpen(false)}
                  className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md flex items-center gap-2 cursor-pointer ring-2 ring-emerald-400"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>+ Simpan &amp; Daftarkan Kelahiran</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. MODAL: LAPOR KEMATIAN */}
      {/* ======================================================== */}
      {isLaporKematianOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f172a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">sentiment_dissatisfied</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Formulir Laporan Kematian Warga RW 13</h3>
                  <p className="text-xs text-slate-400">Pencatatan data kematian &amp; penerbitan pengantar</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLaporKematianOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleLaporKematian} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Nama Lengkap Almarhum / Almarhumah *
                  </label>
                  <input
                    name="nama"
                    required
                    type="text"
                    placeholder="Contoh: Almh. Hj. Aminah binti Hasan"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-rose-500/50 rounded-lg text-white font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">NIK Almarhum (16 Digit) *</label>
                  <input
                    name="nik"
                    required
                    maxLength={16}
                    type="text"
                    placeholder="327503xxxxxxxxxx"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Usia Saat Meninggal *</label>
                  <input
                    name="usia"
                    required
                    type="text"
                    placeholder="Contoh: 79 Tahun"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Wilayah RT Domisili *</label>
                  <select
                    name="rt"
                    required
                    defaultValue="RT 07"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {["01", "02", "03", "04", "05", "06", "07", "08", "09"].map((rt) => (
                      <option key={rt} value={`RT ${rt}`}>
                        RT {rt} / RW 13
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Lokasi Pemakaman *</label>
                  <select
                    name="lokasiMakam"
                    required
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="TPU Padurenan, Bekasi">TPU Padurenan, Mustikajaya Bekasi</option>
                    <option value="TPU Perwira Bekasi Utara">TPU Perwira Bekasi Utara</option>
                    <option value="Makam Wakaf Margahayu">Makam Wakaf Margahayu RW 13</option>
                    <option value="Luar Kota (Kampung Halaman)">Luar Kota / Dipulangkan</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsLaporKematianOpen(false)}
                  className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Simpan &amp; Terbitkan Pengantar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 10. MODAL: PRATINJAU SURAT JALAN JENAZAH */}
      {/* ======================================================== */}
      {previewSuratJalan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f172a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">description</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Pratinjau Surat Jalan Jenazah</h3>
                  <p className="text-xs text-slate-400">Format Resmi Rukun Warga 13 Kelurahan Margahayu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSuratJalan(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
              <div className="border-2 border-slate-300 rounded-xl p-6 bg-white text-slate-900 shadow-lg">
                <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                  <h4 className="font-bold text-xs tracking-wider uppercase">
                    PEMERINTAH KOTA BEKASI • RUKUN WARGA 13
                  </h4>
                  <h3 className="font-bold text-sm uppercase mt-0.5">
                    SURAT KETERANGAN KEMATIAN &amp; PENGANTAR PEMAKAMAN
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">Nomor: 474.3/SPJ-08/RW13/III/2026</p>
                </div>

                <div className="text-xs leading-relaxed space-y-2 mb-4">
                  <p>Yang bertanda tangan di bawah ini Pengurus RW 13 Margahayu menerangkan bahwa:</p>
                  <div className="grid grid-cols-3 gap-1 pl-2">
                    <span className="font-bold">Nama Almarhum</span>
                    <span className="col-span-2">: {previewSuratJalan.nama}</span>
                    <span className="font-bold">NIK</span>
                    <span className="col-span-2 font-mono">: {previewSuratJalan.nik}</span>
                    <span className="font-bold">Tanggal Meninggal</span>
                    <span className="col-span-2">: {previewSuratJalan.tglMeninggal}</span>
                    <span className="font-bold">Usia Saat Wafat</span>
                    <span className="col-span-2">: {previewSuratJalan.usia}</span>
                    <span className="font-bold">Wilayah Domisili</span>
                    <span className="col-span-2">: {previewSuratJalan.rt} / RW 13 Margahayu</span>
                    <span className="font-bold">Tujuan Pemakaman</span>
                    <span className="col-span-2">: {previewSuratJalan.lokasiMakam}</span>
                  </div>
                  <p className="pt-2">
                    Demikian surat jalan/keterangan ini dibuat dengan sebenar-benarnya untuk dipergunakan dalam pengurusan ambulans, izin pemakaman, dan pelaporan Disdukcapil Kota Bekasi.
                  </p>
                </div>

                <div className="flex justify-between items-end pt-4 text-xs border-t border-slate-200">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500">QR Verifikasi Digital RW 13</p>
                    <div className="w-16 h-16 border border-slate-400 mx-auto my-1 flex items-center justify-center font-bold text-[9px] text-slate-700 bg-slate-50 rounded">
                      QR VALID
                    </div>
                  </div>
                  <div className="text-center">
                    <p>Bekasi, 24 Maret 2026</p>
                    <p className="font-bold mt-8 underline">{ketuaNama}</p>
                    <p className="text-[11px] text-slate-600">Ketua RW 13 Margahayu</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-800 bg-[#0f172a] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setPreviewSuratJalan(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerToast("Mengunduh Surat Jalan Jenazah format PDF...")}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Unduh PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Cetak Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 11. MODAL: BERKAS DETAIL KEMATIAN */}
      {/* ======================================================== */}
      {berkasKematian && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f172a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">folder</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Berkas Kematian &amp; Pemakaman</h3>
                  <p className="text-xs text-slate-400">{berkasKematian.noReg || "RW13-SKK-2026-0007"}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBerkasKematian(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-3 text-slate-200 text-xs">
              <div className="p-3 bg-[#0f172a] rounded-lg border border-slate-800">
                <div className="text-[11px] text-slate-400 uppercase font-bold">Nama Almarhum</div>
                <div className="text-base font-bold text-white mt-0.5">{berkasKematian.nama}</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-800/60 rounded-lg">
                  <span className="text-slate-400 font-bold block">NIK:</span>
                  <span className="font-mono">{berkasKematian.nik}</span>
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-lg">
                  <span className="text-slate-400 font-bold block">Wilayah:</span>
                  {berkasKematian.rt} / RW 13
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-lg">
                  <span className="text-slate-400 font-bold block">Tgl Meninggal:</span>
                  {berkasKematian.tglMeninggal}
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-lg">
                  <span className="text-slate-400 font-bold block">Usia:</span>
                  {berkasKematian.usia}
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-lg col-span-2">
                  <span className="text-slate-400 font-bold block">Lokasi Pemakaman:</span>
                  {berkasKematian.lokasiMakam}
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-lg col-span-2">
                  <span className="text-slate-400 font-bold block">Penyebab Kematian:</span>
                  {berkasKematian.penyebab || "Penyakit Usia Lanjut (Geriatri)"}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-800 bg-[#0f172a] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setBerkasKematian(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 12. MODAL: AJUKAN SURAT BARU */}
      {/* ======================================================== */}
      {isAjukanSuratOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f172a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">post_add</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Buat Permohonan Pengantar Surat RW 13</h3>
                  <p className="text-xs text-slate-400">Pusat Layanan Cepat Kependudukan Margahayu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAjukanSuratOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAjukanSurat} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Jenis Blanko Layanan Surat *
                  </label>
                  <select
                    name="layananKode"
                    required
                    value={selectedLayananKode}
                    onChange={(e) => setSelectedLayananKode(e.target.value)}
                    className="w-full h-10 px-3 bg-[#0f172a] border border-emerald-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="SKD-01">SKD-01 - Surat Keterangan Domisili</option>
                    <option value="SKTM-02">SKTM-02 - Keterangan Tidak Mampu</option>
                    <option value="SP-KTP-03">SP-KTP-03 - Pengantar KTP &amp; KK Baru</option>
                    <option value="SKU-04">SKU-04 - Keterangan Usaha / UMKM</option>
                    <option value="SPN-05">SPN-05 - Pengantar Nikah (N1-N4)</option>
                    <option value="SKK-06">SKK-06 - Keterangan Kematian</option>
                    <option value="SKP-07">SKP-07 - Surat Pindah Domisili</option>
                    <option value="SKCK-08">SKCK-08 - Catatan Kelakuan Baik</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nama Pemohon *</label>
                  <input
                    name="pemohon"
                    required
                    type="text"
                    placeholder="Contoh: Muhammad Farhan"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">NIK Pemohon (16 Digit) *</label>
                  <input
                    name="nik"
                    required
                    maxLength={16}
                    type="text"
                    placeholder="327503xxxxxxxxxx"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Wilayah RT *</label>
                  <select
                    name="rt"
                    required
                    defaultValue="RT 01"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {["01", "02", "03", "04", "05", "06", "07", "08", "09"].map((rt) => (
                      <option key={rt} value={`RT ${rt}`}>
                        RT {rt} / RW 13
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Keperluan Pengantar *</label>
                  <input
                    name="keperluan"
                    required
                    type="text"
                    placeholder="Contoh: Kelengkapan Berkas Lamaran Pekerjaan"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsAjukanSuratOpen(false)}
                  className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md flex items-center gap-2 cursor-pointer ring-2 ring-emerald-400"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>+ Ajukan &amp; Simpan Permohonan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 13. MODAL: MUTASI KELUAR (SKPWNI) */}
      {/* ======================================================== */}
      {isMutasiKeluarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0f172a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">person_remove</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Formulir Permohonan Pindah Keluar (SKPWNI)</h3>
                  <p className="text-xs text-slate-400">Pencatatan mutasi domisili RW 13 Margahayu</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMutasiKeluarOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAjukanMutasiKeluar} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nama Pemohon Pindah *</label>
                  <input
                    name="nama"
                    required
                    type="text"
                    placeholder="Contoh: Ilyas Kurniawan"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-blue-500/50 rounded-lg text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">RT Asal Pemohon *</label>
                  <select
                    name="rtAsal"
                    required
                    defaultValue="RT 06"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {["01", "02", "03", "04", "05", "06", "07", "08", "09"].map((rt) => (
                      <option key={rt} value={`RT ${rt}`}>
                        RT {rt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Alasan Kepindahan *</label>
                  <select
                    name="alasan"
                    required
                    defaultValue="Tugas Pekerjaan / Mutasi Kantor"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Tugas Pekerjaan / Mutasi Kantor">Tugas Pekerjaan / Mutasi Kantor</option>
                    <option value="Membeli Rumah Sendiri">Membeli Rumah Sendiri</option>
                    <option value="Mengikuti Suami / Istri">Mengikuti Suami / Istri</option>
                    <option value="Pendidikan / Studi">Pendidikan / Studi</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Alamat Lengkap Tujuan Pindah *</label>
                  <input
                    name="tujuan"
                    required
                    type="text"
                    placeholder="Contoh: Kec. Cikarang Selatan, Kab. Bekasi"
                    className="w-full h-10 px-3 bg-[#0f172a] border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsMutasiKeluarOpen(false)}
                  className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>+ Simpan &amp; Terbitkan SKPWNI</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
