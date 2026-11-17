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

  const paymentMethodsListHTML = appState.settings.paymentMethods.map(m => `
    <div class="flex items-center justify-between p-4 rounded-xl bg-panel border border-border">
      <div>
        <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">${m.type}</span>
        <strong class="block text-sm text-textMain mt-1">${m.name}</strong>
        <span class="block text-xs text-textMuted">${m.type === 'qris' ? 'URL Gambar QRIS' : 'No. Rek: ' + m.number} • a.n. ${m.holder}</span>
      </div>
      <button type="button" onclick="deleteAdminPayment('${m.id}')" class="px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition">
        Hapus
      </button>
    </div>
  `).join('') || '<p class="text-sm text-textMuted italic">Belum ada metode pembayaran.</p>';

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

      <div class="flex flex-wrap gap-2 border-b border-border/60 pb-4">
        <button onclick="adminActiveTab='projects'; renderAdminDashboard();" class="px-4 py-2 rounded-xl text-xs font-bold ${adminActiveTab==='projects'?'bg-primary text-white':'bg-panel text-textMuted'}">Proyek & Klien</button>
        <button onclick="adminActiveTab='payments'; renderAdminDashboard();" class="px-4 py-2 rounded-xl text-xs font-bold ${adminActiveTab==='payments'?'bg-primary text-white':'bg-panel text-textMuted'}">Metode Pembayaran</button>
        <button onclick="adminActiveTab='content'; renderAdminDashboard(); if(window.renderSiteContentAdmin) renderSiteContentAdmin();" class="px-4 py-2 rounded-xl text-xs font-bold ${adminActiveTab==='content'?'bg-primary text-white':'bg-panel text-textMuted'}">Konten Beranda</button>
        <button onclick="adminActiveTab='settings'; renderAdminDashboard();" class="px-4 py-2 rounded-xl text-xs font-bold ${adminActiveTab==='settings'?'bg-primary text-white':'bg-panel text-textMuted'}">Pengaturan Umum</button>
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
      ` : adminActiveTab === 'payments' ? `
        <div class="grid lg:grid-cols-2 gap-8">
          <form onsubmit="saveAdminPayment(event)" class="space-y-4 bg-panel/40 p-6 rounded-2xl border border-border">
            <h3 class="font-bold text-lg">Tambah Rekening / QRIS</h3>
            <div>
              <label class="block text-xs font-bold mb-1.5">Jenis Pembayaran</label>
              <select id="pay-type" class="w-full bg-panel border border-border rounded-xl p-3 text-sm">
                <option value="bank">Transfer Bank / E-Wallet</option>
                <option value="qris">QRIS (Link Gambar QR)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold mb-1.5">Nama Bank / Penyedia</label>
              <input type="text" id="pay-name" required placeholder="Cth: Bank BCA / Dana / QRIS" class="w-full bg-panel border border-border rounded-xl p-3 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold mb-1.5">Nomor Rekening / URL Gambar QRIS</label>
              <input type="text" id="pay-number" required placeholder="Cth: 1234567890 atau https://..." class="w-full bg-panel border border-border rounded-xl p-3 text-sm" />
            </div>
            <div>
              <label class="block text-xs font-bold mb-1.5">Atas Nama (Pemilik Rekening)</label>
              <input type="text" id="pay-holder" required placeholder="Cth: Fikri Yassaar" class="w-full bg-panel border border-border rounded-xl p-3 text-sm" />
            </div>
            <button type="submit" class="btn-primary w-full py-3 rounded-xl text-xs font-bold">+ Simpan Metode Pembayaran</button>
          </form>

          <div class="space-y-3">
            <h3 class="font-bold text-lg mb-2">Daftar Metode Aktif</h3>
            ${paymentMethodsListHTML}
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

function saveAdminPayment(e) {
  if (e) e.preventDefault();
  const type = document.getElementById('pay-type')?.value || 'bank';
  const name = document.getElementById('pay-name')?.value.trim();
  const number = document.getElementById('pay-number')?.value.trim();
  const holder = document.getElementById('pay-holder')?.value.trim();

  if (!name || !number || !holder) {
    return showToast('Perhatian', 'Semua kolom metode pembayaran wajib diisi.', 'warning');
  }

  appState.settings.paymentMethods.push({
    id: `pay-${Date.now()}`,
    type,
    name,
    number,
    holder
  });

  persistLocalState();
  showToast('Berhasil', 'Metode pembayaran baru ditambahkan.');
  renderAdminDashboard();
}

function deleteAdminPayment(id) {
  appState.settings.paymentMethods = appState.settings.paymentMethods.filter(m => m.id !== id);
  persistLocalState();
  showToast('Info', 'Metode pembayaran dihapus.');
  renderAdminDashboard();
}

function saveAdminSettings() {
  const newWa = document.getElementById('admin-wa-input')?.value.trim();
  const newPin = document.getElementById('admin-pin-setting')?.value.trim();
  if (newWa) appState.settings.studioWhatsApp = newWa;
  if (newPin) appState.settings.adminPin = newPin;
  persistLocalState();
  showToast('Berhasil', 'Pengaturan umum disimpan.');
}

function resetAdminPin() {
  showToast('Info', 'PIN default Anda adalah 2026.', 'warning');
}

Object.assign(window, {
  verifyAdminPin, logoutAdmin, refreshAdminPageUI, renderAdminDashboard,
  saveAdminSettings, saveAdminPayment, deleteAdminPayment, resetAdminPin
});
