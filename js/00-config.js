const DEFAULT_SERVICE_CATALOG = {
  tari: {
    label: 'Musik Iringan Tari',
    addonPrice: 250000,
    packages: {
      dasar: {
        label: 'Paket Dasar',
        price: 750000,
        desc: 'Komposisi iringan tari berdasarkan 1 nuansa utama (Sakral, Ceria, Dramatis, Misterius, atau pilihan khusus). Maks. 3x revisi minor, output master WAV & MP3.'
      },
      standar: {
        label: 'Paket Standar',
        price: 1500000,
        desc: 'Iringan tari dinamis terstruktur per adegan & perubahan tempo (Maks. durasi 07:00 menit). Sinkronisasi alur suasana & struktur gerak tari.'
      },
      pro: {
        label: 'Paket Pro',
        price: 2500000,
        desc: 'Produksi presisi tinggi mengikuti rekaman video tari per bagian & BPM (Maks. durasi 07:00 menit). Unlimited revisi 1 bulan + stems instrumen.'
      },
      custom: {
        label: 'Paket Custom',
        price: 3500000,
        desc: 'Durasi bebas (> 7 menit / sendratari), kolaborasi instrumen khusus, konsep dramatika multi-babak & spesifikasi teknis sesuai kesepakatan.'
      }
    }
  },
  digital: {
    label: 'Musik Non-Tari',
    addonPrice: 250000,
    packages: {
      dasar: {
        label: 'Paket Dasar (Akustik / Demo)',
        price: 650000,
        desc: 'Aransemen minimalis (1–3 instrumen utama), durasi maks. 03:30, mixing bersih standar, maks. 2x revisi minor, output master WAV & MP3.'
      },
      standar: {
        label: 'Paket Standar (Full Arrangement)',
        price: 1350000,
        desc: 'Aransemen penuh (4–7 instrumen), dinamika intro–verse–chorus–outro, mixing & mastering siap rilis platform digital.'
      },
      pro: {
        label: 'Paket Pro (Scoring / Orkestral)',
        price: 2300000,
        desc: 'Scoring sinematik/brand/jingle kompleks, layer orkestra & sound design penuh, unlimited revisi 1 bulan + file Stems/Multitrack.'
      },
      custom: {
        label: 'Paket Custom (Proyek Khusus)',
        price: 3000000,
        desc: 'Produksi multi-lagu/EP, mars/himne resmi instansi, scoring film berdurasi panjang, atau lisensi hak cipta penuh (buyout).'
      }
    }
  },
  transkripsi: {
    label: 'Transkripsi Musik',
    addonPrice: 250000,
    packages: {
      dasar: {
        label: 'Paket Dasar (1 Jalur / Melodi)',
        price: 250000,
        desc: 'Transkripsi melodi utama (vokal atau 1 instrumen solo) beserta simbol akor dasar. Output partitur PDF rapi siap cetak.'
      },
      standar: {
        label: 'Paket Standar (2–4 Instrumen)',
        price: 550000,
        desc: 'Transkripsi ensambel kecil / iringan piano 2 tangan / melodi + ritmis. Output PDF partitur + audio simulasi MIDI/MP3.'
      },
      pro: {
        label: 'Paket Pro (Full Score / Orkestra)',
        price: 1100000,
        desc: 'Transkripsi lengkap multi-instrumen / band penuh / ansambel tradisi. Termasuk Full Score, Part per instrumen, PDF & MIDI.'
      },
      custom: {
        label: 'Paket Custom (Arsip / Akademik)',
        price: 1500000,
        desc: 'Transkripsi repertoar tradisi kompleks, analisis etnomusikologi, durasi panjang, atau paket file sumber Sibelius/MuseScore/MusicXML.'
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
