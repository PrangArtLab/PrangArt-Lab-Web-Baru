/* === INISIALISASI FIREBASE (AUTH, FIRESTORE & AI) — PRANGART LAB === */

(async function initPrangArtFirebase() {
  // GANTI DENGAN KONFIGURASI FIREBASE PROJECT ANDA
  const firebaseConfig = {
    apiKey: "AIzaSyDJX7Y95gJ8j3A3te5pvTONrAJBxZ5yS2s",
    authDomain: "website-prangart-8ceeb.firebaseapp.com",
    projectId: "website-prangart-8ceeb",
    storageBucket: "website-prangart-8ceeb.firebasestorage.app",
    messagingSenderId: "153873576617",
    appId: "1:153873576617:web:34441945bc26c38d53afb8"
  };

  try {
    const [
      { initializeApp, getApps, getApp },
      {
        getAuth,
        signInWithEmailAndPassword,
        createUserWithEmailAndPassword,
        updateProfile,
        updatePassword,
        GoogleAuthProvider,
        signInWithPopup,
        sendPasswordResetEmail,
        signOut,
        onAuthStateChanged
      },
      {
        getFirestore,
        collection,
        doc,
        setDoc,
        getDocs,
        deleteDoc,
        query,
        orderBy,
        where
      }
    ] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js')
    ]);

    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const { getFunctions, httpsCallable } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-functions.js');
    const fnInstance = getFunctions(app); // ganti region di sini jika Cloud Functions tidak di us-central1
    window.callFn = async (name, data) => (await httpsCallable(fnInstance, name)(data)).data;

    window.firebaseApp = app;
    window.firebaseAuth = auth;
    window.auth = auth;
    window.firebaseDb = db;

    window.signInWithEmailAndPassword = signInWithEmailAndPassword;
    window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
    window.updateProfile = updateProfile;
    window.updatePassword = updatePassword;
    window.GoogleAuthProvider = GoogleAuthProvider;
    window.signInWithPopup = signInWithPopup;
    window.sendPasswordResetEmail = sendPasswordResetEmail;
    window.signOut = signOut;

    window.firestoreHelpers = {
      doc,
      setDoc,
      getDocs,
      deleteDoc,
      collection,
      query,
      orderBy,
      where
    };

    try {
      const { getAI, GoogleAIBackend } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-ai.js');
      window.firebaseAI = getAI(app, { backend: new GoogleAIBackend() });
    } catch (aiErr) {
      console.warn('Firebase AI belum aktif atau tidak didukung pada konfigurasi ini:', aiErr?.message || aiErr);
    }

    onAuthStateChanged(auth, (user) => {
      if (user) {
        const email = (user.email || '').toLowerCase();
        let savedProfiles = {};
        try {
          savedProfiles = JSON.parse(localStorage.getItem('prangart_local_users') || '{}');
        } catch (_) {}

        const extra = savedProfiles[email] || {};
        const sessionObj = {
          uid: user.uid,
          name: user.displayName || extra.name || email.split('@')[0],
          email: email,
          wa: extra.wa || ''
        };

        if (typeof applyClientSessionUI === 'function') {
          applyClientSessionUI(sessionObj);
        } else {
          appState.currentClientUser = sessionObj;
        }
      }
    });

    await syncCloudProjects();

  } catch (err) {
    console.warn('Mode lokal aktif (Firebase belum dikonfigurasi/offline):', err?.message || err);
    loadLocalProjectsFallback();
    window.cloudSyncStatus = { ok: false, reason: 'Firebase tidak dapat dimuat (mode offline).', at: Date.now() };
  }
})();

/* === PENYIMPANAN PROYEK: LOKAL (CADANGAN) + CLOUD (FIRESTORE) === */

function humanizeFirestoreError(err) {
  const code = err?.code || '';
  if (code === 'permission-denied') return 'Akses ditolak oleh aturan Firestore. Periksa Firestore Rules dan status login.';
  if (code === 'unavailable') return 'Koneksi ke database bermasalah. Coba lagi nanti.';
  if (code === 'unauthenticated') return 'Belum masuk dengan akun Firebase.';
  return err?.message || 'Terjadi kesalahan tidak diketahui.';
}

// Gabungkan dua daftar proyek berdasarkan id; data dari "b" (cloud) menimpa data lokal
function mergeProjects(a, b) {
  const map = new Map();
  [...(a || []), ...(b || [])].forEach((p) => {
    if (p && p.id) map.set(p.id, { ...(map.get(p.id) || {}), ...p });
  });
  return Array.from(map.values()).sort((x, y) =>
    String(y.createdAt || y.id).localeCompare(String(x.createdAt || x.id))
  );
}

function loadLocalProjectsFallback() {
  try {
    const local = JSON.parse(localStorage.getItem('prangart_projects_backup') || '[]');
    if (Array.isArray(local)) appState.projects = mergeProjects(appState.projects || [], local);
  } catch (_) {}
}

function saveLocalProjectsBackup() {
  try {
    localStorage.setItem('prangart_projects_backup', JSON.stringify(appState.projects || []));
  } catch (_) {}
}

