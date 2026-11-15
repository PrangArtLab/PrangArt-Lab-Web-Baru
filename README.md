# PrangArt Lab — Music Production Studio

Website resmi **PrangArt Lab** — studio produksi musik tari, musik non-tari, dan transkripsi musik yang berlokasi di Samarinda, Kalimantan Timur.

Aplikasi ini adalah **static web app multi-file** (HTML + CSS + JavaScript) yang dapat di-deploy gratis di GitHub Pages tanpa proses build, tanpa server backend, dan tanpa database wajib.

---

## Daftar Isi

1. [Fitur Utama](#fitur-utama)
2. [Struktur Folder](#struktur-folder)
3. [Cara Deploy ke GitHub Pages](#cara-deploy-ke-github-pages)
4. [Setup Firebase (Opsional)](#setup-firebase-opsional)
5. [Mode Operasi Aplikasi](#mode-operasi-aplikasi)
6. [Akun Demo & PIN Admin](#akun-demo--pin-admin)
7. [Alur Pemesanan 14 Tahap](#alur-pemesanan-14-tahap)
8. [Kustomisasi](#kustomisasi)
9. [Troubleshooting](#troubleshooting)
10. [Lisensi](#lisensi)

---

## Fitur Utama

- **Landing page** dengan penjelasan 3 kategori layanan dan alur SOP 14 tahap.
- **Formulir kebutuhan klien** dengan estimasi biaya realtime, kalkulator terbilang Rupiah otomatis, dan dukungan input spesifikasi dinamis per paket (Dasar / Standar / Pro).
- **Generator Kartu Brief 16:9 PNG** otomatis — dapat diunduh dan dikirim ke WhatsApp Produser sebagai dokumen pengajuan.
- **AI Synopsis Generator** — membuat draf sinopsis karya otomatis dari judul + jenis + latar budaya (dengan fallback lokal jika API tidak tersedia).
- **Ruang Klien** — login, lihat penawaran resmi, setujui perjanjian, unggah bukti transfer, unduh hasil akhir, konfirmasi penerimaan.
- **Ruang Admin** — terbitkan penawaran, atur Lampiran A/B/C perjanjian, verifikasi pembayaran, unggah audio pratinjau & master final, kelola portofolio.
- **Perjanjian Produksi Musik v4-8** lengkap dengan Lampiran A, B, C — dapat dicetak, diunduh sebagai PNG, dan ditandatangani secara elektronik.
- **Invoice & Kuitansi resmi** untuk Termin I (DP), Termin II (Pelunasan), atau Pembayaran Penuh 100%.
- **Komposisi WhatsApp** interaktif — pesan diskusi otomatis terformat sebelum membuka WhatsApp.
- **Sinkronisasi cloud opsional** via Firebase Firestore + Storage, dengan fallback otomatis ke `localStorage` jika Firebase belum dikonfigurasi.

---

## Struktur Folder
