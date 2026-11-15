async function initFirebaseSync() {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js');
    const { getAuth, signInAnonymously, signInWithCustomToken } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js');
    const { getFirestore, collection, doc, setDoc, onSnapshot } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js');
    const { getStorage } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js');
    const { initializeAppCheck, ReCaptchaV3Provider } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-app-check.js');

    const cfg = (typeof __firebase_config !== 'undefined' && __firebase_config)
      ? JSON.parse(__firebase_config)
      : STUDIO_FIREBASE_CONFIG;

    const fbApp = initializeApp(cfg);
    
    try {
      initializeAppCheck(fbApp, {
        provider: new ReCaptchaV3Provider(appState.settings.recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true
      });
    } catch(e) { console.warn('App Check Gagal:', e); }

    const fbAuth = getAuth(fbApp);
    db = getFirestore(fbApp);
    fbStorage = getStorage(fbApp);

    let authCred;
    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
      authCred = await signInWithCustomToken(fbAuth, __initial_auth_token);
    } else {
      authCred = await signInAnonymously(fbAuth);
    }
    firebaseUser = authCred?.user || fbAuth.currentUser;
    if (!firebaseUser) return;

    window.db = db;
    window.fbStorage = fbStorage;
    window.firebaseUser = firebaseUser;

    const projCol = collection(db, 'artifacts', firebaseAppId, 'public', 'data', 'projects');
    onSnapshot(projCol, (snap) => {
      if (!snap.empty) {
        const cloudList = [];
        snap.forEach(d => cloudList.push(d.data()));
        const localMap = new Map(appState.projects.map(p => [p.id, p]));
        const merged = cloudList.map(cp => {
          const lp = localMap.get(cp.id);
          if (!lp) return cp;
          return {
            ...cp,
            dpProofDataUrl: cp.dpProofDataUrl || lp.dpProofDataUrl || '',
            pelunasanProofDataUrl: cp.pelunasanProofDataUrl || lp.pelunasanProofDataUrl || '',
            previewAudioUrl: cp.previewAudioUrl || lp.previewAudioUrl || '',
            masterFileUrl: cp.masterFileUrl || lp.masterFileUrl || ''
          };
        });
        merged.sort((a, b) => (b.createdTs || 0) - (a.createdTs || 0));
        appState.projects = merged;
        persistLocalState();
        if (appState.currentPage === 'client') renderClientWorkspace();
        if (appState.currentPage === 'admin' && appState.isAdminAuthenticated) renderAdminDashboard();
      }
    }, () => {});

    const configDoc = doc(db, 'artifacts', firebaseAppId, 'public', 'data', 'studio_config', 'main');
    onSnapshot(configDoc, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.settings) appState.settings = { ...appState.settings, ...data.settings };
        if (Array.isArray(data.portfolioItems)) appState.portfolioItems = data.portfolioItems;
        persistLocalState();
        if (appState.currentPage === 'portfolio') renderPortfolioGrid();
      }
    }, () => {});
  } catch (_) {}
}

async function uploadFileToFirebaseStorage(path, file) {
  if (!fbStorage || !firebaseUser || !file) return '';
  try {
    const { ref: storageRef, uploadBytes, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js');
    const sRef = storageRef(fbStorage, `artifacts/${firebaseAppId}/public/${path}`);
    await uploadBytes(sRef, file);
    return await getDownloadURL(sRef);
  } catch (_) { return ''; }
}

async function syncProjectToCloud(proj) {
  persistLocalState();
  if (!db || !firebaseUser) return;
  try {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js');
    const ref = doc(db, 'artifacts', firebaseAppId, 'public', 'data', 'projects', proj.id);
    await setDoc(ref, prepareProjectForFirestore(proj));
  } catch (_) {}
}

async function syncUserToCloud(userObj) {
  persistLocalState();
  if (!db || !firebaseUser || !userObj?.email) return;
  try {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js');
    const ref = doc(db, 'artifacts', firebaseAppId, 'public', 'data', 'users', sanitizeDocId(userObj.email));
    await setDoc(ref, userObj);
  } catch (_) {}
}

async function syncStudioConfigToCloud() {
  persistLocalState();
  if (!db || !firebaseUser) return;
  try {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js');
    const ref = doc(db, 'artifacts', firebaseAppId, 'public', 'data', 'studio_config', 'main');
    await setDoc(ref, {
      settings: appState.settings,
      portfolioItems: appState.portfolioItems
    });
  } catch (_) {}
}
