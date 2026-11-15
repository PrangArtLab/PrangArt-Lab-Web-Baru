function refreshOrderPageUI() {
  const banner = document.getElementById('order-account-banner');
  if (banner) {
    if (appState.currentClientUser) {
      const u = appState.currentClientUser;
      banner.innerHTML = `<div class="flex items-center gap-2.5"><span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-mono text-[11px] font-bold">✓ Akun Aktif</span><span>Pemesan: <strong>${u.name}</strong></span></div>`;
      const setIfEmpty = (id, val) => {
        const el = document.getElementById(id);
        if (el && !el.value && val) el.value = val;
      };
      setIfEmpty('field-nama', u.name);
      setIfEmpty('field-email', u.email);
      setIfEmpty('field-wa', u.wa);
    } else {
      banner.innerHTML = `<div class="flex flex-wrap items-center gap-2 text-red-500 font-bold">Anda belum masuk. Silakan <button type="button" onclick="openClientAuthModal('login')" class="underline">Masuk</button> terlebih dahulu.</div>`;
    }
  }
  selectServiceLine(appState.selectedServiceLine);
}

function selectServiceLine(svcKey) {
  appState.selectedServiceLine = svcKey;
  document.querySelectorAll('.svc-tab-btn').forEach(btn => {
    btn.className = 'svc-tab-btn p-4 rounded-2xl border border-border bg-panel text-textMuted hover:text-textMain text-left transition-colors duration-300';
  });
  const activeTab = document.getElementById(`svc-tab-${svcKey}`);
  if (activeTab) {
    activeTab.className = 'svc-tab-btn p-4 rounded-2xl border border-primary bg-primary/5 text-textMain text-left transition-colors duration-300 shadow-sm';
  }
  renderPackageCards();
  renderDynamicSpecFields();
  recalculateLivePrice();
}

function renderPackageCards() {
  const grid = document.getElementById('package-cards-grid');
  if (!grid) return;
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  grid.innerHTML = Object.entries(svc.packages).map(([pkgKey, pkg]) => {
    const isSelected = appState.selectedPackage === pkgKey;
    return `
      <button type="button" onclick="selectPackageTier('${pkgKey}')" class="p-4 rounded-2xl border text-left transition flex flex-col justify-between ${isSelected ? 'border-primary bg-primary/10 shadow-sm' : 'border-border bg-panel hover:border-primary/50'}">
        <div>
          <div class="flex items-center justify-between gap-1">
            <span class="text-sm font-bold text-textMain">${pkg.label}</span>
            ${isSelected ? '<span class="text-primary text-sm font-bold">✓</span>' : ''}
          </div>
          <span class="text-base font-mono font-bold text-primary block mt-2">${formatRupiah(pkg.price)}</span>
          <p class="text-xs text-textMuted mt-2 leading-relaxed">${pkg.desc}</p>
        </div>
      </button>
    `;
  }).join('');
}

function selectPackageTier(pkgKey) {
  appState.selectedPackage = pkgKey;
  renderPackageCards();
  renderDynamicSpecFields();
  recalculateLivePrice();
}

