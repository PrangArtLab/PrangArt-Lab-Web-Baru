function navigateTo(page) {
  if (page === 'order' && !appState.currentClientUser) {
    showToast('Perhatian', 'Silakan masuk atau daftar akun terlebih dahulu untuk mengajukan layanan.', 'warning');
    page = 'client';
  }

  if (page === 'home') {
    const cleanUrl = `${location.pathname}${location.search}`;
    if (location.href !== cleanUrl) {
      window.history.replaceState(null, '', cleanUrl);
    }
  } else if (window.location.hash !== `#${page}`) {
    window.location.hash = page;
  }

  appState.currentPage = page;
  
  document.querySelectorAll('.page-section').forEach(sec => sec.classList.add('hidden'));
  const target = document.getElementById(`page-${page}`);
  if (target) { target.classList.remove('hidden'); target.classList.remove('page-dissolve'); void target.offsetWidth; target.classList.add('page-dissolve'); }

  document.querySelectorAll('.nav-pill, .mnav-pill').forEach(btn => btn.classList.remove('bg-primary', 'text-white'));
  const activeNav = document.getElementById(`nav-${page}`) || document.getElementById(`mnav-${page}`);
  if (activeNav) activeNav.classList.add('bg-primary', 'text-white');

  if (page === 'portfolio') renderPortfolioGrid();
  if (page === 'order') refreshOrderPageUI();
  if (page === 'client') refreshClientPageUI();
  if (page === 'admin') refreshAdminPageUI();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('hashchange', () => {
  const page = window.location.hash.replace('#', '') || 'home';
  if (appState.currentPage !== page) navigateTo(page);
});

function updateHeaderAuthBadge() {
  const box = document.getElementById('header-auth-status');
  if (!box) return;
  if (appState.currentClientUser) {
    // Tanda silang (x) dihilangkan dari sini
    box.innerHTML = `<div class="flex items-center gap-1.5 bg-surface border border-border rounded-xl px-3 py-1.5 text-xs"><span class="w-2 h-2 rounded-full bg-emerald-500"></span><span class="font-bold text-textMain">${appState.currentClientUser.name}</span></div>`;
  } else {
    box.innerHTML = `<button onclick="navigateTo('client')" class="px-4 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-textMain">Masuk</button>`;
  }
}

function selectServiceAndGoOrder(svcKey) {
  appState.selectedServiceLine = svcKey;
  appState.selectedPackage = 'standar';
  navigateTo('order'); 
}
function renderSop14Grid() { const el = document.getElementById('sop-14-grid'); if(el) el.innerHTML = `<div class="p-4 bg-surface border rounded-xl">SOP 14 Tahap</div>`; }
