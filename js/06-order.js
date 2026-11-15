function refreshOrderPageUI() {
  const banner = document.getElementById('order-account-banner');
  if (banner) {
    if (appState.currentClientUser) {
      const u = appState.currentClientUser;
      banner.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[11px] font-bold">✓ Akun Aktif</span>
          <span>Pemesan: <strong>${u.name}</strong> (${u.instansi} - ${u.kota})</span>
        </div>
      `;
      const setIfEmpty = (id, val) => {
        const el = document.getElementById(id);
        if (el && !el.value && val) el.value = val;
      };
      setIfEmpty('field-nama', u.name);
      setIfEmpty('field-email', u.email);
      setIfEmpty('field-wa', u.wa);
      setIfEmpty('field-instansi', u.instansi);
      setIfEmpty('field-kota', u.kota);
      setIfEmpty('field-alamat', u.alamat);
      setIfEmpty('field-nik', u.nik);
    } else {
      banner.innerHTML = `
        <div class="flex flex-wrap items-center gap-2">
          <span class="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono text-[11px] font-bold">Akun Klien</span>
          <span>Buat akun singkat (30 detik) agar progres penawaran &amp; dokumen tersimpan di akun Anda.</span>
          <button type="button" onclick="openClientAuthModal('register')" class="text-gold font-bold underline">Daftar / Masuk Sekarang</button>
        </div>
      `;
    }
  }
  selectServiceLine(appState.selectedServiceLine);
}

function selectServiceLine(svcKey) {
  appState.selectedServiceLine = svcKey;
  document.querySelectorAll('.svc-tab-btn').forEach(btn => {
    btn.className = 'svc-tab-btn p-3 rounded-xl border border-borderline bg-acoustic text-ash hover:text-ivory text-left transition';
  });
  const activeTab = document.getElementById(`svc-tab-${svcKey}`);
  if (activeTab) {
    activeTab.className = 'svc-tab-btn p-3 rounded-xl border border-gold bg-gold/15 text-ivory text-left transition';
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
      <button type="button" onclick="selectPackageTier('${pkgKey}')" class="p-4 rounded-xl border text-left transition flex flex-col justify-between ${isSelected ? 'border-gold bg-gold/10 shadow-md' : 'border-borderline bg-acoustic/70 hover:border-gold/40'}">
        <div>
          <div class="flex items-center justify-between gap-1">
            <span class="text-xs font-bold text-ivory">${pkg.label}</span>
            ${isSelected ? '<span class="text-gold text-xs font-bold">✓</span>' : ''}
          </div>
          <span class="text-sm font-mono font-extrabold text-gold block mt-1">${formatRupiah(pkg.price)}</span>
          <p class="text-[11px] text-ash mt-1.5 leading-relaxed">${pkg.desc}</p>
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
          <div>
            <label class="block text-xs font-semibold text-ivory mb-1.5">Tempo Utama (BPM) *</label>
            <input type="number" id="spec-dasar-bpm" value="110" min="40" max="240" required class="w-full bg-acoustic border border-borderline focus:border-gold rounded-xl px-3.5 py-2.5 text-xs font-mono text-ivory focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-ivory mb-1.5">Nuansa Dominan *</label>
            <select id="spec-dasar-mood" class="w-full bg-acoustic border border-borderline focus:border-gold rounded-xl px-3.5 py-2.5 text-xs text-ivory focus:outline-none">
              <option value="Agung / Sakral">Agung / Sakral</option>
              <option value="Dinamis / Energik">Dinamis / Energik</option>
              <option value="Melankolis / Dramatik">Melankolis / Dramatik</option>
              <option value="Ceria / Pesta Rakyat">Ceria / Pesta Rakyat</option>
              <option value="Mistis / Magis">Mistis / Magis</option>
            </select>
          </div>
        </div>
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-semibold text-ivory">Instrumen Utama (Maksimal 5 Instrumen) *</label>
            <span id="inst-counter" class="text-[11px] font-mono text-gold">${appState.basicInstruments.length}/5</span>
          </div>
          <div id="inst-input-box" class="flex gap-2">
            <input type="text" id="spec-inst-input" onkeydown="if(event.key==='Enter'){event.preventDefault();addBasicInstrument();}" placeholder="Ketik instrumen lalu tekan Enter (misal: Suling)..." class="flex-1 bg-acoustic border border-borderline focus:border-gold rounded-xl px-3.5 py-2 text-xs text-ivory focus:outline-none" />
            <button type="button" onclick="addBasicInstrument()" class="btn-ghost-gold px-3.5 py-2 rounded-xl text-xs font-bold">+ Tambah</button>
          </div>
          <div id="inst-tags-list" class="flex flex-wrap gap-2 mt-2.5"></div>
        </div>
      `;
      renderBasicInstrumentTags();
    } else if (pkg === 'standar') {
      const structures = ['Opening / Pembuka', 'Eksplorasi / Isi', 'Transisi / Jembatan', 'Klimaks / Puncak', 'Ending / Penutup'];
      container.innerHTML = `
        <div class="space-y-3">
          <label class="block text-xs font-semibold text-ivory">Pilih Struktur Tari &amp; Rincian Timestamp *</label>
          <div class="grid grid-cols-1 gap-3">
            ${structures.map((st, idx) => {
              const checked = idx === 0 || idx === 3;
              return `
                <div class="bg-acoustic/70 border border-borderline rounded-xl p-3.5 space-y-2.5">
                  <label class="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" class="std-struct-cb w-4 h-4 accent-[#d4af37]" data-idx="${idx}" data-name="${st}" ${checked ? 'checked' : ''} onchange="toggleStandarStructCard(${idx})" />
                    <span class="text-xs font-bold text-ivory">${st}</span>
                  </label>
                  <div id="std-struct-fields-${idx}" class="${checked ? 'grid' : 'hidden'} grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
                    <div class="sm:col-span-4"><input type="text" id="std-time-${idx}" placeholder="00:00 - 01:30" class="w-full bg-obsidian border border-borderline focus:border-gold rounded-lg px-3 py-2 text-xs font-mono text-ivory focus:outline-none" /></div>
                    <div class="sm:col-span-8"><input type="url" id="std-link-${idx}" placeholder="Link GDrive referensi bagian ini (opsional)" class="w-full bg-obsidian border border-borderline focus:border-gold rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none" /></div>
                    <div class="sm:col-span-12"><textarea id="std-detail-${idx}" rows="2" placeholder="Uraian nuansa, tempo, &amp; dinamika gerak pada ${st}..." class="w-full bg-obsidian border border-borderline focus:border-gold rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none"></textarea></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-semibold text-ivory">Babak / Alur Dramatik &amp; Perubahan Tempo Bebas *</label>
            <button type="button" onclick="addProSceneBlock()" class="btn-ghost-gold px-3 py-1.5 rounded-lg text-xs font-bold">+ Tambah Babak Alur</button>
          </div>
          <div id="pro-scenes-list" class="space-y-3"></div>
        </div>
      `;
      renderProSceneBlocks();
    }
  } else if (svc === 'transkripsi') {
    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-semibold text-ivory mb-1.5">Jenis Notasi *</label>
          <select id="spec-trans-format" class="w-full bg-acoustic border border-borderline focus:border-gold rounded-xl px-3.5 py-2.5 text-xs text-ivory focus:outline-none">
            <option value="Not Angka & Not Balok (Lengkap)">Not Angka &amp; Not Balok</option>
            <option value="Not Angka Saja">Not Angka Saja</option>
            <option value="Not Balok Saja">Not Balok Saja</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-ivory mb-1.5">Tingkat Detail Notasi</label>
          <input type="text" id="spec-trans-key" placeholder="Contoh: Melodi + Akor / Full Partitur" class="w-full bg-acoustic border border-borderline focus:border-gold rounded-xl px-3.5 py-2.5 text-xs text-ivory focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-ivory mb-1.5">Format Hasil yang Diinginkan</label>
          <input type="text" id="spec-trans-meter" placeholder="Contoh: PDF Cetak + Audio Panduan" class="w-full bg-acoustic border border-borderline focus:border-gold rounded-xl px-3.5 py-2.5 text-xs text-ivory focus:outline-none" />
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-ivory mb-1.5">Instrumen / Jalur Suara yang Ditranskripsikan *</label>
        <textarea id="spec-trans-detail" rows="3" required placeholder="Contoh: Melodi utama vokal sopran-alto-tenor-bass beserta iringan piano..." class="w-full bg-acoustic border border-borderline focus:border-gold rounded-xl px-3.5 py-2.5 text-xs text-ivory focus:outline-none"></textarea>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-ivory mb-1.5">Konsep &amp; Genre Musik *</label>
          <input type="text" id="spec-dig-genre" required placeholder="Contoh: Pop Orkestra / Etnik Elektronik / Teater" class="w-full bg-acoustic border border-borderline focus:border-gold rounded-xl px-3.5 py-2.5 text-xs text-ivory focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-ivory mb-1.5">Durasi &amp; Target Tempo (BPM)</label>
          <input type="text" id="spec-dig-tempo" placeholder="Contoh: 120 BPM - G Mayor" class="w-full bg-acoustic border border-borderline focus:border-gold rounded-xl px-3.5 py-2.5 text-xs text-ivory focus:outline-none" />
        </div>
      </div>
      <div>
        <label class="block text-xs font-semibold text-ivory mb-1.5">Karakter, Suasana, Instrumen &amp; Kebutuhan Rekaman *</label>
        <textarea id="spec-dig-detail" rows="3" required placeholder="Jelaskan karakter suasana, susunan instrumen, dan kebutuhan rekaman..." class="w-full bg-acoustic border border-borderline focus:border-gold rounded-xl px-3.5 py-2.5 text-xs text-ivory focus:outline-none"></textarea>
      </div>
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
    showToast('Batas Paket Dasar', 'Maksimal 5 instrumen untuk Paket Dasar.', 'warning');
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
    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs font-semibold">
      <span>${inst}</span>
      <button type="button" onclick="removeBasicInstrument(${i})" class="hover:text-ivory">×</button>
    </span>
  `).join('');
}

function toggleStandarStructCard(idx) {
  const cb = document.querySelector(`.std-struct-cb[data-idx="${idx}"]`);
  const fields = document.getElementById(`std-struct-fields-${idx}`);
  if (!fields) return;
  if (cb?.checked) {
    fields.classList.remove('hidden');
    fields.classList.add('grid');
  } else {
    fields.classList.add('hidden');
    fields.classList.remove('grid');
  }
}

function addProSceneBlock() {
  const nextNum = appState.proScenes.length + 1;
  appState.proScenes.push({ title: `Babak ${nextNum}`, detail: '', link: '' });
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
    <div class="bg-acoustic/70 border border-borderline rounded-xl p-3.5 space-y-2.5">
      <div class="flex items-center justify-between gap-2">
        <input type="text" value="${sc.title}" oninput="appState.proScenes[${idx}].title = this.value" placeholder="Nama Babak / Alur..." class="flex-1 bg-obsidian border border-borderline focus:border-gold rounded-lg px-3 py-1.5 text-xs font-bold text-ivory focus:outline-none" />
        ${idx > 0 ? `<button type="button" onclick="removeProSceneBlock(${idx})" class="text-red-400 text-xs px-2 py-1 hover:bg-red-500/15 rounded">Hapus</button>` : ''}
      </div>
      <textarea rows="2" oninput="appState.proScenes[${idx}].detail = this.value" placeholder="Uraian perubahan tempo, dinamika, dan suasana alur ini..." class="w-full bg-obsidian border border-borderline focus:border-gold rounded-lg px-3 py-2 text-xs text-ivory focus:outline-none">${sc.detail}</textarea>
      <input type="url" value="${sc.link}" oninput="appState.proScenes[${idx}].link = this.value" placeholder="Link Google Drive referensi tempo/gerak babak ini (opsional)" class="w-full bg-obsidian border border-borderline focus:border-gold rounded-lg px-3 py-1.5 text-xs text-ivory focus:outline-none" />
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
  document.getElementById('calc-plan-title').textContent = plan === 'DP 50%' ? 'Opsi DP 50% (Setelah Penawaran)' : 'Opsi Penuh 100% (Setelah Penawaran)';
  document.getElementById('calc-dp-price').textContent = formatRupiah(firstInstallment);
  document.getElementById('calc-terbilang-dp').textContent = `Terbilang: ${numberToIndonesianWords(firstInstallment)} Rupiah`;

  const mobTotal = document.getElementById('mob-calc-total');
  const mobDp = document.getElementById('mob-calc-dp');
  if (mobTotal) mobTotal.textContent = formatRupiah(total);
  if (mobDp) mobDp.textContent = formatRupiah(firstInstallment);
}

function copyBankAccount() {
  const txt = appState.settings.bankAccount;
  const tmp = document.createElement('textarea');
  tmp.value = txt;
  document.body.appendChild(tmp);
  tmp.select();
  document.execCommand('copy');
  tmp.remove();
  showToast('Rekening Disalin', txt);
}
async function generateAISynopsis(isVariation = false) {
  const judul = document.getElementById('field-judul')?.value.trim();
  const jenis = document.getElementById('field-jenis-tari')?.value.trim();
  const budaya = document.getElementById('field-budaya')?.value.trim();
  const sinopsisEl = document.getElementById('field-sinopsis');
  const btn = document.getElementById('btn-ai-synopsis');

  if (!judul || !jenis) {
    showToast('Data Belum Lengkap', 'Isi Judul Karya dan Jenis Karya terlebih dahulu agar AI dapat menyusun sinopsis.', 'warning');
    return;
  }

  if (!isVariation && sinopsisEl.value.trim()) {
    appState.previousSynopsisBackup = sinopsisEl.value;
  }

  btn.disabled = true;
  btn.textContent = 'Menyusun Sinopsis...';

  const prompt = `Buatkan sinopsis singkat dan jelas (2 paragraf padat, maksimal 90 kata) untuk karya "${judul}" kategori "${jenis}" berlatar "${budaya || 'Nusantara'}". ${isVariation ? 'Gunakan sudut pandang narasi berbeda.' : ''}`;

  try {
    const apiKey = '';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (!res.ok) throw new Error('API fallback');
    const data = await res.json();
    const generated = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!generated) throw new Error('Empty AI text');
    sinopsisEl.value = generated;
  } catch (_) {
    const variants = [
      `Karya "${judul}" menghadirkan alur dramatik berakar pada ${budaya || 'budaya Nusantara'} dalam balutan ${jenis}. Bagian pembuka mengalir tenang membangun suasana sebelum meningkat menuju dinamika ritmis yang tegas.\n\nPada puncak ketegangan, perpaduan dinamika dan aksen musikal menyimbolkan keteguhan karakter, lalu ditutup dengan harmoni yang berkesan.`,
      `Terinspirasi dari nilai ${budaya || 'tradisi lokal'}, "${judul}" merangkai ekspresi ${jenis} yang memadukan kehalusan rasa dan kekuatan tempo. Setiap pergeseran ritme menjadi penanda perubahan emosi dari keheningan menuju puncak klimaks.`
    ];
    sinopsisEl.value = variants[isVariation ? 1 : 0];
  } finally {
    btn.disabled = false;
    btn.textContent = '✦ Generate Sinopsis AI';
    const bar = document.getElementById('ai-synopsis-toolbar');
    bar?.classList.remove('hidden');
    bar?.classList.add('flex');
  }
}

