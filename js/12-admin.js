function verifyAdminPin(e) {
  e.preventDefault();
  const pin = document.getElementById('admin-pin-input')?.value.trim();
  if (pin !== appState.settings.adminPin) return showToast('PIN Salah', 'Akses ditolak.', 'error');
  appState.isAdminAuthenticated = true; refreshAdminPageUI();
}

function refreshAdminPageUI() {
  const gate = document.getElementById('admin-pin-gate'), ws = document.getElementById('admin-workspace-content');
  if (!appState.isAdminAuthenticated) { gate?.classList.remove('hidden'); ws?.classList.add('hidden'); return; }
  gate?.classList.add('hidden'); ws?.classList.remove('hidden'); renderAdminDashboard();
}

function renderAdminDashboard() {
  const container = document.getElementById('admin-workspace-content');
  container.innerHTML = `
    <div class="bg-surface border border-border rounded-3xl p-6 space-y-6">
      <div class="flex justify-between items-center border-b border-border pb-4">
        <h2 class="text-xl font-bold text-textMain font-display">Panel Admin</h2>
        <button onclick="appState.isAdminAuthenticated = false; refreshAdminPageUI()" class="text-red-500 text-xs font-bold">Logout</button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-panel border border-border p-4 rounded-xl space-y-3">
          <h3 class="font-bold text-sm text-textMain font-display">Metode Pembayaran</h3>
          ${appState.settings.paymentMethods.map(pm => `<div class="flex justify-between text-xs text-textMuted border-b border-border pb-1"><span>${pm.name}</span> <button onclick="removePaymentMethod('${pm.id}')" class="text-red-500 hover:underline">Hapus</button></div>`).join('')}
          <button onclick="addPaymentMethod()" class="text-primary text-xs font-bold mt-2">+ Tambah Metode</button>
        </div>
        
        <div class="bg-panel border border-border p-4 rounded-xl space-y-3">
           <h3 class="font-bold text-sm text-textMain font-display">Proyek Masuk</h3>
           ${appState.projects.map(p => `<div class="flex justify-between text-xs text-textMuted border-b border-border pb-1"><span>${p.clientName} - ${p.judul}</span> <span class="text-emerald-500 font-bold">${p.dpStatus}</span></div>`).join('') || 'Belum ada'}
        </div>
      </div>
    </div>
  `;
}

function addPaymentMethod() {
  appState.settings.paymentMethods.push({ id: `pay-${Date.now()}`, type: 'bank', name: 'Bank Baru', number: '1234', holder: 'Nama', logo: 'https://iili.io/oHYybgj.md.png' });
  syncStudioConfigToCloud(); renderAdminDashboard();
}
function removePaymentMethod(id) {
  appState.settings.paymentMethods = appState.settings.paymentMethods.filter(pm => pm.id !== id);
  syncStudioConfigToCloud(); renderAdminDashboard();
}
function renderAdminInspector() {}
function saveStudioSettings() {}