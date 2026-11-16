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
    ws.innerHTML = `<div class="bg-surface border border-border/80 rounded-[2rem] p-12 text-center max-w-lg mx-auto shadow-premium"><h3 class="text-2xl font-display font-bold text-textMain mb-4">Belum Ada Pengajuan</h3><p class="text-textMuted text-sm mb-8">Silakan buat pengajuan pertama Anda untuk melihat progres.</p><button type="button" onclick="navigateTo('order')" class="btn-primary px-8 py-3.5 rounded-xl text-sm font-bold">+ Buat Pengajuan</button></div>`;
    return;
  }

  if (!myProjects.some(p => p.id === appState.selectedClientProjectId)) appState.selectedClientProjectId = myProjects[0].id;
  const proj = myProjects.find(p => p.id === appState.selectedClientProjectId);
  const isQuoteIssued = proj.quoteStatus === 'Diterbitkan';
  const isAgreementSigned = Boolean(proj.agreementSigned);
  const isFirstPaymentVerified = proj.dpStatus === 'Terverifikasi';
  const isFullyPaid = proj.paymentScheme === 'Pembayaran Penuh 100%' ? isFirstPaymentVerified : (proj.pelunasanStatus === 'Lunas');

  ws.innerHTML = `
    <div class="bg-surface border border-border/80 rounded-[2rem] p-8 space-y-8 shadow-premium dark:shadow-premium-dark">
      <div class="flex flex-wrap justify-between items-center border-b border-border/60 pb-6 gap-4">
        <div>
          <span class="text-xs font-mono text-primary font-bold uppercase tracking-wider block mb-1">Ruang Klien</span>
          <h2 class="text-3xl font-display font-bold text-textMain">${proj.judul}</h2>
          <p class="text-sm text-textMuted mt-1">Kode: ${proj.id}</p>
        </div>
        <div class="flex gap-3">
          <button type="button" onclick="navigateTo('order')" class="btn-outline px-5 py-2.5 rounded-xl text-xs font-bold">+ Pengajuan Baru</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-panel border border-border/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <span class="text-xs text-primary font-bold uppercase tracking-wider">Penawaran</span>
            <p class="text-2xl text-textMain font-mono font-bold mt-3">${formatRupiah(proj.totalPrice)}</p>
          </div>
        </div>
        <div class="bg-panel border border-border/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <span class="text-xs text-primary font-bold uppercase tracking-wider">Persetujuan</span>
            ${isAgreementSigned ? `<p class="text-lg text-emerald-500 font-bold mt-3">✓ Disetujui</p>` : `<p class="text-sm text-textMuted mt-3 mb-4">Tanda tangan perjanjian diperlukan.</p>`}
          </div>
          ${!isAgreementSigned ? `<button type="button" onclick="openContractDocModal('${proj.id}', true)" class="btn-primary w-full py-2.5 rounded-xl text-xs font-bold mt-4">Setujui Perjanjian</button>` : ''}
        </div>
        <div class="bg-panel border border-border/80 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <span class="text-xs text-primary font-bold uppercase tracking-wider">Pembayaran</span>
            ${isFirstPaymentVerified ? `<p class="text-lg text-emerald-500 font-bold mt-3">✓ DP Lunas</p>` : `<p class="text-sm text-textMuted mt-3">Status: ${proj.dpStatus}</p>`}
          </div>
          ${isAgreementSigned && !isFirstPaymentVerified ? `
            <div class="mt-4 space-y-3">
              <select id="payment-method-select-${proj.id}" onchange="changePaymentMethodDisplay('${proj.id}')" class="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-xs text-textMain font-bold focus:outline-none">
                ${appState.settings.paymentMethods.map(pm => `<option value="${pm.id}">${pm.name}</option>`).join('')}
              </select>
              <div id="payment-detail-box-${proj.id}" class="bg-surface border border-border rounded-xl p-3"></div>
              <label class="btn-primary w-full py-2.5 rounded-xl text-xs font-bold text-center block cursor-pointer shadow-glow">Unggah Bukti Transfer<input type="file" accept="image/*,application/pdf" onchange="uploadClientStagePayment('${proj.id}', 'dp', this.files[0])" class="hidden" /></label>
            </div>
          ` : ''}
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border/60">
        <button type="button" onclick="openOfficialDocModal('${proj.id}', 'invoice', 'dp')" class="btn-outline w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2">Lihat Invoice</button>
        ${isFullyPaid ? `<button type="button" onclick="showToast('Sukses', 'File master berhasil diunduh.');" class="btn-primary w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2">Unduh Hasil Akhir</button>` : `<button type="button" disabled class="w-full py-3.5 rounded-xl bg-panel border border-border/50 text-textMuted text-sm font-bold cursor-not-allowed">Hasil Terkunci (Belum Lunas)</button>`}
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
    ? `<div class="flex items-center justify-between"><div class="flex items-center gap-3"><img src="${method.logo}" class="h-6 object-contain" /><div><p class="font-mono text-sm font-bold text-textMain">${method.number}</p><p class="text-[10px] text-textMuted">${method.holder}</p></div></div><button type="button" onclick="navigator.clipboard.writeText('${method.number}'); showToast('Disalin','Nomor disalin')" class="text-primary text-xs font-bold bg-primary/10 px-2 py-1 rounded">Salin</button></div>`
    : `<div class="text-center"><img src="${method.logo}" class="w-32 h-32 object-contain mx-auto rounded-lg border border-border" /></div>`;
}

function uploadClientStagePayment(projId, kind, file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    const proj = appState.projects.find(p => p.id === projId); if (!proj) return;
    proj.dpProofDataUrl = reader.result; 
    proj.dpStatus = 'Menunggu Verifikasi';
    await syncProjectToCloud(proj); 
    renderClientWorkspace(); 
    showToast('Terkirim', 'Bukti transfer sedang diperiksa Admin.');
  };
  reader.readAsDataURL(file);
}

function changeClientPaymentScheme() {}
function confirmClientFinalReceipt() {}
function downloadMasterAsset() { showToast('Unduh', 'File master berhasil diunduh.'); }