function renderDynamicSpecFields() {
  const container = document.getElementById('dynamic-spec-fields');
  if (!container) return;
  const svc = appState.selectedServiceLine;
  const pkg = appState.selectedPackage;

  if (svc === 'tari') {
    if (pkg === 'dasar') {
      container.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label class="block text-xs font-semibold text-textMain mb-1.5">Tempo Utama (BPM) *</label><input type="number" id="spec-dasar-bpm" value="110" min="40" max="240" required class="w-full bg-panel border border-border focus:border-primary rounded-xl px-4 py-3 text-sm font-mono text-textMain focus:outline-none transition-colors duration-300" /></div>
          <div><label class="block text-xs font-semibold text-textMain mb-1.5">Nuansa Dominan *</label><select id="spec-dasar-mood" class="w-full bg-panel border border-border focus:border-primary rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none transition-colors duration-300"><option value="Agung / Sakral">Agung / Sakral</option><option value="Dinamis / Energik">Dinamis / Energik</option><option value="Melankolis / Dramatik">Melankolis / Dramatik</option><option value="Ceria / Pesta Rakyat">Ceria / Pesta Rakyat</option><option value="Mistis / Magis">Mistis / Magis</option></select></div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-semibold text-textMain">Instrumen Utama (Maks 5) *</label>
            <span id="inst-counter" class="text-[11px] font-mono text-primary font-bold">${appState.basicInstruments.length}/5</span>
          </div>
          <div id="inst-input-box" class="flex gap-2">
            <input type="text" id="spec-inst-input" onkeydown="if(event.key==='Enter'){event.preventDefault();addBasicInstrument();}" placeholder="Ketik instrumen..." class="flex-1 bg-panel border border-border focus:border-primary rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none transition-colors duration-300" />
            <button type="button" onclick="addBasicInstrument()" class="btn-outline px-4 py-3 rounded-xl text-xs font-bold">+ Tambah</button>
          </div>
          <div id="inst-tags-list" class="flex flex-wrap gap-2 mt-3"></div>
        </div>
      `;
      renderBasicInstrumentTags();
    } else if (pkg === 'standar') {
      const structures = ['Opening / Pembuka', 'Eksplorasi / Isi', 'Transisi / Jembatan', 'Klimaks / Puncak', 'Ending / Penutup'];
      container.innerHTML = `
        <div class="space-y-4">
          <label class="block text-xs font-semibold text-textMain">Struktur Tari &amp; Timestamp *</label>
          <div class="grid grid-cols-1 gap-3">
            ${structures.map((st, idx) => {
              const checked = idx === 0 || idx === 3;
              return `
                <div class="bg-panel border border-border rounded-2xl p-4 space-y-3 transition-colors duration-300">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" class="std-struct-cb w-5 h-5 accent-primary rounded" data-idx="${idx}" data-name="${st}" ${checked ? 'checked' : ''} onchange="toggleStandarStructCard(${idx})" />
                    <span class="text-sm font-bold text-textMain">${st}</span>
                  </label>
                  <div id="std-struct-fields-${idx}" class="${checked ? 'grid' : 'hidden'} grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                    <div class="sm:col-span-4"><input type="text" id="std-time-${idx}" placeholder="00:00 - 01:30" class="w-full bg-base border border-border focus:border-primary rounded-xl px-3 py-2 text-xs font-mono text-textMain focus:outline-none transition-colors duration-300" /></div>
                    <div class="sm:col-span-8"><input type="url" id="std-link-${idx}" placeholder="Link GDrive referensi bagian ini" class="w-full bg-base border border-border focus:border-primary rounded-xl px-3 py-2 text-xs text-textMain focus:outline-none transition-colors duration-300" /></div>
                    <div class="sm:col-span-12"><textarea id="std-detail-${idx}" rows="2" placeholder="Uraian nuansa pada ${st}..." class="w-full bg-base border border-border focus:border-primary rounded-xl px-3 py-2 text-xs text-textMain focus:outline-none transition-colors duration-300"></textarea></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-semibold text-textMain">Babak / Alur Dramatik *</label>
            <button type="button" onclick="addProSceneBlock()" class="btn-outline px-4 py-2 rounded-xl text-xs font-bold">+ Babak</button>
          </div>
          <div id="pro-scenes-list" class="space-y-3"></div>
        </div>
      `;
      renderProSceneBlocks();
    }
  } else if (svc === 'transkripsi') {
    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div><label class="block text-xs font-semibold text-textMain mb-1.5">Jenis Notasi *</label><select id="spec-trans-format" class="w-full bg-panel border border-border focus:border-primary rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none transition-colors duration-300"><option value="Not Angka & Not Balok">Not Angka &amp; Balok</option><option value="Not Angka Saja">Not Angka Saja</option><option value="Not Balok Saja">Not Balok Saja</option></select></div>
        <div><label class="block text-xs font-semibold text-textMain mb-1.5">Detail Notasi</label><input type="text" id="spec-trans-key" placeholder="Melodi + Akor" class="w-full bg-panel border border-border focus:border-primary rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none transition-colors duration-300" /></div>
        <div><label class="block text-xs font-semibold text-textMain mb-1.5">Format Hasil</label><input type="text" id="spec-trans-meter" placeholder="PDF + Audio" class="w-full bg-panel border border-border focus:border-primary rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none transition-colors duration-300" /></div>
      </div>
      <div><label class="block text-xs font-semibold text-textMain mb-1.5">Instrumen / Jalur Suara *</label><textarea id="spec-trans-detail" rows="3" required class="w-full bg-panel border border-border focus:border-primary rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none transition-colors duration-300"></textarea></div>
    `;
  } else {
    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label class="block text-xs font-semibold text-textMain mb-1.5">Konsep &amp; Genre *</label><input type="text" id="spec-dig-genre" required placeholder="Pop Orkestra" class="w-full bg-panel border border-border focus:border-primary rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none transition-colors duration-300" /></div>
        <div><label class="block text-xs font-semibold text-textMain mb-1.5">Durasi &amp; Tempo</label><input type="text" id="spec-dig-tempo" placeholder="120 BPM - G Mayor" class="w-full bg-panel border border-border focus:border-primary rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none transition-colors duration-300" /></div>
      </div>
      <div><label class="block text-xs font-semibold text-textMain mb-1.5">Karakter &amp; Kebutuhan Rekaman *</label><textarea id="spec-dig-detail" rows="3" required class="w-full bg-panel border border-border focus:border-primary rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none transition-colors duration-300"></textarea></div>
    `;
  }
}

function addBasicInstrument() {
  const inp = document.getElementById('spec-inst-input');
  const val = inp?.value.trim();
  if (!val) return;
  if (appState.basicInstruments.length >= 5) {
    const box = document.getElementById('inst-input-box');
    box?.classList.remove('shake-error');
    void box?.offsetWidth;
    box?.classList.add('shake-error');
    showToast('Batas', 'Maksimal 5 instrumen.', 'warning');
    return;
  }
  appState.basicInstruments.push(val);
  inp.value = '';
  renderBasicInstrumentTags();
}

function removeBasicInstrument(idx) {
  appState.basicInstruments.splice(idx, 1);
  renderBasicInstrumentTags();
}

function renderBasicInstrumentTags() {
  const list = document.getElementById('inst-tags-list');
  const counter = document.getElementById('inst-counter');
  if (counter) counter.textContent = `${appState.basicInstruments.length}/5`;
  if (!list) return;
  list.innerHTML = appState.basicInstruments.map((inst, i) => `
    <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
      <span>${inst}</span>
      <button type="button" onclick="removeBasicInstrument(${i})" class="hover:text-red-500 text-sm">×</button>
    </span>
  `).join('');
}

function toggleStandarStructCard(idx) {
  const cb = document.querySelector(`.std-struct-cb[data-idx="${idx}"]`);
  const fields = document.getElementById(`std-struct-fields-${idx}`);
  if (!fields) return;
  if (cb?.checked) { fields.classList.remove('hidden'); fields.classList.add('grid'); } 
  else { fields.classList.add('hidden'); fields.classList.remove('grid'); }
}

function addProSceneBlock() {
  appState.proScenes.push({ title: `Babak ${appState.proScenes.length + 1}`, detail: '', link: '' });
  renderProSceneBlocks();
}

function removeProSceneBlock(idx) {
  if (appState.proScenes.length <= 1) return;
  appState.proScenes.splice(idx, 1);
  renderProSceneBlocks();
}

function renderProSceneBlocks() {
  const list = document.getElementById('pro-scenes-list');
  if (!list) return;
  list.innerHTML = appState.proScenes.map((sc, idx) => `
    <div class="bg-panel border border-border rounded-2xl p-4 space-y-3 transition-colors duration-300">
      <div class="flex items-center justify-between gap-3">
        <input type="text" value="${sc.title}" oninput="appState.proScenes[${idx}].title = this.value" class="flex-1 bg-base border border-border focus:border-primary rounded-xl px-4 py-2 text-sm font-bold text-textMain focus:outline-none transition-colors duration-300" />
        ${idx > 0 ? `<button type="button" onclick="removeProSceneBlock(${idx})" class="text-red-500 text-xs px-3 py-2 hover:bg-red-500/10 rounded-lg font-bold">Hapus</button>` : ''}
      </div>
      <textarea rows="2" oninput="appState.proScenes[${idx}].detail = this.value" placeholder="Uraian alur..." class="w-full bg-base border border-border focus:border-primary rounded-xl px-4 py-2 text-sm text-textMain focus:outline-none transition-colors duration-300">${sc.detail}</textarea>
      <input type="url" value="${sc.link}" oninput="appState.proScenes[${idx}].link = this.value" placeholder="Link GDrive (opsional)" class="w-full bg-base border border-border focus:border-primary rounded-xl px-4 py-2 text-sm text-textMain focus:outline-none transition-colors duration-300" />
    </div>
  `).join('');
}

function recalculateLivePrice() {
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  const pkg = svc.packages[appState.selectedPackage];
  const addonPriceLabelEl = document.getElementById('addon-vocal-price-label');
  if (addonPriceLabelEl) addonPriceLabelEl.textContent = `+${formatRupiah(svc.addonPrice)}`;
  const addonChecked = Boolean(document.getElementById('field-addon-vocal')?.checked);
  const addonCost = addonChecked ? svc.addonPrice : 0;
  const total = pkg.price + addonCost;
  const plan = document.querySelector('input[name="payment-plan"]:checked')?.value || 'DP 50%';
  const firstInstallment = plan === 'DP 50%' ? Math.round(total * 0.5) : total;

  document.getElementById('calc-service-name').textContent = svc.label;
  document.getElementById('calc-pkg-name').textContent = pkg.label;
  document.getElementById('calc-pkg-price').textContent = formatRupiah(pkg.price);

  const addonRow = document.getElementById('calc-addon-row');
  if (addonChecked) {
    addonRow.classList.remove('hidden');
    addonRow.classList.add('flex');
    document.getElementById('calc-addon-label').textContent = svc.addonLabel;
    document.getElementById('calc-addon-price').textContent = `+${formatRupiah(addonCost)}`;
  } else {
    addonRow.classList.add('hidden');
    addonRow.classList.remove('flex');
  }

  document.getElementById('calc-total-price').textContent = formatRupiah(total);
  document.getElementById('calc-terbilang-total').textContent = `Terbilang: ${numberToIndonesianWords(total)} Rupiah`;
  document.getElementById('calc-plan-title').textContent = plan === 'DP 50%' ? 'DP 50% (Setelah Penawaran)' : 'Penuh 100% (Setelah Penawaran)';
  document.getElementById('calc-dp-price').textContent = formatRupiah(firstInstallment);
  document.getElementById('calc-terbilang-dp').textContent = `Terbilang: ${numberToIndonesianWords(firstInstallment)} Rupiah`;
}

function copyBankAccount() {
  const txt = appState.settings.paymentMethods[0].number; // Fallback
  const tmp = document.createElement('textarea'); tmp.value = txt; document.body.appendChild(tmp); tmp.select(); document.execCommand('copy'); tmp.remove();
  showToast('Disalin', txt);
}

async function generateAISynopsis(isVariation = false) {
  const judul = document.getElementById('field-judul')?.value.trim();
  const jenis = document.getElementById('field-jenis-tari')?.value.trim();
  const budaya = document.getElementById('field-budaya')?.value.trim();
  const sinopsisEl = document.getElementById('field-sinopsis');
  const btn = document.getElementById('btn-ai-synopsis');

  if (!judul || !jenis) {
    showToast('Data Kurang', 'Isi Judul dan Jenis Karya.', 'warning');
    return;
  }
  if (!isVariation && sinopsisEl.value.trim()) appState.previousSynopsisBackup = sinopsisEl.value;

  btn.disabled = true; btn.textContent = 'Menyusun...';
  const prompt = `Buatkan sinopsis singkat (maks 90 kata) karya "${judul}" kategori "${jenis}" latar "${budaya || 'Nusantara'}". ${isVariation ? 'Gunakan narasi berbeda.' : ''}`;

  try {
    if (!window.firebaseAI) throw new Error('Firebase AI Logic belum siap.');
    const { getGenerativeModel, GoogleAIBackend } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-ai.js");
    const model = getGenerativeModel(window.firebaseAI, { model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    sinopsisEl.value = (await result.response).text();
  } catch (error) {
    console.warn('AI Error:', error);
    const variants = [
      `Karya "${judul}" menghadirkan alur dramatik berakar pada ${budaya || 'budaya Nusantara'} dalam balutan ${jenis}. Bagian pembuka mengalir tenang membangun suasana sebelum meningkat menuju dinamika ritmis yang tegas.`,
      `Terinspirasi dari nilai ${budaya || 'tradisi lokal'}, "${judul}" merangkai ekspresi ${jenis} yang memadukan kehalusan rasa dan kekuatan tempo.`
    ];
    sinopsisEl.value = variants[isVariation ? 1 : 0];
    showToast('Mode Cadangan', 'Menggunakan draf lokal.', 'warning');
  } finally {
    btn.disabled = false; btn.textContent = '✦ Generate AI';
    const bar = document.getElementById('ai-synopsis-toolbar');
    bar?.classList.remove('hidden'); bar?.classList.add('flex');
  }
}

function restorePreviousSynopsis() {
  const sinopsisEl = document.getElementById('field-sinopsis');
  if (sinopsisEl && appState.previousSynopsisBackup) {
    sinopsisEl.value = appState.previousSynopsisBackup;
  }
}

function collectOrderMusicalSpec() {
  const svc = appState.selectedServiceLine;
  const pkg = appState.selectedPackage;
  if (svc === 'tari') {
    if (pkg === 'dasar') return { mode: 'dasar', bpm: document.getElementById('spec-dasar-bpm')?.value || '110', mood: document.getElementById('spec-dasar-mood')?.value || 'Dinamis', instruments: [...appState.basicInstruments] };
    if (pkg === 'standar') {
      const structures = [];
      document.querySelectorAll('.std-struct-cb:checked').forEach(cb => {
        const idx = cb.dataset.idx;
        structures.push({ name: cb.dataset.name, time: document.getElementById(`std-time-${idx}`)?.value || '-', detail: document.getElementById(`std-detail-${idx}`)?.value || '-', link: document.getElementById(`std-link-${idx}`)?.value || '' });
      });
      return { mode: 'standar', structures };
    }
    return { mode: 'pro', scenes: structuredClone(appState.proScenes) };
  }
  if (svc === 'transkripsi') return { mode: 'transkripsi', format: document.getElementById('spec-trans-format')?.value || 'Not Angka', key: document.getElementById('spec-trans-key')?.value || '-', meter: document.getElementById('spec-trans-meter')?.value || '-', detail: document.getElementById('spec-trans-detail')?.value || '-' };
  return { mode: 'digital', genre: document.getElementById('spec-dig-genre')?.value || '-', tempo: document.getElementById('spec-dig-tempo')?.value || '-', detail: document.getElementById('spec-dig-detail')?.value || '-' };
}

async function handleOrderFormSubmit(e) {
  e.preventDefault();
  if (!appState.currentClientUser) { showToast('Akses Ditolak', 'Masuk terlebih dahulu.', 'warning'); navigateTo('client'); return; }

  const entryPath = document.querySelector('input[name="entry-path"]:checked')?.value || 'Jalur A';
  const paymentScheme = document.querySelector('input[name="payment-plan"]:checked')?.value || 'DP 50%';
  const nama = document.getElementById('field-nama').value.trim();
  const email = document.getElementById('field-email').value.trim().toLowerCase();
  const wa = document.getElementById('field-wa').value.trim();
  const kota = document.getElementById('field-kota').value.trim();
  const alamat = document.getElementById('field-alamat')?.value.trim() || kota;
  const nik = document.getElementById('field-nik')?.value.trim() || '';
  const instansi = document.getElementById('field-instansi').value.trim();
  const koreografer = document.getElementById('field-koreografer').value.trim();
  const judul = document.getElementById('field-judul').value.trim();
  const jenisTari = document.getElementById('field-jenis-tari').value.trim();
  const budaya = document.getElementById('field-budaya').value.trim();
  const durasi = document.getElementById('field-durasi').value.trim();
  const referensi = document.getElementById('field-referensi').value.trim();
  const sinopsis = document.getElementById('field-sinopsis').value.trim();

  const svcObj = appState.serviceCatalog[appState.selectedServiceLine];
  const pkgObj = svcObj.packages[appState.selectedPackage];
  const addonSelected = Boolean(document.getElementById('field-addon-vocal')?.checked);
  const addonPrice = addonSelected ? svcObj.addonPrice : 0;
  const totalPrice = pkgObj.price + addonPrice;
  const dpAmount = paymentScheme === 'DP 50%' ? Math.round(totalPrice * 0.5) : totalPrice;

  const seqNum = String(Math.floor(100 + Math.random() * 899));
  const ticketId = `PAL-2026-${seqNum}`;
  const nowDate = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  const newProject = {
    id: ticketId, createdTs: Date.now(), createdAt: nowDate, entryPath,
    clientEmail: email, clientName: nama, instansi, kota, alamat, nik, wa,
    serviceLine: appState.selectedServiceLine, serviceLineLabel: svcObj.label,
    packageKey: appState.selectedPackage, packageName: pkgObj.label,
    addonSelected, addonLabel: svcObj.addonLabel, addonPrice: svcObj.addonPrice, basePrice: pkgObj.price,
    totalPrice, dpAmount, paymentScheme, judul, koreografer, jenisTari, budaya, durasi, referensi, sinopsis,
    musicalSpec: collectOrderMusicalSpec(),
    contractNumber: `${seqNum}/PAL-SPK/XI/2026`, composerRole: 'Composer & Arranger',
    musicFileTitle: judul.replace(/\s+/g, '_') + '_Final',
    deliverableFormat: appState.selectedServiceLine === 'transkripsi' ? 'PDF Partitur & Audio Panduan' : 'WAV 24-bit & MP3 320kbps',
    revisionQuota: appState.selectedPackage === 'dasar' ? '3' : appState.selectedPackage === 'standar' ? '6' : 'Sesuai kesepakatan',
    thirdPartyMaterial: 'Tidak ada', collaboratorNotes: 'Tidak ada kontributor tambahan',
    rawFilesIncluded: false, rawFilesDetail: '', extraAttachmentNotes: '-', courtCity: 'Samarinda',
    quoteStatus: 'Menunggu Pemeriksaan', quoteDurationDays: '7-10 Hari Kerja',
    quoteDeliverables: 'Sesuai Lampiran A', quoteNotes: '',
    agreementSigned: false, agreementSignedAt: '',
    dpStatus: 'Belum Dibayar', dpRejectReason: '', dpProofName: '', dpProofDataUrl: '',
    pelunasanStatus: paymentScheme === 'Pembayaran Penuh 100%' ? 'Tidak Perlu' : 'Belum Lunas',
    pelunasanProofName: '', pelunasanProofDataUrl: '',
    productionStatus: TRACKER_MILESTONES[0], previewAudioName: '', previewAudioUrl: '',
    masterFileName: '', masterFileUrl: '', clientAcceptedFinal: false
  };

  appState.projects.unshift(newProject);
  appState.activeBriefProjectId = ticketId;
  appState.selectedClientProjectId = ticketId;
  appState.selectedAdminProjectId = ticketId;
  await syncProjectToCloud(newProject);

  const briefDataUrl = await generateBriefCardPNGDataUrl(newProject);
  triggerPngFileDownload(briefDataUrl, `Kartu-Brief-${ticketId}.png`);
  showToast('Pengajuan Terkirim', 'Kartu Brief otomatis terunduh.');
  
  document.getElementById('order-form-container').classList.add('hidden');
  document.getElementById('mobile-sticky-bar')?.classList.add('hidden');
  document.getElementById('order-success-container').classList.remove('hidden');
  document.getElementById('success-ticket-id').textContent = ticketId;
  document.getElementById('brief-card-preview-img').src = briefDataUrl;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
