/* === SISTEM AUTENTIKASI KLIEN & AKUN DEMO (PRANGART LAB) === */

const DEFAULT_DEMO_ACCOUNTS = {
  'siti@sanggar.id': {
    uid: 'demo-siti-001',
    name: 'Siti Aminah (Sanggar Tari)',
    email: 'siti@sanggar.id',
    wa: '081234567890',
    password: '1234'
  }
};

function getAllLocalAccounts() {
  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem('prangart_local_users') || '{}');
  } catch (_) {
    stored = {};
  }
  return { ...DEFAULT_DEMO_ACCOUNTS, ...stored };
}

function saveLocalAccount(account) {
  if (!account || !account.email) return;
  const emailKey = account.email.trim().toLowerCase();
  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem('prangart_local_users') || '{}');
  } catch (_) {
    stored = {};
  }
  stored[emailKey] = { ...stored[emailKey], ...account, email: emailKey };
  try {
    localStorage.setItem('prangart_local_users', JSON.stringify(stored));
  } catch (_) {}
}

function togglePasswordVisibility(inputId, showIconId, hideIconId) {
  const input = document.getElementById(inputId);
  const showIcon = document.getElementById(showIconId);
  const hideIcon = document.getElementById(hideIconId);
  if (!input) return;

  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  if (showIcon) showIcon.classList.toggle('hidden', isPassword);
  if (hideIcon) hideIcon.classList.toggle('hidden', !isPassword);
}

