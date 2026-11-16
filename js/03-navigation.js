function navigateTo(page) {
  window.location.hash = page;
  appState.currentPage = page;
  document.querySelectorAll('.page-section').forEach(sec => sec.classList.add('hidden'));
  const target = document.getElementById(`page-${page}`);
  if (target) {
    target.classList.remove('hidden');
    target.classList.remove('page-dissolve');
    void target.offsetWidth;
    target.classList.add('page-dissolve');
  }

  document.querySelectorAll('.nav-pill').forEach(btn => {
    btn.classList.remove('bg-primary', 'text-white');
    btn.classList.add('text-textMuted', 'hover:text-textMain');
  });
  const activeNav = document.getElementById(`nav-${page}`);
  if (activeNav) {
    activeNav.classList.add('bg-primary', 'text-white');
    activeNav.classList.remove('text-textMuted', 'hover:text-textMain');
  }

  document.querySelectorAll('.mnav-pill').forEach(btn => {
    btn.classList.remove('bg-primary', 'text-white');
    btn.classList.add('text-textMuted');
  });
  const activeMNav = document.getElementById(`mnav-${page}`);
  if (activeMNav) {
    activeMNav.classList.add('bg-primary', 'text-white');
    activeMNav.classList.remove('text-textMuted');
  }

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
    box.innerHTML = `
      <div class="flex items-center gap-2 bg-panel border border-border rounded-xl px-3 py-2 text-xs transition-colors duration-300">
        <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span class="font-bold text-textMain max-w-[90px] truncate">${appState.currentClientUser.name}</span>
        <button type="button" onclick="logoutClientUser()" class="text-textMuted hover:text-red-500 ml-1" title="Keluar">×</button>
      </div>
    `;
  } else {
    box.innerHTML = `
      <button type="button" onclick="openClientAuthModal('register')" class="px-4 py-2.5 rounded-xl bg-panel border border-border hover:border-primary text-xs font-bold text-textMain transition">
        Masuk
      </button>
    `;
  }
}

function selectServiceAndGoOrder(svcKey) {
  appState.selectedServiceLine = svcKey;
  appState.selectedPackage = 'standar';
  if (!appState.currentClientUser) {
    showToast('Masuk ke Akun', 'Silakan masuk untuk mengisi formulir.', 'warning');
    navigateTo('client');
    openClientAuthModal('register');
  } else {
    navigateTo('order');
  }
}

function renderSop14Grid() {
  const grid = document.getElementById('sop-14-grid');
  if (!grid) return;
  grid.innerHTML = SOP_14_STEPS.map(s => `
    <div class="bg-surface border border-border rounded-2xl p-5 hover:border-primary/50 transition-colors duration-300 shadow-sm group">
      <span class="text-[11px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">Tahap ${s.no}</span>
      <h4 class="text-base font-bold text-textMain font-display mt-3 group-hover:text-primary transition">${s.title}</h4>
      <p class="text-xs text-textMuted leading-relaxed mt-2 font-light">${s.desc}</p>
    </div>
  `).join('');
}
