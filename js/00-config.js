const LOGO_URL = 'https://iili.io/o9B6HXa.md.png';
const STORAGE_KEY = 'prangart_lab_state_v7';

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
    studioWhatsApp: '628977230597',
    recaptchaSiteKey: '6LeDaSEuAAAAAIDdp1Ir_V-wkmOXE-e8imq9Alzj',
    adminPin: '2026',
    paymentMethods: [
      { id: 'pay-1', type: 'bank', name: 'Bank BCA', number: '1234567890', holder: 'Fikri Yassaar Arrazaq', logo: 'https://iili.io/oHYybgj.md.png' },
      { id: 'pay-2', type: 'qris', name: 'QRIS Shopee', number: '-', holder: 'PrangArt Lab', logo: 'https://iili.io/oHaHbAQ.md.png' }
    ]
  },
  serviceCatalog: {
    tari: {
      label:'Produksi Musik Tari', addonLabel:'Rekaman Vokal', addonPrice:50000,
      packages: {
        dasar: { label:'Paket Dasar (1 Juta)', price:1000000, desc:'1 tempo utama, maks. 5 instrumen.' },
        standar: { label:'Paket Standar (1,5 Juta)', price:1500000, desc:'Rincian per struktur tari + timestamp.' },
        pro: { label:'Paket Pro (2 Juta)', price:2000000, desc:'Alur dramatik kompleks, perubahan bebas.' }
      }
    },
    digital: {
      label:'Produksi Musik Non-Tari', addonLabel:'Rekaman Vokal', addonPrice:50000,
      packages: {
        dasar: { label:'Paket Dasar (750rb)', price:750000, desc:'Aransemen digital standar.' },
        standar: { label:'Paket Standar (1,2 Juta)', price:1200000, desc:'Aransemen penuh + mixing.' },
        pro: { label:'Paket Pro (1,8 Juta)', price:1800000, desc:'Produksi multi-layer + stem.' }
      }
    },
    transkripsi: {
      label:'Transkripsi Musik', addonLabel:'Partitur Lengkap', addonPrice:50000,
      packages: {
        dasar: { label:'Paket Dasar (350rb)', price:350000, desc:'Melodi utama, 1 notasi.' },
        standar: { label:'Paket Standar (600rb)', price:600000, desc:'Not Angka & Balok lengkap.' },
        pro: { label:'Paket Pro (1 Juta)', price:1000000, desc:'Full skor ansambel + MIDI.' }
      }
    }
  },
  portfolioItems: [],
  faqs: [
    { q:'Mengapa diskusi sebelum pembayaran?', a:'Memastikan kebutuhan artistik dan anggaran dipahami sebelum penawaran resmi.' },
    { q:'Bagaimana perbedaan persetujuan?', a:'Tari/Non-Tari menggunakan Perjanjian Produksi. Transkripsi menggunakan Persetujuan Layanan.' }
  ],
  users: [
    { email:'siti@sanggar.id', pass:'1234', name:'Siti Rahmawati', wa:'081254889900', instansi:'Sanggar Pesona Mahakam', kota:'Samarinda', alamat:'Jl. AW Syahranie No. 45', nik:'6472015504950002' }
  ],
  projects: []
};

let appState = {
  ...structuredClone(DEFAULT_STATE),
  currentPage:'home', currentClientUser:null, isAdminAuthenticated:false,
  selectedServiceLine:'tari', selectedPackage:'standar',
  basicInstruments:['Sampe','Kendang','Gong'],
  proScenes:[{ title:'Babak 1', detail:'Tempo lambat.', link:'' }],
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
    if (Array.isArray(parsed.users)) appState.users = parsed.users;
    if (Array.isArray(parsed.projects)) appState.projects = parsed.projects;
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