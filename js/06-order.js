function refreshOrderPageUI() {
  if (!appState.currentClientUser) return; 
  const setIf = (id, val) => { const el = document.getElementById(id); if (el && !el.value && val) el.value = val; };
  setIf('field-nama', appState.currentClientUser.name);
  selectServiceLine(appState.selectedServiceLine);
}

function setSynopsisMode(mode) {
  appState.synopsisMode = mode;
  const btnManual = document.getElementById('btn-mode-manual');
  const btnAi = document.getElementById('btn-mode-ai');
  const aiWrap = document.getElementById('ai-action-wrapper');
  if(!btnManual || !btnAi || !aiWrap) return;

  if (mode === 'manual') {
    btnManual.className = 'px-3 py-1 rounded-md text-[10px] font-bold bg-surface text-textMain shadow-sm';
    btnAi.className = 'px-3 py-1 rounded-md text-[10px] font-bold text-textMuted';
    aiWrap.classList.add('hidden');
  } else {
    btnAi.className = 'px-3 py-1 rounded-md text-[10px] font-bold bg-surface text-textMain shadow-sm';
    btnManual.className = 'px-3 py-1 rounded-md text-[10px] font-bold text-textMuted';
    aiWrap.classList.remove('hidden');
  }
}

function selectServiceLine(svcKey) {
  appState.selectedServiceLine = svcKey; 
  appState.customPrice = null;
  const inp = document.getElementById('custom-price-input');
  if(inp) inp.value = '';
  
  document.querySelectorAll('.svc-tab-btn').forEach(b => b.className = 'svc-tab-btn p-4 rounded-2xl border border-border bg-panel text-textMuted text-left');
  const active = document.getElementById(`svc-tab-${svcKey}`);
  if(active) active.className = 'svc-tab-btn p-4 rounded-2xl border border-primary bg-primary/10 text-primary text-left shadow-glow';
  
  renderPackageCards(); renderDynamicSpecFields(); recalculateLivePrice();
}

function renderPackageCards() {
  const grid = document.getElementById('package-cards-grid'); if(!grid) return;
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  
  grid.innerHTML = Object.entries(svc.packages).map(([k, p]) => {
    const sel = appState.selectedPackage === k && !appState.customPrice;
    return `<button type="button" onclick="selectPackageTier('${k}')" class="p-5 rounded-2xl border text-left flex flex-col justify-between h-full ${sel ? 'border-primary bg-primary/10' : 'border-border bg-surface'}">
      <div class="mb-3">
        <span class="text-sm font-bold text-textMain block">${p.label}</span>
        <span class="text-lg font-mono text-primary block mt-1">${formatRupiah(p.price)}</span>
      </div>
      <span class="text-[11px] text-textMuted leading-relaxed">${p.desc}</span>
    </button>`;
  }).join('');
}

function selectPackageTier(k) { appState.selectedPackage = k; appState.customPrice = null; document.getElementById('custom-price-input').value = ''; renderPackageCards(); renderDynamicSpecFields(); recalculateLivePrice(); }
function handleCustomPrice(v) { appState.customPrice = (v && Number(v) > 0) ? Number(v) : null; renderPackageCards(); renderDynamicSpecFields(); recalculateLivePrice(); }

