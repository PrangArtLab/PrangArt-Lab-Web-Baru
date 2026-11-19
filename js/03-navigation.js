/* === SISTEM NAVIGASI HALAMAN (DESKTOP, TABLET & MOBILE), PEMISAHAN ROLE & LOGOUT === */

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

/* === NAVIGASI KHUSUS LAYAR MOBILE (DI BAWAH LAYAR) === */
function ensureMobileBottomNav() {
  if (document.getElementById('prangart-mobile-bottom-nav')) return;

  const navBar = document.createElement('nav');
  navBar.id = 'prangart-mobile-bottom-nav';
  navBar.className =
    'md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-t border-border px-2 py-2 flex items-center justify-around shadow-lg';

  const items = [
    { page: 'home', label: 'Beranda', icon: '⌂' },
    { page: 'portfolio', label: 'Portofolio', icon: '♫' },
    { page: 'client', label: 'Ruang Klien', icon: '👤', roleClass: 'role-client-nav' },
    { page: 'admin', label: 'Admin', icon: '⚙', roleClass: 'role-admin-nav' }
  ];

  navBar.innerHTML = items
    .map(
      (item) => `
      <button type="button"
        data-nav-target="${item.page}"
        class="${item.roleClass || ''} flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[11px] font-bold text-textMuted hover:text-primary transition cursor-pointer">
        <span class="text-base leading-none mb-1">${item.icon}</span>
        <span>${item.label}</span>
      </button>
    `
    )
    .join('');

  document.body.appendChild(navBar);
  document.body.style.paddingBottom = '72px';
}

function getAllAdminNavButtons() {
  const matches = new Set();
  document
    .querySelectorAll('[data-nav-target="admin"], .role-admin-nav, a[href="#admin"], header button, header a, #mobile-menu button, #mobile-menu a')
    .forEach((el) => {
      const onclickAttr = el.getAttribute('onclick') || '';
      const targetAttr = el.getAttribute('data-nav-target') || '';
      const label = (el.textContent || '').trim().toLowerCase();
      if (
        targetAttr === 'admin' ||
        el.classList.contains('role-admin-nav') ||
        onclickAttr.includes("'admin'") ||
        onclickAttr.includes('"admin"') ||
        label === 'admin' ||
        label.endsWith('admin')
      ) {
        matches.add(el);
      }
    });
  return Array.from(matches);
}