function refreshViews() {
  if (typeof renderClientPortal === 'function' && appState.currentClientUser) renderClientPortal();
  const adminOn = Boolean(sessionStorage.getItem('prangart_admin_token'));
  if (typeof renderAdminDashboard === 'function' && adminOn) renderAdminDashboard();
}

// Admin: semua proyek lewat Cloud Function. Klien: hanya proyek miliknya lewat Firestore.
async function syncCloudProjects() {
  loadLocalProjectsFallback();
  const adminToken = sessionStorage.getItem('prangart_admin_token') || '';

  // ADMIN: data dibaca lewat Cloud Function (token PIN), bukan langsung ke Firestore
  if (adminToken) {
    if (typeof window.callFn !== 'function') {
      window.cloudSyncStatus = { ok: false, reason: 'Layanan admin belum siap.', at: Date.now() };
      return { ok: false };
    }
    try {
      const res = await window.callFn('adminListProjects', { token: adminToken });
      const cloudList = Array.isArray(res?.projects) ? res.projects : [];
      appState.projects = mergeProjects(appState.projects || [], cloudList);
      saveLocalProjectsBackup();
      window.cloudSyncStatus = { ok: true, count: cloudList.length, pending: 0, at: Date.now() };
      return { ok: true };
    } catch (err) {
      console.warn('Gagal memuat proyek (admin):', err?.message || err);
      if (err?.code === 'functions/unauthenticated') sessionStorage.removeItem('prangart_admin_token');
      window.cloudSyncStatus = { ok: false, reason: err?.message || 'Gagal memuat dari server.', at: Date.now() };
      return { ok: false };
    }
  }

  // KLIEN: hanya proyek miliknya (sesuai firestore.rules)
  const email = String(appState.currentClientUser?.email || '').toLowerCase();
  if (!email) {
    window.cloudSyncStatus = { ok: false, reason: 'Belum ada sesi masuk.', at: Date.now() };
    return { ok: false };
  }
  const db = window.firebaseDb;
  const helpers = window.firestoreHelpers;
  if (!db || !helpers) {
    window.cloudSyncStatus = { ok: false, reason: 'Firebase belum tersambung.', at: Date.now() };
    return { ok: false };
  }
  try {
    const { collection, getDocs, query, where } = helpers;
    const snap = await getDocs(query(collection(db, 'projects'), where('clientEmail', '==', email)));
    const cloudList = [];
    snap.forEach((d) => cloudList.push({ id: d.id, ...d.data() }));

    const cloudIds = new Set(cloudList.map((p) => p.id));
    const pending = (appState.projects || []).filter((p) =>
      p && p.id && !cloudIds.has(p.id) && String(p.clientEmail || '').toLowerCase() === email
    );

    appState.projects = mergeProjects(appState.projects || [], cloudList);
    saveLocalProjectsBackup();
    pending.forEach((p) => syncProjectToCloud(p));

    window.cloudSyncStatus = { ok: true, count: cloudList.length, pending: pending.length, at: Date.now() };
    return { ok: true };
  } catch (err) {
    console.warn('Gagal memuat proyek dari Firestore:', err?.message || err);
    window.cloudSyncStatus = { ok: false, reason: humanizeFirestoreError(err), at: Date.now() };
    return { ok: false };
  }
}

async function refreshProjectsFromCloud() {
  const r = await syncCloudProjects();
  if (r.ok) {
    showToast('Data Diperbarui', `${window.cloudSyncStatus.count} proyek dimuat dari cloud.`);
  } else {
    showToast('Gagal Memuat Cloud', window.cloudSyncStatus?.reason || 'Periksa koneksi dan aturan Firestore.', 'error');
  }
  refreshViews();
}

async function syncProjectToCloud(projectObj) {
  if (!projectObj || !projectObj.id) return { ok: false, reason: 'Data proyek tidak valid.' };

  // Selalu simpan cadangan lokal terlebih dahulu
  saveLocalProjectsBackup();

  if (!window.firebaseDb || !window.firestoreHelpers) {
    return { ok: false, reason: 'Firebase belum tersambung.' };
  }
  try {
    const { doc, setDoc } = window.firestoreHelpers;
    const clean = JSON.parse(JSON.stringify(projectObj)); // buang nilai undefined
    await setDoc(doc(window.firebaseDb, 'projects', projectObj.id), clean, { merge: true });
    return { ok: true };
  } catch (err) {
    console.warn('Sinkronisasi proyek ke Firestore gagal:', err?.message || err);
    return { ok: false, reason: humanizeFirestoreError(err) };
  }
}

async function deleteProjectFromCloud(projectId) {
  if (!projectId) return;
  appState.projects = (appState.projects || []).filter((p) => p.id !== projectId);
  saveLocalProjectsBackup();

  if (!window.firebaseDb || !window.firestoreHelpers) return;
  try {
    const { doc, deleteDoc } = window.firestoreHelpers;
    await deleteDoc(doc(window.firebaseDb, 'projects', projectId));
  } catch (err) {
    console.warn('Hapus proyek di Firestore gagal:', err?.message || err);
  }
}

Object.assign(window, {
  syncProjectToCloud,
  syncCloudProjects,
  refreshProjectsFromCloud,
  deleteProjectFromCloud,
  loadLocalProjectsFallback,
  saveLocalProjectsBackup
});
