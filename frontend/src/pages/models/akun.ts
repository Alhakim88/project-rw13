export abstract class Akun {
  nama: string;
  email: string;

  constructor(nama: string, email: string) {
    this.nama = nama;
    this.email = email;
  }

  abstract getPeran(): string;
}

export class Admin extends Akun {
  getPeran(): string {
    return "admin";
  }
}

export class Kasir extends Akun {
  getPeran(): string {
    return "kasir";
  }
}

export class Warga extends Akun {
  nik: string;
  kontak?: string;

  constructor(nama: string, email: string, nik: string = "", kontak?: string) {
    super(nama, email);
    this.nik = nik;
    this.kontak = kontak;
  }

  getPeran(): string {
    return "warga";
  }
}