function openClientAuthModal(mode = 'register') {
  const modal = document.getElementById('client-auth-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeClientAuthModal() {
  const modal = document.getElementById('client-auth-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function renderHeaderAuth() {
  const container = document.getElementById('header-auth-status');
  if (!container) return;

  if (appState.currentClientUser) {
    const firstName = (appState.currentClientUser.name || 'Klien').split(' ')[0];
    container.innerHTML = `
      <div class="flex items-center gap-2">
        <button type="button" onclick="navigateTo('client')" class="px-3.5 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary hover:text-white transition">
          ${firstName}
        </button>
        <button type="button" onclick="handleClientLogout()" class="px-3 py-2 rounded-xl bg-panel border border-border text-textMuted hover:text-red-500 text-xs font-bold transition">
          Keluar
        </button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <button type="button" onclick="navigateTo('client')" class="px-4 py-2 rounded-xl bg-panel border border-border/80 hover:border-primary text-xs font-bold text-textMain transition">
        Masuk Klien
      </button>
    `;
  }
}

function applyClientSessionUI(userObj) {
  if (userObj) {
    appState.currentClientUser = {
      uid: userObj.uid || `usr-${Date.now()}`,
      name: userObj.name || userObj.displayName || (userObj.email ? userObj.email.split('@')[0] : 'Klien'),
      email: (userObj.email || '').trim().toLowerCase(),
      wa: userObj.wa || ''
    };
    try {
      localStorage.setItem('prangart_active_client', JSON.stringify(appState.currentClientUser));
    } catch (_) {}
  }

  renderHeaderAuth();

  const loginWall = document.getElementById('client-login-wall');
  const workspace = document.getElementById('client-workspace-content');

  if (appState.currentClientUser) {
    if (loginWall) loginWall.classList.add('hidden');
    if (workspace) workspace.classList.remove('hidden');

    if (typeof renderClientPortal === 'function') renderClientPortal();
    if (typeof renderClientWorkspace === 'function') renderClientWorkspace();
  } else {
    if (loginWall) loginWall.classList.remove('hidden');
    if (workspace) workspace.classList.add('hidden');
  }
}

/* === 1. LOGIN PORTAL KLIEN (EMAIL & SANDI + AKUN DEMO) === */
async function handleClientPortalLogin(e) {
  if (e && e.preventDefault) e.preventDefault();

  const emailEl = document.getElementById('portal-login-email');
  const passEl = document.getElementById('portal-login-pass');
  const btn = e?.target?.querySelector('button[type="submit"]');

  const email = (emailEl?.value || '').trim().toLowerCase();
  const password = passEl?.value || '';

  if (!email || !password) {
    return typeof showToast === 'function' && showToast('Peringatan', 'Email dan Kata Sandi wajib diisi.', 'warning');
  }

  const origHtml = btn ? btn.innerHTML : 'Masuk →';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Memproses...';
  }

  try {
    const accounts = getAllLocalAccounts();
    const localMatch = accounts[email];

    // Cek akun lokal / akun demo bawaan (seperti siti@sanggar.id / 1234) terlebih dahulu
    if (localMatch && localMatch.password === password) {
      applyClientSessionUI(localMatch);
      if (typeof showToast === 'function') {
        showToast('Berhasil Masuk', `Selamat datang kembali, ${localMatch.name}!`);
      }
      if (typeof navigateTo === 'function') navigateTo('client');
      return;
    }

    // Cek via Firebase Auth jika tersedia di window
    const authInstance = window.firebaseAuth || window.auth;
    if (authInstance && typeof window.signInWithEmailAndPassword === 'function') {
      const cred = await window.signInWithEmailAndPassword(authInstance, email, password);
      const fbUser = cred.user;
      const profile = accounts[email] || {};
      const sessionData = {
        uid: fbUser.uid,
        name: fbUser.displayName || profile.name || email.split('@')[0],
        email: fbUser.email,
        wa: profile.wa || ''
      };
      saveLocalAccount({ ...sessionData, password });
      applyClientSessionUI(sessionData);
      if (typeof showToast === 'function') {
        showToast('Berhasil Masuk', `Selamat datang, ${sessionData.name}!`);
      }
      if (typeof navigateTo === 'function') navigateTo('client');
      return;
    }

    // Jika tidak cocok keduanya
    throw new Error('INVALID_CREDENTIALS');
  } catch (err) {
    console.error('Login gagal:', err);
    let pesan = 'Email atau kata sandi salah. Jika belum punya akun, klik "Daftar Akun".';
    if (err?.code === 'auth/too-many-requests') {
      pesan = 'Terlalu banyak percobaan gagal. Silakan tunggu beberapa saat.';
    } else if (err?.code === 'auth/network-request-failed') {
      pesan = 'Koneksi internet bermasalah. Periksa jaringan Anda.';
    }
    if (typeof showToast === 'function') {
      showToast('Gagal Masuk', pesan, 'error');
    } else {
      alert(pesan);
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

/* === 2. PENDAFTARAN AKUN BARU === */
async function handleQuickClientRegister(e) {
  if (e && e.preventDefault) e.preventDefault();

  const name = (document.getElementById('reg-name')?.value || '').trim();
  const email = (document.getElementById('reg-email')?.value || '').trim().toLowerCase();
  const wa = (document.getElementById('reg-wa')?.value || '').trim();
  const password = document.getElementById('reg-pass')?.value || '';
  const btn = e?.target?.querySelector('button[type="submit"]');

  if (!name || !email || !wa || password.length < 4) {
    return typeof showToast === 'function' && showToast('Data Kurang', 'Lengkapi semua data dan kata sandi.', 'warning');
  }

  const origHtml = btn ? btn.innerHTML : 'Daftar Manual →';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = 'Mendaftarkan...';
  }

  try {
    let uid = `usr-${Date.now()}`;
    const authInstance = window.firebaseAuth || window.auth;

    if (authInstance && typeof window.createUserWithEmailAndPassword === 'function') {
      try {
        const cred = await window.createUserWithEmailAndPassword(authInstance, email, password);
        uid = cred.user.uid;
        if (typeof window.updateProfile === 'function') {
          await window.updateProfile(cred.user, { displayName: name }).catch(() => {});
        }
      } catch (fbErr) {
        if (fbErr?.code === 'auth/email-already-in-use') {
          throw fbErr;
        }
        // Jika sandi < 6 karakter (batas minimal Firebase) tetap simpan ke akun lokal studio
        console.warn('Fallback ke penyimpanan akun lokal:', fbErr?.code);
      }
    }

    const newAccount = { uid, name, email, wa, password };
    saveLocalAccount(newAccount);
    closeClientAuthModal();
    applyClientSessionUI(newAccount);

    if (typeof showToast === 'function') {
      showToast('Pendaftaran Berhasil', `Akun ${name} siap digunakan.`);
    }
    if (typeof navigateTo === 'function') navigateTo('client');
  } catch (err) {
    console.error('Register error:', err);
    const msg = err?.code === 'auth/email-already-in-use'
      ? 'Email ini sudah terdaftar. Silakan langsung masuk.'
      : 'Gagal mendaftarkan akun. Coba lagi.';
    if (typeof showToast === 'function') {
      showToast('Gagal Daftar', msg, 'error');
    } else {
      alert(msg);
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = origHtml;
    }
  }
}

/* === 3. MASUK / DAFTAR DENGAN GOOGLE === */
async function handleGoogleLogin() {
  try {
    const authInstance = window.firebaseAuth || window.auth;
    if (!authInstance || typeof window.signInWithPopup !== 'function' || !window.GoogleAuthProvider) {
      return typeof showToast === 'function' && showToast(
        'Google Sign-In Belum Siap',
        'Modul Firebase Auth belum termuat atau belum diekspos di js/02-firebase.js.',
        'warning'
      );
    }

    const provider = new window.GoogleAuthProvider();
    const result = await window.signInWithPopup(authInstance, provider);
    const u = result.user;
    const email = (u.email || '').toLowerCase();
    const existing = getAllLocalAccounts()[email] || {};

    const accountData = {
      uid: u.uid,
      name: u.displayName || existing.name || email.split('@')[0],
      email: email,
      wa: existing.wa || ''
    };
    saveLocalAccount(accountData);
    closeClientAuthModal();
    applyClientSessionUI(accountData);

    if (typeof showToast === 'function') {
      showToast('Berhasil Masuk', `Masuk dengan Google sebagai ${accountData.name}`);
    }
    if (typeof navigateTo === 'function') navigateTo('client');
  } catch (err) {
    console.error('Google Sign-In error:', err);
    if (err?.code !== 'auth/popup-closed-by-user') {
      const detail = err?.code === 'auth/unauthorized-domain'
        ? 'Domain prangartlab.github.io belum ditambahkan di Firebase Console → Authentication → Authorized Domains.'
        : 'Gagal masuk dengan Google. Pastikan pop-up browser tidak diblokir.';
      if (typeof showToast === 'function') {
        showToast('Login Google Gagal', detail, 'error');
      } else {
        alert(detail);
      }
    }
  }
}

/* === 4. LUPA KATA SANDI === */
async function handleForgotPassword(emailInput) {
  const email = (emailInput || '').trim().toLowerCase();
  if (!email) {
    return typeof showToast === 'function' && showToast('Masukkan Email', 'Isi alamat email Anda terlebih dahulu lalu klik Lupa Sandi.', 'warning');
  }

  const authInstance = window.firebaseAuth || window.auth;
  if (authInstance && typeof window.sendPasswordResetEmail === 'function') {
    try {
      await window.sendPasswordResetEmail(authInstance, email);
      return typeof showToast === 'function' && showToast('Email Terkirim', `Tautan reset kata sandi telah dikirim ke ${email}.`);
    } catch (_) {}
  }

  if (typeof showToast === 'function') {
    showToast('Bantuan Reset Sandi', 'Untuk reset akun lokal/demo, silakan hubungi Admin via WhatsApp.', 'warning');
  }
}

/* === 5. LOGOUT === */
function handleClientLogout() {
  appState.currentClientUser = null;
  try {
    localStorage.removeItem('prangart_active_client');
  } catch (_) {}

  const authInstance = window.firebaseAuth || window.auth;
  if (authInstance && typeof window.signOut === 'function') {
    window.signOut(authInstance).catch(() => {});
  }

  applyClientSessionUI(null);
  if (typeof showToast === 'function') {
    showToast('Keluar', 'Anda telah keluar dari Ruang Klien.');
  }
  if (typeof navigateTo === 'function') navigateTo('home');
}

/* === PULIHKAN SESI OTOMATIS SAAT HALAMAN DIBUKA === */
function initAuthSessionRestore() {
  try {
    const saved = localStorage.getItem('prangart_active_client');
    if (saved) {
      const userObj = JSON.parse(saved);
      if (userObj && userObj.email) {
        applyClientSessionUI(userObj);
        return;
      }
    }
  } catch (_) {}
  applyClientSessionUI(null);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthSessionRestore);
} else {
  initAuthSessionRestore();
}

Object.assign(window, {
  togglePasswordVisibility,
  openClientAuthModal,
  closeClientAuthModal,
  renderHeaderAuth,
  applyClientSessionUI,
  handleClientPortalLogin,
  handleQuickClientRegister,
  handleGoogleLogin,
  handleForgotPassword,
  handleClientLogout,
  initAuthSessionRestore
});
