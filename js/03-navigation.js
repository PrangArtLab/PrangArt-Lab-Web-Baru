/* === SISTEM NAVIGASI HALAMAN, PEMISAHAN ROLE (KLIEN VS ADMIN) & LOGOUT === */

function removeDuplicateAdminNavButtons() {
  // Hapus tombol suntikan duplikat "⚙ Admin Studio" agar hanya menyisakan tombol "Admin" bawaan HTML
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
    typeof appState !== 'undefined' && appState.currentClientUser && appState.currentClientUser.email
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

function navigateTo(pageId) {
  if (!pageId) pageId = 'home';
  const { isClientLoggedIn, isAdminLoggedIn } = getActiveRoleState();

  // Blokir akses silang sebelum logout
  if (isClientLoggedIn && pageId === 'admin') {
    if (typeof showToast === 'function') {
      showToast(
        'Akses Ditolak',
        'Anda sedang masuk sebagai Klien. Silakan klik Keluar terlebih dahulu sebelum membuka fitur Admin.',
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

  document.querySelectorAll('.page-section, section[id^="page-"], div[id^="page-"]').forEach((sec) => {
    sec.classList.add('hidden');
    sec.style.display = 'none';
  });

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

async function performUniversalLogout(roleHint) {
  try {
    if (!roleHint || roleHint === 'client' || roleHint === 'all') {
      if (typeof appState !== 'undefined') {
        appState.currentClientUser = null;
      }
      localStorage.removeItem('prangart_client_user');
      sessionStorage.removeItem('prangart_client_user');

      if (window.firebaseAuth && typeof window.firebaseAuth.signOut === 'function') {
        await window.firebaseAuth.signOut().catch(() => {});
      }
    }

    if (!roleHint || roleHint === 'admin' || roleHint === 'all') {
      if (typeof appState !== 'undefined') {
        appState.isAdminUnlocked = false;
      }
      localStorage.removeItem('prangart_admin_unlocked');
      sessionStorage.removeItem('prangart_admin_unlocked');

      const adminLockBox = document.getElementById('admin-lock-screen');
      const adminMainPanel = document.getElementById('admin-dashboard-content');
      if (adminLockBox) adminLockBox.classList.remove('hidden');
      if (adminMainPanel) adminMainPanel.classList.add('hidden');
    }
  } catch (err) {
    console.error('Error saat logout:', err);
  }

  syncRoleNavVisibility();

  if (typeof refreshClientDashboard === 'function') {
    try { refreshClientDashboard(); } catch (_) {}
  }

  if (typeof showToast === 'function') {
    showToast('Berhasil Keluar', 'Sesi Anda telah diakhiri.');
  }

  navigateTo('home');
}

document.addEventListener('click', (ev) => {
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
  }
});

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

Object.assign(window, {
  navigateTo,
  toggleMobileMenu,
  goToOrderWithService,
  syncRoleNavVisibility,
  ensureAdminNavButtonsVisible: syncRoleNavVisibility,
  removeDuplicateAdminNavButtons,
  updateActiveNavHighlight,
  performUniversalLogout,
  logoutClient: () => performUniversalLogout('client'),
  handleClientLogout: () => performUniversalLogout('client'),
  logoutAdmin: () => performUniversalLogout('admin'),
  handleAdminLogout: () => performUniversalLogout('admin'),
  logoutAll: () => performUniversalLogout('all')
});
