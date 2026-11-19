/* === SISTEM NAVIGASI HALAMAN, PEMISAHAN ROLE (KLIEN VS ADMIN) & LOGOUT === */

function removeDuplicateAdminNavButtons() {
  document.querySelectorAll('#nav-btn-admin, #mobile-nav-admin').forEach((el) => el.remove());

  document.querySelectorAll('header button, header a, #mobile-menu button, #mobile-menu a').forEach((el) => {
    const label = (el.textContent || '').trim().toLowerCase();
    if (label.includes('admin studio')) {
      el.remove();
    }
  });
}

function getActiveRoleState() {
  const isClientLoggedIn = Boolean(
    typeof appState !== 'undefined' &&
    appState.currentClientUser &&
    (appState.currentClientUser.email || appState.currentClientUser.name)
  );
  const isAdminLoggedIn = Boolean(
    (typeof appState !== 'undefined' && appState.isAdminUnlocked) ||
    sessionStorage.getItem('prangart_admin_unlocked') === 'true' ||
    localStorage.getItem('prangart_admin_unlocked') === 'true'
  );
  return { isClientLoggedIn, isAdminLoggedIn };
}

function getAllAdminNavButtons() {
  const matches = new Set();
  document
    .querySelectorAll('[data-nav-target="admin"], a[href="#admin"], header button, header a, #mobile-menu button, #mobile-menu a')
    .forEach((el) => {
      const onclickAttr = el.getAttribute('onclick') || '';
      const targetAttr = el.getAttribute('data-nav-target') || '';
      const label = (el.textContent || '').trim().toLowerCase();
      if (
        targetAttr === 'admin' ||
        onclickAttr.includes("'admin'") ||
        onclickAttr.includes('"admin"') ||
        label === 'admin'
      ) {
        matches.add(el);
      }
    });
  return Array.from(matches);
}

function getAllClientNavButtons() {
  const matches = new Set();
  document
    .querySelectorAll('[data-nav-target="client"], [data-nav-target="order"], header button, header a, #mobile-menu button, #mobile-menu a')
    .forEach((el) => {
      const onclickAttr = el.getAttribute('onclick') || '';
      const targetAttr = el.getAttribute('data-nav-target') || '';
      const label = (el.textContent || '').trim().toLowerCase();
      if (
        targetAttr === 'client' ||
        targetAttr === 'order' ||
        onclickAttr.includes("'client'") ||
        onclickAttr.includes('"client"') ||
        onclickAttr.includes("'order'") ||
        onclickAttr.includes('"order"') ||
        label === 'ruang klien' ||
        label === 'pemesanan' ||
        label === 'order'
      ) {
        matches.add(el);
      }
    });
  return Array.from(matches);
}

function syncRoleNavVisibility() {
  removeDuplicateAdminNavButtons();
  const { isClientLoggedIn, isAdminLoggedIn } = getActiveRoleState();

  // Jika Klien sedang login -> sembunyikan menu Admin
  getAllAdminNavButtons().forEach((el) => {
    el.classList.toggle('hidden', isClientLoggedIn);
    el.style.display = isClientLoggedIn ? 'none' : '';
  });

  // Jika Admin sedang login -> sembunyikan menu Ruang Klien & Order
  getAllClientNavButtons().forEach((el) => {
    el.classList.toggle('hidden', isAdminLoggedIn);
    el.style.display = isAdminLoggedIn ? 'none' : '';
  });
}

function toggleMobileMenu(forceState) {
  const menu = document.getElementById('mobile-menu');
  if (!menu) return;
  if (typeof forceState === 'boolean') {
    menu.classList.toggle('hidden', !forceState);
  } else {
    menu.classList.toggle('hidden');
  }
}

function updateActiveNavHighlight(pageId) {
  document.querySelectorAll('header button, header a, #mobile-menu button, #mobile-menu a, [data-nav-target]').forEach((btn) => {
    const target = btn.getAttribute('data-nav-target') || '';
    const onclickAttr = btn.getAttribute('onclick') || '';
    const isTarget =
      target === pageId ||
      onclickAttr.includes(`'${pageId}'`) ||
      onclickAttr.includes(`"${pageId}"`);

    if (isTarget) {
      btn.classList.add('text-primary', 'bg-primary/10', 'font-bold');
      btn.classList.remove('text-textMuted');
    } else if (target || onclickAttr.includes('navigateTo(')) {
      btn.classList.remove('text-primary', 'bg-primary/10');
      btn.classList.add('text-textMuted');
    }
  });
}

