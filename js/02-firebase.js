async function initFirebaseSync() {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js');
    const { getAuth, signInAnonymously } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js');
    const { getFirestore } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js');
    const { getStorage } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js');
    const { initializeAppCheck, ReCaptchaV3Provider } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-app-check.js');

    const app = initializeApp(STUDIO_FIREBASE_CONFIG);
    try { initializeAppCheck(app, { provider: new ReCaptchaV3Provider(appState.settings.recaptchaSiteKey), isTokenAutoRefreshEnabled: true }); } catch(e) {}
    
    firebaseAuth = getAuth(app); db = getFirestore(app); fbStorage = getStorage(app);
    const auth = await signInAnonymously(firebaseAuth); firebaseUser = auth.user;
    
    window.firebaseAI = (await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-ai.js')).getAI(app, { backend: new (await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-ai.js')).GoogleAIBackend() });
  } catch(e) { console.warn("Firebase Offline Mode"); }
}
async function syncProjectToCloud(p) { persistLocalState(); }
async function syncUserToCloud(u) { persistLocalState(); }
