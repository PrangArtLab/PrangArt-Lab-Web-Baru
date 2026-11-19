/* === SISTEM NAVIGASI HALAMAN & AKSES DASHBOARD (DESKTOP, TABLET & MOBILE) === */

function ensureAdminNavButtonsVisible() {
  // 1. Cari bilah navigasi utama untuk Desktop & Tablet
  const desktopNavCandidates = document.querySelectorAll(
    'header nav, nav .hidden.md\\:flex, nav .hidden.sm\\:flex, nav .hidden.lg\\:flex, #desktop-nav-links, #main-nav-links'
  );

  desktopNavCandidates.forEach((nav) => {
    // Hindari menyuntikkan ke dalam drawer mobile
    if (nav.id === 'mobile-menu' || nav.closest('#mobile-menu')) return;

    if (!nav.querySelector('[data-nav-target="admin"], #nav-btn-admin')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'nav-btn-admin';
      btn.setAttribute('data-nav-target', 'admin');
      btn.onclick = (e) => {
        e.preventDefault();
        navigateTo('admin');
      };
      btn.className =
        'nav-link-btn px-3 py-2 rounded-xl text-xs font-bold text-textMuted hover:text-primary hover:bg-primary/10 transition cursor-pointer inline-flex items-center gap-1.5 shrink-0';
      btn.innerHTML = '<span>⚙</span><span>Admin Studio</span>';
      nav.appendChild(btn);
    }
  });

  // 2. Pastikan juga tersedia di menu mobile drawer jika belum ada
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu && !mobileMenu.querySelector('[data-nav-target="admin"], #mobile-nav-admin')) {
    const mBtn = document.createElement('button');
    mBtn.type = 'button';
    mBtn.id = 'mobile-nav-admin';
    mBtn.setAttribute('data-nav-target', 'admin');
    mBtn.onclick = (e) => {
      e.preventDefault();
      navigateTo('admin');
    };
    mBtn.className =
      'nav-link-btn w-full text-left px-4 py-3 rounded-xl text-sm font-bold text-textMuted hover:text-primary hover:bg-primary/10 transition flex items-center gap-2';
    mBtn.innerHTML = '<span>⚙</span><span>Admin Studio</span>';
    mobileMenu.appendChild(mBtn);
  }
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
  if (typeof appState !== 'undefined') {
    appState.currentPage = pageId;
  }

  // Sembunyikan seluruh section halaman secara konsisten
  document.querySelectorAll('.page-section, section[id^="page-"], div[id^="page-"]').forEach((sec) => {
    sec.classList.add('hidden');
    sec.style.display = 'none';
  });

  // Tampilkan halaman target & hapus segala class responsif yang menahan visibilitas di desktop/tablet
  const target = document.getElementById(`page-${pageId}`);
  if (target) {
    target.classList.remove('hidden', 'sm:hidden', 'md:hidden', 'lg:hidden', 'xl:hidden');
    target.style.display = 'block';
  }

  // Perbarui status aktif tombol navigasi
  updateActiveNavHighlight(pageId);

  // Tutup menu mobile otomatis setelah berpindah halaman
  toggleMobileMenu(false);

  // Jalankan inisialisasi / render ulang konten sesuai halaman tujuan
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

  // Simpan hash URL ringan agar mudah dilacak
  try {
    if (history.replaceState) {
      history.replaceState(null, '', `#${pageId}`);
    }
  } catch (_) {}

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToOrderWithService(serviceKey, packageKey) {
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

// Event delegation global untuk seluruh tombol navigasi (Desktop, Tablet, Mobile & Kartu Layanan)
document.addEventListener('click', (ev) => {
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

// Inisialisasi saat DOM siap
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

// Ekspos fungsi navigasi ke global window
Object.assign(window, {
  navigateTo,
  toggleMobileMenu,
  goToOrderWithService,
  ensureAdminNavButtonsVisible,
  updateActiveNavHighlight
});
