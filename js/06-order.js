const DEFAULT_SERVICE_CATALOG = {
  tari: {
    label: 'Musik Iringan Tari',
    addonPrice: 250000,
    overview: 'Produksi musik iringan tari orisinal (tradisional, kreasi baru, maupun kontemporer) yang dirancang berdasarkan dramaturgi gerak, suasana adegan, dan karakter budaya.',
    packages: {
      dasar: {
        label: 'Paket Dasar',
        price: 1000000,
        badge: '1 Nuansa Utama',
        summary: 'Komposisi iringan tari dengan 1 nuansa suasana utama (Sakral, Ceria, Dramatis, Misterius, atau pilihan khusus).',
        features: [
          'Konsep 1 nuansa musik utama secara utuh dari awal hingga akhir karya.',
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
        badge: 'Presisi Video & BPM • Maks. 07:00',
        summary: 'Produksi presisi tinggi mengikuti rekaman video latihan tari per bagian & BPM (Maks. durasi 07:00 menit) dengan unlimited revisi 1 bulan.',
        features: [
          'Sinkronisasi presisi tinggi (frame-by-frame / ketukan) mengikuti rekaman video Google Drive & target BPM tiap bagian.',
          'Pengaturan detail titik masuk penari (intro musik pembuka, kode isyarat, atau masuk bersamaan).',
          'Durasi maksimal 07:00 menit dengan kualitas produksi & mastering tingkat kompetisi/festival.',
          'Unlimited revisi selama 1 bulan penuh terhitung sejak draf pertama dikirimkan.',
          'Output lengkap: Master WAV, MP3, serta Stems / trek terpisah per instrumen.'
        ],
        workflow: 'Sistematika: Kirim video latihan & catatan BPM per bagian → DP 50% → Produksi sinkronisasi presisi video → Uji coba latihan & revisi bebas selama 1 bulan → Pelunasan & pengiriman paket lengkap.'
      },
      custom: {
        label: 'Paket Custom',
        price: 0,
        isCustom: true,
        badge: 'Durasi Bebas & Skala Khusus',
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
    overview: 'Layanan aransemen lagu orisinal, cover/remix, scoring film/konten, jingle brand, hingga mars/himne instansi dengan standar mixing & mastering profesional.',
    packages: {
      dasar: {
        label: 'Paket Dasar',
        price: 1000000,
        badge: 'Aransemen Minimalis',
        summary: 'Aransemen musik minimalis (1–3 instrumen utama), durasi maks. 03:30 menit, mixing bersih standar, maks. 2x revisi minor.',
        features: [
          'Aransemen inti menggunakan 1–3 instrumen utama (misal: piano, gitar akustik, atau synth ringan).',
          'Durasi audio maksimal 03:30 menit, cocok untuk demo lagu, cover akustik, atau backsound ringan.',
          'Mixing seimbang dan bersih agar vokal/melodi utama terdengar jelas.',
          'Hak revisi minor maksimal 2 kali.',
          'Output file Master WAV (24-bit) & MP3 (320kbps).'
        ],
        workflow: 'Sistematika: Kirim panduan melodi/vokal kasar & referensi lagu → DP 50% → Pembuatan aransemen minimalis → Preview draf → Revisi minor (maks. 2x) → Pelunasan & kirim master.'
      },
      standar: {
        label: 'Paket Standar',
        price: 1750000,
        badge: 'Full Band / Pop / Scoring',
        summary: 'Aransemen penuh (4–7 instrumen) dengan dinamika intro–verse–chorus–outro, siap rilis platform digital.',
        features: [
          'Aransemen lengkap 4–7 instrumen (rhythm section, harmoni, melodi pengisi, dan perkusi/drum).',
          'Pembangunan dinamika lagu utuh (Intro, Verse, Pre-Chorus, Chorus, Bridge, hingga Outro).',
          'Mixing & mastering profesional sesuai standar loudness platform digital (Spotify, YouTube, Instagram).',
          'Revisi penyesuaian aransemen & keseimbangan instrumen (maks. 3 kali).',
          'Output file Master WAV, MP3, serta versi Minus One / Karaoke.'
        ],
        workflow: 'Sistematika: Diskusi genre, tempo (BPM) & nada dasar → DP 50% → Produksi aransemen penuh → Kirim draf mixing awal → Tahap revisi → Mastering final & pelunasan.'
      },
      pro: {
        label: 'Paket Pro',
        price: 2500000,
        badge: 'Sinematik • Unlimited Revisi 1 Bln',
        summary: 'Produksi kompleks untuk scoring film/brand/jingle, layer orkestra & sound design penuh, unlimited revisi 1 bulan + stems.',
        features: [
          'Aransemen kompleks multi-layer (orkestrasi lengkap, perpaduan etnik-modern, dan cinematic sound design).',
          'Sinkronisasi presisi dengan adegan video/film atau identitas audio merek (sonic branding).',
          'Unlimited revisi selama 1 bulan penuh sejak pengiriman draf pertama.',
          'Mastering kualitas rilis komersial dengan kejernihan dan kedalaman ruang stereo maksimal.',
          'Output lengkap: Master WAV, MP3, Minus One, serta Stems / Multitrack terpisah.'
        ],
        workflow: 'Sistematika: Bedah konsep/storyboard video → DP 50% → Penyusunan aransemen kompleks → Review & revisi bebas selama 1 bulan → Final mastering & penyerahan multitrack.'
      },
      custom: {
        label: 'Paket Custom',
        price: 0,
        isCustom: true,
        badge: 'Multi-Trek / Mars / Buyout',
        summary: 'Solusi khusus untuk produksi paket multi-lagu/EP, mars atau himne resmi instansi, scoring film panjang, maupun kebutuhan lisensi hak cipta penuh dengan nominal sesuai kesepakatan.',
        features: [
          'Produksi multi-trek dalam satu proyek (paket album/EP, bundel jingle berbagai durasi 15s/30s/60s, atau mars instansi).',
          'Opsi rekaman live instrumen/vokal khusus sesuai kebutuhan karakter proyek.',
          'Pilihan skema lisensi komersial penuh hingga Full Buyout (pengalihan hak cipta eksklusif kepada klien).',
          'Standar teknis khusus sesuai permintaan (target LUFS penyiaran TV/radio, format audio sinema, atau stems lengkap).',
          'Nominal biaya ditetapkan berdasarkan ruang lingkup proyek hasil diskusi bersama.'
        ],
        workflow: 'Sistematika: Konsultasi ruang lingkup & skema lisensi → Kesepakatan harga & kontrak → DP 50% → Produksi bertahap sesuai milestone → Finalisasi & penyerahan seluruh hak/file.'
      }
    }
  },
  transkripsi: {
    label: 'Transkripsi Musik',
    addonPrice: 250000,
    overview: 'Penulisan ulang rekaman audio/video menjadi partitur notasi musik yang akurat (Not Balok, Not Angka, maupun Tablatur) untuk pertunjukan, dokumentasi, HAKI, dan penelitian.',
    packages: {
      dasar: {
        label: 'Paket Dasar',
        price: 100000,
        badge: 'Melodi Utama & Akor',
        summary: 'Transkripsi melodi utama (vokal atau 1 instrumen solo) beserta simbol akor dasar dalam format partitur PDF siap cetak.',
        features: [
          'Transkripsi akurat 1 jalur melodi utama (vokal atau instrumen solo) dari sumber audio/video.',
          'Penulisan simbol akor (chord symbols) dan tanda birama/tempo yang tepat.',
          'Pilihan penulisan Not Balok (Staff Notation) atau Not Angka.',
          'Revisi koreksi pembacaan nada/ritme maksimal 2 kali.',
          'Output file Partitur PDF beresolusi tinggi dengan tata letak rapi siap cetak.'
        ],
        workflow: 'Sistematika: Kirim tautan/file audio/video → DP 50% → Analisis nada dasar, birama & transkripsi melodi → Kirim draf PDF → Pengecekan & revisi → Pelunasan & file final.'
      },
      standar: {
        label: 'Paket Standar',
        price: 200000,
        badge: 'Piano 2 Tangan / Ensambel Kecil',
        summary: 'Transkripsi iringan piano 2 tangan (grand staff), vokal + iringan, atau ensambel kecil (2–4 instrumen) lengkap dengan audio simulasi.',
        features: [
          'Transkripsi multi-stave untuk piano 2 tangan, vokal + iringan, atau ansambel kecil (2–4 instrumen).',
          'Penulisan dinamika, artikulasi, lirik (jika ada), serta simbol akor lengkap.',
          'Pilihan Not Balok, Not Angka, atau gabungan keduanya.',
          'Revisi penyesuaian notasi maksimal 3 kali.',
          'Output file Partitur PDF siap cetak + audio simulasi MIDI/MP3 untuk mempermudah pembacaan.'
        ],
        workflow: 'Sistematika: Kirim sumber audio & pilih format notasi → DP 50% → Proses transkripsi & engraving partitur → Preview PDF & simulasi audio → Revisi → Pelunasan.'
      },
      pro: {
        label: 'Paket Pro',
        price: 350000,
        badge: 'Full Band / Orkestra / Tradisi',
        summary: 'Transkripsi lengkap multi-instrumen, full band, paduan suara, atau ansambel musik tradisional termasuk Full Score & Partitur per instrumen.',
        features: [
          'Transkripsi menyeluruh untuk komposisi multi-instrumen (Full Band, Orkestra, Paduan Suara, atau Ansambel Tradisi).',
          'Penyusunan Full Score (skor gabungan seluruh instrumen) sekaligus Part terpisah untuk masing-masing pemain.',
          'Detail artikulasi, ornamentasi melodi, pola ritmis perkusi, dan dinamika lengkap.',
          'Output lengkap: PDF Full Score, PDF Part per instrumen, serta audio simulasi MIDI & MP3.'
        ],
        workflow: 'Sistematika: Pemetaan seluruh instrumen dalam audio → DP 50% → Transkripsi detail tiap instrumen & penyusunan Full Score → Review draf → Penyempurnaan → Pelunasan & serah terima.'
      },
      custom: {
        label: 'Paket Custom',
        price: 0,
        isCustom: true,
        badge: 'Etnomusikologi / Bundel / File Sumber',
        summary: 'Layanan khusus untuk transkripsi deskriptif kebutuhan akademik (skripsi/tesis etnomusikologi), repertoar tradisi kompleks, bundel multi-karya, atau penyertaan file proyek sumber dengan biaya sesuai kesepakatan.',
        features: [
          'Transkripsi deskriptif maupun preskriptif untuk kebutuhan penelitian akademik, skripsi, tesis, dan dokumentasi budaya.',
          'Penyesuaian simbol khusus untuk instrumen tradisional, sistem laras non-diatonis, atau teknik tabuhan perkusi.',
          'Pengerjaan bundel multi-repertoar atau karya berdurasi panjang.',
          'Dapat menyertakan file proyek sumber asli (Sibelius, MuseScore, atau MusicXML) agar mudah diedit kembali.',
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