function getAllClientNavButtons() {
  const matches = new Set();
  document
    .querySelectorAll('[data-nav-target="client"], [data-nav-target="order"], .role-client-nav, header button, header a, #mobile-menu button, #mobile-menu a')
    .forEach((el) => {
      const onclickAttr = el.getAttribute('onclick') || '';
      const targetAttr = el.getAttribute('data-nav-target') || '';
      const label = (el.textContent || '').trim().toLowerCase();
      if (
        targetAttr === 'client' ||
        targetAttr === 'order' ||
        el.classList.contains('role-client-nav') ||
        onclickAttr.includes("'client'") ||
        onclickAttr.includes('"client"') ||
        onclickAttr.includes("'order'") ||
        onclickAttr.includes('"order"') ||
        label.includes('ruang klien') ||
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
  ensureMobileBottomNav();

  const { isClientLoggedIn, isAdminLoggedIn } = getActiveRoleState();

  getAllAdminNavButtons().forEach((el) => {
    el.classList.toggle('hidden', isClientLoggedIn);
    el.style.display = isClientLoggedIn ? 'none' : '';
  });

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
  document.querySelectorAll('header button, header a, #mobile-menu button, #mobile-menu a, #prangart-mobile-bottom-nav button, [data-nav-target]').forEach((btn) => {
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

  adminPage.classList.remove('hidden', 'sm:hidden', 'md:hidden', 'lg:hidden', 'xl:hidden');
  adminPage.style.display = 'block';

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

/* === FUNGSI LOGOUT / KELUAR BERSIH (SINKRON UNTUK TOMBOL "LOG OUT" & "KELUAR") === */
let isLoggingOutLock = false;

async function performUniversalLogout(roleHint) {
  if (isLoggingOutLock) return;
  isLoggingOutLock = true;

  try {
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

      // Jika ada tombol "Keluar" asli di header yang memiliki handler khusus auth, ikut panggil secara aman
      const headerKeluarBtn = Array.from(document.querySelectorAll('header button, header a')).find(
        (el) => (el.textContent || '').trim().toLowerCase() === 'keluar'
      );
      if (headerKeluarBtn && headerKeluarBtn.getAttribute('onclick')) {
        const fnCall = headerKeluarBtn.getAttribute('onclick');
        if (!fnCall.includes('performUniversalLogout')) {
          try { new Function(fnCall)(); } catch (_) {}
        }
      }

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
  } finally {
    setTimeout(() => { isLoggingOutLock = false; }, 300);
  }

  syncRoleNavVisibility();

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

/* === DETEKSI KLIK GLOBAL UNTUK TOMBOL "LOG OUT" (APAPUN TAG HTML-NYA) & "KELUAR" === */
document.addEventListener('click', (ev) => {
  // Cek mulai dari target terdekat (termasuk span/div/button/a) yang bertuliskan "Log Out" atau "Keluar"
  let node = ev.target;
  let matchedLogoutEl = null;

  while (node && node !== document.body) {
    if (node.nodeType === 1) {
      const txt = (node.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
      const onclickAttr = (node.getAttribute('onclick') || '').toLowerCase();
      const idAttr = (node.id || '').toLowerCase();
      const actionAttr = (node.getAttribute('data-action') || '').toLowerCase();

      const isDirectTextMatch =
        txt === 'log out' ||
        txt === 'logout' ||
        txt === 'keluar' ||
        txt === 'keluar akun' ||
        txt === 'keluar admin';

      const isAttrMatch =
        onclickAttr.includes('logout') ||
        onclickAttr.includes('keluar') ||
        onclickAttr.includes('signout') ||
        idAttr.includes('logout') ||
        idAttr.includes('keluar') ||
        actionAttr.includes('logout') ||
        node.classList.contains('btn-logout');

      if (isDirectTextMatch || isAttrMatch) {
        matchedLogoutEl = node;
        break;
      }
    }
    node = node.parentElement;
  }

  if (matchedLogoutEl) {
    ev.preventDefault();
    ev.stopPropagation();
    const fullStr = `${matchedLogoutEl.textContent || ''} ${matchedLogoutEl.id || ''} ${matchedLogoutEl.getAttribute('onclick') || ''}`.toLowerCase();
    if (fullStr.includes('admin')) {
      performUniversalLogout('admin');
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
}, true);

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

// Ekspos semua variasi nama fungsi logout ke global window
Object.assign(window, {
  navigateTo,
  toggleMobileMenu,
  goToOrderWithService,
  syncRoleNavVisibility,
  ensureMobileBottomNav,
  ensureAdminNavButtonsVisible: syncRoleNavVisibility,
  removeDuplicateAdminNavButtons,
  ensureAdminPageInnerState,
  updateActiveNavHighlight,
  performUniversalLogout,
  logout: () => performUniversalLogout('all'),
  logOut: () => performUniversalLogout('all'),
  doLogout: () => performUniversalLogout('all'),
  onLogout: () => performUniversalLogout('all'),
  logoutUser: () => performUniversalLogout('all'),
  signOutClient: () => performUniversalLogout('client'),
  clientSignOut: () => performUniversalLogout('client'),
  clientLogout: () => performUniversalLogout('client'),
  logoutClient: () => performUniversalLogout('client'),
  handleClientLogout: () => performUniversalLogout('client'),
  adminLogout: () => performUniversalLogout('admin'),
  logoutAdmin: () => performUniversalLogout('admin'),
  handleAdminLogout: () => performUniversalLogout('admin'),
  logoutAll: () => performUniversalLogout('all')
});
