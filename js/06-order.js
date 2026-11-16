function refreshOrderPageUI() {
  const banner = document.getElementById('order-account-banner');
  if (banner) {
    if (appState.currentClientUser) {
      banner.innerHTML = `<div class="flex items-center gap-2"><span class="text-emerald-500 font-bold">✓ Akun Aktif:</span> <strong>${appState.currentClientUser.name}</strong></div>`;
      const setIfEmpty = (id, val) => { const el = document.getElementById(id); if (el && !el.value && val) el.value = val; };
      setIfEmpty('field-nama', appState.currentClientUser.name);
      setIfEmpty('field-email', appState.currentClientUser.email);
      setIfEmpty('field-wa', appState.currentClientUser.wa);
    }
  }
  selectServiceLine(appState.selectedServiceLine);
}

function selectServiceLine(svcKey) {
  appState.selectedServiceLine = svcKey;
  appState.customPrice = null;
  const customInp = document.getElementById('custom-price-input');
  if(customInp) customInp.value = '';
  
  document.querySelectorAll('.svc-tab-btn').forEach(btn => {
    btn.className = 'svc-tab-btn p-4 rounded-2xl border border-border bg-panel text-textMuted hover:text-textMain text-left transition-colors duration-300';
  });
  const activeTab = document.getElementById(`svc-tab-${svcKey}`);
  if (activeTab) activeTab.className = 'svc-tab-btn p-4 rounded-2xl border border-primary bg-primary/10 text-primary text-left transition-colors duration-300 shadow-glow';
  
  renderPackageCards(); 
  renderDynamicSpecFields(); 
  recalculateLivePrice();
}

function renderPackageCards() {
  const grid = document.getElementById('package-cards-grid');
  if (!grid) return;
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  grid.innerHTML = Object.entries(svc.packages).map(([pkgKey, pkg]) => {
    // Jika customPrice diisi, maka visual kartu paket tidak ada yang terpilih (selected)
    const isSelected = appState.selectedPackage === pkgKey && !appState.customPrice;
    
    return `
      <button type="button" onclick="selectPackageTier('${pkgKey}')" class="p-5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between ${isSelected ? 'border-primary bg-primary/10 shadow-md transform scale-[1.02]' : 'border-border bg-surface hover:border-primary/40'}">
        <div>
          <span class="text-sm font-bold text-textMain block">${pkg.label}</span>
          <span class="text-lg font-mono font-bold text-primary block mt-1">${formatRupiah(pkg.price)}</span>
          <p class="text-xs text-textMuted mt-2 leading-relaxed">${pkg.desc}</p>
        </div>
      </button>`;
  }).join('');
}

function selectPackageTier(pkgKey) {
  appState.selectedPackage = pkgKey; 
  appState.customPrice = null; // Reset custom price jika memilih paket standar
  
  const customInp = document.getElementById('custom-price-input');
  if(customInp) customInp.value = ''; // Kosongkan input custom

  renderPackageCards(); 
  renderDynamicSpecFields(); 
  recalculateLivePrice();
}

// Fungsi baru untuk menangkap input bebas
function handleCustomPrice(val) {
  if (val && Number(val) > 0) {
    appState.customPrice = Number(val);
  } else {
    appState.customPrice = null;
  }
  renderPackageCards(); // Update visual kartu (hapus highlight)
  recalculateLivePrice();
}

function renderDynamicSpecFields() {
  const container = document.getElementById('dynamic-spec-fields');
  if (!container) return;
  const svc = appState.selectedServiceLine;
  const pkg = appState.selectedPackage;
  if (svc === 'tari') {
    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div><label class="block text-xs font-bold text-textMain mb-2">Tempo Utama (BPM)</label><input type="number" id="spec-dasar-bpm" value="110" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none" /></div>
        <div><label class="block text-xs font-bold text-textMain mb-2">Nuansa Dominan</label><select class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none"><option>Agung / Sakral</option><option>Dinamis / Energik</option><option>Melankolis</option></select></div>
      </div>`;
  } else {
    container.innerHTML = `<div><label class="block text-xs font-bold text-textMain mb-2">Catatan Spesifikasi</label><textarea rows="3" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none"></textarea></div>`;
  }
}

function recalculateLivePrice() {
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  const pkg = svc.packages[appState.selectedPackage];
  
  // HARGA DASAR: Gunakan custom price jika ada, jika tidak gunakan harga paket
  const basePrice = appState.customPrice ? appState.customPrice : pkg.price;
  const addonCost = Boolean(document.getElementById('field-addon-vocal')?.checked) ? svc.addonPrice : 0;
  const total = basePrice + addonCost;
  
  document.getElementById('calc-service-name').textContent = svc.label;
  
  // Tampilkan label yang sesuai di kalkulator
  if (appState.customPrice) {
    document.getElementById('calc-pkg-name').textContent = 'Harga Kesepakatan';
  } else {
    document.getElementById('calc-pkg-name').textContent = pkg.label;
  }
  
  document.getElementById('calc-pkg-price').textContent = formatRupiah(basePrice);
  document.getElementById('calc-total-price').textContent = formatRupiah(total);
}

async function generateAISynopsis(isVariation = false) {
  const judul = document.getElementById('field-judul')?.value.trim();
  const jenis = document.getElementById('field-jenis-tari')?.value.trim();
  const sinopsisEl = document.getElementById('field-sinopsis');
  const btn = document.getElementById('btn-ai-synopsis');
  if (!judul || !jenis) { showToast('Lengkapi', 'Isi Judul & Jenis Karya.', 'warning'); return; }

  btn.disabled = true; btn.textContent = 'Menyusun...';
  try {
    if (!window.firebaseAI) throw new Error('AI belum siap.');
    const { getGenerativeModel } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-ai.js");
    const model = getGenerativeModel(window.firebaseAI, { model: "gemini-1.5-flash" });
    const result = await model.generateContent(`Buat sinopsis 2 paragraf untuk karya "${judul}" (${jenis}).`);
    sinopsisEl.value = (await result.response).text();
  } catch (e) {
    sinopsisEl.value = `Karya "${judul}" menghadirkan alur dramatik dalam balutan ${jenis}. (Draf Lokal)`;
    showToast('AI Sibuk', 'Menggunakan draf lokal.', 'warning');
  } finally {
    btn.disabled = false; btn.textContent = '✦ Generate AI';
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
    pelunasanStatus: 'Belum Lunas', 
    agreementSigned: false, 
    quoteStatus: 'Diterbitkan',
    productionStatus: TRACKER_MILESTONES[0], 
    clientAcceptedFinal: false, 
    wa: document.getElementById('field-wa').value
  };
  
  appState.projects.unshift(newProject);
  await syncProjectToCloud(newProject);
  showToast('Berhasil', 'Pengajuan terkirim.');
  navigateTo('client');
}
