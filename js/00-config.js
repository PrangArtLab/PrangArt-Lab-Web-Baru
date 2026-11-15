const LOGO_URL = 'https://iili.io/o9B6HXa.md.png';
const STORAGE_KEY = 'prangart_lab_state_v6';

const STUDIO_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDJX7Y95gJ8j3A3te5pvTONrAJBxZ5yS2s",
  authDomain: "website-prangart-8ceeb.firebaseapp.com",
  databaseURL: "https://website-prangart-8ceeb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "website-prangart-8ceeb",
  storageBucket: "website-prangart-8ceeb.firebasestorage.app",
  messagingSenderId: "153873576617",
  appId: "1:153873576617:web:34441945bc26c38d53afb8"
};

const firebaseAppId = 'website-prangart-8ceeb';
let db = null;
let fbStorage = null;
let firebaseUser = null;

const SOP_14_STEPS = [
  { no:'01', title:'Kontak Awal', desc:'Klien menghubungi PrangArt Lab via WhatsApp, media sosial, atau website.' },
  { no:'02', title:'Diskusi & Konsultasi', desc:'Membahas jenis layanan, konsep, referensi, teknis, anggaran, & estimasi waktu.' },
  { no:'03', title:'Formulir Pemesanan', desc:'Mengisi form sesuai layanan: Musik Tari, Musik Non-Tari, atau Transkripsi.' },
  { no:'04', title:'Pemeriksaan Data', desc:'PrangArt Lab memeriksa kelengkapan formulir, referensi, audio, dan video.' },
  { no:'05', title:'Diskusi Lanjutan', desc:'Mengklarifikasi detail yang belum jelas & menyepakati ruang lingkup (jika perlu).' },
  { no:'06', title:'Penawaran Harga', desc:'PrangArt Lab menyampaikan biaya resmi, waktu pengerjaan, output, & ketentuan.' },
  { no:'07', title:'Persetujuan Administrasi', desc:'Tanda tangan Perjanjian Produksi (Tari/Non-Tari) atau Persetujuan Transkripsi.' },
  { no:'08', title:'Pembayaran', desc:'Klien memilih DP 50% atau Penuh 100%, lalu diverifikasi sebelum kerja dimulai.' },
  { no:'09', title:'Konfirmasi Pesanan', desc:'PrangArt Lab menerbitkan nomor pesanan & pemberitahuan pekerjaan siap dimulai.' },
  { no:'10', title:'Proses Pengerjaan', desc:'Komposisi, aransemen, atau transkripsi dikerjakan sesuai kesepakatan.' },
  { no:'11', title:'Pratinjau & Revisi', desc:'Klien memeriksa hasil sementara dan menyampaikan koreksi sesuai kuota.' },
  { no:'12', title:'Pelunasan', desc:'Khusus skema DP 50%, klien melunasi sisa 50% sebelum hasil akhir diserahkan.' },
  { no:'13', title:'Penyerahan Hasil Akhir', desc:'PrangArt Lab menyerahkan berkas master berkualitas tinggi sesuai format.' },
  { no:'14', title:'Konfirmasi & Arsip', desc:'Klien mengonfirmasi penerimaan hasil; seluruh dokumen & berkas diarsipkan.' }
];

const TRACKER_MILESTONES = [
  '01. Pengajuan & Pemeriksaan Brief',
  '02. Diskusi & Penawaran Harga',
  '03. Persetujuan Administrasi',
  '04. Pembayaran & Konfirmasi',
  '05. Proses Pengerjaan Studio',
  '06. Pratinjau Hasil & Revisi',
  '07. Pelunasan & Penyerahan Akhir',
  '08. Selesai & Diarsipkan'
];

