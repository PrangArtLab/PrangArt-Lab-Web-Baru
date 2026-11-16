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
  appState.customPrice = null;
  const customInp = document.getElementById('custom-price-input');
  if(customInp) customInp.value = '';
  renderPackageCards(); 
  renderDynamicSpecFields(); 
  recalculateLivePrice();
}

function handleCustomPrice(val) {
  if (val && Number(val) > 0) appState.customPrice = Number(val);
  else appState.customPrice = null;
  renderPackageCards(); 
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
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><label class="block text-xs font-bold text-textMain mb-2">Tempo Utama (BPM)</label><input type="number" id="spec-dasar-bpm" value="110" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none" /></div>
          <div><label class="block text-xs font-bold text-textMain mb-2">Nuansa Dominan</label><select id="spec-dasar-mood" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm text-textMain focus:outline-none"><option value="Agung / Sakral">Agung / Sakral</option><option value="Dinamis / Energik">Dinamis / Energik</option><option value="Melankolis">Melankolis</option></select></div>
        </div>`;
    } else if (pkg === 'standar') {
      const structures = ['Opening / Pembuka', 'Eksplorasi / Isi', 'Transisi / Jembatan', 'Klimaks / Puncak', 'Ending / Penutup'];
      container.innerHTML = `
        <div class="space-y-4">
          <p class="text-xs text-textMuted mb-2">Isi detail waktu (timestamp) dan link Google Drive referensi per bagian.</p>
          ${structures.map((st, idx) => `
            <div class="bg-panel border border-border rounded-xl p-4 space-y-3">
              <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" class="std-struct-cb" data-idx="${idx}" data-name="${st}" ${idx===0||idx===3?'checked':''} /><span class="text-sm font-bold text-textMain">${st}</span></label>
              <div id="std-fields-${idx}" class="${idx===0||idx===3?'grid':'hidden'} grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" id="std-time-${idx}" placeholder="00:00 - 01:30" class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs" />
                <input type="url" id="std-link-${idx}" placeholder="Link GDrive (opsional)" class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs" />
                <textarea id="std-detail-${idx}" rows="2" placeholder="Detail nuansa bagian ini..." class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs sm:col-span-2"></textarea>
              </div>
            </div>`).join('')}
        </div>`;
      container.querySelectorAll('.std-struct-cb').forEach(cb => {
        cb.addEventListener('change', (e) => {
          const idx = e.target.dataset.idx;
          const fields = document.getElementById(`std-fields-${idx}`);
          if (e.target.checked) fields.className = 'grid grid-cols-1 sm:grid-cols-2 gap-3';
          else fields.className = 'hidden';
        });
      });
    } else {
      container.innerHTML = `
        <div class="space-y-4">
          <div class="flex justify-between items-center mb-2"><p class="text-xs text-textMuted">Rincian Babak & Link Drive.</p><button type="button" onclick="addProSceneBlock()" class="text-xs text-primary font-bold">+ Tambah Babak</button></div>
          <div id="pro-scenes-list" class="space-y-3"></div>
        </div>`;
      renderProSceneBlocks();
    }
  } else if (svc === 'transkripsi') {
    container.innerHTML = `
      <div class="grid grid-cols-1 gap-4">
        <div><label class="block text-xs font-bold text-textMain mb-2">Jenis Notasi</label><select id="spec-trans-format" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm text-textMain"><option>Not Angka & Not Balok (Lengkap)</option><option>Not Angka Saja</option><option>Not Balok Saja</option></select></div>
        <div><label class="block text-xs font-bold text-textMain mb-2">Tingkat Detail</label><input type="text" id="spec-trans-key" placeholder="Contoh: Melodi + Akor" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" /></div>
        <div><label class="block text-xs font-bold text-textMain mb-2">Instrumen / Jalur Suara</label><textarea id="spec-trans-detail" rows="2" placeholder="Contoh: Vokal SATB, Piano" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm"></textarea></div>
      </div>`;
  } else {
    container.innerHTML = `
      <div class="grid grid-cols-1 gap-4">
        <div><label class="block text-xs font-bold text-textMain mb-2">Konsep & Genre</label><input type="text" id="spec-dig-genre" placeholder="Pop, Orkestra, dll" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" /></div>
        <div><label class="block text-xs font-bold text-textMain mb-2">Karakter & Instrumen</label><textarea id="spec-dig-detail" rows="2" placeholder="Jelaskan suasana musik..." class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm"></textarea></div>
      </div>`;
  }
}

function addProSceneBlock() { appState.proScenes.push({ title: `Babak ${appState.proScenes.length+1}`, detail: '', link: '' }); renderProSceneBlocks(); }
function renderProSceneBlocks() {
  const list = document.getElementById('pro-scenes-list'); if(!list) return;
  list.innerHTML = appState.proScenes.map((sc, idx) => `
    <div class="bg-panel border border-border rounded-xl p-4 space-y-3 relative">
      ${idx>0?`<button type="button" onclick="appState.proScenes.splice(${idx},1);renderProSceneBlocks();" class="absolute top-2 right-2 text-red-500 text-xs">Hapus</button>`:''}
      <input type="text" value="${sc.title}" oninput="appState.proScenes[${idx}].title=this.value" class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm font-bold" />
      <textarea rows="2" oninput="appState.proScenes[${idx}].detail=this.value" placeholder="Detail alur..." class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs">${sc.detail}</textarea>
      <input type="url" value="${sc.link}" oninput="appState.proScenes[${idx}].link=this.value" placeholder="Link GDrive (opsional)" class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs" />
    </div>`).join('');
}

function recalculateLivePrice() {
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  const pkg = svc.packages[appState.selectedPackage];
  const basePrice = appState.customPrice ? appState.customPrice : pkg.price;
  const addonCost = Boolean(document.getElementById('field-addon-vocal')?.checked) ? svc.addonPrice : 0;
  const total = basePrice + addonCost;
  
  document.getElementById('calc-service-name').textContent = svc.label;
  document.getElementById('calc-pkg-name').textContent = appState.customPrice ? 'Harga Kesepakatan' : pkg.label;
  document.getElementById('calc-pkg-price').textContent = formatRupiah(basePrice);
  document.getElementById('calc-total-price').textContent = formatRupiah(total);
}

async function generateAISynopsis(isVariation = false) {
  const judul = document.getElementById('field-judul')?.value.trim();
  const jenis = document.getElementById('field-jenis-tari')?.value.trim();
  const sinopsisEl = document.getElementById('field-sinopsis');
  const btn = document.getElementById('btn-ai-synopsis');
  if (!judul || !jenis) { showToast('Lengkapi', 'Isi Judul & Jenis Karya terlebih dahulu.', 'warning'); return; }

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

function restorePreviousSynopsis() {}
function copyBankAccount() {}

async function handleOrderFormSubmit(e) {
  e.preventDefault();
  if (!appState.currentClientUser) return showToast('Error', 'Masuk dulu.', 'error');
  
  const svcObj = appState.serviceCatalog[appState.selectedServiceLine];
  const pkgObj = svcObj.packages[appState.selectedPackage];
  const basePrice = appState.customPrice ? appState.customPrice : pkgObj.price;
  const totalPrice = basePrice + (Boolean(document.getElementById('field-addon-vocal')?.checked) ? svcObj.addonPrice : 0);
  
  // Ambil data spesifikasi detail
  let musicalSpec = {};
  if (appState.selectedServiceLine === 'tari') {
    if(appState.selectedPackage === 'standar') {
      const structs = [];
      document.querySelectorAll('.std-struct-cb:checked').forEach(cb => {
        const i = cb.dataset.idx;
        structs.push({
          name: cb.dataset.name,
          time: document.getElementById(`std-time-${i}`)?.value || '-',
          detail: document.getElementById(`std-detail-${i}`)?.value || '-',
          link: document.getElementById(`std-link-${i}`)?.value || ''
        });
      });
      musicalSpec = { mode: 'standar', structures: structs };
    } else if (appState.selectedPackage === 'pro') {
      musicalSpec = { mode: 'pro', scenes: appState.proScenes };
    }
  }

  const newProject = {
    id: `PAL-${Date.now()}`, 
    createdAt: new Date().toLocaleDateString(), 
    clientEmail: appState.currentClientUser.email,
    clientName: document.getElementById('field-nama').value, 
    judul: document.getElementById('field-judul').value,
    wa: document.getElementById('field-wa').value,
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
    musicalSpec: musicalSpec
  };
  
  appState.projects.unshift(newProject);
  await syncProjectToCloud(newProject);
  showToast('Berhasil', 'Pengajuan terkirim.');
  navigateTo('client');
}
