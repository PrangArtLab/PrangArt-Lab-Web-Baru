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

/* === FORM DINAMIS — TARI mengikuti FORMULIR DATA KARYA TARI (17 pertanyaan) === */
function renderDynamicSpecFields() {
  const c = document.getElementById('dynamic-spec-fields'); if(!c) return;
  const svc = appState.selectedServiceLine;
  
  if (svc === 'tari') {
    c.innerHTML = `
      <div class="space-y-6">

        <!-- A. IDENTITAS KARYA -->
        <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-4">
          <h4 class="text-sm font-bold text-primary mb-2">A. Identitas Karya</h4>
          <p class="text-[11px] text-textMuted italic -mt-2 mb-2">
            No. 1 (Judul) &amp; No. 4 (Jenis Karya) diisi di bagian <strong>Informasi Karya</strong> di atas.
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold mb-2">2. Nama Koreografer / Penata Tari *</label>
              <input id="spec-koreografer" required class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Nama lengkap"/>
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">3. Asal Daerah / Komunitas (jika ada)</label>
              <input id="spec-asal" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Cth: Surakarta / Sanggar X"/>
            </div>
          </div>
        </div>

        <!-- B. KONSEP PENCIPTAAN -->
        <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-4">
          <h4 class="text-sm font-bold text-primary mb-2">B. Konsep Penciptaan</h4>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold mb-2">5. Tema Karya *</label>
              <input id="spec-tema" required class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Pokok persoalan / gagasan utama"/>
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">6. Apa yang melatarbelakangi penciptaan karya ini?</label>
              <textarea id="spec-latar" rows="2" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Fenomena, tradisi, budaya, atau pengalaman yang melandasi"></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">7. Dari mana sumber inspirasi karya ini berasal?</label>
              <textarea id="spec-inspirasi" rows="2" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Sumber inspirasi karya"></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">8. Apa gagasan utama yang ingin diangkat melalui tarian ini?</label>
              <textarea id="spec-gagasan" rows="2" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Gagasan utama karya"></textarea>
            </div>
          </div>
        </div>

        <!-- C. KONSEP GARAPAN -->
        <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-4">
          <h4 class="text-sm font-bold text-primary mb-2">C. Konsep Garapan</h4>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold mb-2">9. Apa yang digambarkan atau diceritakan dalam tarian ini? *</label>
              <textarea id="spec-gambaran" required rows="2" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Substansi / alur / suasana yang digambarkan"></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">10. Bagaimana perkembangan penyajian tari dari awal, tengah, hingga akhir?</label>
              <textarea id="spec-perkembangan" rows="2" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Alur dramatik dari awal hingga akhir"></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">11. Bagaimana karakter gerakan dalam tarian ini?</label>
              <input id="spec-karakter" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Cth: lembut, tegas, dinamis, energik, lincah, atau perpaduan"/>
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">12. Apakah gerakan tari bersumber dari gerak tradisi, aktivitas masyarakat, alam, kehidupan sehari-hari, atau hasil eksplorasi sendiri? Jelaskan.</label>
              <textarea id="spec-sumber-gerak" rows="2" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Sumber gerak dan penjelasannya"></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">13. Musik pengiring: Bagaimana gambaran musik yang digunakan dalam tarian ini?</label>
              <input id="spec-musik" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Cth: tradisional, modern, perpaduan, atau instrumental"/>
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">14. Alat musik/instrumen: Apakah ada alat musik yang digunakan atau terdengar dalam pengiring tari? Sebutkan jika mengetahui namanya.</label>
              <input id="spec-instrumen" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Cth: gendang, gong, gambus, biola, suling, rebana, gitar, piano, atau lainnya"/>
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">15. Kostum dan tata rias seperti apa yang digunakan?</label>
              <input id="spec-kostum" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Cth: terinspirasi pakaian adat, kehidupan masyarakat, karakter tertentu, atau konsep lainnya"/>
            </div>
          </div>
        </div>

        <!-- D. MAKNA DAN PESAN KARYA -->
        <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-4">
          <h4 class="text-sm font-bold text-primary mb-2">D. Makna dan Pesan Karya</h4>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold mb-2">16. Apakah terdapat makna, filosofi, atau nilai tertentu yang ingin disampaikan melalui karya ini?</label>
              <textarea id="spec-makna" rows="2" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Makna / filosofi / nilai"></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">17. Apa pesan yang ingin disampaikan kepada penonton?</label>
              <textarea id="spec-pesan" rows="2" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Pesan untuk penonton"></textarea>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-primary/5 border border-primary/20 text-[11px] text-textMuted leading-relaxed">
          <strong class="text-textMain block mb-1">Catatan Pengisian:</strong>
          Gunakan bahasa sederhana sesuai pemahaman. Tidak harus menggunakan istilah teknis. Untuk pertanyaan yang tidak diketahui atau tidak relevan, boleh dikosongkan.
        </div>
      </div>
    `;
  } else if (svc === 'digital') {
    c.innerHTML = `
      <div class="space-y-4">
        <div><label class="block text-xs font-bold mb-2">Tema Lagu / Karya *</label><input id="spec-tema" required class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Cth: Perpisahan"/></div>
        <div><label class="block text-xs font-bold mb-2">Gaya Musik / Genre *</label><input id="spec-gaya" required class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Cth: Pop Akustik"/></div>
        <div><label class="block text-xs font-bold mb-2">Nuansa / Mood *</label><input id="spec-nuansa" required class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Cth: Melankolis"/></div>
      </div>
    `;
  } else {
    c.innerHTML = `
      <div class="space-y-4">
        <div><label class="block text-xs font-bold mb-2">Instrumen yang Ditranskripsi *</label><input id="spec-instrumen" required class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Cth: Vokal Solo, Piano"/></div>
        <div><label class="block text-xs font-bold mb-2">Format Notasi *</label>
          <select id="spec-format" class="w-full bg-surface border rounded-xl px-4 py-2.5 text-sm">
            <option value="Not Angka">Not Angka</option>
            <option value="Not Balok">Not Balok</option>
            <option value="Keduanya">Keduanya</option>
          </select>
        </div>
      </div>
    `;
  }
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

/* === KUMPULKAN DATA FORMULIR TARI (17 PERTANYAAN) === */
function collectTariFormData() {
  const get = (id) => (document.getElementById(id)?.value || '').trim();
  return {
    judul:        get('field-judul'),
    koreografer:  get('spec-koreografer'),
    asal:         get('spec-asal'),
    jenis:        get('field-jenis-tari'),
    tema:         get('spec-tema'),
    latar:        get('spec-latar'),
    inspirasi:    get('spec-inspirasi'),
    gagasan:      get('spec-gagasan'),
    gambaran:     get('spec-gambaran'),
    perkembangan: get('spec-perkembangan'),
    karakter:     get('spec-karakter'),
    sumberGerak:  get('spec-sumber-gerak'),
    musik:        get('spec-musik'),
    instrumen:    get('spec-instrumen'),
    kostum:       get('spec-kostum'),
    makna:        get('spec-makna'),
    pesan:        get('spec-pesan')
  };
}

/* === BANGUN PROMPT SINOPSIS KARYA TARI (template lengkap dari user) === */
function buildTariSynopsisPrompt(data) {
  const f = (v) => v && v.length ? v : '(belum diisi)';

  return `PROMPT PENULISAN SINOPSIS KARYA TARI

Bertindaklah sebagai seorang penulis, pengkaji seni tari, dan dramaturg yang memahami koreografi, etnokoreologi, serta penulisan karya seni pertunjukan.

Buatlah sinopsis karya tari berdasarkan informasi dan konsep yang saya berikan. Susun tulisan secara profesional, sistematis, komunikatif, dan memiliki kedalaman artistik tanpa menggunakan bahasa yang berlebihan atau terlalu puitis.

Sinopsis harus mencakup unsur-unsur berikut:

1. Identitas Karya: Judul tari dan nama koreografer.
2. Tema Karya: Pokok persoalan atau gagasan utama yang diangkat.
3. Latar Belakang Penciptaan: Sumber inspirasi, fenomena, tradisi, budaya, atau pengalaman yang melandasi penciptaan karya.
4. Ide dan Konsep Garapan: Gagasan artistik serta pendekatan penciptaan yang digunakan.
5. Gambaran Isi Karya: Penjelasan mengenai substansi, alur, suasana, dan perkembangan dramatik atau artistik tarian dari awal hingga akhir.
6. Konsep Gerak: Sumber gerak, karakteristik gerak, serta pengembangan atau eksplorasi gerak yang digunakan.
7. Konsep Musik: Karakter musik pengiring, instrumen, pola musikal, dan hubungannya dengan gerak tari.
8. Kostum dan Tata Rias: Gambaran visual busana dan tata rias serta relevansinya dengan konsep karya.
9. Makna dan Pesan Karya: Nilai, filosofi, refleksi, atau pesan yang ingin disampaikan kepada penonton.

Ketentuan Penulisan:

- Gunakan bahasa Indonesia yang baik dan benar.
- Gunakan gaya penulisan profesional untuk kebutuhan proposal, festival, pertunjukan, dan katalog karya tari.
- Susun dalam bentuk narasi yang utuh dan mengalir, bukan sekadar daftar poin.
- Hindari pengulangan gagasan, kalimat klise, dan ungkapan puitis yang tidak diperlukan.
- Pastikan setiap informasi saling berkaitan dan membentuk identitas karya yang jelas.
- Jangan mengarang informasi, filosofi, simbol, sejarah, atau makna yang tidak diberikan.
- Apabila terdapat informasi yang belum tersedia, jangan membuat asumsi. Tandai bagian tersebut sebagai informasi yang perlu dilengkapi.
- Bedakan secara jelas antara sumber inspirasi, konsep artistik, dan makna karya.
- Jangan memaksakan seluruh unsur masuk apabila tidak relevan dengan karya.

Hasil Akhir:
Buat satu sinopsis tari yang utuh, padat, informatif, memiliki karakter artistik, dan mampu memberikan pemahaman kepada pembaca mengenai latar belakang, gagasan, bentuk penyajian, serta substansi karya tari.

Panjang sinopsis disesuaikan dengan kebutuhan, dengan rekomendasi sekitar 150–250 kata.

---

FORMULIR DATA KARYA TARI
Bahan penyusunan sinopsis karya tari

A. IDENTITAS KARYA

1. Judul karya tari: ${f(data.judul)}
2. Nama koreografer/penata tari: ${f(data.koreografer)}
3. Asal daerah/komunitas (jika ada): ${f(data.asal)}
4. Jenis karya (Tari tradisi / Tari kreasi / Tari kontemporer): ${f(data.jenis)}

B. KONSEP PENCIPTAAN

5. Tema karya: ${f(data.tema)}
6. Apa yang melatarbelakangi penciptaan karya ini?: ${f(data.latar)}
7. Dari mana sumber inspirasi karya ini berasal?: ${f(data.inspirasi)}
8. Apa gagasan utama yang ingin diangkat melalui tarian ini?: ${f(data.gagasan)}

C. KONSEP GARAPAN

9. Apa yang digambarkan atau diceritakan dalam tarian ini?: ${f(data.gambaran)}
10. Bagaimana perkembangan penyajian tari dari awal, tengah, hingga akhir?: ${f(data.perkembangan)}
11. Bagaimana karakter gerakan dalam tarian ini?: ${f(data.karakter)}
12. Apakah gerakan tari bersumber dari gerak tradisi, aktivitas masyarakat, alam, kehidupan sehari-hari, atau hasil eksplorasi sendiri? Jelaskan: ${f(data.sumberGerak)}
13. Musik pengiring: ${f(data.musik)}
14. Alat musik/instrumen: ${f(data.instrumen)}
15. Kostum dan tata rias: ${f(data.kostum)}

D. MAKNA DAN PESAN KARYA

16. Makna, filosofi, atau nilai tertentu yang ingin disampaikan: ${f(data.makna)}
17. Pesan yang ingin disampaikan kepada penonton: ${f(data.pesan)}`;
}

/* === GENERATE SINOPSIS AI === */
async function generateAISynopsis() {
  const judul = document.getElementById('field-judul').value;
  if (!judul) return showToast('Info', 'Isi Judul Karya dulu.', 'warning');
  
  const btn = document.getElementById('btn-ai-synopsis'); 
  btn.innerHTML = 'Menyusun...'; 
  btn.disabled = true;

  let promptText = '';

  try {
    if (appState.selectedServiceLine === 'tari') {
      const data = collectTariFormData();
      promptText = buildTariSynopsisPrompt(data);
    } else if (appState.selectedServiceLine === 'digital') {
      const get = (id) => (document.getElementById(id)?.value || '').trim();
      promptText = `Buat sinopsis singkat dan profesional untuk lagu "${judul}" dengan genre ${get('spec-gaya') || 'bebas'}, tema ${get('spec-tema') || 'kehidupan'}, dan nuansa ${get('spec-nuansa') || 'emosional'}.`;
    } else {
      const get = (id) => (document.getElementById(id)?.value || '').trim();
      promptText = `Buatkan catatan transkripsi profesional untuk karya "${judul}" yang ditranskripsi untuk instrumen ${get('spec-instrumen') || 'musik'} dengan format ${get('spec-format') || 'notasi'}.`;
    }

    if (!window.firebaseAI) throw new Error('Firebase AI tidak siap');
    const { getGenerativeModel } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-ai.js');
    const model = getGenerativeModel(window.firebaseAI, { model: "gemini-1.5-flash" });
    const res = await model.generateContent(promptText);
    const responseText = (await res.response).text();
    
    document.getElementById('field-sinopsis').value = responseText.trim();
    showToast('Sukses', 'Sinopsis berhasil dibuat oleh AI.', 'success');
    
  } catch (error) { 
    console.error(error);
    showToast('Mode Offline', 'Menggunakan draf offline. Silakan edit manual.', 'warning');
    
    if (appState.selectedServiceLine === 'tari') {
      const d = collectTariFormData();
      document.getElementById('field-sinopsis').value =
        `Karya tari berjudul "${judul || '(judul belum diisi)'}" karya ${d.koreografer || '(koreografer belum diisi)'} ini mengangkat tema ${d.tema || '(tema belum diisi)'}. ` +
        (d.gambaran ? `Karya ini menggambarkan ${d.gambaran}. ` : '') +
        (d.pesan ? `Pesan yang ingin disampaikan adalah ${d.pesan}.` : '') +
        `\n\n*(Mode Offline — silakan lengkapi/edit manual. Prompt lengkap telah disiapkan berdasarkan FORMULIR DATA KARYA TARI.)*`;
    } else {
      document.getElementById('field-sinopsis').value = `Karya "${judul}" yang memukau dengan pendekatan musikal yang unik.\n\n*(Mode Offline)*`;
    }
  } finally { 
    btn.innerHTML = '✦ Generate Sinopsis AI'; 
    btn.disabled = false; 
  }
}

async function handleOrderFormSubmit(e) {
  e.preventDefault();
  if (!appState.currentClientUser) return navigateTo('client');
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  const pkg = svc.packages[appState.selectedPackage];
  const total = (appState.customPrice || pkg.price) + (document.getElementById('field-addon-vocal').checked ? svc.addonPrice : 0);
  
  const specs = [];
  
  if (appState.selectedServiceLine === 'tari') {
    const d = collectTariFormData();
    specs.push({ key: 'Koreografer', val: d.koreografer });
    specs.push({ key: 'Asal/ Komunitas', val: d.asal });
    specs.push({ key: 'Jenis Karya', val: d.jenis });
    specs.push({ key: 'Tema', val: d.tema });
    specs.push({ key: 'Latar Belakang', val: d.latar });
    specs.push({ key: 'Sumber Inspirasi', val: d.inspirasi });
    specs.push({ key: 'Gagasan Utama', val: d.gagasan });
    specs.push({ key: 'Gambaran Isi', val: d.gambaran });
    specs.push({ key: 'Perkembangan', val: d.perkembangan });
    specs.push({ key: 'Karakter Gerak', val: d.karakter });
    specs.push({ key: 'Sumber Gerak', val: d.sumberGerak });
    specs.push({ key: 'Musik Pengiring', val: d.musik });
    specs.push({ key: 'Instrumen', val: d.instrumen });
    specs.push({ key: 'Kostum & Tata Rias', val: d.kostum });
    specs.push({ key: 'Makna/Filosofi', val: d.makna });
    specs.push({ key: 'Pesan', val: d.pesan });
  } else if (appState.selectedServiceLine === 'digital') {
    specs.push({ key: 'Tema', val: document.getElementById('spec-tema')?.value });
    specs.push({ key: 'Genre', val: document.getElementById('spec-gaya')?.value });
    specs.push({ key: 'Nuansa', val: document.getElementById('spec-nuansa')?.value });
  } else {
    specs.push({ key: 'Instrumen', val: document.getElementById('spec-instrumen')?.value });
    specs.push({ key: 'Format', val: document.getElementById('spec-format')?.value });
  }

  const videoLink = document.getElementById('field-video-link')?.value || '';
  const videoFileInput = document.getElementById('field-video-file');
  const videoFileName = videoFileInput?.files[0] ? videoFileInput.files[0].name : '';
  const sinopsis = document.getElementById('field-sinopsis')?.value || '';

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
    videoFileName: videoFileName,
    sinopsis: sinopsis
  };
  
  appState.projects.unshift(newP); await syncProjectToCloud(newP);
  showToast('Berhasil', 'Pesanan dibuat.'); navigateTo('client');
}
