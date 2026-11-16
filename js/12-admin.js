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
    <div class="bg-surface border border-border/80 rounded-[2rem] p-8 space-y-8 shadow-premium dark:shadow-premium-dark">
      <div class="flex justify-between items-center border-b border-border/60 pb-6">
        <h2 class="text-3xl font-display font-bold text-textMain">Panel Admin</h2>
        <button onclick="appState.isAdminAuthenticated = false; refreshAdminPageUI()" class="btn-outline px-5 py-2 rounded-xl text-xs font-bold text-red-500 border-red-500/30 hover:bg-red-500/10">Logout</button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-panel border border-border/80 p-6 rounded-2xl space-y-4">
          <h3 class="font-bold text-lg text-textMain font-display border-b border-border/50 pb-2">Metode Pembayaran</h3>
          ${appState.settings.paymentMethods.map(pm => `<div class="flex justify-between items-center text-sm text-textMuted border-b border-border/50 pb-2"><span class="font-medium text-textMain">${pm.name}</span> <button onclick="removePaymentMethod('${pm.id}')" class="text-red-500 hover:underline text-xs">Hapus</button></div>`).join('')}
          <button onclick="addPaymentMethod()" class="btn-primary w-full py-2.5 rounded-xl text-xs font-bold mt-4 shadow-sm">+ Tambah Metode (Dummy)</button>
        </div>
        
        <div class="bg-panel border border-border/80 p-6 rounded-2xl space-y-4">
           <h3 class="font-bold text-lg text-textMain font-display border-b border-border/50 pb-2">Proyek Masuk</h3>
           <div class="space-y-3">
             ${appState.projects.map(p => `
               <div class="bg-surface p-4 rounded-xl border border-border/80 shadow-sm space-y-3">
                 <div class="flex justify-between items-start">
                   <div>
                     <p class="font-bold text-sm text-textMain">${p.judul}</p>
                     <p class="text-xs text-textMuted">${p.clientName} - ${formatRupiah(p.totalPrice)}</p>
                   </div>
                   <span class="text-[10px] px-2 py-1 rounded font-bold ${p.dpStatus === 'Terverifikasi' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}">${p.dpStatus}</span>
                 </div>
                 
                 <!-- Verifikasi Pembayaran -->
                 ${p.dpStatus === 'Menunggu Verifikasi' ? `
                   <div class="flex gap-2">
                     <button onclick="inspectPaymentProof('${p.id}')" class="flex-1 py-1.5 bg-panel border border-border rounded text-xs font-bold text-textMain">Lihat Bukti</button>
                     <button onclick="approvePayment('${p.id}')" class="flex-1 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold">Terima</button>
                   </div>
                 ` : ''}

                 <!-- Unggah File -->
                 ${p.dpStatus === 'Terverifikasi' ? `
                   <div class="flex gap-2">
                     <label class="flex-1 py-1.5 bg-panel border border-border rounded text-center text-[10px] font-bold text-textMain cursor-pointer hover:border-primary">Unggah Master<input type="file" onchange="uploadAdminMaster('${p.id}', this.files[0])" class="hidden" /></label>
                     <button onclick="showToast('Info', 'Membuka detail proyek...')" class="flex-1 py-1.5 bg-primary text-white rounded text-xs font-bold">Detail</button>
                   </div>
                 ` : ''}
               </div>
             `).join('') || '<p class="text-sm text-textMuted">Belum ada proyek.</p>'}
           </div>
        </div>
      </div>
    </div>
  `;
}

function inspectPaymentProof(id) {
  const p = appState.projects.find(x => x.id === id);
  if(!p || !p.dpProofDataUrl) return showToast('Error', 'Belum ada bukti.');
  document.getElementById('custom-modal-title').textContent = `Bukti Transfer - ${p.clientName}`;
  document.getElementById('custom-modal-body').innerHTML = `<img src="${p.dpProofDataUrl}" class="w-full h-auto rounded-xl border border-border" />`;
  const m = document.getElementById('custom-modal'); m.classList.remove('hidden'); m.classList.add('flex');
}

function approvePayment(id) {
  const p = appState.projects.find(x => x.id === id);
  if(p) { p.dpStatus = 'Terverifikasi'; syncProjectToCloud(p); renderAdminDashboard(); showToast('Sukses', 'Pembayaran diverifikasi.'); }
}

function uploadAdminMaster(id, file) {
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    const p = appState.projects.find(x => x.id === id);
    if(p) { p.masterFileName = file.name; p.masterFileUrl = reader.result; await syncProjectToCloud(p); showToast('Sukses', 'File master terunggah.'); }
  };
  reader.readAsDataURL(file);
}

function addPaymentMethod() { showToast('Info', 'Form tambah metode belum diimplementasi di UI demo ini.'); }
function removePaymentMethod() { showToast('Info', 'Hapus metode belum diimplementasi di UI demo ini.'); }
function renderAdminInspector() {}
function issueOfficialQuotation() {}
function updateAdminProjectStage() {}
function verifyProjectPayment() {}
function uploadStudioDeliverable() {}
function saveStudioSettings() {}
function closeCustomModal() { document.getElementById('custom-modal')?.classList.add('hidden'); }
