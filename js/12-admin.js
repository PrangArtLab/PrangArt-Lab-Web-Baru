let adminActiveTab = 'projects';

function verifyAdminPin(e) {
  e.preventDefault();
  const inputPin = document.getElementById('admin-pin-input').value;
  if (inputPin === appState.settings.adminPin) {
    appState.isAdminAuthenticated = true;
    showToast('Berhasil', 'Masuk sebagai Admin.');
    refreshAdminPageUI();
    updateHeaderAuthBadge();
  } else {
    showToast('Gagal', 'PIN Admin salah.', 'error');
  }
}

function logoutAdmin() {
  appState.isAdminAuthenticated = false;
  showToast('Info', 'Admin berhasil Log Out.');
  refreshAdminPageUI();
  updateHeaderAuthBadge();
  navigateTo('home');
}

function refreshAdminPageUI() {
  const pinGate = document.getElementById('admin-pin-gate');
  const ws = document.getElementById('admin-workspace-content');
  if (!pinGate || !ws) return;

  if (!appState.isAdminAuthenticated) {
    pinGate.classList.remove('hidden');
    ws.classList.add('hidden');
    const inp = document.getElementById('admin-pin-input');
    if (inp) inp.value = '';
  } else {
    pinGate.classList.add('hidden');
    ws.classList.remove('hidden');
    renderAdminDashboard();
  }
}

function renderAdminDashboard() {
  const ws = document.getElementById('admin-workspace-content');
  if (!ws) return;

  ws.innerHTML = `
    <div class="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-premium space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <span class="text-xs font-mono text-primary font-bold uppercase">Dashboard</span>
          <h2 class="text-2xl font-display font-bold mt-1">Panel Pengelolaan Studio</h2>
        </div>
        <button onclick="logoutAdmin()" class="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition shadow-sm">
          Log Out Admin
        </button>
      </div>

      <div class="flex gap-2 border-b border-border/60 pb-4">
        <button onclick="adminActiveTab='projects'; renderAdminDashboard();" class="px-4 py-2 rounded-xl text-xs font-bold ${adminActiveTab==='projects'?'bg-primary text-white':'bg-panel text-textMuted'}">Proyek & Klien</button>
        <button onclick="adminActiveTab='content'; renderAdminDashboard(); if(window.renderSiteContentAdmin) renderSiteContentAdmin();" class="px-4 py-2 rounded-xl text-xs font-bold ${adminActiveTab==='content'?'bg-primary text-white':'bg-panel text-textMuted'}">Konten Beranda</button>
        <button onclick="adminActiveTab='settings'; renderAdminDashboard();" class="px-4 py-2 rounded-xl text-xs font-bold ${adminActiveTab==='settings'?'bg-primary text-white':'bg-panel text-textMuted'}">Pengaturan</button>
      </div>

      ${adminActiveTab === 'projects' ? `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-5 rounded-2xl bg-panel border border-border/60">
            <span class="text-xs text-textMuted font-bold uppercase block">Total Proyek Masuk</span>
            <strong class="text-3xl font-mono text-primary mt-2 block">${appState.projects.length}</strong>
          </div>
          <div class="p-5 rounded-2xl bg-panel border border-border/60">
            <span class="text-xs text-textMuted font-bold uppercase block">Klien Terdaftar</span>
            <strong class="text-3xl font-mono text-emerald-500 mt-2 block">${appState.users.length}</strong>
          </div>
          <div class="p-5 rounded-2xl bg-panel border border-border/60">
            <span class="text-xs text-textMuted font-bold uppercase block">Status Layanan</span>
            <strong class="text-sm font-bold text-textMain mt-3 block flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Aktif
            </strong>
          </div>
        </div>
        <div class="pt-4">
          <h3 class="text-lg font-bold mb-4">Daftar Proyek Klien</h3>
          <div class="space-y-3">
            ${appState.projects.length ? appState.projects.map(p => `
              <div class="p-4 rounded-xl bg-panel border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <strong class="text-base text-textMain block">${p.judul}</strong>
                  <span class="text-xs text-textMuted">Klien: ${p.clientName} (${p.clientEmail}) • Layanan: ${p.serviceLineLabel}</span>
                </div>
                <div class="text-right">
                  <span class="text-sm font-mono font-bold text-primary block">${formatRupiah(p.totalPrice)}</span>
                  <span class="text-xs bg-surface px-2.5 py-1 rounded-full border border-border font-semibold">${p.productionStatus}</span>
                </div>
              </div>
            `).join('') : '<p class="text-sm text-textMuted italic">Belum ada data proyek masuk.</p>'}
          </div>
        </div>
      ` : adminActiveTab === 'content' ? `
        <div id="site-content-admin-inner"></div>
      ` : `
        <div class="max-w-md space-y-4">
          <div>
            <label class="block text-xs font-bold mb-2">Nomor WhatsApp Tujuan</label>
            <input type="text" id="admin-wa-input" value="${appState.settings.studioWhatsApp}" class="w-full bg-panel border border-border rounded-xl p-3 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold mb-2">PIN Akses Admin</label>
            <input type="text" id="admin-pin-setting" value="${appState.settings.adminPin}" class="w-full bg-panel border border-border rounded-xl p-3 text-sm" />
          </div>
          <button onclick="saveAdminSettings()" class="btn-primary w-full py-3 rounded-xl text-xs font-bold">Simpan Pengaturan</button>
        </div>
      `}
    </div>
  `;
}

function saveAdminSettings() {
  const newWa = document.getElementById('admin-wa-input')?.value.trim();
  const newPin = document.getElementById('admin-pin-setting')?.value.trim();
  if (newWa) appState.settings.studioWhatsApp = newWa;
  if (newPin) appState.settings.adminPin = newPin;
  persistLocalState();
  showToast('Berhasil', 'Pengaturan disimpan.');
}

function saveAdminPayment() {}
function deleteAdminPayment() {}

function resetAdminPin() {
  showToast('Info', 'PIN default Anda adalah 2026.', 'warning');
}

Object.assign(window, {
  verifyAdminPin, logoutAdmin, refreshAdminPageUI, renderAdminDashboard,
  saveAdminSettings, saveAdminPayment, deleteAdminPayment, resetAdminPin
});
