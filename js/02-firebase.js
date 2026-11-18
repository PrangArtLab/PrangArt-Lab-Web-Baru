/* === INISIALISASI FIREBASE (AUTH, FIRESTORE & AI) — PRANGART LAB === */

(async function initPrangArtFirebase() {
  // GANTI DENGAN KONFIGURASI FIREBASE PROJECT ANDA
  const firebaseConfig = {
    apiKey: "ISI_API_KEY_FIREBASE_ANDA",
    authDomain: "ISI_PROJECT_ID.firebaseapp.com",
    projectId: "ISI_PROJECT_ID",
    storageBucket: "ISI_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "ISI_MESSAGING_SENDER_ID",
    appId: "ISI_APP_ID"
  };

  try {
    const [
      { initializeApp, getApps, getApp },
      {
        getAuth,
        signInWithEmailAndPassword,
        createUserWithEmailAndPassword,
        updateProfile,
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
        orderBy
      }
    ] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js')
    ]);

    // Inisialisasi App (hindari duplikasi jika sudah ada)
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Ekspos seluruh fungsi Auth ke window agar terbaca oleh js/05-auth.js
    window.firebaseApp = app;
    window.firebaseAuth = auth;
    window.auth = auth;
    window.firebaseDb = db;

    window.signInWithEmailAndPassword = signInWithEmailAndPassword;
    window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
    window.updateProfile = updateProfile;
    window.GoogleAuthProvider = GoogleAuthProvider;
    window.signInWithPopup = signInWithPopup;
    window.sendPasswordResetEmail = sendPasswordResetEmail;
    window.signOut = signOut;

    // Helper Firestore untuk Admin / Klien
    window.firestoreHelpers = {
      doc,
      setDoc,
      getDocs,
      deleteDoc,
      collection,
      query,
      orderBy
    };

    // Inisialisasi Firebase AI (Gemini) untuk fitur Sinopsis AI di js/06-order.js
    try {
      const { getAI, GoogleAIBackend } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-ai.js');
      window.firebaseAI = getAI(app, { backend: new GoogleAIBackend() });
    } catch (aiErr) {
      console.warn('Firebase AI belum aktif atau tidak didukung pada konfigurasi ini:', aiErr?.message || aiErr);
    }

    // Pantau perubahan status login Firebase Auth
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

    // Muat data proyek & katalog dari Firestore saat startup
    await loadCloudDataIfAvailable(db, { collection, getDocs });

  } catch (err) {
    console.warn('Mode lokal aktif (Firebase belum dikonfigurasi/offline):', err?.message || err);
    loadLocalProjectsFallback();
  }
})();

/* === SINKRONISASI PROYEK KE CLOUD & FALLBACK LOCALSTORAGE === */

function loadLocalProjectsFallback() {
  try {
    const localProjects = JSON.parse(localStorage.getItem('prangart_projects_backup') || '[]');
    if (Array.isArray(localProjects) && localProjects.length > 0) {
      appState.projects = localProjects;
    }
  } catch (_) {}
}

function saveLocalProjectsBackup() {
  try {
    localStorage.setItem('prangart_projects_backup', JSON.stringify(appState.projects || []));
  } catch (_) {}
}

async function loadCloudDataIfAvailable(db, { collection, getDocs }) {
  loadLocalProjectsFallback();
  if (!db) return;

  try {
    const snap = await getDocs(collection(db, 'projects'));
    if (!snap.empty) {
      const cloudList = [];
      snap.forEach((d) => cloudList.push({ id: d.id, ...d.data() }));
      cloudList.sort((a, b) => String(b.id).localeCompare(String(a.id)));
      appState.projects = cloudList;
      saveLocalProjectsBackup();

      if (typeof renderClientPortal === 'function') renderClientPortal();
      if (typeof renderClientWorkspace === 'function') renderClientWorkspace();
      if (typeof renderAdminWorkspace === 'function' && appState.isAdminUnlocked) renderAdminWorkspace();
    }
  } catch (err) {
    console.warn('Gagal memuat koleksi projects dari Firestore, menggunakan data lokal:', err?.message || err);
  }
}

async function syncProjectToCloud(projectObj) {
  if (!projectObj || !projectObj.id) return;

  // Selalu simpan cadangan lokal terlebih dahulu agar data tidak pernah hilang
  saveLocalProjectsBackup();

  if (!window.firebaseDb || !window.firestoreHelpers) return;
  try {
    const { doc, setDoc } = window.firestoreHelpers;
    await setDoc(doc(window.firebaseDb, 'projects', projectObj.id), projectObj, { merge: true });
  } catch (err) {
    console.warn('Sinkronisasi proyek ke Firestore tertunda (tersimpan di lokal):', err?.message || err);
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
  deleteProjectFromCloud,
  loadLocalProjectsFallback,
  saveLocalProjectsBackup
});
