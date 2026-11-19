/* === SISTEM NAVIGASI HALAMAN, PEMISAHAN ROLE (KLIEN VS ADMIN) & LOGOUT === */

function getActiveRoleState() {
  const isClientLoggedIn = Boolean(
    typeof appState !== 'undefined' && appState.currentClientUser && appState.currentClientUser.email
  );
  const isAdminLoggedIn = Boolean(
    (typeof appState !== 'undefined' && appState.isAdminUnlocked) ||
    sessionStorage.getItem('prangart_admin_unlocked') === 'true' ||
    localStorage.getItem('prangart_admin_unlocked') === 'true'
  );
  return { isClientLoggedIn, isAdminLoggedIn };
}

function ensureAdminNavButtonsVisible() {
  const { isClientLoggedIn, isAdminLoggedIn } = getActiveRoleState();

  // 1. Suntikkan tombol Admin Studio ke bilah navigasi Desktop & Tablet jika belum ada
  const desktopNavCandidates = document.querySelectorAll(
    'header nav, nav .hidden.md\\:flex, nav .hidden.sm\\:flex, nav .hidden.lg\\:flex, #desktop-nav-links, #main-nav-links'
  );

  desktopNavCandidates.forEach((nav) => {
    if (nav.id === 'mobile-menu' || nav.closest('#mobile-menu')) return;

    if (!nav.querySelector('[data-nav-target="admin"], #nav-btn-admin')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'nav-btn-admin';
      btn.setAttribute('data-nav-target', 'admin');
      btn.className =
        'nav-link-btn px-3 py-2 rounded-xl text-xs font-bold text-textMuted hover:text-primary hover:bg-primary/10 transition cursor-pointer inline-flex items-center gap-1.5 shrink-0';
      btn.innerHTML = '<span>⚙</span><span>Admin Studio</span>';
      nav.appendChild(btn);
    }
  });

  // 2. Pastikan juga ada di mobile drawer
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu && !mobileMenu.querySelector('[data-nav-target="admin"], #mobile-nav-admin')) {
    const mBtn = document.createElement('button');
    mBtn.type = 'button';
    mBtn.id = 'mobile-nav-admin';
    mBtn.setAttribute('data-nav-target', 'admin');
    mBtn.className =
      'nav-link-btn w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-textMuted hover:text-primary hover:bg-primary/10 transition flex items-center gap-2';
    mBtn.innerHTML = '<span>⚙</span><span>Admin Studio</span>';
    mobileMenu.appendChild(mBtn);
  }

  // 3. ATURAN PEMISAHAN VISIBILITAS TOMBOL NAVIGASI:
  // Jika Klien sedang login -> Sembunyikan semua tombol menuju Admin
  document.querySelectorAll('[data-nav-target="admin"], #nav-btn-admin, #mobile-nav-admin').forEach((el) => {
    el.classList.toggle('hidden', isClientLoggedIn);
    el.style.display = isClientLoggedIn ? 'none' : '';
  });

  // Jika Admin sedang login -> Sembunyikan tombol Ruang Klien & Pemesanan Klien
  document
    .querySelectorAll('[data-nav-target="client"], [data-nav-target="order"], #nav-btn-client, #mobile-nav-client, #nav-btn-order, #mobile-nav-order')
    .forEach((el) => {
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
  document.querySelectorAll('.nav-link-btn, [data-nav-target]').forEach((btn) => {
    const target = btn.getAttribute('data-nav-target');
    const isTarget =
      target === pageId ||
      btn.id === `nav-btn-${pageId}` ||
      btn.id === `mobile-nav-${pageId}`;

    if (isTarget) {
      btn.classList.add('text-primary', 'bg-primary/10', 'font-bold');
      btn.classList.remove('text-textMuted');
    } else {
      btn.classList.remove('text-primary', 'bg-primary/10');
      btn.classList.add('text-textMuted');
    }
  });
}

function navigateTo(pageId) {
  if (!pageId) pageId = 'home';
  const { isClientLoggedIn, isAdminLoggedIn } = getActiveRoleState();

  // BLOKIR AKSES SILANG ANTAR ROLE SEBELUM LOGOUT
  if (isClientLoggedIn && pageId === 'admin') {
    if (typeof showToast === 'function') {
      showToast(
        'Akses Ditolak',
        'Anda sedang masuk sebagai Klien. Silakan klik Keluar (Logout) dari Ruang Klien terlebih dahulu untuk membuka Admin Studio.',
        'warning'
      );
    }
    pageId = 'client';
  }

  if (isAdminLoggedIn && (pageId === 'client' || pageId === 'order')) {
    if (typeof showToast === 'function') {
      showToast(
        'Akses Ditolak',
        'Anda sedang berada dalam sesi Admin Studio. Silakan keluar dari Admin terlebih dahulu sebelum masuk ke fitur Klien.',
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

  // Tampilkan halaman tujuan
  const target = document.getElementById(`page-${pageId}`);
  if (target) {
    target.classList.remove('hidden', 'sm:hidden', 'md:hidden', 'lg:hidden', 'xl:hidden');
    target.style.display = 'block';
  }

  ensureAdminNavButtonsVisible();
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
      showToast('Sesi Admin Aktif', 'Keluar dari Admin Studio terlebih dahulu untuk membuat pesanan sebagai Klien.', 'warning');
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

/* === FUNGSI LOGOUT / KELUAR BERSIH (KLIEN MAUPUN ADMIN) === */
async function performUniversalLogout(roleHint) {
  try {
    // 1. Bersihkan sesi Klien
    if (!roleHint || roleHint === 'client' || roleHint === 'all') {
      if (typeof appState !== 'undefined') {
        appState.currentClientUser = null;
      }
      localStorage.removeItem('prangart_client_user');
      sessionStorage.removeItem('prangart_client_user');

      // Sign out Firebase Auth jika tersedia
      if (window.firebaseAuth && typeof window.firebaseAuth.signOut === 'function') {
        await window.firebaseAuth.signOut().catch(() => {});
      }
    }

    // 2. Bersihkan sesi Admin
    if (!roleHint || roleHint === 'admin' || roleHint === 'all') {
      if (typeof appState !== 'undefined') {
        appState.isAdminUnlocked = false;
      }
      localStorage.removeItem('prangart_admin_unlocked');
      sessionStorage.removeItem('prangart_admin_unlocked');

      // Kunci kembali panel admin & tampilkan form PIN admin jika elemennya ada
      const adminLockBox = document.getElementById('admin-lock-screen');
      const adminMainPanel = document.getElementById('admin-dashboard-content');
      if (adminLockBox) adminLockBox.classList.remove('hidden');
      if (adminMainPanel) adminMainPanel.classList.add('hidden');
    }
  } catch (err) {
    console.error('Error saat logout:', err);
  }

  // 3. Kembalikan semua tombol navigasi (Klien & Admin) agar muncul normal kembali
  ensureAdminNavButtonsVisible();

  if (typeof refreshClientDashboard === 'function') {
    try { refreshClientDashboard(); } catch (_) {}
  }

  if (typeof showToast === 'function') {
    showToast('Berhasil Keluar', 'Sesi Anda telah diakhiri dengan aman.');
  }

  // 4. Arahkan kembali ke Beranda
  navigateTo('home');
}

// Event delegation global untuk navigasi & semua tombol Keluar / Logout
document.addEventListener('click', (ev) => {
  // Tangkap segala tombol logout/keluar baik via ID, data-action, maupun atribut onclick lama
  const logoutBtn = ev.target.closest(
    '#btn-client-logout, #btn-admin-logout, [data-action="logout"], [data-action="client-logout"], [data-action="admin-logout"], .btn-logout'
  );
  if (logoutBtn) {
    ev.preventDefault();
    ev.stopPropagation();
    const act = logoutBtn.getAttribute('data-action') || logoutBtn.id || '';
    if (act.includes('admin')) {
      performUniversalLogout('admin');
    } else if (act.includes('client')) {
      performUniversalLogout('client');
    } else {
      performUniversalLogout('all');
    }
    return;
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
    return;
  }

  const adminTrigger = ev.target.closest('#nav-btn-admin, #mobile-nav-admin, a[href="#admin"]');
  if (adminTrigger) {
    ev.preventDefault();
    navigateTo('admin');
  }
});

function initNavigationSystem() {
  ensureAdminNavButtonsVisible();
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

// Ekspos ke global window agar semua tombol onclick lama (logoutClient, logoutAdmin, dll.) otomatis bekerja
Object.assign(window, {
  navigateTo,
  toggleMobileMenu,
  goToOrderWithService,
  ensureAdminNavButtonsVisible,
  updateActiveNavHighlight,
  performUniversalLogout,
  logoutClient: () => performUniversalLogout('client'),
  handleClientLogout: () => performUniversalLogout('client'),
  logoutAdmin: () => performUniversalLogout('admin'),
  handleAdminLogout: () => performUniversalLogout('admin'),
  logoutAll: () => performUniversalLogout('all')
});
