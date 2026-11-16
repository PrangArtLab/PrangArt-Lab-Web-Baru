const LOGO_URL = 'https://iili.io/o9B6HXa.md.png';
const STORAGE_KEY = 'prangart_lab_v10';

const STUDIO_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDJX7Y95gJ8j3A3te5pvTONrAJBxZ5yS2s",
  authDomain: "website-prangart-8ceeb.firebaseapp.com",
  projectId: "website-prangart-8ceeb",
  storageBucket: "website-prangart-8ceeb.firebasestorage.app",
  messagingSenderId: "153873576617",
  appId: "1:153873576617:web:34441945bc26c38d53afb8"
};

const firebaseAppId = 'website-prangart-8ceeb';
let db = null; let fbStorage = null; let firebaseUser = null; let firebaseAuth = null;

const SOP_14_STEPS = [
  { no:'01', title:'Kontak Awal', desc:'Klien menghubungi via WhatsApp atau website.' },
  { no:'02', title:'Konsultasi', desc:'Membahas konsep, referensi, dan anggaran.' },
  { no:'03', title:'Formulir', desc:'Mengisi form sesuai layanan.' },
  { no:'04', title:'Pemeriksaan', desc:'PrangArt Lab memeriksa kelengkapan data.' },
  { no:'05', title:'Diskusi Lanjutan', desc:'Klarifikasi detail (jika perlu).' },
  { no:'06', title:'Penawaran', desc:'Biaya resmi, waktu, output, dan ketentuan.' },
  { no:'07', title:'Persetujuan', desc:'Tanda tangan Perjanjian.' },
  { no:'08', title:'Pembayaran', desc:'DP 50% atau Penuh 100%, diverifikasi.' },
  { no:'09', title:'Konfirmasi', desc:'Nomor pesanan terbit.' },
  { no:'10', title:'Pengerjaan', desc:'Produksi sesuai kesepakatan.' },
  { no:'11', title:'Revisi', desc:'Pemeriksaan hasil sementara.' },
  { no:'12', title:'Pelunasan', desc:'Sisa 50% sebelum file final.' },
  { no:'13', title:'Penyerahan', desc:'Berkas master diserahkan.' },
  { no:'14', title:'Selesai', desc:'Dokumen diarsipkan.' }
];

const TRACKER_MILESTONES = [
  '01. Pengajuan & Pemeriksaan Brief', '02. Diskusi & Penawaran Harga',
  '03. Persetujuan Administrasi', '04. Pembayaran & Konfirmasi',
  '05. Proses Pengerjaan Studio', '06. Pratinjau Hasil & Revisi',
  '07. Pelunasan & Penyerahan Akhir', '08. Selesai & Diarsipkan'
];

const DEFAULT_STATE = {
  settings: {
    directorName: 'Fikri Yassaar Arrazaq',
    studioWhatsApp: '628977250597',
    recaptchaSiteKey: '6LeDaSEuAAAAAIDdp1Ir_V-wkmOXE-e8imq9Alzj',
    adminPin: '2026',
    paymentMethods: [
      { id: 'pay-1', type: 'bank', name: 'Bank BCA', number: '1234567890', holder: 'Fikri Yassaar', logo: 'https://iili.io/oHYybgj.md.png' },
      { id: 'pay-2', type: 'qris', name: 'QRIS Shopee', number: '-', holder: 'PrangArt Lab', logo: 'https://iili.io/oHaHbAQ.md.png' }
    ]
  },
  serviceCatalog: {
    tari: {
      label:'Aransemen Musik Tari', addonLabel:'Tambahan Vokal', addonPrice:250000,
      packages: {
        dasar: { label:'Paket Dasar (1 Juta)', price:1000000, desc:'Maks 5 menit. Musik dasar, maks 5 instrumen.' },
        standar: { label:'Paket Standar (1,5 Juta)', price:1500000, desc:'Maks 7 menit. Sesuai alur gerak, MP3 & WAV.' },
        pro: { label:'Paket Pro (2 Juta)', price:2000000, desc:'Maks 7 menit. Revisi UNLIMITED (1 bln).' }
      }
    },
    digital: {
      label:'Aransemen Musik Non-Tari', addonLabel:'Tambahan Vokal', addonPrice:250000,
      packages: {
        dasar: { label:'Paket Dasar (1 Juta)', price:1000000, desc:'Maks 4-5 menit. Aransemen akustik.' },
        standar: { label:'Paket Standar (1,5 Juta)', price:1500000, desc:'Maks 7 menit. Struktur lengkap.' },
        pro: { label:'Paket Pro (2 Juta)', price:2000000, desc:'Maks 7 menit. Revisi UNLIMITED (1 bln).' }
      }
    },
    transkripsi: {
      label:'Transkripsi Musik', addonLabel:'Tambahan Vokal', addonPrice:250000,
      packages: {
        dasar: { label:'Tarif Minimum (50rb)', price:50000, desc:'Durasi ≤ 1 Menit / pola berulang.' },
        standar: { label:'Bundling Dasar (300rb)', price:300000, desc:'± 3 Menit. Melodi utama.' },
        pro: { label:'Bundling Standar (600rb)', price:600000, desc:'± 3 Menit. Not Angka & Balok.' }
      }
    }
  },
  portfolioItems: [
    { id: 'pf-1', title: 'Gema Enggang Mahakam', category: 'Produksi Musik Tari', culture: 'Dayak Kenyah', mediaUrl: 'https://youtube.com', desc: 'Komposisi sampe dan kendang tradisional.' }
  ],
  faqs: [
    { q:'Bagaimana ketentuan revisi?', a:'Paket Dasar 3x revisi. Paket Pro UNLIMITED (1 bln). Revisi tambahan Rp250.000/sesi.' },
    { q:'Apa yang terjadi jika tidak merespon?', a:'Proyek diarsipkan setelah 14 hari. DP hangus jika batal sepihak.' }
  ],
  users: [
    { email:'siti@sanggar.id', pass:'1234', name:'Siti Rahmawati', wa:'081254889900', instansi:'Sanggar Pesona', kota:'Samarinda' }
  ],
  projects: []
};

let appState = {
  ...structuredClone(DEFAULT_STATE),
  currentPage:'home', currentClientUser: null, clientTab: 'projects', 
  isAdminAuthenticated:false, selectedServiceLine:'tari', selectedPackage:'standar', 
  customPrice: null, synopsisMode: 'manual', proScenes:[{ title:'Babak 1', detail:'', link:'' }],
  activeBriefProjectId:null, selectedClientProjectId:null, selectedAdminProjectId:null,
  adminFilterStatus:'Semua', portfolioFilter:'Semua',
  docModalState:{ projectId:null, docType:'invoice', stage:'dp' }
};

try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const p = JSON.parse(saved);
    if (p.settings) appState.settings = { ...appState.settings, ...p.settings };
    if (Array.isArray(p.users)) appState.users = p.users;
    if (Array.isArray(p.projects)) appState.projects = p.projects;
    if (Array.isArray(p.portfolioItems)) appState.portfolioItems = p.portfolioItems;
  }
  const savedUser = localStorage.getItem('prangart_current_user');
  if (savedUser) appState.currentClientUser = JSON.parse(savedUser);
} catch(_) {}

function persistLocalState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      settings: appState.settings, users: appState.users, projects: appState.projects, portfolioItems: appState.portfolioItems
    }));
    if (appState.currentClientUser) localStorage.setItem('prangart_current_user', JSON.stringify(appState.currentClientUser));
    else localStorage.removeItem('prangart_current_user');
  } catch(_) {}
}
window.appState = appState;
