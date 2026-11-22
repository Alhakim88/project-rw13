export type DataRegister = {
  fullName: string;
  nik: string;
  contact: string;
  password: string;
  confirmPassword: string;
};

export type FormRegisterErrors = {
  fullName?: string;
  nik?: string;
  contact?: string;
  password?: string;
  confirmPassword?: string;
};

export function validasiRegister(data: DataRegister): FormRegisterErrors {
  const errors: FormRegisterErrors = {};

  // Validasi Nama Lengkap
  if (!data.fullName.trim()) {
    errors.fullName = "Nama lengkap wajib diisi";
  } else if (data.fullName.trim().length < 3) {
    errors.fullName = "Nama lengkap minimal 3 karakter";
  }

  // Validasi NIK
  const nikClean = data.nik.trim();
  if (!nikClean) {
    errors.nik = "NIK / No. KTP wajib diisi";
  } else if (!/^\d+$/.test(nikClean)) {
    errors.nik = "NIK hanya boleh berisi angka";
  } else if (nikClean.length !== 16) {
    errors.nik = "NIK harus berjumlah tepat 16 digit angka";
  }

  // Validasi Kontak (Email atau No. WhatsApp / HP)
  if (!data.contact.trim()) {
    errors.contact = "Email / No. WhatsApp wajib diisi";
  } else {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact.trim());
    const isPhone = /^[0-9+\-\s]{9,16}$/.test(data.contact.trim());
    if (!isEmail && !isPhone) {
      errors.contact = "Format Email atau No. WhatsApp tidak valid";
    }
  }

  // Validasi Password
  if (!data.password) {
    errors.password = "Password wajib diisi";
  } else if (data.password.length < 6) {
    errors.password = "Password minimal 6 karakter";
  }

  // Validasi Konfirmasi Password
  if (!data.confirmPassword) {
    errors.confirmPassword = "Konfirmasi password wajib diisi";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Konfirmasi password tidak cocok dengan password";
  }

  return errors;
}
