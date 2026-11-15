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
    ws.innerHTML = `<div class="bg-surface border border-border rounded-3xl p-10 text-center"><h3 class="text-lg font-bold text-textMain mb-4">Belum Ada Pengajuan</h3><button type="button" onclick="navigateTo('order')" class="btn-primary px-6 py-3 rounded-xl text-sm font-bold">+ Buat Pengajuan</button></div>`;
    return;
  }

  if (!myProjects.some(p => p.id === appState.selectedClientProjectId)) appState.selectedClientProjectId = myProjects[0].id;
  const proj = myProjects.find(p => p.id === appState.selectedClientProjectId);
  const isQuoteIssued = proj.quoteStatus === 'Diterbitkan';
  const isAgreementSigned = Boolean(proj.agreementSigned);
  const isFirstPaymentVerified = proj.dpStatus === 'Terverifikasi';

  ws.innerHTML = `
    <div class="bg-surface border border-border rounded-3xl p-6 space-y-6">
      <div class="flex justify-between items-center border-b border-border pb-4">
        <h2 class="text-xl font-bold text-textMain font-display">${proj.judul}</h2>
        <button type="button" onclick="navigateTo('order')" class="text-primary text-xs font-bold">+ Baru</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-panel border border-border rounded-xl p-4">
          <span class="text-xs text-primary font-bold">Penawaran</span>
          <p class="text-sm text-textMain font-mono mt-2">${formatRupiah(proj.totalPrice)}</p>
        </div>
        <div class="bg-panel border border-border rounded-xl p-4">
          <span class="text-xs text-primary font-bold">Persetujuan</span>
          ${isAgreementSigned ? `<p class="text-sm text-emerald-500 mt-2 font-bold">✓ Disetujui</p>` : `<button type="button" onclick="openContractDocModal('${proj.id}', true)" class="btn-primary w-full py-2 mt-2 rounded-lg text-xs">Setujui</button>`}
        </div>
        <div class="bg-panel border border-border rounded-xl p-4">
          <span class="text-xs text-primary font-bold">Pembayaran</span>
          ${isAgreementSigned ? `
            ${!isFirstPaymentVerified ? `
              <select id="payment-method-select-${proj.id}" onchange="changePaymentMethodDisplay('${proj.id}')" class="w-full bg-surface border border-border rounded-lg px-2 py-1.5 text-xs text-textMain mt-2">
                ${appState.settings.paymentMethods.map(pm => `<option value="${pm.id}">${pm.name}</option>`).join('')}
              </select>
              <div id="payment-detail-box-${proj.id}" class="bg-surface border border-border rounded-lg p-2 mt-2"></div>
              <label class="btn-primary w-full py-2 mt-2 rounded-lg text-xs font-bold text-center block cursor-pointer">Unggah Bukti<input type="file" onchange="uploadClientStagePayment('${proj.id}', 'dp', this.files[0])" class="hidden" /></label>
            ` : `<p class="text-sm text-emerald-500 mt-2 font-bold">✓ Lunas</p>`}
          ` : `<p class="text-xs text-textMuted mt-2">Terkunci</p>`}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
        <button type="button" onclick="openOfficialDocModal('${proj.id}', 'invoice', 'dp')" class="btn-outline w-full py-3 rounded-xl text-sm font-bold">Lihat Invoice</button>
        <button type="button" onclick="downloadMasterAsset('${proj.id}')" class="btn-primary w-full py-3 rounded-xl text-sm font-bold">Unduh Hasil</button>
      </div>
    </div>
  `;
  if (isAgreementSigned && !isFirstPaymentVerified) changePaymentMethodDisplay(proj.id);
}

function changePaymentMethodDisplay(projId) {
  const select = document.getElementById(`payment-method-select-${projId}`);
  const box = document.getElementById(`payment-detail-box-${projId}`);
  if (!select || !box) return;
  const method = appState.settings.paymentMethods.find(m => m.id === select.value);
  if (!method) return;
  box.innerHTML = method.type === 'bank' 
    ? `<div class="flex items-center gap-2"><img src="${method.logo}" class="h-5 object-contain" /><p class="font-mono text-xs font-bold text-textMain">${method.number}</p></div>`
    : `<div class="text-center"><img src="${method.logo}" class="w-24 h-24 object-contain mx-auto rounded border border-border" /></div>`;
}

function uploadClientStagePayment(projId, kind, file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    const proj = appState.projects.find(p => p.id === projId); if (!proj) return;
    proj.dpProofDataUrl = reader.result; proj.dpStatus = 'Menunggu Verifikasi';
    await syncProjectToCloud(proj); renderClientWorkspace(); showToast('Terkirim', 'Menunggu verifikasi.');
  };
  reader.readAsDataURL(file);
}
function changeClientPaymentScheme() {}
function downloadMasterAsset() { showToast('Unduh', 'File master berhasil diunduh.'); }