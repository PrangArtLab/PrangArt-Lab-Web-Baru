function openClientAuthModal(mode = 'register') {
  const m = document.getElementById('client-auth-modal');
  if (m) { m.classList.remove('hidden'); m.classList.add('flex'); }
}

function closeClientAuthModal() {
  const m = document.getElementById('client-auth-modal');
  if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
}

function togglePasswordVisibility(inputId, showIconId, hideIconId) {
  const inp = document.getElementById(inputId);
  const showIcon = document.getElementById(showIconId);
  const hideIcon = document.getElementById(hideIconId);
  if (!inp) return;
  if (inp.type === 'password') {
    inp.type = 'text';
    showIcon?.classList.add('hidden');
    hideIcon?.classList.remove('hidden');
  } else {
    inp.type = 'password';
    showIcon?.classList.remove('hidden');
    hideIcon?.classList.add('hidden');
  }
}

async function handleQuickClientRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const wa = document.getElementById('reg-wa').value.trim();
  const pass = document.getElementById('reg-pass').value;

  if (appState.users.some(u => u.email === email)) {
    return showToast('Gagal', 'Email sudah terdaftar. Silakan masuk.', 'error');
  }

  const newUser = { email, pass, name, wa };
  appState.users.push(newUser);
  appState.currentClientUser = newUser;
  persistLocalState();
  await syncUserToCloud(newUser);

  closeClientAuthModal();
  showToast('Berhasil', `Selamat datang, ${name}!`);
  updateHeaderAuthBadge();
  refreshClientPageUI();
}

function handleClientPortalLogin(e) {
  e.preventDefault();
  const email = document.getElementById('portal-login-email').value.trim().toLowerCase();
  const pass = document.getElementById('portal-login-pass').value;

  const user = appState.users.find(u => u.email === email && u.pass === pass);
  if (!user) {
    return showToast('Gagal', 'Email atau kata sandi salah.', 'error');
  }

  appState.currentClientUser = user;
  persistLocalState();
  showToast('Berhasil', `Selamat datang kembali, ${user.name}!`);
  updateHeaderAuthBadge();
  refreshClientPageUI();
}

function handleGoogleLogin() {
  const dummyUser = { email: 'klien.google@prangart.id', pass: '', name: 'Klien Google', wa: '' };
  if (!appState.users.some(u => u.email === dummyUser.email)) {
    appState.users.push(dummyUser);
  }
  appState.currentClientUser = dummyUser;
  persistLocalState();
  closeClientAuthModal();
  showToast('Berhasil', 'Masuk menggunakan akun Google.');
  updateHeaderAuthBadge();
  refreshClientPageUI();
}

function handleForgotPassword(email) {
  if (!email) return showToast('Info', 'Masukkan alamat email Anda terlebih dahulu.', 'warning');
  showToast('Terkirim', `Instruksi pemulihan sandi dikirim ke ${email}.`);
}

function logoutClientUser() {
  appState.currentClientUser = null;
  localStorage.removeItem('prangart_current_user');
  persistLocalState();
  showToast('Info', 'Anda telah keluar (Log Out) dari akun klien.');
  updateHeaderAuthBadge();
  refreshClientPageUI();
  navigateTo('home');
}

function updateProfile() {
  if (!appState.currentClientUser) return;
  const newName = document.getElementById('set-name').value.trim();
  const newWa = document.getElementById('set-wa').value.trim();
  if (!newName) return showToast('Perhatian', 'Nama tidak boleh kosong.', 'warning');

  appState.currentClientUser.name = newName;
  appState.currentClientUser.wa = newWa;
  const idx = appState.users.findIndex(u => u.email === appState.currentClientUser.email);
  if (idx !== -1) appState.users[idx] = { ...appState.currentClientUser };

  persistLocalState();
  updateHeaderAuthBadge();
  showToast('Berhasil', 'Profil berhasil diperbarui.');
}

function updatePass() {
  if (!appState.currentClientUser) return;
  const newPass = document.getElementById('set-pass').value;
  if (!newPass || newPass.length < 4) return showToast('Perhatian', 'Kata sandi minimal 4 karakter.', 'warning');

  appState.currentClientUser.pass = newPass;
  const idx = appState.users.findIndex(u => u.email === appState.currentClientUser.email);
  if (idx !== -1) appState.users[idx].pass = newPass;

  persistLocalState();
  document.getElementById('set-pass').value = '';
  showToast('Berhasil', 'Kata sandi berhasil diganti.');
}

Object.assign(window, {
  openClientAuthModal, closeClientAuthModal, togglePasswordVisibility,
  handleQuickClientRegister, handleClientPortalLogin, handleGoogleLogin,
  handleForgotPassword, logoutClientUser, updateProfile, updatePass
});
