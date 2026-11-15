function navigateTo(page) {
  // Simpan state halaman saat ini ke URL hash
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
    btn.classList.remove('bg-gold', 'text-obsidian');
    btn.classList.add('text-ash', 'hover:text-ivory');
  });
  const activeNav = document.getElementById(`nav-${page}`);
  if (activeNav) {
    activeNav.classList.add('bg-gold', 'text-obsidian');
    activeNav.classList.remove('text-ash', 'hover:text-ivory');
  }

  document.querySelectorAll('.mnav-pill').forEach(btn => {
    btn.classList.remove('bg-gold', 'text-obsidian');
    btn.classList.add('text-ash');
  });
  const activeMNav = document.getElementById(`mnav-${page}`);
  if (activeMNav) {
    activeMNav.classList.add('bg-gold', 'text-obsidian');
    activeMNav.classList.remove('text-ash');
  }

  const mobBar = document.getElementById('mobile-sticky-bar');
  if (mobBar) {
    if (page === 'order' && !document.getElementById('order-form-container')?.classList.contains('hidden')) {
      mobBar.classList.remove('hidden');
    } else {
      mobBar.classList.add('hidden');
    }
  }

  if (page === 'portfolio') renderPortfolioGrid();
  if (page === 'order') refreshOrderPageUI();
  if (page === 'client') refreshClientPageUI();
  if (page === 'admin') refreshAdminPageUI();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Tangani tombol Back/Forward browser
window.addEventListener('hashchange', () => {
  const page = window.location.hash.replace('#', '') || 'home';
  if (appState.currentPage !== page) {
    navigateTo(page);
  }
});

function updateHeaderAuthBadge() {
  const box = document.getElementById('header-auth-status');
  if (!box) return;
  if (appState.currentClientUser) {
    box.innerHTML = `
      <div class="flex items-center gap-1.5 bg-charcoal border border-borderline rounded-xl px-2.5 py-1.5 text-[11px] transition-colors duration-300">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span class="font-semibold text-ivory max-w-[90px] truncate">${appState.currentClientUser.name}</span>
        <button type="button" onclick="logoutClientUser()" class="text-ash hover:text-red-400 ml-1" title="Keluar">×</button>
      </div>
    `;
  } else {
    box.innerHTML = `
      <button type="button" onclick="openClientAuthModal('register')" class="px-3 py-2 rounded-xl bg-charcoal border border-borderline hover:border-gold text-xs font-semibold text-ivory transition">
        Daftar / Masuk
      </button>
    `;
  }
}

function selectServiceAndGoOrder(svcKey) {
  appState.selectedServiceLine = svcKey;
  appState.selectedPackage = 'standar';
  
  if (!appState.currentClientUser) {
    showToast('Masuk ke Akun', 'Silakan masuk atau daftar untuk mengisi formulir pengajuan.', 'warning');
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
    <div class="bg-charcoal border border-borderline rounded-xl p-4 space-y-1.5 transition-colors duration-300">
      <span class="text-[11px] font-mono font-bold text-gold">Tahap ${s.no}</span>
      <h4 class="text-xs sm:text-sm font-bold text-ivory">${s.title}</h4>
      <p class="text-[11px] text-ash leading-relaxed">${s.desc}</p>
    </div>
  `).join('');
}

function openGitHubPagesGuideModal() {
  document.getElementById('custom-modal-title').textContent = 'Panduan Deploy PrangArt Lab ke GitHub Pages';
  document.getElementById('custom-modal-body').innerHTML = `
    <div class="space-y-3 text-xs leading-relaxed text-ivory/90">
      <p class="text-ash">Aplikasi ini adalah <strong>Static Web App multi-file</strong> (HTML + CSS + JS) yang dapat dipublikasikan gratis di GitHub Pages tanpa proses build:</p>
      <ol class="list-decimal pl-5 space-y-2">
        <li><strong>Buat Repositori Baru di GitHub:</strong> Buka <code>github.com/new</code>, beri nama misalnya <code>prangart-lab</code>, pilih <strong>Public</strong>.</li>
        <li><strong>Unggah Semua File:</strong> Upload <code>index.html</code>, folder <code>css/</code>, dan folder <code>js/</code> ke branch <code>main</code>, lalu <strong>Commit changes</strong>.</li>
        <li><strong>Aktifkan GitHub Pages:</strong> Masuk ke tab <strong>Settings → Pages</strong>. Pada <em>Build and deployment</em>, pilih Source: <strong>Deploy from a branch</strong>, Branch: <strong>main</strong>, folder <strong>/ (root)</strong>, klik <strong>Save</strong>.</li>
        <li><strong>Akses Website:</strong> Dalam 1-2 menit website aktif di <code>https://username-anda.github.io/prangart-lab/</code>.</li>
      </ol>
    </div>
  `;
  const m = document.getElementById('custom-modal');
  m?.classList.remove('hidden');
  m?.classList.add('flex');
}