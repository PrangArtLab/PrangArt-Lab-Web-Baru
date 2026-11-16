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
    <div class="bg-surface border border-border rounded-[2rem] p-8 space-y-8 shadow-sm">
      <div class="flex justify-between items-center border-b border-border pb-6">
        <h2 class="text-3xl font-display font-bold text-textMain">Panel Admin</h2>
        <button onclick="appState.isAdminAuthenticated = false; refreshAdminPageUI()" class="btn-outline px-5 py-2 rounded-xl text-xs font-bold text-red-500 border-red-500/30 hover:bg-red-500/10">Logout</button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-panel border border-border p-6 rounded-2xl space-y-4">
          <h3 class="font-bold text-lg text-textMain font-display border-b border-border pb-2">Metode Pembayaran</h3>
          ${appState.settings.paymentMethods.map(pm => `<div class="flex justify-between items-center text-sm text-textMuted border-b border-border pb-2"><span class="font-medium text-textMain">${pm.name}</span> <button onclick="removePaymentMethod('${pm.id}')" class="text-red-500 hover:underline text-xs">Hapus</button></div>`).join('')}
          <button onclick="addPaymentMethod()" class="btn-primary w-full py-2.5 rounded-xl text-xs font-bold mt-4">+ Tambah Metode</button>
        </div>
        
        <div class="bg-panel border border-border p-6 rounded-2xl space-y-4">
           <h3 class="font-bold text-lg text-textMain font-display border-b border-border pb-2">Proyek Masuk</h3>
           <div class="space-y-3">
             ${appState.projects.map(p => `<div class="flex justify-between items-center bg-surface p-3 rounded-xl border border-border"><span class="text-sm text-textMain font-bold">${p.judul}</span> <span class="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-1 rounded">${p.dpStatus}</span></div>`).join('') || '<p class="text-sm text-textMuted">Belum ada proyek.</p>'}
           </div>
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
