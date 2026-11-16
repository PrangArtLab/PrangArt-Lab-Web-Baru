function openClientAuthModal() { document.getElementById('client-auth-modal')?.classList.remove('hidden'); document.getElementById('client-auth-modal')?.classList.add('flex'); }
function closeClientAuthModal() { document.getElementById('client-auth-modal')?.classList.add('hidden'); document.getElementById('client-auth-modal')?.classList.remove('flex'); }

function handleQuickClientRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const wa = document.getElementById('reg-wa').value.trim();
  const pass = document.getElementById('reg-pass').value;
  if (!name || !email || !wa || !pass) {
    showToast('Gagal', 'Semua field wajib diisi.', 'error');
    return;
  }
  if (appState.users.find(u => u.email.toLowerCase() === email)) return showToast('Gagal', 'Email terdaftar. Silakan masuk.', 'error');

  const newUser = { name, email, wa, pass };
  appState.users.push(newUser);
  appState.currentClientUser = newUser;
  localStorage.setItem('prangart_current_user', JSON.stringify(newUser));
  persistLocalState();
  updateHeaderAuthBadge();
  closeClientAuthModal();
  showToast('Sukses', 'Akun dibuat. Selamat datang!');
  refreshClientPageUI();
}

function handleClientPortalLogin(e) {
  e.preventDefault();
  const email = document.getElementById('portal-login-email').value.trim().toLowerCase();
  const pass = document.getElementById('portal-login-pass').value;
  const registeredUser = appState.users.find(u => (u.email || '').toLowerCase() === email);

  if (!registeredUser) {
    const registrationEmail = document.getElementById('reg-email');
    if (registrationEmail) registrationEmail.value = email;
    openClientAuthModal();
    showToast('Belum terdaftar', 'Silakan buat akun baru terlebih dahulu.', 'warning');
    return;
  }

  if (registeredUser.pass !== pass) {
    showToast('Gagal', 'Kata sandi salah. Silakan coba lagi.', 'error');
    return;
  }

  appState.currentClientUser = registeredUser;
  localStorage.setItem('prangart_current_user', JSON.stringify(registeredUser));
  updateHeaderAuthBadge();
  refreshClientPageUI();
  showToast('Sukses', `Halo, ${registeredUser.name}`);
}

async function handleGoogleLogin() {
  if (!window.firebaseAuth) return showToast('Info', 'Firebase belum siap.', 'warning');
  try {
    const { GoogleAuthProvider, signInWithPopup } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js');
    const result = await signInWithPopup(window.firebaseAuth, new GoogleAuthProvider());
    
    let existing = appState.users.find(u => u.email === result.user.email);
    if (!existing) {
      existing = { 
        name: result.user.displayName, 
        email: result.user.email, 
        wa: '', 
        pass: 'google-auth' 
      };
      appState.users.push(existing);
      persistLocalState();
    }
    
    appState.currentClientUser = existing;
    localStorage.setItem('prangart_current_user', JSON.stringify(existing));
    
    closeClientAuthModal(); 
    updateHeaderAuthBadge(); 
    refreshClientPageUI(); 
    showToast('Sukses', `Halo, ${existing.name}`);
  } catch (error) { 
    showToast('Gagal', 'Login Google dibatalkan atau gagal.', 'error'); 
  }
}

async function handleForgotPassword(email) {
  if (!email) return showToast('Info', 'Isi email dulu.', 'warning');
  if (!window.firebaseAuth) return showToast('Info', 'Firebase tidak siap.', 'warning');
  try {
    const { sendPasswordResetEmail } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js');
    await sendPasswordResetEmail(window.firebaseAuth, email);
    showToast('Email Terkirim', 'Cek kotak masuk.', 'success');
  } catch (error) { showToast('Gagal', 'Email tidak ditemukan.', 'error'); }
}

function logoutClientUser() {
  appState.currentClientUser = null; localStorage.removeItem('prangart_current_user');
  updateHeaderAuthBadge(); navigateTo('client'); showToast('Logout', 'Berhasil keluar.');
}
