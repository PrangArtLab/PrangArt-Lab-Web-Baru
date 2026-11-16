function refreshOrderPageUI() {
  if (!appState.currentClientUser) return; // Akan dicegat oleh tombol navigasi
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
    return `<button type="button" onclick="selectPackageTier('${k}')" class="p-5 rounded-2xl border text-left ${sel ? 'border-primary bg-primary/10' : 'border-border bg-surface'}"><span class="text-sm font-bold text-textMain block">${p.label}</span><span class="text-lg font-mono text-primary block mt-1">${formatRupiah(p.price)}</span></button>`;
  }).join('');
}

function selectPackageTier(k) { appState.selectedPackage = k; appState.customPrice = null; document.getElementById('custom-price-input').value = ''; renderPackageCards(); renderDynamicSpecFields(); recalculateLivePrice(); }
function handleCustomPrice(v) { appState.customPrice = (v && Number(v) > 0) ? Number(v) : null; renderPackageCards(); renderDynamicSpecFields(); recalculateLivePrice(); }

function renderDynamicSpecFields() {
  const c = document.getElementById('dynamic-spec-fields'); if(!c) return;
  
  // Tampilan jika menggunakan Custom Price
  if (appState.customPrice) {
    c.innerHTML = `<div class="p-4 bg-surface border border-primary/30 rounded-xl"><label class="text-xs font-bold text-primary mb-2 block">Spesifikasi Custom (Harga Kesepakatan)</label><textarea id="spec-custom-detail" rows="3" placeholder="Jelaskan detail kebutuhan custom Anda..." class="w-full bg-panel border border-border rounded-lg p-3 text-sm"></textarea></div>`;
    return;
  }
  
  // Tampilan standar
  c.innerHTML = appState.selectedPackage === 'dasar' 
    ? `<div class="grid grid-cols-2 gap-4"><input type="number" placeholder="BPM" class="bg-panel border p-3 rounded-xl text-sm"/><input type="text" placeholder="Nuansa" class="bg-panel border p-3 rounded-xl text-sm"/></div>` 
    : `<div class="space-y-3"><label class="text-xs text-textMuted">Rincian Waktu & Link Drive</label><input type="text" placeholder="00:00 - 01:30 (Opening)" class="w-full bg-panel border p-3 rounded-xl text-sm"/><input type="url" placeholder="Link GDrive (opsional)" class="w-full bg-panel border p-3 rounded-xl text-sm"/></div>`;
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
  
  const newP = { 
    id: `PAL-${Date.now()}`, clientEmail: appState.currentClientUser.email, clientName: appState.currentClientUser.name, 
    judul: document.getElementById('field-judul').value, serviceLine: appState.selectedServiceLine, 
    serviceLineLabel: svc.label, packageName: appState.customPrice ? 'Kustom' : pkg.label, 
    totalPrice: total, dpAmount: total/2, dpStatus: 'Belum Dibayar', productionStatus: TRACKER_MILESTONES[0] 
  };
  appState.projects.unshift(newP); await syncProjectToCloud(newP);
  showToast('Berhasil', 'Pesanan dibuat.'); navigateTo('client');
}