/* === SPESIFIKASI DINAMIS (SESUAI LAYANAN) === */
function renderDynamicSpecFields() {
  const c = document.getElementById('dynamic-spec-fields'); if(!c) return;
  const svc = appState.selectedServiceLine;
  
  let standardFields = '';
  
  if (svc === 'tari') {
    standardFields = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div><label class="block text-xs font-bold mb-2">Tema Pertunjukan *</label><input id="spec-tema" required class="w-full bg-panel border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Legenda Nusantara / Kepahlawanan"/></div>
        <div><label class="block text-xs font-bold mb-2">Nuansa / Suasana *</label><input id="spec-nuansa" required class="w-full bg-panel border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Megah, Misterius, Ceria"/></div>
        <div><label class="block text-xs font-bold mb-2">Gaya Musik *</label><input id="spec-gaya" required class="w-full bg-panel border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Tradisional Modern, Etnik / Orkestra"/></div>
        <div><label class="block text-xs font-bold mb-2">Properti / Kostum (Opsional)</label><input id="spec-properti" class="w-full bg-panel border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Kipas, Selendang, Tombak"/></div>
      </div>
    `;
  } else if (svc === 'digital') {
    standardFields = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div><label class="block text-xs font-bold mb-2">Tema Lagu / Karya *</label><input id="spec-tema" required class="w-full bg-panel border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Perpisahan, Semangat Pantang Menyerah"/></div>
        <div><label class="block text-xs font-bold mb-2">Gaya Musik / Genre *</label><input id="spec-gaya" required class="w-full bg-panel border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Pop Akustik, EDM, Rock"/></div>
        <div><label class="block text-xs font-bold mb-2">Nuansa / Mood *</label><input id="spec-nuansa" required class="w-full bg-panel border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Melankolis, Ceria, Epik"/></div>
        <div><label class="block text-xs font-bold mb-2">Referensi Artis / Lagu (Opsional)</label><input id="spec-referensi" class="w-full bg-panel border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Mirip lagu X dari artis Y"/></div>
      </div>
    `;
  } else if (svc === 'transkripsi') {
    standardFields = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div><label class="block text-xs font-bold mb-2">Instrumen yang Ditranskripsi *</label><input id="spec-instrumen" required class="w-full bg-panel border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Vokal Solo, Piano, Kendang"/></div>
        <div><label class="block text-xs font-bold mb-2">Format Notasi *</label>
          <select id="spec-format" required class="w-full bg-panel border rounded-xl px-4 py-3 text-sm">
            <option value="Not Angka">Not Angka</option>
            <option value="Not Balok">Not Balok</option>
            <option value="Keduanya (Angka & Balok)">Keduanya (Angka & Balok)</option>
          </select>
        </div>
        <div class="sm:col-span-2"><label class="block text-xs font-bold mb-2">Kebutuhan File Tambahan (Opsional)</label><input id="spec-tambahan" class="w-full bg-panel border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Butuh file MIDI / Sibelius"/></div>
      </div>
    `;
  }

  c.innerHTML = standardFields + `
    <div class="flex justify-between items-center mb-3 mt-6 pt-6 border-t border-border/60">
      <label class="text-xs font-bold text-textMain">Catatan Spesifikasi Tambahan (Opsional)</label>
      <button type="button" onclick="addSpecFieldRow()" class="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition">+ Tambah Baris</button>
    </div>
    <div id="spec-rows-container" class="space-y-3">
      ${specRowTemplate('', '')}
    </div>
  `;
}

function specRowTemplate(key = '', val = '') {
  return `
    <div class="flex gap-2 items-center spec-row">
      <input type="text" placeholder="Label Kustom" value="${key}" class="w-1/3 bg-panel border border-border rounded-xl px-3 py-2.5 text-sm spec-key" />
      <input type="text" placeholder="Detail Kebutuhan" value="${val}" class="flex-1 bg-panel border border-border rounded-xl px-3 py-2.5 text-sm spec-val" />
      <button type="button" onclick="this.parentElement.remove()" class="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition" aria-label="Hapus">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      </button>
    </div>
  `;
}

function addSpecFieldRow() {
  const container = document.getElementById('spec-rows-container');
  if (container) container.insertAdjacentHTML('beforeend', specRowTemplate());
}

function recalculateLivePrice() {
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  const pkg = svc.packages[appState.selectedPackage];
  const base = appState.customPrice || pkg.price;
  const addon = document.getElementById('field-addon-vocal')?.checked ? svc.addonPrice : 0;
  
  if(document.getElementById('calc-service-name')) {
    document.getElementById('calc-service-name').textContent = svc.label;
    document.getElementById('calc-pkg-name').textContent = appState.customPrice ? 'Harga Kesepakatan' : pkg.label;
    document.getElementById('calc-pkg-price').textContent = formatRupiah(base);
    document.getElementById('calc-total-price').textContent = formatRupiah(base + addon);
    document.getElementById('calc-addon-label').parentElement.classList.toggle('hidden', addon === 0);
    if(addon > 0) document.getElementById('calc-addon-price').textContent = '+ ' + formatRupiah(addon);
  }
}

async function generateAISynopsis() {
  const judul = document.getElementById('field-judul').value;
  if (!judul) return showToast('Info', 'Isi judul dulu.', 'warning');
  const btn = document.getElementById('btn-ai-synopsis'); btn.textContent = 'Menyusun...'; btn.disabled = true;
  try {
    if (!window.firebaseAI) throw new Error();
    const { getGenerativeModel } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-ai.js');
    const res = await getGenerativeModel(window.firebaseAI, { model: "gemini-1.5-flash" }).generateContent(`Buat sinopsis tari/lagu "${judul}".`);
    document.getElementById('field-sinopsis').value = (await res.response).text();
  } catch { document.getElementById('field-sinopsis').value = `Karya "${judul}" yang memukau. (Mode Offline)`; }
  finally { btn.textContent = '✦ Generate Sinopsis AI'; btn.disabled = false; }
}

async function handleOrderFormSubmit(e) {
  e.preventDefault();
  if (!appState.currentClientUser) return navigateTo('client');
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  const pkg = svc.packages[appState.selectedPackage];
  const total = (appState.customPrice || pkg.price) + (document.getElementById('field-addon-vocal').checked ? svc.addonPrice : 0);
  
  const specs = [];
  
  // Ambil spesifikasi standar (tergantung layanan)
  if (appState.selectedServiceLine === 'tari') {
    specs.push({ key: 'Tema Pertunjukan', val: document.getElementById('spec-tema').value });
    specs.push({ key: 'Nuansa / Suasana', val: document.getElementById('spec-nuansa').value });
    specs.push({ key: 'Gaya Musik', val: document.getElementById('spec-gaya').value });
    const prop = document.getElementById('spec-properti').value;
    if(prop) specs.push({ key: 'Properti / Kostum', val: prop });
  } else if (appState.selectedServiceLine === 'digital') {
    specs.push({ key: 'Tema Lagu', val: document.getElementById('spec-tema').value });
    specs.push({ key: 'Gaya Musik / Genre', val: document.getElementById('spec-gaya').value });
    specs.push({ key: 'Nuansa / Mood', val: document.getElementById('spec-nuansa').value });
    const ref = document.getElementById('spec-referensi').value;
    if(ref) specs.push({ key: 'Referensi Artis', val: ref });
  } else if (appState.selectedServiceLine === 'transkripsi') {
    specs.push({ key: 'Instrumen', val: document.getElementById('spec-instrumen').value });
    specs.push({ key: 'Format Notasi', val: document.getElementById('spec-format').value });
    const tambahan = document.getElementById('spec-tambahan').value;
    if(tambahan) specs.push({ key: 'File Tambahan', val: tambahan });
  }

  // Ambil spesifikasi tambahan (baris manual)
  document.querySelectorAll('.spec-row').forEach(row => {
    const key = row.querySelector('.spec-key').value.trim();
    const val = row.querySelector('.spec-val').value.trim();
    if (key || val) specs.push({ key, val });
  });

  const videoLink = document.getElementById('field-video-link')?.value || '';
  const videoFileInput = document.getElementById('field-video-file');
  const videoFileName = videoFileInput?.files[0] ? videoFileInput.files[0].name : '';

  const newP = { 
    id: `PAL-${Date.now()}`, 
    clientEmail: appState.currentClientUser.email, 
    clientName: appState.currentClientUser.name, 
    judul: document.getElementById('field-judul').value, 
    serviceLine: appState.selectedServiceLine, 
    serviceLineLabel: svc.label, 
    packageName: appState.customPrice ? 'Kustom' : pkg.label, 
    totalPrice: total, 
    dpAmount: total/2, 
    dpStatus: 'Belum Dibayar', 
    productionStatus: TRACKER_MILESTONES[0],
    specs: specs,
    videoLink: videoLink,
    videoFileName: videoFileName
  };
  
  appState.projects.unshift(newP); await syncProjectToCloud(newP);
  showToast('Berhasil', 'Pesanan dibuat.'); navigateTo('client');
}
