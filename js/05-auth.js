function openClientAuthModal(tab = 'register') {
  switchAuthModalTab(tab);
  const m = document.getElementById('client-auth-modal');
  m?.classList.remove('hidden');
  m?.classList.add('flex');
}

function closeClientAuthModal() {
  const m = document.getElementById('client-auth-modal');
  m?.classList.add('hidden');
  m?.classList.remove('flex');
}

function switchAuthModalTab(tab) {
  const regTab = document.getElementById('auth-tab-register');
  const logTab = document.getElementById('auth-tab-login');
  const regForm = document.getElementById('form-client-register');
  const logForm = document.getElementById('form-client-login');

  if (tab === 'register') {
    regTab.className = 'py-2.5 rounded-lg text-xs font-bold bg-surface shadow text-textMain';
    logTab.className = 'py-2.5 rounded-lg text-xs font-semibold text-textMuted hover:text-textMain transition';
    regForm.classList.remove('hidden');
    logForm.classList.add('hidden');
  } else {
    logTab.className = 'py-2.5 rounded-lg text-xs font-bold bg-surface shadow text-textMain';
    regTab.className = 'py-2.5 rounded-lg text-xs font-semibold text-textMuted hover:text-textMain transition';
    logForm.classList.remove('hidden');
    regForm.classList.add('hidden');
  }
}

function handleQuickClientRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const wa = document.getElementById('reg-wa').value.trim();
  const pass = document.getElementById('reg-pass').value;

  const existing = appState.users.find(u => u.email === email);
  if (existing) {
    showToast('Email Terdaftar', 'Silakan masuk menggunakan tab Masuk.', 'warning');
    switchAuthModalTab('login');
    document.getElementById('login-email').value = email;
    return;
  }

  const newUser = { name, email, wa, pass, instansi: '', kota: '', alamat: '', nik: '' };
  appState.users.push(newUser);
  appState.currentClientUser = newUser;
  syncUserToCloud(newUser);
  updateHeaderAuthBadge();
  closeClientAuthModal();
  showToast('Akun Dibuat', `Selamat datang, ${name}!`);
  if (appState.currentPage === 'client') refreshClientPageUI();
  if (appState.currentPage === 'order') refreshOrderPageUI();
}

function handleQuickClientLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass = document.getElementById('login-pass').value;
  const found = appState.users.find(u => u.email === email && u.pass === pass);
  if (!found) {
    showToast('Gagal Masuk', 'Email atau kata sandi salah.', 'error');
    return;
  }
  appState.currentClientUser = found;
  updateHeaderAuthBadge();
  closeClientAuthModal();
  showToast('Berhasil Masuk', `Halo, ${found.name}.`);
  if (appState.currentPage === 'client') refreshClientPageUI();
  if (appState.currentPage === 'order') refreshOrderPageUI();
}

function handleClientPortalLogin(e) {
  e.preventDefault();
  const email = document.getElementById('portal-login-email').value.trim().toLowerCase();
  const pass = document.getElementById('portal-login-pass').value;
  const found = appState.users.find(u => u.email === email && u.pass === pass);
  if (!found) {
    showToast('Gagal Masuk', 'Email atau kata sandi tidak sesuai.', 'error');
    return;
  }
  appState.currentClientUser = found;
  updateHeaderAuthBadge();
  refreshClientPageUI();
}

function logoutClientUser() {
  appState.currentClientUser = null;
  updateHeaderAuthBadge();
  showToast('Keluar Akun', 'Anda telah keluar dari sesi klien.');
  navigateTo('client');
}
