function refreshClientPageUI() {
  const wall = document.getElementById('client-login-wall');
  const ws = document.getElementById('client-workspace-content');
  if (!appState.currentClientUser) { wall?.classList.remove('hidden'); ws?.classList.add('hidden'); return; }
  wall?.classList.add('hidden'); ws?.classList.remove('hidden'); renderClientWorkspace();
}

function renderClientWorkspace() {
  const ws = document.getElementById('client-workspace-content');
  if (!ws || !appState.currentClientUser) return;
  const myProjects = appState.projects.filter(p => p.clientEmail === appState.currentClientUser.email);

  if (!myProjects.length) {
    ws.innerHTML = `<div class="bg-surface border border-border/80 rounded-[2rem] p-12 text-center shadow-premium"><h3 class="text-2xl font-display font-bold text-textMain mb-4">Belum Ada Pengajuan</h3><button type="button" onclick="navigateTo('order')" class="btn-primary px-8 py-3.5 rounded-xl text-sm font-bold mt-4">+ Buat Pengajuan Baru</button></div>`;
    return;
  }

  if (!myProjects.some(p => p.id === appState.selectedClientProjectId)) appState.selectedClientProjectId = myProjects[0].id;
  const proj = myProjects.find(p => p.id === appState.selectedClientProjectId);
  const isAgreementSigned = Boolean(proj.agreementSigned);
  const isFirstPaymentVerified = proj.dpStatus === 'Terverifikasi';
  const isFullyPaid = proj.paymentScheme === 'Pembayaran Penuh 100%' ? isFirstPaymentVerified : (proj.pelunasanStatus === 'Lunas');

  ws.innerHTML = `
    <div class="bg-surface border border-border/80 rounded-[2rem] p-8 space-y-8 shadow-premium">
      <div class="flex flex-wrap justify-between items-center border-b border-border/60 pb-6 gap-4">
        <div>
          <span class="text-xs font-mono text-primary font-bold uppercase block mb-1">Dashboard Klien</span>
          <h2 class="text-3xl font-display font-bold text-textMain">${proj.judul}</h2>
        </div>
        <div class="flex gap-3">
          <button type="button" onclick="openChangePasswordModal()" class="btn-outline px-4 py-2 rounded-xl text-xs font-bold">Ganti Sandi</button>
          <button type="button" onclick="navigateTo('order')" class="btn-primary px-4 py-2 rounded-xl text-xs font-bold">+ Baru</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-panel border border-border/80 rounded-2xl p-6">
          <span class="text-xs text-primary font-bold uppercase">Penawaran</span>
          <p class="text-2xl text-textMain font-mono font-bold mt-3">${formatRupiah(proj.totalPrice)}</p>
        </div>
        <div class="bg-panel border border-border/80 rounded-2xl p-6">
          <span class="text-xs text-primary font-bold uppercase">Persetujuan</span>
          ${isAgreementSigned ? `<p class="text-lg text-emerald-500 font-bold mt-3">✓ Disetujui</p>` : `<button type="button" onclick="openContractDocModal('${proj.id}', true)" class="btn-primary w-full py-2 rounded-xl text-xs mt-3">Setujui</button>`}
        </div>
        <div class="bg-panel border border-border/80 rounded-2xl p-6">
          <span class="text-xs text-primary font-bold uppercase">Pembayaran</span>
          ${isFirstPaymentVerified ? `<p class="text-lg text-emerald-500 font-bold mt-3">✓ DP Lunas</p>` : `<p class="text-sm text-textMuted mt-3">Status: ${proj.dpStatus}</p>`}
          ${isAgreementSigned && !isFirstPaymentVerified ? `
            <div class="mt-3 space-y-2">
              <select id="payment-method-select-${proj.id}" onchange="changePaymentMethodDisplay('${proj.id}')" class="w-full bg-surface border border-border rounded-lg px-2 py-1.5 text-xs">
                ${appState.settings.paymentMethods.map(pm => `<option value="${pm.id}">${pm.name}</option>`).join('')}
              </select>
              <div id="payment-detail-box-${proj.id}" class="bg-surface border border-border rounded-lg p-2 text-xs"></div>
              <label class="btn-primary w-full py-2 rounded-lg text-xs font-bold text-center block cursor-pointer">Unggah Bukti<input type="file" onchange="uploadClientStagePayment('${proj.id}', 'dp', this.files[0])" class="hidden" /></label>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border/60">
        <button type="button" onclick="openOfficialDocModal('${proj.id}', 'invoice', 'dp')" class="btn-outline w-full py-3.5 rounded-xl text-sm font-bold">Lihat Invoice</button>
        ${isFullyPaid ? `<button type="button" onclick="downloadMasterAsset('${proj.id}')" class="btn-primary w-full py-3.5 rounded-xl text-sm font-bold">Unduh Hasil Akhir</button>` : `<button type="button" disabled class="w-full py-3.5 rounded-xl bg-panel border border-border text-textMuted text-sm font-bold">Hasil Terkunci</button>`}
      </div>
    </div>
  `;
  if (isAgreementSigned && !isFirstPaymentVerified) changePaymentMethodDisplay(proj.id);
}
// Fungsi pendukung (uploadClientStagePayment, dll) sama seperti sebelumnya
function changePaymentMethodDisplay(projId) {
  const select = document.getElementById(`payment-method-select-${projId}`);
  const box = document.getElementById(`payment-detail-box-${projId}`);
  if (!select || !box) return;
  const method = appState.settings.paymentMethods.find(m => m.id === select.value);
  if (!method) return;
  box.innerHTML = method.type === 'bank' ? `<div>${method.name}: ${method.number}</div>` : `<div class="text-center"><img src="${method.logo}" class="w-16 h-16 mx-auto" /></div>`;
}
function uploadClientStagePayment(projId, kind, file) { /* Tetap sama, simpan base64 / upload */ }
function downloadMasterAsset() { showToast('Info', 'Mengunduh file master...'); }