function ensureAdminPageInnerState() {
  const { isAdminLoggedIn } = getActiveRoleState();
  const adminPage = document.getElementById('page-admin');
  if (!adminPage) return;

  // Pastikan section utama admin terlihat
  adminPage.classList.remove('hidden', 'sm:hidden', 'md:hidden', 'lg:hidden', 'xl:hidden');
  adminPage.style.display = 'block';

  // Deteksi layar PIN / Kunci Admin vs Konten Utama Dashboard Admin
  const lockCandidates = adminPage.querySelectorAll('#admin-lock-screen, #admin-pin-screen, #admin-login-box, [id*="admin-pin"], [id*="admin-lock"]');
  const contentCandidates = adminPage.querySelectorAll('#admin-dashboard-content, #admin-main-panel, #admin-panel-content, [id*="admin-dashboard"]');

  if (!isAdminLoggedIn) {
    lockCandidates.forEach((el) => {
      el.classList.remove('hidden');
      el.style.display = '';
    });
    contentCandidates.forEach((el) => {
      el.classList.add('hidden');
    });
  } else {
    lockCandidates.forEach((el) => {
      el.classList.add('hidden');
    });
    contentCandidates.forEach((el) => {
      el.classList.remove('hidden');
      el.style.display = '';
    });
  }
}

