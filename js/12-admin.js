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
    <div class="bg-surface border border-border/80 rounded-[2rem] p-8 space-y-8 shadow-premium">
      <div class="flex justify-between items-center border-b border-border/60 pb-6">
        <h2 class="text-3xl font-display font-bold text-textMain">Dashboard Admin</h2>
        <button onclick="appState.isAdminAuthenticated = false; refreshAdminPageUI()" class="btn-outline px-5 py-2 rounded-xl text-xs font-bold text-red-500">Logout</button>
      </div>
      
      <div class="grid grid-cols-1 gap-6">
        <div class="bg-panel border border-border/80 p-6 rounded-2xl space-y-4">
           <h3 class="font-bold text-lg text-textMain font-display border-b border-border/50 pb-2">Proyek Masuk</h3>
           ${appState.projects.map(p => `
             <div class="bg-surface p-4 rounded-xl border border-border/80 shadow-sm space-y-3">
               <div class="flex justify-between items-start">
                 <div>
                   <p class="font-bold text-sm text-textMain">${p.judul} (${p.id})</p>
                   <p class="text-xs text-textMuted">${p.clientName} - ${formatRupiah(p.totalPrice)}</p>
                 </div>
                 <span class="text-[10px] px-2 py-1 rounded font-bold ${p.dpStatus === 'Terverifikasi' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}">${p.dpStatus}</span>
               </div>
               ${p.dpStatus === 'Menunggu Verifikasi' ? `
                 <div class="flex gap-2">
                   <button onclick="inspectPaymentProof('${p.id}')" class="flex-1 py-1.5 bg-panel border border-border rounded text-xs font-bold">Lihat Bukti</button>
                   <button onclick="approvePayment('${p.id}')" class="flex-1 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold">Terima</button>
                 </div>
               ` : ''}
             </div>
           `).join('') || '<p class="text-sm text-textMuted">Belum ada proyek.</p>'}
        </div>
      </div>
    </div>
  `;
}
// Fungsi pendukung (inspectPaymentProof, approvePayment) tetap sama
function inspectPaymentProof(id) { /* ... */ }
function approvePayment(id) { /* ... */ }
