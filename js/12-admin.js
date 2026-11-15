function verifyAdminPin(e) {
  e.preventDefault();
  const pin = document.getElementById('admin-pin-input')?.value.trim();
  const validPin = appState.settings.adminPin || '2026';
  if (pin !== validPin) { showToast('PIN Salah', 'PIN Studio tidak sesuai.', 'error'); return; }
  appState.isAdminAuthenticated = true; refreshAdminPageUI();
}

function refreshAdminPageUI() {
  const gate = document.getElementById('admin-pin-gate');
  const ws = document.getElementById('admin-workspace-content');
  if (!appState.isAdminAuthenticated) { gate?.classList.remove('hidden'); ws?.classList.add('hidden'); return; }
  gate?.classList.add('hidden'); ws?.classList.remove('hidden'); renderAdminDashboard();
}

function renderAdminDashboard() {
  const container = document.getElementById('admin-workspace-content');
  if (!container) return;
  const filtered = appState.adminFilterStatus === 'Semua' ? appState.projects : appState.projects.filter(p => p.productionStatus === appState.adminFilterStatus);
  if (!filtered.some(p => p.id === appState.selectedAdminProjectId) && filtered.length > 0) appState.selectedAdminProjectId = filtered[0].id;

  container.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
      <div><span class="text-xs font-mono uppercase text-primary font-bold">Panel Admin</span><h2 class="text-2xl font-display font-bold text-textMain">Pemeriksaan &amp; Produksi</h2></div>
      <div class="flex flex-wrap gap-2">
        ${['Semua', ...TRACKER_MILESTONES].map(st => `<button type="button" onclick="appState.adminFilterStatus = '${st}'; renderAdminDashboard()" class="px-3 py-1.5 rounded-lg text-xs font-bold ${appState.adminFilterStatus === st ? 'bg-primary text-white shadow' : 'bg-surface text-textMuted border border-border hover:text-textMain'}">${st}</button>`).join('')}
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div class="lg:col-span-4 space-y-3">
        ${filtered.map(p => `
          <button type="button" onclick="appState.selectedAdminProjectId = '${p.id}'; renderAdminDashboard()" class="w-full text-left p-5 rounded-2xl border transition ${p.id === appState.selectedAdminProjectId ? 'bg-surface border-primary shadow-sm' : 'bg-surface/50 border-border hover:border-primary/50'}">
            <div class="flex items-center justify-between text-xs font-mono mb-2"><span class="text-primary font-bold">${p.id}</span><span class="text-textMuted">${p.createdAt}</span></div>
            <strong class="text-base font-display font-bold text-textMain block truncate">${p.judul}</strong>
            <span class="text-xs text-textMuted block truncate mt-1">${p.clientName} • ${p.instansi}</span>
            <div class="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs">
              <span class="text-emerald-500 font-bold truncate max-w-[170px]">${p.productionStatus}</span>
              <span class="font-mono text-textMain font-bold">${formatRupiah(p.totalPrice)}</span>
            </div>
          </button>
        `).join('') || '<p class="text-sm text-textMuted text-center py-10">Belum ada proyek.</p>'}
      </div>
      <div id="admin-inspector-panel" class="lg:col-span-8"></div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
      <div class="bg-surface border border-border rounded-3xl p-6 space-y-5">
        <h3 class="text-lg font-display font-bold text-primary">Pengaturan Pembayaran</h3>
        <div class="space-y-4 text-sm">
          <div><label class="block text-xs font-semibold text-textMain mb-1.5">WhatsApp Admin</label><input type="text" id="set-wa" value="${appState.settings.studioWhatsApp}" class="w-full bg-panel border border-border focus:border-primary rounded-xl px-4 py-3 font-mono text-textMain" /></div>
          <div><label class="block text-xs font-semibold text-textMain mb-1.5">PIN Akses Admin</label><input type="text" id="set-pin" value="${appState.settings.adminPin || '2026'}" class="w-full bg-panel border border-border focus:border-primary rounded-xl px-4 py-3 font-mono text-textMain" /></div>
          <div class="pt-4 border-t border-border">
            <label class="block text-xs font-bold text-textMain mb-2">Metode Pembayaran:</label>
            <div class="space-y-2 mb-4">
              ${appState.settings.paymentMethods.map(pm => `
                <div class="flex items-center justify-between bg-panel rounded-xl p-3 border border-border">
                  <div class="flex items-center gap-3"><img src="${pm.logo}" class="h-6 w-auto object-contain bg-white rounded p-0.5" /><span class="text-xs text-textMain font-semibold">${pm.name} - ${pm.number}</span></div>
                  <button type="button" onclick="removePaymentMethod('${pm.id}')" class="text-red-500 text-xs font-bold hover:underline">Hapus</button>
                </div>
              `).join('')}
            </div>
            <div class="bg-base p-4 rounded-xl border border-border space-y-3">
              <select id="new-pm-type" class="w-full bg-panel border border-border rounded-xl px-3 py-2 text-sm text-textMain"><option value="bank">Bank Transfer</option><option value="qris">QRIS / E-Wallet</option></select>
              <input type="text" id="new-pm-name" placeholder="Nama (cth: BCA, Dana)" class="w-full bg-panel border border-border rounded-xl px-3 py-2 text-sm text-textMain" />
              <input type="text" id="new-pm-number" placeholder="No Rekening / No HP" class="w-full bg-panel border border-border rounded-xl px-3 py-2 text-sm text-textMain" />
              <input type="text" id="new-pm-holder" placeholder="Atas Nama" class="w-full bg-panel border border-border rounded-xl px-3 py-2 text-sm text-textMain" />
              <input type="url" id="new-pm-logo" placeholder="URL Logo / QRIS (https://...)" class="w-full bg-panel border border-border rounded-xl px-3 py-2 text-sm text-textMain text-xs" />
              <button type="button" onclick="addPaymentMethod()" class="btn-outline w-full py-2.5 rounded-xl text-xs font-bold">+ Tambah</button>
            </div>
          </div>
          <button type="button" onclick="saveStudioSettings()" class="btn-primary w-full py-3 rounded-xl text-sm font-bold mt-2">Simpan Pengaturan</button>
        </div>
      </div>
      <div class="bg-surface border border-border rounded-3xl p-6 space-y-5">
        <h3 class="text-lg font-display font-bold text-primary">Portofolio Publik</h3>
        <form onsubmit="addPortfolioItem(event)" class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <input type="text" id="pf-new-title" required placeholder="Judul karya..." class="bg-panel border border-border rounded-xl px-4 py-2 text-textMain" />
          <select id="pf-new-cat" class="bg-panel border border-border rounded-xl px-4 py-2 text-textMain"><option value="Produksi Musik Tari">Musik Tari</option><option value="Produksi Musik Non-Tari">Musik Non-Tari</option><option value="Transkripsi Musik">Transkripsi</option></select>
          <input type="text" id="pf-new-culture" required placeholder="Latar budaya..." class="bg-panel border border-border rounded-xl px-4 py-2 text-textMain" />
          <input type="url" id="pf-new-url" placeholder="Link YouTube/Drive..." class="bg-panel border border-border rounded-xl px-4 py-2 text-textMain" />
          <input type="text" id="pf-new-desc" placeholder="Deskripsi..." class="bg-panel border border-border rounded-xl px-4 py-2 text-textMain sm:col-span-2" />
          <button type="submit" class="btn-outline rounded-xl py-2.5 font-bold sm:col-span-2">+ Tambah Karya</button>
        </form>
        <div class="space-y-2 max-h-48 overflow-y-auto">
          ${appState.portfolioItems.map((item, idx) => `<div class="flex items-center justify-between bg-panel rounded-xl px-4 py-3 text-sm"><div><strong class="text-textMain block">${item.title}</strong><span class="text-xs text-textMuted">${item.category}</span></div><button type="button" onclick="removePortfolioItem(${idx})" class="text-red-500 text-xs font-bold">Hapus</button></div>`).join('') || '<p class="text-sm text-textMuted text-center py-4">Belum ada karya.</p>'}
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
  if (!proj) { panel.innerHTML = `<div class="bg-surface border border-border rounded-3xl p-10 text-center text-sm text-textMuted">Pilih proyek untuk melihat detail.</div>`; return; }

  let specHtml = '';
  if (proj.musicalSpec) {
    const spec = proj.musicalSpec;
    if (spec.mode === 'standar' && spec.structures) {
      specHtml = spec.structures.map(s => `<div class="mb-3 last:mb-0 bg-panel p-4 rounded-xl border border-border"><strong class="text-textMain text-sm block mb-1">[${s.time}] ${s.name}:</strong><p class="text-textMuted text-xs mb-2">${s.detail}</p>${s.link ? `<a href="${s.link}" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> Buka Link Drive</a>` : ''}</div>`).join('');
    } else if (spec.mode === 'pro' && spec.scenes) {
      specHtml = spec.scenes.map(s => `<div class="mb-3 last:mb-0 bg-panel p-4 rounded-xl border border-border"><strong class="text-textMain text-sm block mb-1">${s.title}:</strong><p class="text-textMuted text-xs mb-2">${s.detail}</p>${s.link ? `<a href="${s.link}" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> Buka Link Drive</a>` : ''}</div>`).join('');
    } else if (spec.mode === 'dasar') {
      specHtml = `<p class="text-sm"><strong class="text-textMain">Tempo:</strong> <span class="text-textMuted">${spec.bpm} BPM (${spec.mood})</span></p><p class="text-sm mt-1"><strong class="text-textMain">Instrumen:</strong> <span class="text-textMuted">${(spec.instruments || []).join(', ')}</span></p>`;
    } else if (spec.mode === 'transkripsi') {
      specHtml = `<p class="text-sm"><strong class="text-textMain">Format:</strong> <span class="text-textMuted">${spec.format} (${spec.key})</span></p><p class="text-sm mt-1"><strong class="text-textMain">Catatan:</strong> <span class="text-textMuted">${spec.detail}</span></p>`;
    } else if (spec.mode === 'digital') {
      specHtml = `<p class="text-sm"><strong class="text-textMain">Genre:</strong> <span class="text-textMuted">${spec.genre}</span></p><p class="text-sm mt-1"><strong class="text-textMain">Catatan:</strong> <span class="text-textMuted">${spec.detail}</span></p>`;
    }
  }

  panel.innerHTML = `
    <div class="bg-surface border border-border rounded-3xl p-6 sm:p-8 space-y-6">
      <div class="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
        <div>
          <span class="text-xs font-mono text-primary font-bold">${proj.id} • ${proj.serviceLineLabel}</span>
          <h3 class="text-2xl font-display font-bold text-textMain mt-1">${proj.judul}</h3>
          <p class="text-sm text-textMuted">${proj.clientName} (${proj.instansi}) • ${proj.entryPath}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" onclick="openBriefCardModal('${proj.id}')" class="btn-primary px-4 py-2 rounded-xl text-xs font-bold">Kartu Brief</button>
          <button type="button" onclick="openOfficialDocModal('${proj.id}', 'invoice', 'dp')" class="btn-outline px-4 py-2 rounded-xl text-xs font-bold">Invoice</button>
        </div>
      </div>

      <div class="bg-panel border border-border rounded-2xl p-5 space-y-4">
        <div class="flex items-center justify-between"><strong class="text-sm text-primary font-mono uppercase">Penawaran Resmi</strong><span class="text-xs text-textMuted">Status: ${proj.quoteStatus}</span></div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div><label class="block text-xs text-textMuted mb-1">Biaya (Rp)</label><input type="number" id="admin-quote-price" value="${proj.totalPrice}" class="w-full bg-base border border-border rounded-xl px-4 py-2 font-mono text-textMain" /></div>
          <div><label class="block text-xs text-textMuted mb-1">Kedudukan Pihak I</label><select id="admin-composer-role" class="w-full bg-base border border-border rounded-xl px-3 py-2 text-textMain"><option value="Composer" ${(proj.composerRole || '') === 'Composer' ? 'selected' : ''}>Composer</option><option value="Arranger" ${(proj.composerRole || '') === 'Arranger' ? 'selected' : ''}>Arranger</option><option value="Composer & Arranger" ${(proj.composerRole || '') === 'Composer & Arranger' ? 'selected' : ''}>Composer &amp; Arranger</option></select></div>
          <div><label class="block text-xs text-textMuted mb-1">Revisi</label><input type="text" id="admin-quote-rev" value="${proj.revisionQuota || '6'}" class="w-full bg-base border border-border rounded-xl px-4 py-2 font-mono text-textMain" /></div>
        </div>
        <button type="button" onclick="issueOfficialQuotation('${proj.id}')" class="btn-primary w-full py-3 rounded-xl text-sm font-bold">Terbitkan Penawaran &amp; Perjanjian</button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div class="bg-panel border border-border rounded-2xl p-5 space-y-3">
          <div class="flex items-center justify-between text-sm"><strong class="text-textMain">Termin I (${proj.paymentScheme})</strong><span class="font-mono text-primary font-bold">${proj.dpStatus}</span></div>
          <div class="flex flex-wrap gap-2">
            <button type="button" onclick="inspectPaymentProof('${proj.id}', 'dp')" class="btn-outline px-3 py-2 rounded-xl text-xs font-bold">Lihat Bukti</button>
            <button type="button" onclick="verifyProjectPayment('${proj.id}', 'dp', 'Terverifikasi')" class="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">✓ Sah</button>
          </div>
        </div>
        <div class="bg-panel border border-border rounded-2xl p-5 space-y-3">
          <div class="flex items-center justify-between text-sm"><strong class="text-textMain">Termin II (Pelunasan)</strong><span class="font-mono text-primary font-bold">${proj.pelunasanStatus}</span></div>
          <div class="flex flex-wrap gap-2">
            <button type="button" onclick="inspectPaymentProof('${proj.id}', 'lunas')" class="btn-outline px-3 py-2 rounded-xl text-xs font-bold">Lihat Bukti</button>
            <button type="button" onclick="verifyProjectPayment('${proj.id}', 'lunas', 'Lunas')" class="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">✓ Lunas</button>
          </div>
        </div>
      </div>

      <div class="bg-base border border-border rounded-2xl p-5 text-sm space-y-3">
        <strong class="text-primary block border-b border-border pb-2">Rincian Brief &amp; Link Referensi</strong>
        <p><strong class="text-textMain">Sinopsis:</strong> <span class="text-textMuted leading-relaxed">${proj.sinopsis}</span></p>
        <p><strong class="text-textMain">Link Referensi Utama:</strong> <a href="${proj.referensi}" target="_blank" class="text-primary underline font-bold">Buka Link</a></p>
        <div class="pt-2 mt-2 border-t border-border">
          <strong class="text-textMain block mb-2">Spesifikasi Teknis:</strong>
          <div class="text-textMuted space-y-1">${specHtml || 'Tidak ada.'}</div>
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
  proj.quoteStatus = 'Diterbitkan'; proj.productionStatus = TRACKER_MILESTONES[2];
  await syncProjectToCloud(proj); renderAdminDashboard(); showToast('Diterbitkan', 'Klien dapat menyetujui perjanjian.');
}

async function verifyProjectPayment(projId, kind, status) {
  const proj = appState.projects.find(p => p.id === projId);
  if (!proj) return;
  if (kind === 'dp') { proj.dpStatus = status; if (status === 'Terverifikasi') proj.productionStatus = TRACKER_MILESTONES[4]; } 
  else { proj.pelunasanStatus = status; if (status === 'Lunas') proj.productionStatus = TRACKER_MILESTONES[6]; }
  await syncProjectToCloud(proj); renderAdminDashboard(); showToast('Diperbarui', `Status: ${status}`);
}

function inspectPaymentProof(projId, kind) {
  const proj = appState.projects.find(p => p.id === projId);
  if (!proj) return;
  const name = kind === 'dp' ? proj.dpProofName : proj.pelunasanProofName;
  const url = kind === 'dp' ? proj.dpProofDataUrl : proj.pelunasanProofDataUrl;
  document.getElementById('custom-modal-title').textContent = `Bukti Transfer`;
  document.getElementById('custom-modal-body').innerHTML = `<div class="space-y-4"><p class="font-mono text-primary font-bold">${name || 'Belum ada file'}</p>${url && (url.startsWith('data:image') || url.startsWith('http')) ? `<img src="${url}" class="w-full max-h-96 object-contain rounded-xl border border-border bg-base" />` : `<p class="text-textMuted">Pratinjau PDF.</p>`}</div>`;
  document.getElementById('custom-modal')?.classList.remove('hidden'); document.getElementById('custom-modal')?.classList.add('flex');
}

function closeCustomModal() { document.getElementById('custom-modal')?.classList.add('hidden'); document.getElementById('custom-modal')?.classList.remove('flex'); }

function saveStudioSettings() {
  appState.settings.studioWhatsApp = document.getElementById('set-wa')?.value.trim() || appState.settings.studioWhatsApp;
  appState.settings.adminPin = document.getElementById('set-pin')?.value.trim() || appState.settings.adminPin;
  syncStudioConfigToCloud(); showToast('Tersimpan', 'Pengaturan diperbarui.');
}

function addPaymentMethod() {
  const type = document.getElementById('new-pm-type').value;
  const name = document.getElementById('new-pm-name').value.trim();
  const number = document.getElementById('new-pm-number').value.trim();
  const holder = document.getElementById('new-pm-holder').value.trim();
  const logo = document.getElementById('new-pm-logo').value.trim();
  if (!name || !number || !logo) { showToast('Kurang', 'Lengkapi data.', 'warning'); return; }
  appState.settings.paymentMethods.push({ id: `pay-${Date.now()}`, type, name, number, holder, logo });
  syncStudioConfigToCloud(); renderAdminDashboard(); showToast('Berhasil', 'Metode ditambahkan.');
}

function removePaymentMethod(id) {
  appState.settings.paymentMethods = appState.settings.paymentMethods.filter(pm => pm.id !== id);
  syncStudioConfigToCloud(); renderAdminDashboard(); showToast('Dihapus', 'Metode dihapus.');
}

function addPortfolioItem(e) {
  e.preventDefault();
  const title = document.getElementById('pf-new-title').value.trim();
  const category = document.getElementById('pf-new-cat').value;
  const culture = document.getElementById('pf-new-culture').value.trim();
  const mediaUrl = document.getElementById('pf-new-url').value.trim();
  const desc = document.getElementById('pf-new-desc').value.trim();
  appState.portfolioItems.unshift({ id: `PF-${Date.now()}`, title, category, culture, mediaUrl, desc: desc || `Karya ${category}`, duration: '--:--', freq: 293.66 });
  syncStudioConfigToCloud(); renderAdminDashboard(); showToast('Ditambahkan', 'Portofolio tampil.');
  document.getElementById('pf-new-title').value = ''; document.getElementById('pf-new-culture').value = ''; document.getElementById('pf-new-url').value = ''; document.getElementById('pf-new-desc').value = '';
}

function removePortfolioItem(idx) {
  appState.portfolioItems.splice(idx, 1); syncStudioConfigToCloud(); renderAdminDashboard();
}
