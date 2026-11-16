let adminActiveTab = 'projects';

function verifyAdminPin(e) { 
  e.preventDefault(); 
  if(document.getElementById('admin-pin-input').value === appState.settings.adminPin){ 
    appState.isAdminAuthenticated = true; 
    refreshAdminPageUI(); 
  } else {
    showToast('Salah', 'PIN Salah', 'error'); 
  }
}

function refreshAdminPageUI() {
  const gate = document.getElementById('admin-pin-gate'), ws = document.getElementById('admin-workspace-content');
  if (!appState.isAdminAuthenticated) { 
    gate?.classList.remove('hidden'); 
    ws?.classList.add('hidden'); 
    return; 
  }
  gate?.classList.add('hidden'); 
  ws?.classList.remove('hidden'); 
  renderAdminDashboard();
}

function renderAdminDashboard() {
  const ws = document.getElementById('admin-workspace-content');
  if (!ws) return;

  const tabs = `
    <div class="flex gap-2 border-b border-border/60 pb-4 mb-6 overflow-x-auto">
      <button onclick="adminActiveTab='projects'; renderAdminDashboard();" class="px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${adminActiveTab==='projects'?'bg-primary text-white':'bg-panel text-textMuted hover:bg-primary/10'}">Daftar Proyek</button>
      <button onclick="adminActiveTab='payments'; renderAdminDashboard();" class="px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${adminActiveTab==='payments'?'bg-primary text-white':'bg-panel text-textMuted hover:bg-primary/10'}">Metode Pembayaran</button>
      <button onclick="adminActiveTab='content'; renderAdminDashboard();" class="px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${adminActiveTab==='content'?'bg-primary text-white':'bg-panel text-textMuted hover:bg-primary/10'}">Konten Web</button>
      <button onclick="adminActiveTab='settings'; renderAdminDashboard();" class="px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${adminActiveTab==='settings'?'bg-primary text-white':'bg-panel text-textMuted hover:bg-primary/10'}">Pengaturan</button>
    </div>
  `;

  let contentHTML = '';

  if (adminActiveTab === 'projects') {
    contentHTML = `
      <div class="bg-surface border border-border/80 rounded-3xl p-6 sm:p-8">
        <h2 class="text-2xl font-bold mb-6">Daftar Proyek Klien</h2>
        ${appState.projects.length ? appState.projects.map(p => `
          <div class="border border-border/60 p-5 rounded-2xl mb-3 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-panel">
            <div>
              <strong class="text-lg text-textMain">${p.judul}</strong>
              <span class="block text-xs text-textMuted mt-1">ID: ${p.id} • Klien: ${p.clientName}</span>
              <span class="block text-xs text-textMuted mt-1">Status: ${p.productionStatus}</span>
            </div>
            <div class="text-right">
              <span class="text-primary font-bold block">${formatRupiah(p.totalPrice)}</span>
              <span class="text-xs bg-surface px-2 py-1 rounded border border-border">${p.dpStatus}</span>
            </div>
          </div>
        `).join('') : '<p class="text-textMuted text-sm">Belum ada proyek masuk.</p>'}
      </div>
    `;
  } 
  else if (adminActiveTab === 'payments') {
    contentHTML = `
      <div class="bg-surface border border-border/80 rounded-3xl p-6 sm:p-8">
        <h2 class="text-2xl font-bold mb-6">Metode Pembayaran</h2>
        <form onsubmit="saveAdminPayment(event)" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-panel p-5 rounded-2xl border border-border/60">
          <div>
            <label class="block text-xs font-bold mb-2">Tipe Pembayaran</label>
            <select id="pay-type" class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm">
              <option value="bank">Transfer Bank</option>
              <option value="ewallet">E-Wallet (Dana/OVO/Gopay)</option>
              <option value="qris">QRIS (Gambar)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold mb-2">Nama Layanan / Bank</label>
            <input id="pay-name" required placeholder="Cth: BCA / Dana / QRIS" class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold mb-2">Nomor Rekening / Link Gambar QRIS</label>
            <input id="pay-number" required placeholder="Nomor Rek atau URL Gambar" class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold mb-2">Atas Nama</label>
            <input id="pay-holder" required placeholder="Nama Pemilik" class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <div class="md:col-span-2 flex justify-end mt-2">
            <button type="submit" class="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold">+ Tambah Metode</button>
          </div>
        </form>

        <div class="space-y-3">
          ${appState.settings.paymentMethods.map(pay => `
            <div class="flex justify-between items-center p-4 border border-border/60 rounded-xl bg-panel">
              <div class="flex items-center gap-4">
                <span class="text-xs font-bold uppercase bg-primary/10 text-primary px-2 py-1 rounded">${pay.type}</span>
                <div>
                  <strong class="block text-sm">${pay.name}</strong>
                  <span class="text-xs text-textMuted">${pay.number} ${pay.type === 'qris' ? '(Link Gambar)' : ''} • ${pay.holder}</span>
                </div>
              </div>
              <button onclick="deleteAdminPayment('${pay.id}')" class="text-red-500 hover:bg-red-50 p-2 rounded-lg transition">Hapus</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  else if (adminActiveTab === 'content') {
    contentHTML = `
      <div class="bg-surface border border-border/80 rounded-3xl p-6 sm:p-8">
        <h2 class="text-2xl font-bold mb-6">Kelola Konten Web</h2>
        <div id="site-content-admin-inner"></div>
      </div>
    `;
    ws.innerHTML = tabs + contentHTML;
    if (typeof renderSiteContentAdmin === 'function') renderSiteContentAdmin();
    return;
  }
  else if (adminActiveTab === 'settings') {
    contentHTML = `
      <div class="bg-surface border border-border/80 rounded-3xl p-6 sm:p-8 max-w-xl">
        <h2 class="text-2xl font-bold mb-6">Pengaturan Web</h2>
        <form onsubmit="saveAdminSettings(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-bold mb-2">Nomor WhatsApp Admin (Gunakan format 62)</label>
            <input id="set-wa" value="${appState.settings.studioWhatsApp}" required class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" />
          </div>
          <div>
            <label class="block text-xs font-bold mb-2">PIN Admin</label>
            <input id="set-pin" value="${appState.settings.adminPin}" required class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" />
          </div>
          <button type="submit" class="btn-primary w-full py-3 rounded-xl font-bold mt-4">Simpan Pengaturan</button>
        </form>
        <hr class="my-6 border-border/60"/>
        <button onclick="appState.isAdminAuthenticated=false; refreshAdminPageUI();" class="w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500 hover:text-white transition">Logout Admin</button>
      </div>
    `;
  }

  ws.innerHTML = tabs + contentHTML;
}

/* === FUNGSI SIMPAN PEMBAYARAN & SETTINGS === */
function saveAdminPayment(e) {
  e.preventDefault();
  const type = document.getElementById('pay-type').value;
  const name = document.getElementById('pay-name').value;
  const number = document.getElementById('pay-number').value;
  const holder = document.getElementById('pay-holder').value;

  appState.settings.paymentMethods.push({ id: 'pay-' + Date.now(), type, name, number, holder });
  persistLocalState();
  renderAdminDashboard();
  showToast('Sukses', 'Metode pembayaran ditambahkan.');
}

function deleteAdminPayment(id) {
  if (!confirm('Hapus metode pembayaran ini?')) return;
  appState.settings.paymentMethods = appState.settings.paymentMethods.filter(p => p.id !== id);
  persistLocalState();
  renderAdminDashboard();
  showToast('Sukses', 'Metode dihapus.');
}

function saveAdminSettings(e) {
  e.preventDefault();
  appState.settings.studioWhatsApp = document.getElementById('set-wa').value;
  appState.settings.adminPin = document.getElementById('set-pin').value;
  persistLocalState();
  showToast('Sukses', 'Pengaturan disimpan.');
}
