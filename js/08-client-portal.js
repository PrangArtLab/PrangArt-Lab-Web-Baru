function refreshClientPageUI() {
  const wall = document.getElementById('client-login-wall');
  const ws = document.getElementById('client-workspace-content');
  if (!appState.currentClientUser) {
    wall?.classList.remove('hidden');
    ws?.classList.add('hidden');
    return;
  }
  wall?.classList.add('hidden');
  ws?.classList.remove('hidden');
  renderClientWorkspace();
}

function renderClientWorkspace() {
  const ws = document.getElementById('client-workspace-content');
  if (!ws || !appState.currentClientUser) return;
  const myProjects = appState.projects.filter(p => p.clientEmail === appState.currentClientUser.email);

  if (!myProjects.length) {
    ws.innerHTML = `
      <div class="bg-charcoal border border-borderline rounded-2xl p-10 text-center max-w-lg mx-auto space-y-4">
        <h3 class="text-lg font-bold text-ivory">Belum Ada Pengajuan Aktif</h3>
        <p class="text-xs text-ash">Mulai diskusi dengan Admin atau isi formulir pengajuan kebutuhan pertama Anda.</p>
        <div class="flex justify-center gap-2">
          <button type="button" onclick="openProducerWaModal()" class="btn-ghost-gold px-4 py-2.5 rounded-xl text-xs font-bold">Diskusi WA</button>
          <!-- TOMBOL BARU KE FORMULIR -->
          <button type="button" onclick="navigateTo('order')" class="btn-gold px-4 py-2.5 rounded-xl text-xs font-bold">+ Buat Pengajuan Baru</button>
        </div>
      </div>
    `;
    return;
  }

  if (!myProjects.some(p => p.id === appState.selectedClientProjectId)) {
    appState.selectedClientProjectId = myProjects[0].id;
  }
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
    <div class="flex flex-wrap items-center justify-between gap-3 bg-charcoal border border-borderline rounded-2xl p-4">
      <div>
        <span class="text-[11px] font-mono text-gold uppercase font-bold">Ruang Klien • ${appState.currentClientUser.name}</span>
        <h2 class="text-xl font-bold text-ivory">${proj.judul} <span class="text-xs font-mono text-ash">(${proj.id})</span></h2>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        ${myProjects.length > 1 ? `
          <select onchange="appState.selectedClientProjectId = this.value; renderClientWorkspace()" class="bg-acoustic border border-borderline rounded-xl px-3 py-2 text-xs text-ivory">
            ${myProjects.map(p => `<option value="${p.id}" ${p.id === proj.id ? 'selected' : ''}>${p.id} - ${p.judul}</option>`).join('')}
          </select>
        ` : ''}
        <!-- TOMBOL TAMBAH PENGAJUAN BARU -->
        <button type="button" onclick="navigateTo('order')" class="btn-gold px-3.5 py-2 rounded-xl text-xs font-bold">+ Buat Pengajuan Baru</button>
      </div>
    </div>

    <div class="bg-charcoal border border-borderline rounded-2xl p-5 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-xs font-mono uppercase text-gold font-bold">Progres Tahapan Produksi</span>
        <span class="px-2.5 py-0.5 rounded-full bg-gold/15 text-gold text-xs font-bold">${proj.productionStatus}</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        ${TRACKER_MILESTONES.map((st, idx) => {
          const done = idx <= currentMilestoneIdx;
          return `
            <div class="p-2.5 rounded-xl border ${done ? 'border-gold bg-gold/10' : 'border-borderline bg-acoustic/50 opacity-50'}">
              <span class="text-[10px] font-mono font-bold ${done ? 'text-gold' : 'text-ash'}">0${idx + 1}</span>
              <p class="text-[11px] font-semibold text-ivory mt-0.5 leading-snug">${st.replace(/^\d+\.\s*/, '')}</p>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="bg-charcoal border ${isQuoteIssued ? 'border-emerald-500/40' : 'border-borderline'} rounded-2xl p-5 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-mono font-bold text-gold uppercase">Tahap 6 • Penawaran Resmi</span>
          <span class="text-[11px] font-mono ${isQuoteIssued ? 'text-emerald-400' : 'text-amber-300'}">${proj.quoteStatus}</span>
        </div>
        ${isQuoteIssued ? `
          <div class="space-y-1.5 text-xs">
            <p class="text-ash">Biaya Resmi: <strong class="text-ivory font-mono">${formatRupiah(proj.totalPrice)}</strong></p>
            <p class="text-ash">Estimasi Pengerjaan: <strong class="text-ivory">${proj.quoteDurationDays}</strong></p>
            <p class="text-ash">Hasil Diserahkan: <strong class="text-ivory">${proj.quoteDeliverables}</strong></p>
            ${proj.quoteNotes ? `<p class="text-[11px] italic text-gold">"${proj.quoteNotes}"</p>` : ''}
          </div>
        ` : `
          <p class="text-xs text-ash leading-relaxed">PrangArt Lab sedang memeriksa materi brief Anda &amp; menyiapkan penawaran harga resmi. Silakan lanjutkan diskusi di WhatsApp bila diperlukan.</p>
          <button type="button" onclick="launchWhatsAppProjectDiscussion('${proj.id}')" class="btn-ghost-gold w-full py-2 rounded-xl text-xs font-bold">Diskusi Materi di WA</button>
        `}
      </div>

      <div class="bg-charcoal border ${isAgreementSigned ? 'border-emerald-500/40' : 'border-borderline'} rounded-2xl p-5 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-mono font-bold text-gold uppercase">Tahap 7 • Persetujuan Admin</span>
          <span class="text-[11px] font-mono ${isAgreementSigned ? 'text-emerald-400' : 'text-amber-300'}">${isAgreementSigned ? '✓ Disetujui' : 'Menunggu'}</span>
        </div>
        <p class="text-xs text-ash leading-relaxed">
          ${proj.serviceLine === 'transkripsi'
            ? 'Persetujuan penawaran dan ketentuan layanan transkripsi musik secara elektronik.'
            : 'Penandatanganan Perjanjian Produksi Musik (v4-8) beserta Lampiran A, B, C sebelum pembayaran.'}
        </p>
        ${isAgreementSigned ? `
          <button type="button" onclick="openContractDocModal('${proj.id}', false)" class="btn-ghost-gold w-full py-2.5 rounded-xl text-xs font-bold">Lihat Perjanjian yang Disetujui</button>
        ` : isQuoteIssued ? `
          <button type="button" onclick="openContractDocModal('${proj.id}', true)" class="btn-gold w-full py-2.5 rounded-xl text-xs font-bold">Baca &amp; Setujui Perjanjian</button>
        ` : `
          <button type="button" disabled class="w-full py-2.5 rounded-xl bg-acoustic text-ash text-xs font-semibold cursor-not-allowed">Menunggu Penawaran Resmi</button>
        `}
      </div>

      <div class="bg-charcoal border ${isFirstPaymentVerified ? 'border-emerald-500/40' : 'border-borderline'} rounded-2xl p-5 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-mono font-bold text-gold uppercase">Tahap 8 • Pembayaran</span>
          <span class="text-[11px] font-mono ${isFirstPaymentVerified ? 'text-emerald-400' : 'text-amber-300'}">${proj.dpStatus}</span>
        </div>
        ${isAgreementSigned ? `
          <div class="space-y-2.5 text-xs">
            <div class="flex items-center justify-between gap-2">
              <span class="text-ash">Skema:</span>
              <select onchange="changeClientPaymentScheme('${proj.id}', this.value)" ${isFirstPaymentVerified ? 'disabled' : ''} class="bg-acoustic border border-borderline rounded-lg px-2 py-1 text-xs text-ivory">
                <option value="DP 50%" ${!isFullScheme ? 'selected' : ''}>DP 50% (${formatRupiah(proj.dpAmount)})</option>
                <option value="Pembayaran Penuh 100%" ${isFullScheme ? 'selected' : ''}>Penuh 100% (${formatRupiah(proj.totalPrice)})</option>
              </select>
            </div>
            <div class="bg-obsidian border border-borderline rounded-lg p-2.5 flex items-center justify-between gap-2">
              <span class="font-mono text-[11px] text-ivory truncate">${appState.settings.bankAccount}</span>
              <button type="button" onclick="copyBankAccount()" class="text-gold text-[11px] font-bold shrink-0">Salin</button>
            </div>
            ${proj.dpStatus === 'Ditolak' ? `<p class="text-[11px] text-red-400">${proj.dpRejectReason}</p>` : ''}
            ${!isFirstPaymentVerified ? `
              <label class="btn-gold w-full py-2.5 rounded-xl text-xs font-bold text-center block cursor-pointer">Unggah Bukti Transfer (${formatRupiah(firstPayAmount)})<input type="file" accept="image/jpeg,image/png,application/pdf" onchange="uploadClientStagePayment('${proj.id}', 'dp', this.files[0])" class="hidden" /></label>
            ` : `
              <p class="text-[11px] text-emerald-400 font-semibold">✓ Pembayaran Termin I telah diverifikasi oleh PrangArt Lab.</p>
            `}
          </div>
        ` : `
          <p class="text-xs text-ash leading-relaxed">Kolom unggah bukti transfer terbuka otomatis setelah Anda menyetujui dokumen pada Tahap 7.</p>
        `}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7 bg-charcoal border border-borderline rounded-2xl p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-borderline pb-3">
          <h3 class="text-sm font-bold text-ivory">Tahap 11 • Pratinjau Audio &amp; Catatan Revisi</h3>
          <span class="text-[11px] font-mono text-gold">Kuota: ${proj.revisionQuota || '6'}x revisi ringan</span>
        </div>
        ${proj.previewAudioName ? `
          <div class="bg-acoustic border border-gold/30 rounded-xl p-4 space-y-2.5">
            <div class="flex items-center justify-between text-xs">
              <strong class="text-ivory">${proj.previewAudioName}</strong>
              <span class="text-[11px] font-mono text-emerald-400">Draf Studio Tersedia</span>
            </div>
            ${proj.previewAudioUrl ? `
              <audio controls src="${proj.previewAudioUrl}" class="w-full h-9 rounded-lg"></audio>
            ` : `
              <button type="button" onclick="playSampleTone(246.94, '${proj.judul.replace(/'/g, "\\'")} (Pratinjau)')" class="btn-ghost-gold px-3.5 py-2 rounded-lg text-xs font-bold">Putar Simulasi Pratinjau</button>
            `}
          </div>
        ` : `
          <div class="bg-acoustic/60 border border-borderline rounded-xl p-4 text-xs text-ash">Audio pratinjau akan muncul di sini setelah proses produksi studio selesai dikerjakan.</div>
        `}
        <div class="space-y-2">
          <label class="block text-xs font-semibold text-ivory">Kirim Catatan Revisi / Masukan ke Admin:</label>
          <textarea id="client-revision-note" rows="2" placeholder="Tuliskan timestamp & detail perbaikan ringan (misal: 01:20 transisi kendang diperhalus)..." class="w-full bg-acoustic border border-borderline focus:border-gold rounded-xl px-3.5 py-2 text-xs text-ivory focus:outline-none"></textarea>
          <div class="flex flex-wrap gap-2">
            <button type="button" onclick="sendClientRevisionNoteToWA('${proj.id}')" class="btn-ghost-gold px-4 py-2 rounded-xl text-xs font-bold">Kirim Catatan Revisi ke WA Admin</button>
          </div>
        </div>
      </div>

      <div class="lg:col-span-5 bg-charcoal border border-borderline rounded-2xl p-5 space-y-4">
        <h3 class="text-sm font-bold text-ivory">Dokumen, Pelunasan &amp; Hasil Akhir</h3>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" onclick="openOfficialDocModal('${proj.id}', 'invoice', '${isFullScheme ? 'full' : (isFullyPaid ? 'lunas' : 'dp')}')" class="btn-ghost-gold py-2 rounded-lg text-xs font-bold">Invoice</button>
          <button type="button" onclick="openOfficialDocModal('${proj.id}', 'kuitansi', '${isFullScheme ? 'full' : (isFullyPaid ? 'lunas' : 'dp')}')" class="btn-ghost-gold py-2 rounded-lg text-xs font-bold">Kuitansi</button>
          <button type="button" onclick="openBriefCardModal('${proj.id}')" class="py-2 rounded-lg bg-acoustic border border-gold/40 text-gold text-xs font-bold hover:border-gold">Kartu Brief</button>
          <button type="button" onclick="openContractDocModal('${proj.id}', false)" class="py-2 rounded-lg bg-acoustic border border-gold/40 text-gold text-xs font-bold hover:border-gold">Perjanjian</button>
        </div>
        ${!isFullScheme && !isFullyPaid && isFirstPaymentVerified ? `
          <div class="bg-obsidian border border-gold/30 rounded-xl p-3.5 space-y-2.5">
            <p class="text-[11px] text-ash">Tahap 12: Unggah bukti pelunasan sisa <strong>${formatRupiah(pelunasanAmount)}</strong> sebelum hasil akhir diserahkan:</p>
            <label class="btn-gold w-full py-2.5 rounded-xl text-xs font-bold text-center block cursor-pointer">Unggah Bukti Pelunasan (${formatRupiah(pelunasanAmount)})<input type="file" accept="image/jpeg,image/png,application/pdf" onchange="uploadClientStagePayment('${proj.id}', 'lunas', this.files[0])" class="hidden" /></label>
          </div>
        ` : ''}
        <div class="pt-2 border-t border-borderline space-y-2">
          ${isFullyPaid ? `
            <button type="button" onclick="downloadMasterAsset('${proj.id}')" class="btn-gold w-full py-3 rounded-xl text-xs font-extrabold">Unduh Hasil Akhir (${proj.masterFileName || 'MASTER_FINAL.wav'})</button>
            ${!proj.clientAcceptedFinal ? `
              <button type="button" onclick="confirmClientFinalReceipt('${proj.id}')" class="btn-ghost-gold w-full py-2.5 rounded-xl text-xs font-bold">✓ Konfirmasi Penerimaan Hasil Akhir (Arsipkan)</button>
            ` : `
              <p class="text-center text-[11px] text-emerald-400 font-semibold">✓ Hasil akhir dikonfirmasi diterima &amp; diarsipkan.</p>
            `}
          ` : `
            <button type="button" disabled class="w-full py-3 rounded-xl bg-acoustic border border-borderline text-ash text-xs font-bold cursor-not-allowed">Hasil Akhir Terkunci (Selesaikan Pembayaran / Pelunasan)</button>
          `}
        </div>
      </div>
    </div>
  `;
}

async function changeClientPaymentScheme(projId, scheme) {
  const proj = appState.projects.find(p => p.id === projId);
  if (!proj) return;
  proj.paymentScheme = scheme;
  proj.dpAmount = scheme === 'DP 50%' ? Math.round(proj.totalPrice * 0.5) : proj.totalPrice;
  proj.pelunasanStatus = scheme === 'Pembayaran Penuh 100%' ? 'Tidak Perlu (Skema Penuh)' : 'Belum Lunas';
  await syncProjectToCloud(proj);
  renderClientWorkspace();
}

function uploadClientStagePayment(projId, kind, file) {
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    showToast('File Terlalu Besar', 'Maksimal ukuran file bukti transfer adalah 2 MB.', 'error');
    return;
  }
  const reader = new FileReader();
  reader.onload = async () => {
    const proj = appState.projects.find(p => p.id === projId);
    if (!proj) return;
    const cloudUrl = await uploadFileToFirebaseStorage(`payments/${projId}_${kind}_${Date.now()}_${file.name}`, file);
    const finalUrl = cloudUrl || reader.result;

    if (kind === 'dp') {
      proj.dpProofName = file.name;
      proj.dpProofDataUrl = finalUrl;
      proj.dpStatus = 'Menunggu Verifikasi';
      proj.dpRejectReason = '';
      proj.productionStatus = TRACKER_MILESTONES[3];
    } else {
      proj.pelunasanProofName = file.name;
      proj.pelunasanProofDataUrl = finalUrl;
      proj.pelunasanStatus = 'Menunggu Verifikasi';
    }
    await syncProjectToCloud(proj);
    renderClientWorkspace();
    showToast('Bukti Pembayaran Terkirim', 'Menunggu verifikasi Admin sebelum pekerjaan/rilis dilanjutkan.');
  };
  reader.readAsDataURL(file);
}

async function confirmClientFinalReceipt(projId) {
  const proj = appState.projects.find(p => p.id === projId);
  if (!proj) return;
  proj.clientAcceptedFinal = true;
  proj.productionStatus = TRACKER_MILESTONES[7];
  await syncProjectToCloud(proj);
  renderClientWorkspace();
  showToast('Pesanan Selesai & Diarsipkan', 'Terima kasih telah berkarya bersama PrangArt Lab.');
}

function downloadMasterAsset(projId) {
  const proj = appState.projects.find(p => p.id === projId);
  if (!proj) return;
  if (proj.masterFileUrl) {
    triggerPngFileDownload(proj.masterFileUrl, proj.masterFileName || `${proj.id}-MASTER.wav`);
  } else {
    showToast('Unduhan Master Dimulai', `Mengunduh berkas master resmi untuk ${proj.judul}.`);
  }
}