function navigateTo(pageId) {
  if (!pageId) pageId = 'home';
  const { isClientLoggedIn, isAdminLoggedIn } = getActiveRoleState();

  // Blokir akses silang sebelum logout
  if (isClientLoggedIn && pageId === 'admin') {
    if (typeof showToast === 'function') {
      showToast(
        'Akses Ditolak',
        'Anda sedang masuk sebagai Klien. Silakan klik Log Out / Keluar terlebih dahulu sebelum membuka fitur Admin.',
        'warning'
      );
    }
    pageId = 'client';
  }

  if (isAdminLoggedIn && (pageId === 'client' || pageId === 'order')) {
    if (typeof showToast === 'function') {
      showToast(
        'Akses Ditolak',
        'Anda sedang berada dalam sesi Admin. Silakan keluar dari Admin terlebih dahulu sebelum masuk ke fitur Klien.',
        'warning'
      );
    }
    pageId = 'admin';
  }

  if (typeof appState !== 'undefined') {
    appState.currentPage = pageId;
  }

  // Sembunyikan seluruh section halaman
  document.querySelectorAll('.page-section, section[id^="page-"], div[id^="page-"]').forEach((sec) => {
    sec.classList.add('hidden');
    sec.style.display = 'none';
  });

  // Tampilkan halaman target
  const target = document.getElementById(`page-${pageId}`);
  if (target) {
    target.classList.remove('hidden', 'sm:hidden', 'md:hidden', 'lg:hidden', 'xl:hidden');
    target.style.display = 'block';
  }

  syncRoleNavVisibility();
  updateActiveNavHighlight(pageId);
  toggleMobileMenu(false);

  try {
    if (pageId === 'home') {
      if (typeof renderHomePortfolioPreview === 'function') renderHomePortfolioPreview();
    } else if (pageId === 'portfolio') {
      if (typeof renderPortfolioPage === 'function') renderPortfolioPage();
    } else if (pageId === 'order') {
      if (typeof refreshOrderPageUI === 'function') refreshOrderPageUI();
    } else if (pageId === 'client') {
      if (typeof refreshClientDashboard === 'function') refreshClientDashboard();
    } else if (pageId === 'admin') {
      ensureAdminPageInnerState();
      if (typeof refreshAdminDashboard === 'function') refreshAdminDashboard();
      if (typeof renderAdminCatalogEditor === 'function') renderAdminCatalogEditor();
    }
  } catch (err) {
    console.error(`Gagal merender halaman ${pageId}:`, err);
  }

  try {
    if (history.replaceState) {
      history.replaceState(null, '', `#${pageId}`);
    }
  } catch (_) {}

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToOrderWithService(serviceKey, packageKey) {
  const { isAdminLoggedIn } = getActiveRoleState();
  if (isAdminLoggedIn) {
    if (typeof showToast === 'function') {
      showToast('Sesi Admin Aktif', 'Keluar dari Admin terlebih dahulu untuk membuat pesanan sebagai Klien.', 'warning');
    }
    return navigateTo('admin');
  }

  if (typeof appState !== 'undefined') {
    if (serviceKey) appState.selectedServiceLine = serviceKey;
    if (packageKey) appState.selectedPackage = packageKey;
  }
  navigateTo('order');
  if (typeof selectServiceLine === 'function' && serviceKey) {
    selectServiceLine(serviceKey);
  }
  if (typeof selectPackageTier === 'function' && packageKey) {
    selectPackageTier(packageKey);
  }
}

/* === FUNGSI LOGOUT / KELUAR BERSIH (MENANGANI TOMBOL "KELUAR" MAUPUN "LOG OUT") === */
async function performUniversalLogout(roleHint) {
  try {
    // 1. Bersihkan seluruh penyimpanan sesi klien di browser
    if (!roleHint || roleHint === 'client' || roleHint === 'all') {
      if (typeof appState !== 'undefined') {
        appState.currentClientUser = null;
      }
      const clientStorageKeys = [
        'prangart_client_user',
        'prangart_user',
        'prangart_current_user',
        'clientUser',
        'currentClientUser',
        'prangart_session'
      ];
      clientStorageKeys.forEach((k) => {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      });

      // Reset tampilan tombol profil & keluar di header kanan atas
      const headerUserBadge = document.getElementById('header-user-name') || document.getElementById('nav-user-name');
      const headerLogoutBtn = document.getElementById('header-logout-btn') || document.getElementById('nav-logout-btn');
      const headerLoginBtn = document.getElementById('header-login-btn') || document.getElementById('nav-login-btn');
      if (headerUserBadge) headerUserBadge.classList.add('hidden');
      if (headerLogoutBtn) headerLogoutBtn.classList.add('hidden');
      if (headerLoginBtn) headerLoginBtn.classList.remove('hidden');

      if (window.firebaseAuth && typeof window.firebaseAuth.signOut === 'function') {
        await window.firebaseAuth.signOut().catch(() => {});
      }
    }

    // 2. Bersihkan seluruh penyimpanan sesi admin
    if (!roleHint || roleHint === 'admin' || roleHint === 'all') {
      if (typeof appState !== 'undefined') {
        appState.isAdminUnlocked = false;
      }
      localStorage.removeItem('prangart_admin_unlocked');
      sessionStorage.removeItem('prangart_admin_unlocked');
      ensureAdminPageInnerState();
    }
  } catch (err) {
    console.error('Error saat logout:', err);
  }

  // 3. Kembalikan visibilitas tombol navigasi (menu Admin muncul kembali)
  syncRoleNavVisibility();

  // 4. Perbarui tampilan halaman klien (kembali ke form login klien)
  if (typeof refreshClientDashboard === 'function') {
    try { refreshClientDashboard(); } catch (_) {}
  }
  if (typeof updateHeaderAuthUI === 'function') {
    try { updateHeaderAuthUI(); } catch (_) {}
  }

  if (typeof showToast === 'function') {
    showToast('Berhasil Keluar', 'Sesi Anda telah diakhiri.');
  }

  navigateTo('home');
}

// Tangkap klik pada SEMUA tombol keluar / log out di seluruh halaman (termasuk tombol merah "Log Out" di Ruang Klien)
document.addEventListener('click', (ev) => {
  const clickedBtn = ev.target.closest('button, a');
  if (clickedBtn) {
    const labelText = (clickedBtn.textContent || '').trim().toLowerCase();
    const onclickAttr = (clickedBtn.getAttribute('onclick') || '').toLowerCase();
    const idAttr = (clickedBtn.id || '').toLowerCase();
    const actionAttr = (clickedBtn.getAttribute('data-action') || '').toLowerCase();

    const isLogoutElement =
      labelText === 'log out' ||
      labelText === 'logout' ||
      labelText === 'keluar' ||
      labelText === 'keluar akun' ||
      labelText === 'keluar admin' ||
      onclickAttr.includes('logout') ||
      onclickAttr.includes('keluar') ||
      idAttr.includes('logout') ||
      actionAttr.includes('logout') ||
      clickedBtn.classList.contains('btn-logout');

    if (isLogoutElement) {
      ev.preventDefault();
      ev.stopPropagation();
      if (labelText.includes('admin') || onclickAttr.includes('admin') || idAttr.includes('admin')) {
        performUniversalLogout('admin');
      } else {
        performUniversalLogout('all');
      }
      return;
    }
  }

  const navEl = ev.target.closest('[data-nav-target]');
  if (navEl) {
    ev.preventDefault();
    const pageTarget = navEl.getAttribute('data-nav-target');
    const preService = navEl.getAttribute('data-service');
    const prePackage = navEl.getAttribute('data-package');
    if (pageTarget === 'order' && (preService || prePackage)) {
      goToOrderWithService(preService, prePackage);
    } else {
      navigateTo(pageTarget);
    }
  }
}, true); // Gunakan capture phase (true) agar tidak tertahan event handler lain

function initNavigationSystem() {
  syncRoleNavVisibility();
  const initialHash = (window.location.hash || '').replace('#', '').trim();
  const validPages = ['home', 'services', 'portfolio', 'order', 'client', 'admin'];
  if (validPages.includes(initialHash)) {
    navigateTo(initialHash);
  } else {
    updateActiveNavHighlight((typeof appState !== 'undefined' && appState.currentPage) || 'home');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavigationSystem);
} else {
  initNavigationSystem();
}

// Ekspos seluruh kemungkinan nama fungsi logout & navigasi ke window
Object.assign(window, {
  navigateTo,
  toggleMobileMenu,
  goToOrderWithService,
  syncRoleNavVisibility,
  ensureAdminNavButtonsVisible: syncRoleNavVisibility,
  removeDuplicateAdminNavButtons,
  ensureAdminPageInnerState,
  updateActiveNavHighlight,
  performUniversalLogout,
  logout: () => performUniversalLogout('all'),
  clientLogout: () => performUniversalLogout('client'),
  logoutClient: () => performUniversalLogout('client'),
  handleClientLogout: () => performUniversalLogout('client'),
  adminLogout: () => performUniversalLogout('admin'),
  logoutAdmin: () => performUniversalLogout('admin'),
  handleAdminLogout: () => performUniversalLogout('admin'),
  logoutAll: () => performUniversalLogout('all')
});
