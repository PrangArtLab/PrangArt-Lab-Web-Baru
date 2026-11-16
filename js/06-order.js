function refreshOrderPageUI() {
  const banner = document.getElementById('order-account-banner');
  if (banner && appState.currentClientUser) {
    banner.innerHTML = `<span class="text-emerald-500 font-bold">✓ Akun Aktif:</span> <strong>${appState.currentClientUser.name}</strong>`;
    const setIfEmpty = (id, val) => { const el = document.getElementById(id); if (el && !el.value && val) el.value = val; };
    setIfEmpty('field-nama', appState.currentClientUser.name);
  }
  selectServiceLine(appState.selectedServiceLine);
}

function setSynopsisMode(mode) {
  appState.synopsisMode = mode;
  const btnManual = document.getElementById('btn-mode-manual');
  const btnAi = document.getElementById('btn-mode-ai');
  const aiWrapper = document.getElementById('ai-action-wrapper');
  
  if (mode === 'manual') {
    btnManual.className = 'px-3 py-1 rounded-md text-[10px] font-bold bg-surface text-textMain shadow-sm';
    btnAi.className = 'px-3 py-1 rounded-md text-[10px] font-bold text-textMuted';
    aiWrapper.classList.add('hidden');
  } else {
    btnAi.className = 'px-3 py-1 rounded-md text-[10px] font-bold bg-surface text-textMain shadow-sm';
    btnManual.className = 'px-3 py-1 rounded-md text-[10px] font-bold text-textMuted';
    aiWrapper.classList.remove('hidden');
  }
}

function selectServiceLine(svcKey) {
  appState.selectedServiceLine = svcKey;
  appState.customPrice = null;
  const customInp = document.getElementById('custom-price-input');
  if(customInp) customInp.value = '';
  
  document.querySelectorAll('.svc-tab-btn').forEach(btn => btn.className = 'svc-tab-btn p-4 rounded-2xl border border-border bg-panel text-textMuted hover:text-textMain text-left');
  document.getElementById(`svc-tab-${svcKey}`).className = 'svc-tab-btn p-4 rounded-2xl border border-primary bg-primary/10 text-primary text-left shadow-glow';
  
  renderPackageCards(); 
  renderDynamicSpecFields(); 
  recalculateLivePrice();
}

function renderPackageCards() {
  const grid = document.getElementById('package-cards-grid');
  if (!grid) return;
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  grid.innerHTML = Object.entries(svc.packages).map(([pkgKey, pkg]) => {
    const isSelected = appState.selectedPackage === pkgKey && !appState.customPrice;
    return `
      <button type="button" onclick="selectPackageTier('${pkgKey}')" class="p-5 rounded-2xl border text-left transition-all duration-300 ${isSelected ? 'border-primary bg-primary/10 shadow-md' : 'border-border bg-surface hover:border-primary/40'}">
        <span class="text-sm font-bold text-textMain block">${pkg.label}</span>
        <span class="text-lg font-mono font-bold text-primary block mt-1">${formatRupiah(pkg.price)}</span>
      </button>`;
  }).join('');
}

function selectPackageTier(pkgKey) {
  appState.selectedPackage = pkgKey; 
  appState.customPrice = null;
  document.getElementById('custom-price-input').value = '';
  renderPackageCards(); 
  renderDynamicSpecFields(); 
  recalculateLivePrice();
}

function handleCustomPrice(val) {
  if (val && Number(val) > 0) appState.customPrice = Number(val);
  else appState.customPrice = null;
  renderPackageCards(); 
  renderDynamicSpecFields(); // Tampilkan spesifikasi custom
  recalculateLivePrice();
}

function renderDynamicSpecFields() {
  const container = document.getElementById('dynamic-spec-fields');
  if (!container) return;
  
  // Jika memilih Custom Price
  if (appState.customPrice) {
    container.innerHTML = `
      <div class="p-5 rounded-2xl bg-surface border border-primary/30">
         <h4 class="font-bold text-textMain mb-3 text-sm">Spesifikasi Custom</h4>
         <textarea id="spec-custom-detail" rows="3" placeholder="Jelaskan kebutuhan khusus Anda karena menggunakan harga kesepakatan..." class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm"></textarea>
      </div>`;
    return;
  }

  const svc = appState.selectedServiceLine;
  const pkg = appState.selectedPackage;

  // Tampilkan sesuai paket standar
  if (svc === 'tari') {
    if (pkg === 'dasar') {
      container.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 gap-5"><div><label class="block text-xs font-bold mb-2">Tempo Utama (BPM)</label><input type="number" id="spec-dasar-bpm" value="110" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" /></div><div><label class="block text-xs font-bold mb-2">Nuansa Dominan</label><select class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm"><option>Agung / Sakral</option><option>Dinamis</option></select></div></div>`;
    } else if (pkg === 'standar') {
       container.innerHTML = `<p class="text-xs text-textMuted">Isi detail waktu (timestamp) dan link Google Drive referensi per bagian.</p><div class="space-y-3 mt-3"><input type="text" placeholder="00:00 - 01:30 (Opening)" class="w-full bg-panel border border-border rounded-lg px-3 py-2 text-xs" /><input type="url" placeholder="Link GDrive (opsional)" class="w-full bg-panel border border-border rounded-lg px-3 py-2 text-xs" /></div>`;
    } else {
       container.innerHTML = `<p class="text-xs text-textMuted">Rincian Babak & Link Drive.</p><div class="space-y-3 mt-3"><input type="text" placeholder="Babak 1" class="w-full bg-panel border border-border rounded-lg px-3 py-2 text-xs font-bold" /><textarea rows="2" placeholder="Detail alur..." class="w-full bg-panel border border-border rounded-lg px-3 py-2 text-xs"></textarea></div>`;
    }
  } else if (svc === 'transkripsi') {
    container.innerHTML = `<div class="grid grid-cols-1 gap-4"><div><label class="block text-xs font-bold mb-2">Jenis Notasi</label><select class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm"><option>Not Angka & Balok</option></select></div><div><label class="block text-xs font-bold mb-2">Instrumen</label><textarea rows="2" placeholder="Contoh: Vokal SATB, Piano" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm"></textarea></div></div>`;
  } else {
    container.innerHTML = `<div class="grid grid-cols-1 gap-4"><div><label class="block text-xs font-bold mb-2">Konsep & Genre</label><input type="text" placeholder="Pop, Orkestra, dll" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" /></div></div>`;
  }
}