function restorePreviousSynopsis() {
  const sinopsisEl = document.getElementById('field-sinopsis');
  if (sinopsisEl && appState.previousSynopsisBackup) {
    sinopsisEl.value = appState.previousSynopsisBackup;
    showToast('Teks Dikembalikan', 'Draf sinopsis sebelumnya dipulihkan.');
  }
}

function collectOrderMusicalSpec() {
  const svc = appState.selectedServiceLine;
  const pkg = appState.selectedPackage;
  if (svc === 'tari') {
    if (pkg === 'dasar') {
      return {
        mode: 'dasar',
        bpm: document.getElementById('spec-dasar-bpm')?.value || '110',
        mood: document.getElementById('spec-dasar-mood')?.value || 'Dinamis',
        instruments: [...appState.basicInstruments]
      };
    }
    if (pkg === 'standar') {
      const structures = [];
      document.querySelectorAll('.std-struct-cb:checked').forEach(cb => {
        const idx = cb.dataset.idx;
        structures.push({
          name: cb.dataset.name,
          time: document.getElementById(`std-time-${idx}`)?.value.trim() || '-',
          detail: document.getElementById(`std-detail-${idx}`)?.value.trim() || '-',
          link: document.getElementById(`std-link-${idx}`)?.value.trim() || ''
        });
      });
      return { mode: 'standar', structures };
    }
    return { mode: 'pro', scenes: structuredClone(appState.proScenes) };
  }
  if (svc === 'transkripsi') {
    return {
      mode: 'transkripsi',
      format: document.getElementById('spec-trans-format')?.value || 'Not Angka & Not Balok',
      key: document.getElementById('spec-trans-key')?.value.trim() || 'Melodi + Akor',
      meter: document.getElementById('spec-trans-meter')?.value.trim() || 'PDF Cetak',
      detail: document.getElementById('spec-trans-detail')?.value.trim() || '-'
    };
  }
  return {
    mode: 'digital',
    genre: document.getElementById('spec-dig-genre')?.value.trim() || '-',
    tempo: document.getElementById('spec-dig-tempo')?.value.trim() || '-',
    detail: document.getElementById('spec-dig-detail')?.value.trim() || '-'
  };
}

