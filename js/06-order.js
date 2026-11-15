function refreshOrderPageUI() {
  const banner = document.getElementById('order-account-banner');
  if (banner) {
    if (appState.currentClientUser) {
      banner.innerHTML = `<span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 font-mono text-[11px] font-bold">✓ Akun Aktif:</span> <strong>${appState.currentClientUser.name}</strong>`;
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
  document.querySelectorAll('.svc-tab-btn').forEach(btn => {
    btn.className = 'svc-tab-btn p-4 rounded-2xl border border-border bg-panel text-textMuted hover:text-textMain text-left transition-colors duration-300';
  });
  const activeTab = document.getElementById(`svc-tab-${svcKey}`);
  if (activeTab) activeTab.className = 'svc-tab-btn p-4 rounded-2xl border border-primary bg-primary/10 text-primary text-left transition-colors duration-300';
  renderPackageCards(); renderDynamicSpecFields(); recalculateLivePrice();
}

function renderPackageCards() {
  const grid = document.getElementById('package-cards-grid');
  if (!grid) return;
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  grid.innerHTML = Object.entries(svc.packages).map(([pkgKey, pkg]) => {
    const isSelected = appState.selectedPackage === pkgKey;
    return `
      <button type="button" onclick="selectPackageTier('${pkgKey}')" class="p-4 rounded-xl border text-left transition flex flex-col justify-between ${isSelected ? 'border-primary bg-primary/10 shadow-md' : 'border-border bg-surface hover:border-primary/40'}">
        <div>
          <span class="text-sm font-bold text-textMain block">${pkg.label}</span>
          <span class="text-sm font-mono font-bold text-primary block mt-1">${formatRupiah(pkg.price)}</span>
          <p class="text-[11px] text-textMuted mt-1.5 leading-relaxed">${pkg.desc}</p>
        </div>
      </button>`;
  }).join('');
}

function selectPackageTier(pkgKey) {
  appState.selectedPackage = pkgKey; renderPackageCards(); renderDynamicSpecFields(); recalculateLivePrice();
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
          <div><label class="block text-xs font-semibold text-textMain mb-1.5">BPM</label><input type="number" id="spec-dasar-bpm" value="110" class="w-full bg-panel border border-border rounded-xl px-3 py-2 text-sm text-textMain" /></div>
          <div><label class="block text-xs font-semibold text-textMain mb-1.5">Nuansa</label><select id="spec-dasar-mood" class="w-full bg-panel border border-border rounded-xl px-3 py-2 text-sm text-textMain"><option value="Sakral">Sakral</option><option value="Dinamis">Dinamis</option></select></div>
        </div>`;
      renderBasicInstrumentTags();
    } else if (pkg === 'standar') {
      container.innerHTML = `<div class="text-sm text-textMuted">Struktur tari standar (timestamp & link referensi) akan tampil di sini.</div>`;
    } else { container.innerHTML = `<div class="text-sm text-textMuted">Alur dramatik bebas (Pro).</div>`; }
  } else if (svc === 'transkripsi') {
    container.innerHTML = `<div><label class="block text-xs font-semibold text-textMain mb-1.5">Jenis Notasi</label><select class="w-full bg-panel border border-border rounded-xl px-3 py-2 text-sm text-textMain"><option>Not Angka & Balok</option><option>Not Angka</option></select></div>`;
  } else {
    container.innerHTML = `<div><label class="block text-xs font-semibold text-textMain mb-1.5">Genre Musik</label><input type="text" class="w-full bg-panel border border-border rounded-xl px-3 py-2 text-sm text-textMain" /></div>`;
  }
}

function addBasicInstrument() { /* logika sama */ }
function removeBasicInstrument(idx) { /* logika sama */ }
function renderBasicInstrumentTags() { /* logika sama */ }
function toggleStandarStructCard(idx) { /* logika sama */ }
function addProSceneBlock() { /* logika sama */ }
function removeProSceneBlock(idx) { /* logika sama */ }
function renderProSceneBlocks() { /* logika sama */ }

function recalculateLivePrice() {
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  const pkg = svc.packages[appState.selectedPackage];
  const addonCost = Boolean(document.getElementById('field-addon-vocal')?.checked) ? svc.addonPrice : 0;
  const total = pkg.price + addonCost;
  const plan = document.querySelector('input[name="payment-plan"]:checked')?.value || 'DP 50%';
  const first = plan === 'DP 50%' ? Math.round(total * 0.5) : total;

  document.getElementById('calc-service-name').textContent = svc.label;
  document.getElementById('calc-pkg-name').textContent = pkg.label;
  document.getElementById('calc-pkg-price').textContent = formatRupiah(pkg.price);
  document.getElementById('calc-total-price').textContent = formatRupiah(total);
  document.getElementById('calc-terbilang-total').textContent = `Terbilang: ${numberToIndonesianWords(total)} Rupiah`;
  document.getElementById('calc-dp-price').textContent = formatRupiah(first);
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
  const totalPrice = pkgObj.price + (Boolean(document.getElementById('field-addon-vocal')?.checked) ? svcObj.addonPrice : 0);
  
  const newProject = {
    id: `PAL-${Date.now()}`, createdAt: new Date().toLocaleDateString(), clientEmail: appState.currentClientUser.email,
    clientName: document.getElementById('field-nama').value, judul: document.getElementById('field-judul').value,
    serviceLine: appState.selectedServiceLine, serviceLineLabel: svcObj.label, packageName: pkgObj.label,
    totalPrice: totalPrice, dpAmount: Math.round(totalPrice * 0.5), paymentScheme: 'DP 50%',
    dpStatus: 'Belum Dibayar', pelunasanStatus: 'Belum Lunas', agreementSigned: false, quoteStatus: 'Diterbitkan',
    productionStatus: TRACKER_MILESTONES[0], clientAcceptedFinal: false, wa: document.getElementById('field-wa').value
  };
  appState.projects.unshift(newProject);
  await syncProjectToCloud(newProject);
  showToast('Berhasil', 'Pengajuan terkirim.');
  navigateTo('client');
}