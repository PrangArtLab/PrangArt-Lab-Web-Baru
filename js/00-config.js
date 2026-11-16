const LOGO_URL = 'https://iili.io/o9B6HXa.md.png';
const STORAGE_KEY = 'prangart_lab_state_v9';

const STUDIO_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDJX7Y95gJ8j3A3te5pvTONrAJBxZ5yS2s",
  authDomain: "website-prangart-8ceeb.firebaseapp.com",
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
    studioWhatsApp: '628977250597',
    recaptchaSiteKey: '6LeDaSEuAAAAAIDdp1Ir_V-wkmOXE-e8imq9Alzj',
    adminPin: '2026',
    paymentMethods: [
      { id: 'pay-1', type: 'bank', name: 'Bank BCA', number: '1234567890', holder: 'Fikri Yassaar Arrazaq', logo: 'https://iili.io/oHYybgj.md.png' },
      { id: 'pay-2', type: 'qris', name: 'QRIS Shopee', number: '-', holder: 'PrangArt Lab', logo: 'https://iili.io/oHaHbAQ.md.png' }
    ]
  },
  serviceCatalog: {
    tari: {
      label:'Aransemen Musik Tari', addonLabel:'Tambahan Vokal / Session Player', addonPrice:250000, // HARGA DIUBAH 250RB
      packages: {
        dasar: { label:'Paket Dasar (1 Juta)', price:1000000, desc:'Maks 5 menit. Musik dasar, maks 5 instrumen, 3x revisi, MP3. Pengerjaan 7 hari.' },
        standar: { label:'Paket Standar (1,5 Juta)', price:1500000, desc:'Maks 7 menit. Sesuai alur gerak, 5-8 instrumen, MP3 & WAV. Pengerjaan 14 hari.' },
        pro: { label:'Paket Pro (2 Juta)', price:2000000, desc:'Maks 7 menit. Garapan detail, revisi UNLIMITED (1 bln), MP3 & WAV Master. 14 hari.' }
      }
    },
    digital: {
      label:'Aransemen Musik Non-Tari', addonLabel:'Tambahan Vokal / Session Player', addonPrice:250000, // HARGA DIUBAH 250RB
      packages: {
        dasar: { label:'Paket Dasar (1 Juta)', price:1000000, desc:'Maks 4-5 menit. Aransemen akustik, maks 5 instrumen, 3x revisi, MP3/WAV. 14 hari.' },
        standar: { label:'Paket Standar (1,5 Juta)', price:1500000, desc:'Maks 7 menit. Struktur lengkap (Intro, Verse, Chorus, dll), MP3/WAV. 14 hari.' },
        pro: { label:'Paket Pro (2 Juta)', price:2000000, desc:'Maks 7 menit. Kompleks & mendetail, revisi UNLIMITED (1 bln), MP3/WAV Master. 14 hari.' }
      }
    },
    transkripsi: {
      label:'Layanan Transkripsi Musik', addonLabel:'Tambahan Vokal / Session Player', addonPrice:250000, // HARGA DIUBAH 250RB
      packages: {
        dasar: { label:'Tarif Minimum (50rb)', price:50000, desc:'Durasi ≤ 1 Menit / pola berulang. Tarif per instrumen.' },
        standar: { label:'Paket Bundling Dasar (300rb)', price:300000, desc:'± 3 Menit. Melodi utama, 1 jenis notasi.' },
        pro: { label:'Paket Bundling Standar (600rb)', price:600000, desc:'± 3 Menit. Not Angka & Not Balok lengkap.' }
      }
    }
  },
  portfolioItems: [],
  faqs: [
    { q:'Bagaimana ketentuan revisi?', a:'Paket Dasar mencakup 3x revisi. Paket Pro mencakup revisi UNLIMITED (maksimal 1 bulan setelah selesai). Revisi di luar kuota dikenakan biaya Rp250.000 per sesi.' },
    { q:'Apa yang terjadi jika klien tidak merespon >14 hari?', a:'Proyek akan dicatat sebagai selesai sementara/diarsipkan. Pembatalan sepihak menyebabkan DP hangus (non-refundable).' },
    { q:'Bagaimana prosedur pemesanan?', a:'Seluruh proyek diawali dengan konsultasi via WhatsApp (08977250597) sebelum kesepakatan harga dan pengerjaan.' }
  ],
  users: [
    { email:'siti@sanggar.id', pass:'1234', name:'Siti Rahmawati', wa:'081254889900', instansi:'Sanggar Pesona Mahakam', kota:'Samarinda', alamat:'Jl. AW Syahranie No. 45', nik:'6472015504950002' }
  ],
  projects: []
};

let appState = {
  ...structuredClone(DEFAULT_STATE),
  currentPage:'home', 
  currentClientUser: null,
  clientTab: 'projects', // 'projects' atau 'settings'
  isAdminAuthenticated:false,
  selectedServiceLine:'tari', 
  selectedPackage:'standar', 
  customPrice: null,
  synopsisMode: 'manual', // 'manual' atau 'ai'
  basicInstruments:['Sampe','Kendang','Gong'],
  proScenes:[{ title:'Babak 1', detail:'Tempo lambat.', link:'' }],
  previousSynopsisBackup:'',
  activeBriefProjectId:null,
  selectedClientProjectId:null,
  selectedAdminProjectId:null,
  adminFilterStatus:'Semua', portfolioFilter:'Semua',
  docModalState:{ projectId:null, docType:'invoice', stage:'dp' }
};

// SESSION PERSISTENCE: Load user dari localStorage agar tidak logout saat refresh
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (parsed.settings) appState.settings = { ...appState.settings, ...parsed.settings };
    if (Array.isArray(parsed.users)) appState.users = parsed.users;
    if (Array.isArray(parsed.projects)) appState.projects = parsed.projects;
    if (Array.isArray(parsed.portfolioItems)) appState.portfolioItems = parsed.portfolioItems;
  }
  const savedUser = localStorage.getItem('prangart_current_user');
  if (savedUser) appState.currentClientUser = JSON.parse(savedUser);
} catch(_) {}

function persistLocalState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      settings: appState.settings,
      users: appState.users,
      projects: appState.projects,
      portfolioItems: appState.portfolioItems
    }));
    if (appState.currentClientUser) localStorage.setItem('prangart_current_user', JSON.stringify(appState.currentClientUser));
    else localStorage.removeItem('prangart_current_user');
  } catch(_) {}
}
window.appState = appState;
