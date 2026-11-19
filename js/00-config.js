const DEFAULT_SERVICE_CATALOG = {
  tari: {
    label: 'Musik Iringan Tari',
    addonPrice: 250000,
    overview: 'Produksi musik iringan tari orisinal (tradisional, kreasi baru, maupun kontemporer) yang dirancang berdasarkan dramaturgi gerak, suasana adegan, dan karakter budaya.',
    packages: {
      dasar: {
        label: 'Paket Dasar',
        price: 1000000,
        maxSeconds: 420,
        badge: '1 Nuansa • Maks. 07:00',
        summary: 'Komposisi iringan tari dengan 1 nuansa suasana utama (Sakral, Ceria, Dramatis, Misterius, atau pilihan khusus), durasi maksimal 07:00 menit.',
        features: [
          'Konsep 1 nuansa musik utama secara utuh dari awal hingga akhir karya (maks. 07:00 menit).',
          'Penyesuaian instrumen tradisi/digital sesuai latar belakang budaya tari.',
          'Mixing & mastering standar pertunjukan (audio jernih & bertenaga di panggung).',
          'Hak revisi minor maksimal 3 kali (penyesuaian volume, tempo ringan, atau aksen).',
          'Output file Master WAV (24-bit) & MP3 (320kbps) + opsi tambahan sorak.'
        ],
        workflow: 'Sistematika: Konsultasi konsep & sinopsis → Pembayaran DP 50% → Pembuatan aransemen 1 nuansa utuh → Pengiriman draf → Revisi minor (maks. 3x) → Pelunasan & penyerahan master.'
      },
      standar: {
        label: 'Paket Standar',
        price: 1500000,
        maxSeconds: 420,
        badge: 'Multi-Adegan • Maks. 07:00',
        summary: 'Iringan tari dinamis terstruktur per adegan & perubahan tempo (Maks. durasi 07:00 menit) berdasarkan alur suasana & struktur gerak.',
        features: [
          'Dinamika musik multi-bagian (Opening, Orientasi, Bagian Tengah, Klimaks, Penutup).',
          'Sinkronisasi perubahan tempo, transisi suasana, dan aksentuasi gerak berdasarkan rincian menit (timecode) & link referensi.',
          'Durasi maksimal 07:00 menit dengan aransemen instrumen berlapis (tradisi & modern).',
          'Revisi penyesuaian dinamika, transisi adegan, dan keseimbangan instrumen.',
          'Output file Master WAV (24-bit) & MP3 (320kbps) + opsi tambahan sorak.'
        ],
        workflow: 'Sistematika: Pengisian tabel struktur & urutan menit adegan → DP 50% → Penyusunan kerangka tiap babak → Preview draf per struktur → Penyempurnaan transisi → Pelunasan & serah terima.'
      },
      pro: {
        label: 'Paket Pro',
        price: 2000000,
        maxSeconds: 420,
        badge: 'Presisi Video & BPM • Maks. 07:00',
        summary: 'Produksi presisi tinggi mengikuti rekaman video latihan tari per bagian & BPM (Maks. durasi 07:00 menit) dengan unlimited revisi 1 bulan.',
        features: [
          'Sinkronisasi presisi tinggi (frame-by-frame / ketukan) mengikuti rekaman video Google Drive & target BPM tiap bagian.',
          'Pengaturan detail titik masuk penari (intro musik pembuka, kode isyarat, atau masuk bersamaan).',
          'Durasi maksimal 07:00 menit dengan kualitas produksi & mastering tingkat kompetisi/festival.',
          'Unlimited revisi dalam koridor konsep awal selama 1 bulan penuh terhitung sejak draf pertama dikirimkan.',
          'Output lengkap: Master WAV, MP3, serta Stems / trek terpisah per instrumen.'
        ],
        workflow: 'Sistematika: Kirim video latihan & catatan BPM per bagian → DP 50% → Produksi sinkronisasi presisi video → Uji coba latihan & revisi bebas selama 1 bulan → Pelunasan & pengiriman paket lengkap.'
      },
      custom: {
        label: 'Paket Custom',
        price: 0,
        isCustom: true,
        badge: 'Durasi Bebas (> 07:00) & Skala Khusus',
        summary: 'Dirancang khusus untuk garapan berdurasi di atas 7 menit, sendratari, teater tari, parade/karnaval, atau kolaborasi instrumen khusus dengan nominal biaya sesuai kesepakatan.',
        features: [
          'Durasi bebas tanpa batas 7 menit (cocok untuk sendratari, kolosal, atau pertunjukan multi-babak).',
          'Kolaborasi rekaman instrumen akustik/tradisi live khusus maupun orkestrasi penuh sesuai kebutuhan artistik.',
          'Struktur dramatik multi-babak lengkap dengan pengaturan cue masuk penari, narasi, dan efek suara panggung.',
          'Deliverables fleksibel: Master WAV, MP3, Stems per instrumen, versi potongan latihan, hingga click-track panggung.',
          'Besaran biaya produksi & jadwal pengerjaan ditentukan secara transparan melalui diskusi kesepakatan bersama.'
        ],
        workflow: 'Sistematika: Konsultasi naskah & kebutuhan khusus → Penetapan kesepakatan harga & jadwal → DP 50% → Produksi bertahap per babak → Review & penyempurnaan → Pelunasan & serah terima lengkap.'
      }
    }
  },
  digital: {
    label: 'Musik Non-Tari',
    addonPrice: 250000,
    overview: 'Layanan aransemen lagu orisinal, cover/remix, scoring film/konten, jingle brand, hingga mars/himne instansi dengan batas durasi terukur sesuai paket dan standar mixing & mastering profesional.',
    packages: {
      dasar: {
        label: 'Paket Dasar',
        price: 1000000,
        maxSeconds: 210,
        badge: 'Minimalis • Maks. 03:30',
        summary: 'Aransemen musik minimalis (1–3 instrumen utama), batas durasi maksimal 03:30 menit, mixing bersih standar, maks. 2x revisi minor.',
        features: [
          'Batas durasi maksimal 03:30 menit (untuk durasi di atas 03:30 silakan pilih Paket Standar, Pro, atau Custom).',
          'Aransemen inti menggunakan 1–3 instrumen utama (misal: piano, gitar akustik, atau synth ringan).',
          'Mixing seimbang dan bersih agar vokal/melodi utama terdengar jelas.',
          'Hak revisi minor maksimal 2 kali.',
          'Output file Master WAV (24-bit) & MP3 (320kbps).'
        ],
        workflow: 'Sistematika: Kirim panduan melodi/vokal kasar & referensi lagu → DP 50% → Pembuatan aransemen minimalis (maks. 03:30) → Preview draf → Revisi minor (maks. 2x) → Pelunasan & kirim master.'
      },
      standar: {
        label: 'Paket Standar',
        price: 1750000,
        maxSeconds: 300,
        badge: 'Full Band / Pop • Maks. 05:00',
        summary: 'Aransemen penuh (4–7 instrumen) dengan dinamika intro–verse–chorus–outro, batas durasi maksimal 05:00 menit, siap rilis platform digital.',
        features: [
          'Batas durasi maksimal 05:00 menit (di atas 05:00 pilih Paket Pro atau Paket Custom).',
          'Aransemen lengkap 4–7 instrumen (rhythm section, harmoni, melodi pengisi, dan perkusi/drum).',
          'Pembangunan dinamika lagu utuh (Intro, Verse, Pre-Chorus, Chorus, Bridge, hingga Outro).',
          'Mixing & mastering profesional sesuai standar loudness platform digital (Spotify, YouTube, Instagram).',
          'Revisi penyesuaian aransemen & keseimbangan instrumen (maks. 3 kali) + Output Master WAV, MP3, dan Minus One.'
        ],
        workflow: 'Sistematika: Diskusi genre, tempo (BPM) & nada dasar → DP 50% → Produksi aransemen penuh (maks. 05:00) → Kirim draf mixing awal → Tahap revisi → Mastering final & pelunasan.'
      },
      pro: {
        label: 'Paket Pro',
        price: 2500000,
        maxSeconds: 420,
        badge: 'Sinematik • Maks. 07:00',
        summary: 'Produksi kompleks untuk scoring film/brand/jingle, layer orkestra & sound design penuh, batas durasi maksimal 07:00 menit, unlimited revisi 1 bulan + stems.',
        features: [
          'Batas durasi maksimal 07:00 menit (untuk durasi > 07:00 menit seperti film panjang/suite wajib pilih Paket Custom).',
          'Aransemen kompleks multi-layer (orkestrasi lengkap, perpaduan etnik-modern, dan cinematic sound design).',
          'Sinkronisasi presisi dengan adegan video/film atau identitas audio merek (sonic branding).',
          'Unlimited revisi dalam koridor konsep awal selama 1 bulan penuh sejak pengiriman draf pertama.',
          'Output lengkap: Master WAV, MP3, Minus One, serta Stems / Multitrack terpisah.'
        ],
        workflow: 'Sistematika: Bedah konsep/storyboard video → DP 50% → Penyusunan aransemen kompleks (maks. 07:00) → Review & revisi 1 bulan → Final mastering & penyerahan multitrack.'
      },
      custom: {
        label: 'Paket Custom',
        price: 0,
        isCustom: true,
        badge: 'Durasi Bebas (> 07:00) / Multi-Trek',
        summary: 'Solusi khusus untuk karya berdurasi di atas 7 menit, produksi paket multi-lagu/EP, mars atau himne resmi instansi, maupun kebutuhan lisensi hak cipta penuh dengan nominal sesuai kesepakatan.',
        features: [
          'Durasi bebas tanpa batas 7 menit (cocok untuk overture, scoring film panjang, maupun komposisi multi-bagian).',
          'Produksi multi-trek dalam satu proyek (paket album/EP, bundel jingle berbagai durasi 15s/30s/60s, atau mars instansi).',
          'Opsi rekaman live instrumen/vokal khusus sesuai kebutuhan karakter proyek.',
          'Pilihan skema lisensi komersial penuh hingga Full Buyout (pengalihan hak cipta eksklusif kepada klien).',
          'Nominal biaya ditetapkan berdasarkan ruang lingkup proyek hasil diskusi bersama.'
        ],
        workflow: 'Sistematika: Konsultasi ruang lingkup & skema lisensi → Kesepakatan harga & kontrak → DP 50% → Produksi bertahap sesuai milestone → Finalisasi & penyerahan seluruh hak/file.'
      }
    }
  },
  transkripsi: {
    label: 'Transkripsi Musik',
    addonPrice: 250000,
    overview: 'Penulisan ulang rekaman audio/video menjadi partitur notasi musik akurat (Not Balok, Not Angka, maupun Tablatur). Dihitung secara realistis per menit per instrumen (minimal 1 menit; durasi di bawah 01:00 tetap dihitung 1 menit penuh).',
    packages: {
      dasar: {
        label: 'Paket Dasar (Per Menit / Instrumen)',
        price: 75000,
        billingUnit: 'per_min_inst',
        badge: 'Rp75rb / mnt / instrumen',
        summary: 'Transkripsi melodi tunggal (vokal atau 1 instrumen solo) + simbol akor dasar. Dihitung Rp75.000 per menit per instrumen (minimal 1 menit; durasi < 01:00 tetap dihitung 1 menit).',
        features: [
          'Tarif realistis Rp75.000 per menit per instrumen (minimal 1 menit; di bawah 1 menit harga tetap 1 menit penuh).',
          'Mencakup 1 jalur melodi utama per instrumen + simbol akor (chord symbols) & tanda birama/tempo.',
          'Pilihan penulisan Not Balok (Staff Notation) atau Not Angka.',
          'Revisi koreksi pembacaan nada/ritme maksimal 2 kali.',
          'Output file Partitur PDF beresolusi tinggi siap cetak.'
        ],
        workflow: 'Sistematika: Kirim audio/video, durasi & jumlah instrumen → Kalkulasi otomatis (min. 1 menit) → DP 50% → Transkripsi & engraving → Preview PDF & revisi → Pelunasan & file final.'
      },
      standar: {
        label: 'Paket Standar (Per Menit / Instrumen)',
        price: 125000,
        billingUnit: 'per_min_inst',
        badge: 'Rp125rb / mnt / instrumen',
        summary: 'Transkripsi detail dengan harmoni, iringan piano 2 tangan (grand staff), atau artikulasi polifonik + audio simulasi MIDI/MP3. Minimal 1 menit per instrumen.',
        features: [
          'Tarif Rp125.000 per menit per instrumen (minimal 1 menit; durasi < 01:00 tetap dihitung 1 menit penuh).',
          'Cocok untuk piano 2 tangan, gitar fingerstyle/klasik, atau vokal + iringan harmonik terperinci.',
          'Lengkap dengan dinamika, artikulasi, lirik, serta simbol akor.',
          'Revisi penyesuaian notasi maksimal 3 kali.',
          'Output file Partitur PDF siap cetak + audio simulasi MIDI/MP3.'
        ],
        workflow: 'Sistematika: Kirim sumber audio & rincian instrumen → Kalkulasi otomatis → DP 50% → Proses transkripsi detail → Preview PDF & simulasi audio → Revisi → Pelunasan.'
      },
      komplet: {
        label: 'Paket Komplet (Full Ensemble / Orkestra)',
        price: 450000,
        billingUnit: 'per_min_complete',
        badge: 'Rp450rb / mnt (All-In Ensemble)',
        summary: 'Paket lengkap transkripsi seluruh instrumen dalam satu komposisi utuh (Full Band, Paduan Suara, Orkestra, atau Ansambel Tradisi) termasuk Full Score + Part per pemain. Minimal 1 menit.',
        features: [
          'Tarif paket komplet Rp450.000 per menit untuk seluruh ensambel (minimal 1 menit; di bawah 1 menit harga tetap 1 menit penuh).',
          'Mencakup seluruh instrumen dalam rekaman sekaligus (hemat tanpa perlu menghitung tarif per instrumen).',
          'Mendapatkan Full Score (skor gabungan semua instrumen) + Partitur terpisah (Parts) untuk tiap pemain.',
          'Detail ornamentasi melodi, pola tabuhan perkusi tradisi, dinamika, dan artikulasi lengkap.',
          'Output lengkap: PDF Full Score, PDF Part per instrumen, serta simulasi audio MIDI & MP3.'
        ],
        workflow: 'Sistematika: Pemetaan seluruh instrumen dalam rekaman → Kalkulasi durasi (min. 1 menit) → DP 50% → Penyusunan Full Score & Parts → Review draf → Pelunasan & serah terima lengkap.'
      },
      custom: {
        label: 'Paket Custom',
        price: 0,
        isCustom: true,
        badge: 'Etnomusikologi / Bundel / File Sumber',
        summary: 'Layanan khusus untuk transkripsi deskriptif kebutuhan akademik (skripsi/tesis etnomusikologi), sistem laras tradisi non-diatonis, bundel multi-karya, atau file proyek sumber dengan biaya sesuai kesepakatan.',
        features: [
          'Transkripsi deskriptif maupun preskriptif untuk kebutuhan penelitian akademik, skripsi, tesis, dan dokumentasi budaya.',
          'Penyesuaian simbol khusus untuk instrumen tradisional, sistem laras non-diatonis, atau teknik tabuhan perkusi kompleks.',
          'Pengerjaan bundel multi-repertoar atau karya berdurasi panjang dengan harga borongan kesepakatan.',
          'Menyertakan file proyek sumber asli (Sibelius, MuseScore, atau MusicXML) agar mudah diedit kembali.',
          'Nominal biaya ditentukan berdasarkan tingkat kerumitan dan jumlah halaman/instrumen melalui diskusi.'
        ],
        workflow: 'Sistematika: Kirim sampel audio & standar penulisan yang diminta → Penetapan harga kesepakatan → DP 50% → Proses transkripsi & verifikasi detail → Pelunasan & penyerahan seluruh berkas.'
      }
    }
  }
};

const TRACKER_MILESTONES = [
  '1. Menunggu Verifikasi & Kontrak',
  '2. Pembayaran DP 50%',
  '3. Penyusunan Konsep & Aransemen Awal',
  '4. Pengiriman Draf Pertama',
  '5. Tahap Revisi & Penyempurnaan',
  '6. Mixing & Mastering Final',
  '7. Pelunasan & Penyerahan Master File'
];

const appState = {
  currentPage: 'home',
  selectedServiceLine: 'tari',
  selectedPackage: 'dasar',
  customPrice: null,
  synopsisMode: 'manual',
  currentClientUser: null,
  isAdminUnlocked: false,
  serviceCatalog: JSON.parse(JSON.stringify(DEFAULT_SERVICE_CATALOG)),
  projects: [],
  portfolioItems: []
};
