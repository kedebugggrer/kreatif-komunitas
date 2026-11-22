# Kreatif — Portofolio & Kritik Terbuka

Komunitas portofolio berbasis React + Vite, dengan Supabase untuk autentikasi email/kata sandi, database bersama dan penyimpanan gambar. Desain memakai Fraunces dan Inter yang di-host sendiri.

## Status

Tanpa konfigurasi Supabase, situs menampilkan pratinjau baca-saja dengan karya contoh yang sudah ada. Login/unggah/komentar tidak dibuat seolah-olah online. Data localStorage versi sebelumnya tidak dihapus, tetapi tidak dipakai atau diimpor otomatis karena identitas pengguna lama tidak terverifikasi.

Kode integrasi backend dan migrasi tersedia; aktivasi dan pengujian menyeluruh pada proyek Supabase nyata masih diperlukan sebelum penggunaan publik.

## Fitur

- Pencarian karya/kreator, kategori, urutan terbaru atau paling disukai, hasil kosong dan reset.
- Akun email/kata sandi; username unik 3–20 karakter; konfirmasi email melalui Supabase.
- Karya dengan 1–5 gambar JPG/PNG/WebP, maksimal 3 MB per gambar; judul, deskripsi, kategori dan maksimal 5 tag.
- Edit/hapus karya sendiri; konfirmasi sebelum menghapus karya beserta komentar dan apresiasinya.
- Profil dengan nama tampilan, bio, foto, tautan HTTPS dan galeri.
- Apresiasi serta komentar beranak; penulis dapat menghapus isi komentarnya tanpa menghilangkan balasan.
- Kebijakan row-level security membatasi perubahan data pada pemiliknya.

## Menjalankan

```bash
npm ci
npm run dev
npm run build
```

Belum ada suite tes otomatis dalam proyek. Pemeriksaan browser memakai pratinjau aplikasi, bukan layanan palsu.

## Aktivasi Supabase

1. Buat/pilih proyek Supabase milik tim.
2. Jalankan `supabase/migrations/202611220001_community.sql` melalui SQL Editor pada proyek baru. Migrasi membuat tabel, trigger profil, kebijakan akses dan bucket publik `portfolio`; jangan jalankan ulang pada skema yang sudah berisi tabel ini.
3. Di Auth aktifkan email/password serta konfirmasi email. Atur Site URL dan redirect URL ke URL situs yang sebenarnya. Gunakan SMTP produksi dan batas permintaan yang sesuai sebelum membuka pendaftaran umum.
4. Atur variabel build berikut di host atau file `.env.local` yang diabaikan Git:
   - `VITE_SUPABASE_URL`: URL proyek HTTPS.
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: publishable key (atau anon key) proyek. Jangan pernah memakai service-role/secret key di frontend.
5. Build ulang dan deploy dengan `npm run build`, direktori keluaran `dist`, branch `main`.
6. Uji dua akun dari browser berbeda: daftar dan konfirmasi, masuk, unggah, refresh, lihat dari akun lain, balas komentar, suka, edit profil/karya, dan hapus karya. Pastikan akun lain tidak bisa mengedit atau menghapus data pemilik lewat API.

Kode tidak menyimpan kredensial, tidak mengonfigurasi host, dan tidak mengaktifkan deploy otomatis GitHub. Sambungkan Cloudvea ke branch `main` dan atur variabel build di atas.

## Batas operasional

- Gambar dalam bucket publik dapat dibaca siapa pun yang memiliki URL. Menghapus karya menghapus data karya/komentar/apresiasi, bukan file storage yang mungkin masih direferensikan. Pembersihan aset tak terpakai perlu prosedur server terpisah sebelum pemakaian skala besar.
- Feed mengambil data per batch tetapi belum mempunyai pagination UI; optimasi skala besar, moderasi dan pembatasan spam aplikasi belum termasuk paket ini.
- Pratinjau tanpa backend tidak memverifikasi alur akun online. Jangan menyatakan layanan multiuser aktif sebelum konfigurasi dan pemeriksaan pada proyek nyata selesai.
