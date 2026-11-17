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
  
  // Sembunyikan bagian sinopsis secara otomatis jika memilih Non-Tari atau Transkripsi
  const sinopsisWrap = document.getElementById('synopsis-section-wrapper');
  const sinopsisInput = document.getElementById('field-sinopsis');
  
  if (sinopsisWrap) {
    if (svcKey === 'tari') {
      sinopsisWrap.classList.remove('hidden');
      if (sinopsisInput) sinopsisInput.required = true;
    } else {
      sinopsisWrap.classList.add('hidden');
      if (sinopsisInput) {
        sinopsisInput.required = false;
        sinopsisInput.value = '';
      }
    }
  }

  renderPackageCards(); 
  renderDynamicSpecFields(); 
  recalculateLivePrice();
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

function selectPackageTier(k) { 
  appState.selectedPackage = k; 
  appState.customPrice = null; 
  const customInp = document.getElementById('custom-price-input');
  if (customInp) customInp.value = ''; 
  renderPackageCards(); 
  renderDynamicSpecFields(); 
  recalculateLivePrice(); 
}

function handleCustomPrice(v) { 
  appState.customPrice = (v && Number(v) > 0) ? Number(v) : null; 
  renderPackageCards(); 
  renderDynamicSpecFields(); 
  recalculateLivePrice(); 
}

/* === SPESIFIKASI DINAMIS === */
function renderDynamicSpecFields() {
  const c = document.getElementById('dynamic-spec-fields'); if(!c) return;
  
  c.innerHTML = `
    <div class="flex justify-between items-center mb-3">
      <label class="text-xs font-bold text-textMain">Spesifikasi &amp; Detail Kebutuhan</label>
      <button type="button" onclick="addSpecFieldRow()" class="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition">+ Tambah Baris</button>
    </div>
    <div id="spec-rows-container" class="space-y-3">
      ${specRowTemplate('Kebutuhan Utama', '')}
    </div>
  `;
}

function specRowTemplate(key = '', val = '') {
  return `
    <div class="flex gap-2 items-center spec-row">
      <input type="text" placeholder="Label (cth: BPM / Waktu)" value="${key}" class="w-1/3 bg-panel border border-border rounded-xl px-3 py-2.5 text-sm spec-key" />
      <input type="text" placeholder="Detail (cth: 120 / 00:00-01:30)" value="${val}" class="flex-1 bg-panel border border-border rounded-xl px-3 py-2.5 text-sm spec-val" />
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
  const judul = document.getElementById('field-judul')?.value.trim();
  if (!judul) return showToast('Info', 'Isi Judul Karya terlebih dahulu.', 'warning');

  const tema = document.getElementById('ai-param-tema')?.value.trim() || 'Tari Kreasi Tradisional';
  const etnis = document.getElementById('ai-param-etnis')?.value.trim() || 'Tradisi Nusantara';
  const emosi = document.getElementById('ai-param-emosi')?.value.trim() || 'Tegas, berwibawa, dan sakral';
  const gayaMusik = document.getElementById('ai-param-musik')?.value.trim() || 'Perpaduan perkusi etnik yang dinamis dan lapisan bebunyian akustik modern';
  const gagasan = document.getElementById('ai-param-gagasan')?.value.trim() || 'Refleksi keteguhan jiwa dan dinamika perjalanan hidup';
  const alur = document.getElementById('ai-param-alur')?.value.trim() || 'Progresif dari bagian awal yang kontemplatif, menuju klimaks bertenaga, lalu mereda dalam keheningan yang kokoh';
  const busana = document.getElementById('ai-param-busana')?.value.trim() || 'Busana adat modifikasi bernuansa elegan dan tata rias karakter yang kuat';
  const properti = document.getElementById('ai-param-properti')?.value.trim() || 'Properti simbolis pendukung gerak';

  const btn = document.getElementById('btn-ai-synopsis'); 
  if (btn) { btn.textContent = 'Menyusun Sinopsis...'; btn.disabled = true; }
  
  const masterPrompt = `Bertindaklah sebagai seorang Penata Tari (Koreografer) dan Komposer Musik profesional yang berpengalaman luas dalam kancah seni pertunjukan. Buatlah sebuah sinopsis karya tari dan aransemen musik yang utuh, puitis, berbobot artistik tinggi, serta bernada profesional, berdasarkan parameter lengkap berikut:
- Judul Karya: ${judul}
- Tipe & Tema Tarian: ${tema}
- Akar Etnis / Suku / Budaya: ${etnis}
- Emosi & Suasana (Atmosphere): ${emosi}
- Ide Gagasan / Filosofi: ${gagasan}
- Alur / Struktur Gerak & Musik: ${alur}
- Tata Busana & Rias: ${busana}
- Properti Pendukung: ${properti}
- Gaya Musik: ${gayaMusik}

Susun seluruh parameter di atas ke dalam satu kesatuan paragraf deskriptif yang padu, mengalir indah, dan sinergis—menyatukan elemen visual (busana, rias, properti) dengan elemen auditif (gaya musik dan dinamika tempo) serta penjiwaan (karakter, emosi, dan alur tari) secara utuh. Jangan gunakan format poin-poin atau daftar ke bawah, melainkan buatlah dalam bentuk narasi sinopsis artistik profesional siap pakai.`;

  try {
    if (!window.firebaseAI) throw new Error();
    const { getGenerativeModel } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-ai.js');
    const res = await getGenerativeModel(window.firebaseAI, { model: "gemini-1.5-flash" }).generateContent(masterPrompt);
    document.getElementById('field-sinopsis').value = (await res.response).text().trim();
    showToast('Berhasil', 'Sinopsis profesional berhasil disusun.');
  } catch { 
    document.getElementById('field-sinopsis').value = `Karya tari bertajuk "${judul}" merupakan sebuah manifestasi seni pertunjukan bertema ${tema} yang berakar kuat pada budaya ${etnis}, merepresentasikan ${gagasan}. Ditopang oleh suasana ${emosi}, garapan ini dirancang dengan alur ${alur}. Visualisasi pertunjukan diperkuat melalui ${busana}, serta penggunaan ${properti}. Dari sisi auditif, gaya musik digarap dengan ${gayaMusik}, menciptakan lanskap audio yang megah serta selaras secara organik dengan setiap jengkal gerak penari di atas panggung.`; 
    showToast('Info', 'Sinopsis disusun menggunakan template offline.');
  } finally { 
    if (btn) { btn.textContent = '✦ Susun Sinopsis Profesional dengan AI'; btn.disabled = false; }
  }
}

async function handleOrderFormSubmit(e) {
  e.preventDefault();
  if (!appState.currentClientUser) return navigateTo('client');
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  const pkg = svc.packages[appState.selectedPackage];
  const total = (appState.customPrice || pkg.price) + (document.getElementById('field-addon-vocal').checked ? svc.addonPrice : 0);
  
  const specs = [];
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
    sinopsis: appState.selectedServiceLine === 'tari' ? document.getElementById('field-sinopsis').value : '',
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
  
  appState.projects.unshift(newP); 
  await syncProjectToCloud(newP);
  showToast('Berhasil', 'Pesanan berhasil dibuat.'); 
  navigateTo('client');
}