const DEFAULT_STATE = {
  settings: {
    directorName: 'Fikri Yassaar Arrazaq',
    directorIdNumber: '6472050000000001',
    studioAddress: 'Jl. Wiraguna Gang 4, Kel. Sidodadi, Samarinda',
    studioEmail: 'prangart.studios@gmail.com',
    studioWhatsApp: '628977230597',
    recaptchaSiteKey: '6LeDaSEuAAAAAIDdp1Ir_V-wkmOXE-e8imq9Alzj',
    adminPin: '2026',
    paymentMethods: [
      { id: 'pay-1', type: 'bank', name: 'Bank BCA', number: '1234567890', holder: 'Fikri Yassaar Arrazaq', logo: 'https://iili.io/oHYybgj.md.png' },
      { id: 'pay-2', type: 'qris', name: 'QRIS (Shopee/DANA/OVO)', number: '-', holder: 'PrangArt Lab', logo: 'https://iili.io/oHaHbAQ.md.png' }
    ]
  },
  serviceCatalog: {
    tari: {
      label:'Produksi Musik Tari', addonLabel:'Rekaman Vokal / Sinden / Narasi', addonPrice:50000,
      packages: {
        dasar: { label:'Paket Dasar (1 Juta)', price:1000000, desc:'1 tempo utama, 1 nuansa dominan, maks. 5 instrumen, 3x revisi ringan.' },
        standar: { label:'Paket Standar (1,5 Juta)', price:1500000, desc:'Rincian per struktur tari + timestamp presisi, 6x revisi ringan.' },
        pro: { label:'Paket Pro (2 Juta)', price:2000000, desc:'Alur dramatik kompleks, perubahan tempo bebas, revisi sesuai kesepakatan.' }
      }
    },
    digital: {
      label:'Produksi Musik Non-Tari', addonLabel:'Rekaman Vokal / Soloist', addonPrice:50000,
      packages: {
        dasar: { label:'Paket Dasar (750rb)', price:750000, desc:'Aransemen instrumen digital standar, 2x revisi ringan.' },
        standar: { label:'Paket Standar (1,2 Juta)', price:1200000, desc:'Aransemen penuh + mixing mastering, 4x revisi ringan.' },
        pro: { label:'Paket Pro (1,8 Juta)', price:1800000, desc:'Produksi kompleks multi-layer + stem track terpisah.' }
      }
    },
    transkripsi: {
      label:'Transkripsi Musik', addonLabel:'Partitur Ansambel Lengkap / Express', addonPrice:50000,
      packages: {
        dasar: { label:'Paket Dasar (350rb)', price:350000, desc:'Melodi utama / vokal tunggal, 1 jenis notasi, 2x revisi ringan.' },
        standar: { label:'Paket Standar (600rb)', price:600000, desc:'Not Angka & Not Balok lengkap, akor dasar, 4x revisi ringan.' },
        pro: { label:'Paket Pro (1 Juta)', price:1000000, desc:'Full skor ansambel multi-instrumen + MIDI & PDF siap cetak.' }
      }
    }
  },
  portfolioItems: [],
  faqs: [
    { q:'Mengapa diskusi dilakukan sebelum pembayaran?', a:'Sesi diskusi memastikan kebutuhan artistik, ruang lingkup kerja, durasi, serta anggaran benar-benar dipahami sebelum penawaran resmi diterbitkan.' },
    { q:'Bagaimana perbedaan persetujuan administrasi antar layanan?', a:'Untuk Produksi Musik Tari dan Non-Tari dilakukan penandatanganan Perjanjian Produksi Musik. Untuk Transkripsi Musik dilakukan persetujuan penawaran secara elektronik.' },
    { q:'Bagaimana ketentuan pengalihan hak ekonomi & kredit komposer?', a:'Harga produksi sudah termasuk pengalihan hak ekonomi kepada Pihak Kedua yang berlaku otomatis setelah pelunasan dan penyerahan file final (Pasal 3).' },
    { q:'Apakah file mentah (multitrack) ikut diserahkan?', a:'Tidak termasuk dalam penyerahan standar, kecuali dicantumkan secara tegas pada Lampiran A.' }
  ],
  users: [
    { email:'admin@prangart.com', pass:'rahasia', name:'Admin PrangArt', wa:'08977230597', instansi:'PrangArt Lab', kota:'Samarinda', alamat:'Jl. Wiraguna', nik:'6472' }
  ],
  projects: []
};

let appState = {
  ...structuredClone(DEFAULT_STATE),
  currentPage:'home', currentClientUser:null, isAdminAuthenticated:false,
  selectedServiceLine:'tari', selectedPackage:'standar',
  basicInstruments:['Sampe','Kendang Tradisional','Gong'],
  proScenes:[{ title:'Babak 1 — Pembuka', detail:'Tempo lambat 75 BPM, nuansa sakral.', link:'' }],
  previousSynopsisBackup:'',
  activeBriefProjectId:null,
  selectedClientProjectId:null,
  selectedAdminProjectId:null,
  adminFilterStatus:'Semua', portfolioFilter:'Semua',
  docModalState:{ projectId:null, docType:'invoice', stage:'dp' }
};

try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.settings) appState.settings = { ...appState.settings, ...parsed.settings };
    if (Array.isArray(parsed.users) && parsed.users.length) appState.users = parsed.users;
    if (Array.isArray(parsed.projects) && parsed.projects.length) appState.projects = parsed.projects;
    if (Array.isArray(parsed.portfolioItems)) appState.portfolioItems = parsed.portfolioItems;
  }
} catch(_) {}

function persistLocalState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      settings: appState.settings,
      users: appState.users,
      projects: appState.projects,
      portfolioItems: appState.portfolioItems
    }));
  } catch(_) {}
}

window.appState = appState;
