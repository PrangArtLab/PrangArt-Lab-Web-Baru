function verifyAdminPin(e) {
  e.preventDefault();
  const pin = document.getElementById('admin-pin-input')?.value.trim();
  const validPin = appState.settings.adminPin || '2026';
  if (pin !== validPin) {
    showToast('PIN Salah', 'PIN Studio tidak sesuai.', 'error');
    return;
  }
  appState.isAdminAuthenticated = true;
  refreshAdminPageUI();
}

function refreshAdminPageUI() {
  const gate = document.getElementById('admin-pin-gate');
  const ws = document.getElementById('admin-workspace-content');
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
  const container = document.getElementById('admin-workspace-content');
  if (!container) return;

  const filtered = appState.adminFilterStatus === 'Semua'
    ? appState.projects
    : appState.projects.filter(p => p.productionStatus === appState.adminFilterStatus);

  if (!filtered.some(p => p.id === appState.selectedAdminProjectId) && filtered.length > 0) {
    appState.selectedAdminProjectId = filtered[0].id;
  }

  container.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-borderline pb-4">
      <div>
        <span class="text-xs font-mono uppercase text-gold font-bold">Panel Produser &amp; Komposer</span>
        <h2 class="text-2xl font-bold text-ivory">Pemeriksaan Brief, Penawaran &amp; Produksi</h2>
      </div>
      <div class="flex flex-wrap gap-1.5">
        ${['Semua', ...TRACKER_MILESTONES].map(st => `
          <button type="button" onclick="appState.adminFilterStatus = '${st}'; renderAdminDashboard()" class="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold ${appState.adminFilterStatus === st ? 'bg-gold text-obsidian' : 'bg-charcoal text-ash border border-borderline'}">${st}</button>
        `).join('')}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-4 space-y-2.5">
        ${filtered.map(p => `
          <button type="button" onclick="appState.selectedAdminProjectId = '${p.id}'; renderAdminDashboard()" class="w-full text-left p-4 rounded-2xl border transition ${p.id === appState.selectedAdminProjectId ? 'bg-charcoal border-gold' : 'bg-charcoal/60 border-borderline hover:border-gold/40'}">
            <div class="flex items-center justify-between text-[11px] font-mono mb-1">
              <span class="text-gold font-bold">${p.id}</span>
              <span class="text-ash">${p.createdAt}</span>
            </div>
            <strong class="text-sm text-ivory block truncate">${p.judul}</strong>
            <span class="text-xs text-ash block truncate">${p.clientName} • ${p.instansi}</span>
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-borderline text-[11px]">
              <span class="text-emerald-400 font-semibold truncate max-w-[170px]">${p.productionStatus}</span>
              <span class="font-mono text-ivory">${formatRupiah(p.totalPrice)}</span>
            </div>
          </button>
        `).join('')}
      </div>
      <div id="admin-inspector-panel" class="lg:col-span-8"></div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-charcoal border border-borderline rounded-2xl p-5 space-y-4">
        <h3 class="text-sm font-bold text-gold uppercase font-mono">Pengaturan Studio</h3>
        <div class="space-y-3 text-xs">
          <div>
            <label class="block text-ash mb-1">Rekening Tujuan Pembayaran</label>
            <input type="text" id="set-bank" value="${appState.settings.bankAccount}" class="w-full bg-acoustic border border-borderline rounded-xl px-3 py-2 text-ivory" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-ash mb-1">WhatsApp Produser (628...)</label>
              <input type="text" id="set-wa" value="${appState.settings.studioWhatsApp}" class="w-full bg-acoustic border border-borderline rounded-xl px-3 py-2 font-mono text-ivory" />
            </div>
            <div>
              <label class="block text-ash mb-1">PIN Akses Admin</label>
              <input type="text" id="set-pin" value="${appState.settings.adminPin || '2026'}" class="w-full bg-acoustic border border-borderline rounded-xl px-3 py-2 font-mono text-ivory" />
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" onclick="saveStudioSettings()" class="btn-gold px-4 py-2.5 rounded-xl text-xs font-bold">Simpan Pengaturan</button>
            <button type="button" onclick="openGitHubPagesGuideModal()" class="btn-ghost-gold px-4 py-2.5 rounded-xl text-xs font-bold">Panduan GitHub Pages</button>
          </div>
        </div>
      </div>

      <div class="bg-charcoal border border-borderline rounded-2xl p-5 space-y-4">
        <h3 class="text-sm font-bold text-gold uppercase font-mono">Kelola Portofolio Publik</h3>
        <form onsubmit="addPortfolioItem(event)" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <input type="text" id="pf-new-title" required placeholder="Judul karya..." class="bg-acoustic border border-borderline rounded-xl px-3 py-2 text-ivory" />
          <select id="pf-new-cat" class="bg-acoustic border border-borderline rounded-xl px-3 py-2 text-ivory">
            <option value="Produksi Musik Tari">Produksi Musik Tari</option>
            <option value="Produksi Musik Non-Tari">Produksi Musik Non-Tari</option>
            <option value="Transkripsi Musik">Transkripsi Musik</option>
          </select>
          <input type="text" id="pf-new-culture" required placeholder="Latar budaya / format..." class="bg-acoustic border border-borderline rounded-xl px-3 py-2 text-ivory" />
          <button type="submit" class="btn-ghost-gold rounded-xl py-2 font-bold">+ Tambah Karya</button>
        </form>
        <div class="space-y-1.5 max-h-36 overflow-y-auto">
          ${appState.portfolioItems.map((item, idx) => `
            <div class="flex items-center justify-between bg-acoustic rounded-lg px-3 py-2 text-xs">
              <span><strong>${item.title}</strong> <span class="text-ash">(${item.category})</span></span>
              <button type="button" onclick="removePortfolioItem(${idx})" class="text-red-400 hover:underline">Hapus</button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  renderAdminInspector();
}

function renderAdminInspector() {
  const panel = document.getElementById('admin-inspector-panel');
  if (!panel) return;
  const proj = appState.projects.find(p => p.id === appState.selectedAdminProjectId);
  if (!proj) {
    panel.innerHTML = `<div class="bg-charcoal border border-borderline rounded-2xl p-8 text-center text-xs text-ash">Pilih proyek di sebelah kiri untuk memeriksa detail.</div>`;
    return;
  }

  panel.innerHTML = `
    <div class="bg-charcoal border border-borderline rounded-2xl p-5 sm:p-6 space-y-5">
      <div class="flex flex-wrap items-start justify-between gap-3 border-b border-borderline pb-4">
        <div>
          <span class="text-xs font-mono text-gold font-bold">${proj.id} • ${proj.serviceLineLabel} (${proj.packageName})</span>
          <h3 class="text-xl font-bold text-ivory mt-0.5">${proj.judul}</h3>
          <p class="text-xs text-ash">${proj.clientName} (${proj.instansi}, ${proj.kota}) • ${proj.entryPath}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" onclick="openBriefCardModal('${proj.id}')" class="btn-gold px-3.5 py-2 rounded-xl text-xs font-bold">Kartu Brief</button>
          <button type="button" onclick="openContractDocModal('${proj.id}', false)" class="btn-ghost-gold px-3 py-2 rounded-xl text-xs font-bold">Perjanjian</button>
          <button type="button" onclick="openOfficialDocModal('${proj.id}', 'invoice', 'dp')" class="btn-ghost-gold px-3 py-2 rounded-xl text-xs font-bold">Invoice</button>
          <button type="button" onclick="openOfficialDocModal('${proj.id}', 'kuitansi', 'dp')" class="btn-ghost-gold px-3 py-2 rounded-xl text-xs font-bold">Kuitansi</button>
        </div>
      </div>

      <div class="bg-acoustic border border-gold/30 rounded-xl p-4 space-y-3">
        <div class="flex items-center justify-between">
          <strong class="text-xs text-gold uppercase font-mono">Tahap 6 &amp; 7 • Penawaran Resmi &amp; Lampiran A Perjanjian</strong>
          <span class="text-[11px] font-mono text-ivory">Status: ${proj.quoteStatus}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div><label class="block text-[11px] text-ash mb-1">Biaya Final (Rp)</label><input type="number" id="admin-quote-price" value="${proj.totalPrice}" class="w-full bg-obsidian border border-borderline rounded-lg px-3 py-2 font-mono text-ivory" /></div>
          <div>
            <label class="block text-[11px] text-ash mb-1">Kedudukan Pihak I (Lampiran A)</label>
            <select id="admin-composer-role" class="w-full bg-obsidian border border-borderline rounded-lg px-3 py-2 text-ivory">
              <option value="Composer" ${(proj.composerRole || '') === 'Composer' ? 'selected' : ''}>Composer</option>
              <option value="Arranger" ${(proj.composerRole || '') === 'Arranger' ? 'selected' : ''}>Arranger</option>
              <option value="Composer & Arranger" ${(proj.composerRole || 'Composer & Arranger') === 'Composer & Arranger' ? 'selected' : ''}>Composer &amp; Arranger</option>
              <option value="Tim produksi saja" ${(proj.composerRole || '') === 'Tim produksi saja' ? 'selected' : ''}>Tim produksi saja</option>
            </select>
          </div>
          <div><label class="block text-[11px] text-ash mb-1">Kuota Revisi Ringan (Pasal 8)</label><input type="text" id="admin-quote-rev" value="${proj.revisionQuota || '6'}" placeholder="Contoh: 3 / 6" class="w-full bg-obsidian border border-borderline rounded-lg px-3 py-2 font-mono text-ivory" /></div>
          <div><label class="block text-[11px] text-ash mb-1">Format File Diserahkan</label><input type="text" id="admin-quote-deliver" value="${proj.deliverableFormat || 'WAV 24-bit & MP3 320kbps'}" class="w-full bg-obsidian border border-borderline rounded-lg px-3 py-2 text-ivory" /></div>
          <div><label class="block text-[11px] text-ash mb-1">Estimasi Waktu Pengerjaan</label><input type="text" id="admin-quote-days" value="${proj.quoteDurationDays || '7-10 Hari Kerja'}" class="w-full bg-obsidian border border-borderline rounded-lg px-3 py-2 text-ivory" /></div>
          <div><label class="block text-[11px] text-ash mb-1">Kolaborator (Lampiran B)</label><input type="text" id="admin-collab-notes" value="${proj.collaboratorNotes || 'Tidak ada kontributor tambahan'}" class="w-full bg-obsidian border border-borderline rounded-lg px-3 py-2 text-ivory" /></div>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <input type="text" id="admin-quote-notes" value="${proj.quoteNotes || ''}" placeholder="Catatan tambahan penawaran / Lampiran A..." class="flex-1 bg-obsidian border border-borderline rounded-lg px-3 py-2 text-xs text-ivory" />
          <button type="button" onclick="issueOfficialQuotation('${proj.id}')" class="btn-gold px-4 py-2 rounded-xl text-xs font-bold shrink-0">Terbitkan Penawaran &amp; Perjanjian</button>
        </div>
      </div>

      <div class="bg-acoustic border border-borderline rounded-xl p-4 space-y-2">
        <label class="block text-xs font-bold text-ivory">Tahapan Progres Saat Ini:</label>
        <select onchange="updateAdminProjectStage('${proj.id}', this.value)" class="w-full bg-obsidian border border-gold/40 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gold">
          ${TRACKER_MILESTONES.map(st => `<option value="${st}" ${proj.productionStatus === st ? 'selected' : ''}>${st}</option>`).join('')}
        </select>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="bg-acoustic border border-borderline rounded-xl p-4 space-y-2.5">
          <div class="flex items-center justify-between text-xs">
            <strong>Termin I (${proj.paymentScheme})</strong>
            <span class="font-mono text-gold">${proj.dpStatus}</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" onclick="inspectPaymentProof('${proj.id}', 'dp')" class="px-2.5 py-1.5 rounded-lg bg-obsidian border border-borderline text-xs text-ivory hover:border-gold">Lihat Bukti</button>
            <button type="button" onclick="verifyProjectPayment('${proj.id}', 'dp', 'Terverifikasi')" class="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">✓ Sah</button>
            <button type="button" onclick="verifyProjectPayment('${proj.id}', 'dp', 'Ditolak')" class="px-2.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold">× Tolak</button>
          </div>
        </div>

        <div class="bg-acoustic border border-borderline rounded-xl p-4 space-y-2.5">
          <div class="flex items-center justify-between text-xs">
            <strong>Termin II: Pelunasan (${formatRupiah(proj.totalPrice - proj.dpAmount)})</strong>
            <span class="font-mono text-gold">${proj.pelunasanStatus}</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <button type="button" onclick="inspectPaymentProof('${proj.id}', 'lunas')" class="px-2.5 py-1.5 rounded-lg bg-obsidian border border-borderline text-xs text-ivory hover:border-gold">Lihat Bukti</button>
            <button type="button" onclick="verifyProjectPayment('${proj.id}', 'lunas', 'Lunas')" class="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold">✓ Sah Lunas</button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label class="bg-acoustic border border-dashed border-gold/40 hover:border-gold rounded-xl p-4 cursor-pointer text-xs space-y-1">
          <strong class="text-ivory block">Unggah Audio Pratinjau (MP3/WAV)</strong>
          <span class="text-ash block truncate">${proj.previewAudioName || 'Belum ada file pratinjau'}</span>
          <input type="file" accept="audio/*" onchange="uploadStudioDeliverable('${proj.id}', 'preview', this.files[0])" class="hidden" />
        </label>
        <label class="bg-acoustic border border-dashed border-emerald-500/40 hover:border-emerald-400 rounded-xl p-4 cursor-pointer text-xs space-y-1">
          <strong class="text-ivory block">Unggah Hasil Akhir Master (WAV/ZIP/PDF)</strong>
          <span class="text-ash block truncate">${proj.masterFileName || 'Belum ada file master'}</span>
          <input type="file" onchange="uploadStudioDeliverable('${proj.id}', 'master', this.files[0])" class="hidden" />
        </label>
      </div>

      <div class="bg-obsidian border border-borderline rounded-xl p-4 space-y-2 text-xs">
        <strong class="text-gold block">Sinopsis &amp; Referensi Klien:</strong>
        <p class="text-ash leading-relaxed">${proj.sinopsis}</p>
        <p class="text-[11px] font-mono text-ivory truncate">Ref: ${proj.referensi}</p>
        <div class="pt-2 flex flex-wrap gap-2">
          <a href="https://wa.me/${proj.wa.replace(/^0/, '62')}?text=${encodeURIComponent(`Halo ${proj.clientName}, saya dari PrangArt Lab terkait karya "${proj.judul}" (${proj.id}). Penawaran resmi dan dokumen perjanjian sudah siap.`)}" target="_blank" rel="noopener" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold">Hubungi WhatsApp Klien (${proj.wa})</a>
        </div>
      </div>
    </div>
  `;
}

async function issueOfficialQuotation(projId) {
  const proj = appState.projects.find(p => p.id === projId);
  if (!proj) return;
  const newTotal = Number(document.getElementById('admin-quote-price')?.value) || proj.totalPrice;
  proj.totalPrice = newTotal;
  proj.dpAmount = proj.paymentScheme === 'DP 50%' ? Math.round(newTotal * 0.5) : newTotal;
  proj.composerRole = document.getElementById('admin-composer-role')?.value || 'Composer & Arranger';
  proj.revisionQuota = document.getElementById('admin-quote-rev')?.value.trim() || '6';
  proj.deliverableFormat = document.getElementById('admin-quote-deliver')?.value.trim() || 'WAV 24-bit & MP3 320kbps';
  proj.quoteDurationDays = document.getElementById('admin-quote-days')?.value.trim() || '7-10 Hari Kerja';
  proj.collaboratorNotes = document.getElementById('admin-collab-notes')?.value.trim() || 'Tidak ada kontributor tambahan';
  proj.quoteDeliverables = `${proj.deliverableFormat} (${proj.revisionQuota}x revisi ringan)`;
  proj.quoteNotes = document.getElementById('admin-quote-notes')?.value.trim() || '';
  proj.quoteStatus = 'Diterbitkan';
  proj.productionStatus = TRACKER_MILESTONES[2];
  await syncProjectToCloud(proj);
  renderAdminDashboard();
  showToast('Penawaran & Perjanjian Diterbitkan', 'Klien kini dapat menyetujui perjanjian & melakukan pembayaran.');
}

async function updateAdminProjectStage(projId, newStage) {
  const proj = appState.projects.find(p => p.id === projId);
  if (!proj) return;
  proj.productionStatus = newStage;
  await syncProjectToCloud(proj);
  renderAdminDashboard();
  showToast('Tahapan Diperbarui', `${proj.id} → ${newStage}`);
}

async function verifyProjectPayment(projId, kind, status) {
  const proj = appState.projects.find(p => p.id === projId);
  if (!proj) return;
  if (kind === 'dp') {
    proj.dpStatus = status;
    if (status === 'Terverifikasi') proj.productionStatus = TRACKER_MILESTONES[4];
    if (status === 'Ditolak') proj.dpRejectReason = 'Bukti transfer belum terbaca / nominal belum sesuai. Silakan unggah ulang.';
  } else {
    proj.pelunasanStatus = status;
    if (status === 'Lunas') proj.productionStatus = TRACKER_MILESTONES[6];
  }
  await syncProjectToCloud(proj);
  renderAdminDashboard();
  showToast('Status Pembayaran Diperbarui', `${proj.id}: ${status}`);
}

function inspectPaymentProof(projId, kind) {
  const proj = appState.projects.find(p => p.id === projId);
  if (!proj) return;
  const name = kind === 'dp' ? proj.dpProofName : proj.pelunasanProofName;
  const url = kind === 'dp' ? proj.dpProofDataUrl : proj.pelunasanProofDataUrl;
  document.getElementById('custom-modal-title').textContent = `Bukti Transfer (${kind === 'dp' ? 'Termin I' : 'Pelunasan'})`;
  document.getElementById('custom-modal-body').innerHTML = `
    <div class="space-y-3">
      <p class="font-mono text-gold">${name || 'Belum ada file terunggah'}</p>
      ${url && (url.startsWith('data:image') || url.startsWith('http'))
        ? `<img src="${url}" alt="Bukti Transfer" class="w-full max-h-96 object-contain rounded-xl border border-borderline bg-obsidian" />`
        : `<p class="text-ash">Pratinjau dokumen PDF/simulasi siap diverifikasi.</p>`}
    </div>
  `;
  const m = document.getElementById('custom-modal');
  m?.classList.remove('hidden');
  m?.classList.add('flex');
}

function closeCustomModal() {
  const m = document.getElementById('custom-modal');
  m?.classList.add('hidden');
  m?.classList.remove('flex');
}

function uploadStudioDeliverable(projId, kind, file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    const proj = appState.projects.find(p => p.id === projId);
    if (!proj) return;
    const cloudUrl = await uploadFileToFirebaseStorage(`deliverables/${projId}_${kind}_${Date.now()}_${file.name}`, file);
    const finalUrl = cloudUrl || reader.result;
    if (kind === 'preview') {
      proj.previewAudioName = file.name;
      proj.previewAudioUrl = finalUrl;
      proj.productionStatus = TRACKER_MILESTONES[5];
    } else {
      proj.masterFileName = file.name;
      proj.masterFileUrl = finalUrl;
    }
    await syncProjectToCloud(proj);
    renderAdminInspector();
    showToast('File Terunggah', `${file.name} berhasil dilampirkan ke ${proj.id}.`);
  };
  reader.readAsDataURL(file);
}

function saveStudioSettings() {
  appState.settings.bankAccount = document.getElementById('set-bank')?.value.trim() || appState.settings.bankAccount;
  appState.settings.studioWhatsApp = document.getElementById('set-wa')?.value.trim() || appState.settings.studioWhatsApp;
  appState.settings.adminPin = document.getElementById('set-pin')?.value.trim() || appState.settings.adminPin;
  syncStudioConfigToCloud();
  showToast('Pengaturan Tersimpan', 'Pengaturan studio diperbarui & tersinkron ke Cloud.');
}

function addPortfolioItem(e) {
  e.preventDefault();
  const title = document.getElementById('pf-new-title').value.trim();
  const category = document.getElementById('pf-new-cat').value;
  const culture = document.getElementById('pf-new-culture').value.trim();
  appState.portfolioItems.unshift({
    id: `PF-${Date.now()}`, title, category, culture, duration: '04:30',
    desc: `Karya ${category} oleh PrangArt Lab (${culture}).`, freq: 293.66
  });
  syncStudioConfigToCloud();
  renderAdminDashboard();
  showToast('Portofolio Ditambahkan', `"${title}" tampil di halaman Portofolio.`);
}

function removePortfolioItem(idx) {
  appState.portfolioItems.splice(idx, 1);
  syncStudioConfigToCloud();
  renderAdminDashboard();
}