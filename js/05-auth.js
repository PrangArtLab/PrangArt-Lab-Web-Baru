/* === FITUR LIHAT PASSWORD (MATA) === */
window.togglePasswordVisibility = function(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input || !icon) return;
  
  if (input.type === 'password') {
    input.type = 'text';
    // Ganti ikon jadi mata dicoret (hide)
    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>';
  } else {
    input.type = 'password';
    // Ganti ikon kembali ke mata terbuka
    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>';
  }
};

function openClientAuthModal() { document.getElementById('client-auth-modal')?.classList.remove('hidden'); document.getElementById('client-auth-modal')?.classList.add('flex'); }
function closeClientAuthModal() { document.getElementById('client-auth-modal')?.classList.add('hidden'); document.getElementById('client-auth-modal')?.classList.remove('flex'); }

function handleQuickClientRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const wa = document.getElementById('reg-wa').value.trim();
  const pass = document.getElementById('reg-pass').value;
  
  if (!name || !email || !wa || !pass) {
    return showToast('Gagal', 'Semua field wajib diisi.', 'error');
  }

  // VALIDASI PASSWORD KOMBINASI (Min 8 karakter, ada huruf dan angka)
  const hasLetter = /[a-zA-Z]/.test(pass);
  const hasNumber = /\d/.test(pass);
  if (pass.length < 8 || !hasLetter || !hasNumber) {
    return showToast('Sandi Lemah', 'Kata sandi minimal 8 karakter, serta harus mengandung kombinasi huruf dan angka.', 'warning');
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
