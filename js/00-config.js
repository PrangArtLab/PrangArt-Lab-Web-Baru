const LOGO_URL = 'https://iili.io/o9B6HXa.md.png';
const STORAGE_KEY = 'prangart_lab_v12'; // Naikkan versi untuk hapus cache lama

const STUDIO_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDJX7Y95gJ8j3A3te5pvTONrAJBxZ5yS2s",
  authDomain: "website-prangart-8ceeb.firebaseapp.com",
  projectId: "website-prangart-8ceeb",
  storageBucket: "website-prangart-8ceeb.firebasestorage.app",
  messagingSenderId: "153873576617",
  appId: "1:153873576617:web:34441945bc26c38d53afb8"
};

let db = null; let fbStorage = null; let firebaseUser = null; let firebaseAuth = null;

const TRACKER_MILESTONES = [
  '01. Pengajuan & Pemeriksaan Brief', '02. Diskusi & Penawaran Harga',
  '03. Persetujuan Administrasi', '04. Pembayaran & Konfirmasi',
  '05. Proses Pengerjaan Studio', '06. Pratinjau Hasil & Revisi',
  '07. Pelunasan & Penyerahan Akhir', '08. Selesai & Diarsipkan'
];

const DEFAULT_STATE = {
  settings: {
    studioWhatsApp: '628977250597', // NOMOR WA DIUPDATE
    recaptchaSiteKey: '6LeDaSEuAAAAAIDdp1Ir_V-wkmOXE-e8imq9Alzj',
    adminPin: '2026',
    paymentMethods: [
      { id: 'pay-1', type: 'bank', name: 'Bank BCA', number: '1234567890', holder: 'Fikri Yassaar', logo: 'https://iili.io/oHYybgj.md.png' }
    ]
  },
  serviceCatalog: {
    tari: {
      label:'Aransemen Musik Tari', addonLabel:'Tambahan Vokal', addonPrice:250000,
      packages: {
        dasar: { label:'Paket Dasar (1 Juta)', price:1000000, desc:'Maks 5 menit.' },
        standar: { label:'Paket Standar (1,5 Juta)', price:1500000, desc:'Maks 7 menit.' },
        pro: { label:'Paket Pro (2 Juta)', price:2000000, desc:'Maks 7 menit. Revisi UNLIMITED.' }
      }
    },
    digital: {
      label:'Aransemen Musik Non-Tari', addonLabel:'Tambahan Vokal', addonPrice:250000,
      packages: {
        dasar: { label:'Paket Dasar (1 Juta)', price:1000000, desc:'Maks 4-5 menit.' },
        standar: { label:'Paket Standar (1,5 Juta)', price:1500000, desc:'Maks 7 menit.' },
        pro: { label:'Paket Pro (2 Juta)', price:2000000, desc:'Maks 7 menit. Revisi UNLIMITED.' }
      }
    },
    transkripsi: {
      label:'Transkripsi Musik', addonLabel:'Tambahan Vokal', addonPrice:250000,
      packages: {
        dasar: { label:'Tarif Minimum (50rb)', price:50000, desc:'Durasi ≤ 1 Menit.' },
        standar: { label:'Bundling Dasar (300rb)', price:300000, desc:'± 3 Menit.' },
        pro: { label:'Bundling Standar (600rb)', price:600000, desc:'± 3 Menit.' }
      }
    }
  },
  portfolioItems: [],
  faqs: [
    { q:'Bagaimana ketentuan revisi?', a:'Paket Dasar 3x revisi. Paket Pro UNLIMITED (1 bln).' }
  ],
  users: [
    { email:'siti@sanggar.id', pass:'1234', name:'Siti Rahmawati', wa:'081254889900' }
  ],
  projects: []
};

let appState = {
  ...structuredClone(DEFAULT_STATE),
  currentPage:'home', currentClientUser: null, clientTab: 'projects', 
  isAdminAuthenticated:false, selectedServiceLine:'tari', selectedPackage:'standar', 
  customPrice: null, synopsisMode: 'manual'
};

try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const p = JSON.parse(saved);
    if (p.settings) appState.settings = { ...appState.settings, ...p.settings };
    if (Array.isArray(p.users)) appState.users = p.users;
    if (Array.isArray(p.projects)) appState.projects = p.projects;
  }
  const savedUser = localStorage.getItem('prangart_current_user');
  if (savedUser) appState.currentClientUser = JSON.parse(savedUser);
} catch(_) {}

function persistLocalState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      settings: appState.settings, users: appState.users, projects: appState.projects
    }));
    if (appState.currentClientUser) localStorage.setItem('prangart_current_user', JSON.stringify(appState.currentClientUser));
    else localStorage.removeItem('prangart_current_user');
  } catch(_) {}
}
window.appState = appState;