async function handleOrderFormSubmit(e) {
  e.preventDefault();
  if (!appState.currentClientUser) {
    showToast('Buat Akun Terlebih Dahulu', 'Silakan daftar atau masuk akun singkat agar progres dapat dipantau.', 'warning');
    openClientAuthModal('register');
    return;
  }

  const entryPath = document.querySelector('input[name="entry-path"]:checked')?.value || 'Jalur A (Sudah Diskusi WA)';
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
  const musicalSpec = collectOrderMusicalSpec();
  const defaultRev = appState.selectedPackage === 'dasar' ? '3' : appState.selectedPackage === 'standar' ? '6' : 'Sesuai kesepakatan';

  const newProject = {
    id: ticketId,
    createdTs: Date.now(),
    createdAt: nowDate,
    entryPath,
    clientEmail: email,
    clientName: nama,
    instansi, kota, alamat, nik, wa,
    serviceLine: appState.selectedServiceLine,
    serviceLineLabel: svcObj.label,
    packageKey: appState.selectedPackage,
    packageName: pkgObj.label,
    addonSelected,
    addonLabel: svcObj.addonLabel,
    addonPrice: svcObj.addonPrice,
    basePrice: pkgObj.price,
    totalPrice, dpAmount, paymentScheme,
    judul, koreografer, jenisTari, budaya, durasi, referensi, sinopsis,
    musicalSpec,
    contractNumber: `${seqNum}/PAL-SPK/XI/2026`,
    composerRole: 'Composer & Arranger',
    musicFileTitle: judul.replace(/\s+/g, '_') + '_Final',
    deliverableFormat: appState.selectedServiceLine === 'transkripsi' ? 'PDF Partitur & Audio Panduan' : 'WAV 24-bit & MP3 320kbps',
    revisionQuota: defaultRev,
    thirdPartyMaterial: 'Tidak ada',
    collaboratorNotes: 'Tidak ada kontributor tambahan',
    rawFilesIncluded: false,
    rawFilesDetail: '',
    extraAttachmentNotes: '-',
    courtCity: 'Samarinda',
    quoteStatus: 'Menunggu Pemeriksaan',
    quoteDurationDays: '7-10 Hari Kerja',
    quoteDeliverables: 'Sesuai Lampiran A & paket yang disepakati',
    quoteNotes: '',
    agreementSigned: false,
    agreementSignedAt: '',
    dpStatus: 'Belum Dibayar',
    dpRejectReason: '',
    dpProofName: '',
    dpProofDataUrl: '',
    pelunasanStatus: paymentScheme === 'Pembayaran Penuh 100%' ? 'Tidak Perlu (Skema Penuh)' : 'Belum Lunas',
    pelunasanProofName: '',
    pelunasanProofDataUrl: '',
    productionStatus: TRACKER_MILESTONES[0],
    previewAudioName: '',
    previewAudioUrl: '',
    masterFileName: '',
    masterFileUrl: '',
    clientAcceptedFinal: false
  };

  appState.projects.unshift(newProject);
  appState.activeBriefProjectId = ticketId;
  appState.selectedClientProjectId = ticketId;
  appState.selectedAdminProjectId = ticketId;
  await syncProjectToCloud(newProject);

  const briefDataUrl = await generateBriefCardPNGDataUrl(newProject);
  document.getElementById('success-ticket-id').textContent = ticketId;
  document.getElementById('brief-card-preview-img').src = briefDataUrl;

  document.getElementById('order-form-container').classList.add('hidden');
  document.getElementById('mobile-sticky-bar')?.classList.add('hidden');
  document.getElementById('order-success-container').classList.remove('hidden');

  triggerPngFileDownload(briefDataUrl, `Kartu-Brief-PrangArt-${ticketId}.png`);
  showToast('Kartu Brief Terunduh!', 'Kirim Kartu Brief PNG ke WhatsApp Produser untuk pemeriksaan & penawaran.');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}