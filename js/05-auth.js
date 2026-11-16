function openClientAuthModal() {
  document.getElementById('client-auth-modal')?.classList.remove('hidden');
  document.getElementById('client-auth-modal')?.classList.add('flex');
}
function closeClientAuthModal() {
  document.getElementById('client-auth-modal')?.classList.add('hidden');
  document.getElementById('client-auth-modal')?.classList.remove('flex');
}

function handleQuickClientRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const wa = document.getElementById('reg-wa').value.trim();
  const pass = document.getElementById('reg-pass').value;

  if (appState.users.find(u => u.email === email)) return showToast('Gagal', 'Email sudah terdaftar.', 'error');

  const newUser = { name, email, wa, pass };
  appState.users.push(newUser);
  appState.currentClientUser = newUser;
  
  // Simpan sesi
  localStorage.setItem('prangart_current_user', JSON.stringify(newUser));
  syncUserToCloud(newUser);
  
  updateHeaderAuthBadge();
  closeClientAuthModal();
  showToast('Berhasil', 'Akun berhasil dibuat.');
  navigateTo('client');
}

function handleClientPortalLogin(e) {
  e.preventDefault();
  const email = document.getElementById('portal-login-email').value.trim().toLowerCase();
  const pass = document.getElementById('portal-login-pass').value;
  const found = appState.users.find(u => u.email === email && u.pass === pass);
  
  if (!found) return showToast('Gagal', 'Email atau sandi salah.', 'error');
  
  appState.currentClientUser = found;
  // Simpan sesi
  localStorage.setItem('prangart_current_user', JSON.stringify(found));
  
  updateHeaderAuthBadge();
  refreshClientPageUI();
  showToast('Sukses', `Selamat datang, ${found.name}`);
}

async function handleGoogleLogin() {
  if (!window.firebaseAuth) return showToast('Info', 'Firebase belum siap, gunakan login manual.', 'warning');
  try {
    const { GoogleAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js');
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(window.firebaseAuth, provider);
    const user = result.user;
    
    let existing = appState.users.find(u => u.email === user.email);
    if (!existing) {
      existing = { name: user.displayName, email: user.email, wa: '', pass: 'google-auth' };
      appState.users.push(existing);
      syncUserToCloud(existing);
    }
    appState.currentClientUser = existing;
    localStorage.setItem('prangart_current_user', JSON.stringify(existing));
    
    updateHeaderAuthBadge();
    refreshClientPageUI();
    showToast('Sukses', `Halo, ${user.displayName}`);
  } catch (error) {
    showToast('Gagal', 'Login Google dibatalkan.', 'error');
  }
}

async function handleForgotPassword(email) {
  if (!email) return showToast('Info', 'Ketik email Anda di kolom Email terlebih dahulu.', 'warning');
  if (!window.firebaseAuth) return showToast('Info', 'Fitur reset sandi membutuhkan Firebase.', 'warning');
  try {
    const { sendPasswordResetEmail } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js');
    await sendPasswordResetEmail(window.firebaseAuth, email);
    showToast('Email Terkirim', 'Cek kotak masuk Anda untuk link reset sandi.', 'success');
  } catch (error) {
    showToast('Gagal', 'Email tidak ditemukan atau terjadi kesalahan.', 'error');
  }
}

function logoutClientUser() {
  appState.currentClientUser = null;
  localStorage.removeItem('prangart_current_user'); // Hapus sesi
  updateHeaderAuthBadge();
  navigateTo('client');
  showToast('Logout', 'Anda telah keluar.');
}
