# Kreatif — Portofolio & Kritik Terbuka

Website komunitas untuk kreator: unggah portofolio, dapatkan kritik membangun dalam
 komentar beranak (thread), dan tampilkan galeri pribadi di profil dengan username unik.

## Fitur

- **Jelajah** — umpan karya terbaru dan daftar kreator aktif
- **Halaman karya** — gambar, deskripsi, tag, tombol suka, dan kritik beranak (thread) yang bisa dibalas
- **Profil kreator** — username unik (`@username`), nama tampilan, bio, statistik, dan galeri karya
- **Unggah karya** — judul, deskripsi, tag (maksimal 5), dan gambar (maksimal 3 MB, disimpan lokal)
- **Masuk/Daftar** — cukup pilih username 3–20 karakter (huruf, angka, garis bawah)

Data disimpan di `localStorage` per peramban (demo front-end; karya contoh dimuat saat kunjungan pertama).

## Menjalankan

```bash
npm install
npm run dev      # server pengembangan
npm run build    # build produksi
```

Dibuat dengan React + Vite. Tipografi: Fraunces (judul) dan Inter (teks), di-host sendiri via Fontsource.