function recalculateLivePrice() {
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  const pkg = svc.packages[appState.selectedPackage];
  const basePrice = appState.customPrice ? appState.customPrice : pkg.price;
  const addonChecked = Boolean(document.getElementById('field-addon-vocal')?.checked);
  const addonCost = addonChecked ? svc.addonPrice : 0;
  const total = basePrice + addonCost;
  
  document.getElementById('calc-service-name').textContent = svc.label;
  document.getElementById('calc-pkg-name').textContent = appState.customPrice ? 'Harga Kesepakatan' : pkg.label;
  document.getElementById('calc-pkg-price').textContent = formatRupiah(basePrice);
  
  const addonRow = document.getElementById('calc-addon-label');
  if(addonChecked) {
    addonRow.parentElement.classList.remove('hidden');
    addonRow.textContent = 'Tambahan Vokal';
    document.getElementById('calc-addon-price').textContent = '+ ' + formatRupiah(addonCost);
  } else {
    addonRow.parentElement.classList.add('hidden');
  }
  
  document.getElementById('calc-total-price').textContent = formatRupiah(total);
}

async function generateAISynopsis() {
  const judul = document.getElementById('field-judul')?.value.trim();
  const btn = document.getElementById('btn-ai-synopsis');
  if (!judul) { showToast('Lengkapi', 'Isi Judul Karya terlebih dahulu.', 'warning'); return; }

  btn.disabled = true; btn.textContent = 'Menyusun...';
  try {
    if (!window.firebaseAI) throw new Error('AI belum siap.');
    const { getGenerativeModel } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-ai.js");
    const model = getGenerativeModel(window.firebaseAI, { model: "gemini-1.5-flash" });
    const result = await model.generateContent(`Buat sinopsis 2 paragraf untuk karya "${judul}".`);
    document.getElementById('field-sinopsis').value = (await result.response).text();
  } catch (e) {
    document.getElementById('field-sinopsis').value = `Karya "${judul}" menghadirkan alur dramatik yang memukau. (Draf Lokal)`;
    showToast('AI Sibuk', 'Menggunakan draf lokal.', 'warning');
  } finally {
    btn.disabled = false; btn.textContent = '✦ Generate Sinopsis AI';
  }
}

async function handleOrderFormSubmit(e) {
  e.preventDefault();
  if (!appState.currentClientUser) return showToast('Error', 'Masuk dulu.', 'error');
  
  const svcObj = appState.serviceCatalog[appState.selectedServiceLine];
  const pkgObj = svcObj.packages[appState.selectedPackage];
  const basePrice = appState.customPrice ? appState.customPrice : pkgObj.price;
  const totalPrice = basePrice + (Boolean(document.getElementById('field-addon-vocal')?.checked) ? svcObj.addonPrice : 0);
  
  const newProject = {
    id: `PAL-${Date.now()}`, 
    createdAt: new Date().toLocaleDateString(), 
    clientEmail: appState.currentClientUser.email,
    clientName: document.getElementById('field-nama').value, 
    judul: document.getElementById('field-judul').value,
    serviceLine: appState.selectedServiceLine, 
    serviceLineLabel: svcObj.label, 
    packageName: appState.customPrice ? 'Harga Kesepakatan' : pkgObj.label,
    totalPrice: totalPrice, 
    dpAmount: Math.round(totalPrice * 0.5), 
    paymentScheme: 'DP 50%',
    dpStatus: 'Belum Dibayar', 
    agreementSigned: false, 
    quoteStatus: 'Diterbitkan',
    productionStatus: TRACKER_MILESTONES[0], 
    clientAcceptedFinal: false
  };
  
  appState.projects.unshift(newProject);
  await syncProjectToCloud(newProject);
  showToast('Berhasil', 'Pengajuan terkirim.');
  navigateTo('client');
}
