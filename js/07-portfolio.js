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
    ws.innerHTML = `
      <div class="bg-surface border border-border rounded-3xl p-12 text-center max-w-lg mx-auto space-y-5 shadow-sm">
        <h3 class="text-xl font-display font-bold text-textMain">Belum Ada Pengajuan Aktif</h3>
        <p class="text-sm text-textMuted">Mulai diskusi dengan Admin atau isi formulir pengajuan kebutuhan pertama Anda.</p>
        <div class="flex justify-center gap-3">
          <button type="button" onclick="openProducerWaModal()" class="btn-outline px-5 py-2.5 rounded-xl text-sm font-bold">Diskusi WA</button>
          <button type="button" onclick="navigateTo('order')" class="btn-primary px-5 py-2.5 rounded-xl text-sm font-bold">+ Buat Pengajuan</button>
        </div>
      </div>`;
    return;
  }

  if (!myProjects.some(p => p.id === appState.selectedClientProjectId)) appState.selectedClientProjectId = myProjects[0].id;
  const proj = myProjects.find(p => p.id === appState.selectedClientProjectId);
  const currentMilestoneIdx = Math.max(0, TRACKER_MILESTONES.indexOf(proj.productionStatus));
  const isFullScheme = proj.paymentScheme === 'Pembayaran Penuh 100%';
  const firstPayAmount = isFullScheme ? proj.totalPrice : proj.dpAmount;
  const pelunasanAmount = isFullScheme ? 0 : (proj.totalPrice - proj.dpAmount);
  const isQuoteIssued = proj.quoteStatus === 'Diterbitkan';
  const isAgreementSigned = Boolean(proj.agreementSigned);
  const isFirstPaymentVerified = proj.dpStatus === 'Terverifikasi';
  const isFullyPaid = isFullScheme ? isFirstPaymentVerified : (proj.pelunasanStatus === 'Lunas');

  ws.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-4 bg-surface border border-border rounded-3xl p-6 transition-colors duration-300">
      <div>
        <span class="text-xs font-mono text-primary uppercase font-bold">Ruang Klien • ${appState.currentClientUser.name}</span>
        <h2 class="text-2xl font-display font-bold text-textMain mt-1">${proj.judul} <span class="text-sm font-mono text-textMuted font-normal">(${proj.id})</span></h2>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        ${myProjects.length > 1 ? `<select onchange="appState.selectedClientProjectId = this.value; renderClientWorkspace()" class="bg-panel border border-border rounded-xl px-4 py-2 text-sm text-textMain">${myProjects.map(p => `<option value="${p.id}" ${p.id === proj.id ? 'selected' : ''}>${p.id} - ${p.judul}</option>`).join('')}</select>` : ''}
        <button type="button" onclick="navigateTo('order')" class="btn-primary px-4 py-2.5 rounded-xl text-sm font-bold">+ Pengajuan Baru</button>
      </div>
    </div>

    <div class="bg-surface border border-border rounded-3xl p-6 space-y-5 transition-colors duration-300">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-sm font-mono uppercase text-primary font-bold">Progres Tahapan Produksi</span>
        <span class="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">${proj.productionStatus}</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        ${TRACKER_MILESTONES.map((st, idx) => {
          const done = idx <= currentMilestoneIdx;
          return `<div class="p-3 rounded-xl border ${done ? 'border-primary bg-primary/5' : 'border-border bg-panel opacity-50'} transition-colors duration-300"><span class="text-[10px] font-mono font-bold ${done ? 'text-primary' : 'text-textMuted'}">0${idx + 1}</span><p class="text-[11px] font-semibold text-textMain mt-1 leading-snug">${st.replace(/^\d+\.\s*/, '')}</p></div>`;
        }).join('')}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-surface border ${isQuoteIssued ? 'border-emerald-500/40' : 'border-border'} rounded-3xl p-6 space-y-4 transition-colors duration-300 shadow-sm">
        <div class="flex items-center justify-between"><span class="text-xs font-mono font-bold text-primary uppercase">Tahap 6 • Penawaran</span><span class="text-xs font-mono ${isQuoteIssued ? 'text-emerald-500' : 'text-amber-500'} font-bold">${proj.quoteStatus}</span></div>
        ${isQuoteIssued ? `<div class="space-y-2 text-sm"><p class="text-textMuted">Biaya: <strong class="text-textMain font-mono">${formatRupiah(proj.totalPrice)}</strong></p><p class="text-textMuted">Pengerjaan: <strong class="text-textMain">${proj.quoteDurationDays}</strong></p><p class="text-textMuted">Hasil: <strong class="text-textMain">${proj.quoteDeliverables}</strong></p></div>` : `<p class="text-sm text-textMuted leading-relaxed">Admin sedang memeriksa materi brief Anda &amp; menyiapkan penawaran.</p><button type="button" onclick="launchWhatsAppProjectDiscussion('${proj.id}')" class="btn-outline w-full py-2.5 rounded-xl text-sm font-bold mt-2">Diskusi WA</button>`}
      </div>

      <div class="bg-surface border ${isAgreementSigned ? 'border-emerald-500/40' : 'border-border'} rounded-3xl p-6 space-y-4 transition-colors duration-300 shadow-sm">
        <div class="flex items-center justify-between"><span class="text-xs font-mono font-bold text-primary uppercase">Tahap 7 • Persetujuan</span><span class="text-xs font-mono ${isAgreementSigned ? 'text-emerald-500' : 'text-amber-500'} font-bold">${isAgreementSigned ? '✓ Selesai' : 'Menunggu'}</span></div>
        <p class="text-sm text-textMuted leading-relaxed">${proj.serviceLine === 'transkripsi' ? 'Persetujuan penawaran secara elektronik.' : 'Penandatanganan Perjanjian Produksi Musik (v4-8).'}</p>
        ${isAgreementSigned ? `<button type="button" onclick="openContractDocModal('${proj.id}', false)" class="btn-outline w-full py-2.5 rounded-xl text-sm font-bold mt-2">Lihat Dokumen</button>` : isQuoteIssued ? `<button type="button" onclick="openContractDocModal('${proj.id}', true)" class="btn-primary w-full py-2.5 rounded-xl text-sm font-bold mt-2">Baca &amp; Setujui</button>` : `<button type="button" disabled class="w-full py-2.5 rounded-xl bg-panel text-textMuted text-sm font-bold mt-2 cursor-not-allowed">Menunggu Penawaran</button>`}
      </div>

      <div class="bg-surface border ${isFirstPaymentVerified ? 'border-emerald-500/40' : 'border-border'} rounded-3xl p-6 space-y-4 transition-colors duration-300 shadow-sm">
        <div class="flex items-center justify-between"><span class="text-xs font-mono font-bold text-primary uppercase">Tahap 8 • Pembayaran</span><span class="text-xs font-mono ${isFirstPaymentVerified ? 'text-emerald-500' : 'text-amber-500'} font-bold">${proj.dpStatus}</span></div>
        ${isAgreementSigned ? `
          <div class="space-y-4 text-sm">
            <div class="flex items-center justify-between gap-2"><span class="text-textMuted">Skema:</span><select onchange="changeClientPaymentScheme('${proj.id}', this.value)" ${isFirstPaymentVerified ? 'disabled' : ''} class="bg-panel border border-border rounded-lg px-3 py-1.5 text-xs font-bold text-textMain"><option value="DP 50%" ${!isFullScheme ? 'selected' : ''}>DP 50% (${formatRupiah(proj.dpAmount)})</option><option value="Pembayaran Penuh 100%" ${isFullScheme ? 'selected' : ''}>Penuh 100% (${formatRupiah(proj.totalPrice)})</option></select></div>
            ${!isFirstPaymentVerified ? `
              <div class="space-y-2">
                <label class="text-xs font-bold text-textMain block">Pilih Metode:</label>
                <select id="payment-method-select-${proj.id}" onchange="changePaymentMethodDisplay('${proj.id}')" class="w-full bg-panel border border-border rounded-xl px-3 py-2 text-sm text-textMain font-bold">
                  ${appState.settings.paymentMethods.map(pm => `<option value="${pm.id}">${pm.name}</option>`).join('')}
                </select>
              </div>
              <div id="payment-detail-box-${proj.id}" class="bg-base border border-border rounded-xl p-4"></div>
              <label class="btn-primary w-full py-3 rounded-xl text-sm font-bold text-center block cursor-pointer mt-2">Unggah Bukti Transfer (${formatRupiah(firstPayAmount)})<input type="file" accept="image/jpeg,image/png,application/pdf" onchange="uploadClientStagePayment('${proj.id}', 'dp', this.files[0])" class="hidden" /></label>
            ` : `<p class="text-sm text-emerald-500 font-bold bg-emerald-500/10 p-3 rounded-xl text-center">✓ Termin I Terverifikasi</p>`}
            ${proj.dpStatus === 'Ditolak' ? `<p class="text-xs text-red-500 font-bold bg-red-500/10 p-2 rounded-lg mt-2">${proj.dpRejectReason}</p>` : ''}
          </div>
        ` : `<p class="text-sm text-textMuted leading-relaxed">Unggah bukti transfer terbuka setelah Anda menyetujui perjanjian.</p>`}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7 bg-surface border border-border rounded-3xl p-6 space-y-5 transition-colors duration-300">
        <div class="flex items-center justify-between border-b border-border pb-4"><h3 class="text-lg font-display font-bold text-textMain">Pratinjau Audio &amp; Revisi</h3><span class="text-xs font-mono text-primary font-bold">Kuota: ${proj.revisionQuota || '6'}x</span></div>
        ${proj.previewAudioName ? `<div class="bg-panel border border-primary/30 rounded-2xl p-5 space-y-3"><div class="flex items-center justify-between"><strong class="text-sm text-textMain">${proj.previewAudioName}</strong><span class="text-xs font-mono text-emerald-500 font-bold">Tersedia</span></div>${proj.previewAudioUrl ? `<audio controls src="${proj.previewAudioUrl}" class="w-full h-10 rounded-lg"></audio>` : `<button type="button" onclick="playSampleTone(246.94, 'Pratinjau')" class="btn-outline px-4 py-2 rounded-xl text-xs font-bold">Putar Simulasi</button>`}</div>` : `<div class="bg-panel border border-border rounded-2xl p-5 text-sm text-textMuted">Audio pratinjau akan muncul setelah pengerjaan studio selesai.</div>`}
        <div class="space-y-3">
          <label class="block text-sm font-bold text-textMain">Catatan Revisi:</label>
          <textarea id="client-revision-note" rows="3" placeholder="Tuliskan timestamp & perbaikan..." class="w-full bg-panel border border-border focus:border-primary rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none transition-colors duration-300"></textarea>
          <button type="button" onclick="sendClientRevisionNoteToWA('${proj.id}')" class="btn-outline px-5 py-2.5 rounded-xl text-sm font-bold">Kirim Catatan ke WA</button>
        </div>
      </div>

      <div class="lg:col-span-5 bg-surface border border-border rounded-3xl p-6 space-y-5 transition-colors duration-300">
        <h3 class="text-lg font-display font-bold text-textMain">Dokumen &amp; Hasil Akhir</h3>
        <div class="grid grid-cols-2 gap-3">
          <button type="button" onclick="openOfficialDocModal('${proj.id}', 'invoice', '${isFullScheme ? 'full' : (isFullyPaid ? 'lunas' : 'dp')}')" class="btn-outline py-2.5 rounded-xl text-xs font-bold">Invoice</button>
          <button type="button" onclick="openOfficialDocModal('${proj.id}', 'kuitansi', '${isFullScheme ? 'full' : (isFullyPaid ? 'lunas' : 'dp')}')" class="btn-outline py-2.5 rounded-xl text-xs font-bold">Kuitansi</button>
          <button type="button" onclick="openBriefCardModal('${proj.id}')" class="bg-panel border border-border hover:border-primary text-textMain py-2.5 rounded-xl text-xs font-bold transition-colors duration-300">Kartu Brief</button>
          <button type="button" onclick="openContractDocModal('${proj.id}', false)" class="bg-panel border border-border hover:border-primary text-textMain py-2.5 rounded-xl text-xs font-bold transition-colors duration-300">Perjanjian</button>
        </div>
        ${!isFullScheme && !isFullyPaid && isFirstPaymentVerified ? `<div class="bg-base border border-primary/30 rounded-2xl p-4 space-y-3"><p class="text-xs text-textMuted">Unggah bukti pelunasan sisa <strong>${formatRupiah(pelunasanAmount)}</strong>:</p><label class="btn-primary w-full py-2.5 rounded-xl text-xs font-bold text-center block cursor-pointer">Unggah Bukti Pelunasan<input type="file" accept="image/jpeg,image/png,application/pdf" onchange="uploadClientStagePayment('${proj.id}', 'lunas', this.files[0])" class="hidden" /></label></div>` : ''}
        <div class="pt-4 border-t border-border space-y-3">
          ${isFullyPaid ? `<button type="button" onclick="downloadMasterAsset('${proj.id}')" class="btn-primary w-full py-3 rounded-xl text-sm font-bold">Unduh Hasil Akhir (${proj.masterFileName || 'MASTER.wav'})</button>${!proj.clientAcceptedFinal ? `<button type="button" onclick="confirmClientFinalReceipt('${proj.id}')" class="btn-outline w-full py-2.5 rounded-xl text-sm font-bold">✓ Konfirmasi Terima</button>` : `<p class="text-center text-xs text-emerald-500 font-bold">✓ Selesai &amp; Diarsipkan</p>`}` : `<button type="button" disabled class="w-full py-3 rounded-xl bg-panel border border-border text-textMuted text-sm font-bold cursor-not-allowed">Hasil Akhir Terkunci</button>`}
        </div>
      </div>
    </div>
  `;

  if (isAgreementSigned && !isFirstPaymentVerified) changePaymentMethodDisplay(proj.id);
}

async function changeClientPaymentScheme(projId, scheme) {
  const proj = appState.projects.find(p => p.id === projId);
  if (!proj) return;
  proj.paymentScheme = scheme;
  proj.dpAmount = scheme === 'DP 50%' ? Math.round(proj.totalPrice * 0.5) : proj.totalPrice;
  proj.pelunasanStatus = scheme === 'Pembayaran Penuh 100%' ? 'Tidak Perlu' : 'Belum Lunas';
  await syncProjectToCloud(proj); renderClientWorkspace();
}

function changePaymentMethodDisplay(projId) {
  const select = document.getElementById(`payment-method-select-${projId}`);
  const box = document.getElementById(`payment-detail-box-${projId}`);
  if (!select || !box) return;
  const method = appState.settings.paymentMethods.find(m => m.id === select.value);
  if (!method) return;

  if (method.type === 'bank') {
    box.innerHTML = `<div class="flex items-center gap-4"><img src="${method.logo}" class="h-8 object-contain" /><div class="flex-1"><p class="font-mono text-base font-bold text-textMain">${method.number}</p><p class="text-[11px] text-textMuted">a.n. ${method.holder}</p></div><button type="button" onclick="copyBankAccountNumber('${method.number}')" class="text-primary text-xs font-bold px-3 py-1.5 bg-primary/10 rounded-lg">Salin</button></div>`;
  } else if (method.type === 'qris') {
    box.innerHTML = `<div class="text-center space-y-3"><p class="text-xs text-textMuted">Scan QRIS</p><img src="${method.logo}" class="w-40 h-40 object-contain mx-auto rounded-xl border border-border p-1 bg-white" /><p class="text-sm font-bold text-textMain">${method.name}</p><p class="text-[11px] text-textMuted">a.n. ${method.holder}</p></div>`;
  }
}

function copyBankAccountNumber(number) {
  const tmp = document.createElement('textarea'); tmp.value = number; document.body.appendChild(tmp); tmp.select(); document.execCommand('copy'); tmp.remove(); showToast('Disalin', number);
}

function uploadClientStagePayment(projId, kind, file) {
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { showToast('Gagal', 'Maksimal file 2 MB.', 'error'); return; }
  const reader = new FileReader();
  reader.onload = async () => {
    const proj = appState.projects.find(p => p.id === projId);
    if (!proj) return;
    const cloudUrl = await uploadFileToFirebaseStorage(`payments/${projId}_${kind}_${Date.now()}_${file.name}`, file);
    const finalUrl = cloudUrl || reader.result;
    if (kind === 'dp') {
      proj.dpProofName = file.name; proj.dpProofDataUrl = finalUrl; proj.dpStatus = 'Menunggu Verifikasi'; proj.dpRejectReason = ''; proj.productionStatus = TRACKER_MILESTONES[3];
    } else {
      proj.pelunasanProofName = file.name; proj.pelunasanProofDataUrl = finalUrl; proj.pelunasanStatus = 'Menunggu Verifikasi';
    }
    await syncProjectToCloud(proj); renderClientWorkspace(); showToast('Berhasil', 'Bukti terkirim, menunggu verifikasi.');
  };
  reader.readAsDataURL(file);
}

async function confirmClientFinalReceipt(projId) {
  const proj = appState.projects.find(p => p.id === projId);
  if (!proj) return;
  proj.clientAcceptedFinal = true; proj.productionStatus = TRACKER_MILESTONES[7];
  await syncProjectToCloud(proj); renderClientWorkspace(); showToast('Selesai', 'Terima kasih.');
}

function downloadMasterAsset(projId) {
  const proj = appState.projects.find(p => p.id === projId);
  if (!proj) return;
  if (proj.masterFileUrl) triggerPngFileDownload(proj.masterFileUrl, proj.masterFileName || `${proj.id}-MASTER.wav`);
  else showToast('Unduhan', 'Mengunduh berkas master...');
}
