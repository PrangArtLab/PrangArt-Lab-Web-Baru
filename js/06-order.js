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
    btnManual.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-surface text-textMain shadow-sm transition';
    btnAi.className = 'px-3 py-1.5 rounded-lg text-xs font-bold text-textMuted hover:text-textMain transition';
    aiWrap.classList.add('hidden');
  } else {
    btnAi.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white shadow-sm transition';
    btnManual.className = 'px-3 py-1.5 rounded-lg text-xs font-bold text-textMuted hover:text-textMain transition';
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

/* === LANGKAH 02: SPESIFIKASI & DATA KARYA === */
function renderDynamicSpecFields() {
  const c = document.getElementById('dynamic-spec-fields'); if(!c) return;
  const svc = appState.selectedServiceLine;
  
  if (svc === 'tari') {
    c.innerHTML = `
      <div class="space-y-6">
        <div class="p-4 rounded-2xl bg-primary/5 border border-primary/20">
          <h3 class="text-sm font-bold text-primary uppercase tracking-wider">Formulir Data Karya Tari</h3>
          <p class="text-xs text-textMuted mt-1">Isi spesifikasi konsep karya tari Anda di bawah ini. Data ini juga akan digunakan secara otomatis jika Anda memilih penyusunan Sinopsis AI pada Langkah 03.</p>
        </div>

        <!-- A. IDENTITAS KARYA -->
        <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-4">
          <h4 class="text-sm font-bold text-primary">A. IDENTITAS KARYA</h4>
          <p class="text-[11px] text-textMuted">*1. Judul karya tari &amp; 4. Jenis karya (Tari tradisi / Tari kreasi / Tari kontemporer) sudah diisi pada kolom di atas.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold mb-2">2. Nama koreografer/penata tari:</label>
              <input id="spec-koreografer" class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Nama lengkap koreografer" />
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">3. Asal daerah/komunitas (jika ada):</label>
              <input id="spec-asal" class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Cth: Samarinda / Sanggar..." />
            </div>
          </div>
        </div>

        <!-- B. KONSEP PENCIPTAAN -->
        <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-4">
          <h4 class="text-sm font-bold text-primary">B. KONSEP PENCIPTAAN</h4>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold mb-2">5. Tema karya:</label>
              <input id="spec-tema" class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Pokok persoalan atau tema utama yang diangkat" />
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">6. Apa yang melatarbelakangi penciptaan karya ini?</label>
              <textarea id="spec-latar" rows="2" class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Fenomena, tradisi, budaya, atau pengalaman yang melandasi penciptaan karya..."></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">7. Dari mana sumber inspirasi karya ini berasal?</label>
              <textarea id="spec-inspirasi" rows="2" class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Sumber inspirasi karya..."></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">8. Apa gagasan utama yang ingin diangkat melalui tarian ini?</label>
              <textarea id="spec-gagasan" rows="2" class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Gagasan artistik utama..."></textarea>
            </div>
          </div>
        </div>

        <!-- C. KONSEP GARAPAN -->
        <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-4">
          <h4 class="text-sm font-bold text-primary">C. KONSEP GARAPAN</h4>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold mb-2">9. Apa yang digambarkan atau diceritakan dalam tarian ini?</label>
              <textarea id="spec-gambaran" rows="2" class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Substansi atau cerita yang ditampilkan dalam tarian..."></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">10. Bagaimana perkembangan penyajian tari dari awal, tengah, hingga akhir?</label>
              <textarea id="spec-perkembangan" rows="2" class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Alur, suasana, dan perkembangan dramatik/artistik dari awal hingga akhir..."></textarea>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold mb-2">11. Bagaimana karakter gerakan dalam tarian ini?</label>
                <input id="spec-karakter" class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Contoh: lembut, tegas, dinamis, energik, lincah..." />
              </div>
              <div>
                <label class="block text-xs font-bold mb-2">12. Sumber gerakan tari (tradisi, masyarakat, alam, eksplorasi)?</label>
                <input id="spec-sumber-gerak" class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Jelaskan sumber gerak yang digunakan..." />
              </div>
              <div>
                <label class="block text-xs font-bold mb-2">13. Musik pengiring (gambaran musik yang digunakan):</label>
                <input id="spec-musik" class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Tradisional, modern, perpaduan, instrumental..." />
              </div>
              <div>
                <label class="block text-xs font-bold mb-2">14. Alat musik/instrumen (sebutkan nama alat musik atau bunyinya):</label>
                <input id="spec-instrumen" class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Gendang, gong, gambus, piul, suling, rebana..." />
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">15. Kostum dan tata rias seperti apa yang digunakan?</label>
              <input id="spec-kostum" class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Terinspirasi pakaian adat, kehidupan masyarakat, karakter tertentu..." />
            </div>
          </div>
        </div>

        <!-- D. MAKNA DAN PESAN KARYA -->
        <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-4">
          <h4 class="text-sm font-bold text-primary">D. MAKNA DAN PESAN KARYA</h4>
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold mb-2">16. Apakah terdapat makna, filosofi, atau nilai tertentu yang ingin disampaikan?</label>
              <textarea id="spec-makna" rows="2" class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Nilai atau filosofi karya..."></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">17. Apa pesan yang ingin disampaikan kepada penonton?</label>
              <textarea id="spec-pesan" rows="2" class="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Pesan atau refleksi untuk penonton..."></textarea>
            </div>
          </div>
        </div>

        <!-- CATATAN PENGISIAN -->
        <div class="p-5 bg-panel/70 border border-border/60 rounded-2xl text-xs text-textMuted space-y-1.5">
          <strong class="block text-textMain uppercase tracking-wider mb-1">Catatan Pengisian:</strong>
          <p>• Gunakan bahasa sederhana sesuai pemahaman masing-masing koreografer.</p>
          <p>• Tidak harus menggunakan istilah teknis seni tari maupun musik.</p>
          <p>• Untuk pertanyaan yang tidak diketahui atau tidak relevan, boleh dikosongkan.</p>
          <p>• Tidak perlu membuat jawaban panjang. Cukup jelaskan informasi sesuai konsep karya.</p>
          <p>• Pastikan informasi yang diberikan sesuai dengan karya yang benar-benar diciptakan.</p>
        </div>
      </div>
    `;
  } else if (svc === 'digital') {
    c.innerHTML = `
      <div class="space-y-4">
        <div><label class="block text-xs font-bold mb-2">Tema Lagu / Karya *</label><input id="spec-tema" required class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Perpisahan"/></div>
        <div><label class="block text-xs font-bold mb-2">Gaya Musik / Genre *</label><input id="spec-gaya" required class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Pop Akustik"/></div>
        <div><label class="block text-xs font-bold mb-2">Nuansa / Mood *</label><input id="spec-nuansa" required class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Melankolis"/></div>
      </div>
    `;
  } else {
    c.innerHTML = `
      <div class="space-y-4">
        <div><label class="block text-xs font-bold mb-2">Instrumen yang Ditranskripsi *</label><input id="spec-instrumen" required class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Vokal Solo, Piano"/></div>
        <div><label class="block text-xs font-bold mb-2">Format Notasi *</label>
          <select id="spec-format" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm">
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
  const addonPrice = Number(svc.addonPrice || 250000);
  const isAddonChecked = Boolean(document.getElementById('field-addon-vocal')?.checked);
  const addon = isAddonChecked ? addonPrice : 0;
  
  if(document.getElementById('calc-service-name')) {
    document.getElementById('calc-service-name').textContent = svc.label;
    document.getElementById('calc-pkg-name').textContent = appState.customPrice ? 'Harga Kesepakatan' : pkg.label;
    document.getElementById('calc-pkg-price').textContent = formatRupiah(base);
    document.getElementById('calc-total-price').textContent = formatRupiah(base + addon);
    
    const addonRow = document.getElementById('calc-addon-label')?.parentElement;
    if (addonRow) {
      addonRow.classList.toggle('hidden', !isAddonChecked);
      document.getElementById('calc-addon-label').textContent = 'Tambahan Vokal / Player';
      document.getElementById('calc-addon-price').textContent = '+ ' + formatRupiah(addonPrice);
    }
  }
}

/* === GENERATE PROMPT AI DENGAN DATA DARI LANGKAH 02 === */
async function generateAISynopsis() {
  const judul = document.getElementById('field-judul')?.value.trim();
  const jenis = document.getElementById('field-jenis-tari')?.value.trim() || '(Belum diisi)';
  
  if (!judul) return showToast('Info', 'Isi Judul Karya pada Langkah 02 terlebih dahulu.', 'warning');
  
  const btn = document.getElementById('btn-ai-synopsis'); 
  btn.innerHTML = 'Menyusun Sinopsis...'; 
  btn.disabled = true;

  try {
    let promptText = "";
    const valOrEmpty = (id) => document.getElementById(id)?.value.trim() || '(Belum tersedia / dikosongkan)';
    
    if (appState.selectedServiceLine === 'tari') {
      promptText = `PROMPT PENULISAN SINOPSIS KARYA TARI

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
Berikan HANYA teks sinopsisnya saja tanpa kalimat pengantar.

---
FORMULIR DATA KARYA TARI:
A. IDENTITAS KARYA
1. Judul karya tari: ${judul}
2. Nama koreografer/penata tari: ${valOrEmpty('spec-koreografer')}
3. Asal daerah/komunitas (jika ada): ${valOrEmpty('spec-asal')}
4. Jenis karya: ${jenis}

B. KONSEP PENCIPTAAN
5. Tema karya: ${valOrEmpty('spec-tema')}
6. Apa yang melatarbelakangi penciptaan karya ini?: ${valOrEmpty('spec-latar')}
7. Dari mana sumber inspirasi karya ini berasal?: ${valOrEmpty('spec-inspirasi')}
8. Apa gagasan utama yang ingin diangkat melalui tarian ini?: ${valOrEmpty('spec-gagasan')}

C. KONSEP GARAPAN
9. Apa yang digambarkan atau diceritakan dalam tarian ini?: ${valOrEmpty('spec-gambaran')}
10. Bagaimana perkembangan penyajian tari dari awal, tengah, hingga akhir?: ${valOrEmpty('spec-perkembangan')}
11. Bagaimana karakter gerakan dalam tarian ini?: ${valOrEmpty('spec-karakter')}
12. Sumber gerakan tari: ${valOrEmpty('spec-sumber-gerak')}
13. Musik pengiring: ${valOrEmpty('spec-musik')}
14. Alat musik/instrumen: ${valOrEmpty('spec-instrumen')}
15. Kostum dan tata rias: ${valOrEmpty('spec-kostum')}

D. MAKNA DAN PESAN KARYA
16. Makna, filosofi, atau nilai tertentu: ${valOrEmpty('spec-makna')}
17. Pesan untuk penonton: ${valOrEmpty('spec-pesan')}`;
    } else if (appState.selectedServiceLine === 'digital') {
      promptText = `Buat sinopsis singkat dan profesional (100-150 kata) untuk karya musik "${judul}" dengan genre ${valOrEmpty('spec-gaya')}, tema ${valOrEmpty('spec-tema')}, dan nuansa ${valOrEmpty('spec-nuansa')}. Berikan hanya teks sinopsisnya saja.`;
    } else {
      promptText = `Buatkan catatan deskripsi transkripsi profesional untuk karya "${judul}" pada instrumen ${valOrEmpty('spec-instrumen')} dengan format ${valOrEmpty('spec-format')}. Berikan hanya teks deskripsinya saja.`;
    }

    if (!window.firebaseAI) throw new Error('Firebase AI tidak siap');
    const { getGenerativeModel } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-ai.js');
    const model = getGenerativeModel(window.firebaseAI, { model: "gemini-1.5-flash" });
    const res = await model.generateContent(promptText);
    const responseText = (await res.response).text();
    
    document.getElementById('field-sinopsis').value = responseText.trim();
    showToast('Sukses', 'Sinopsis berhasil disusun AI dari spesifikasi.', 'success');
    
  } catch (error) { 
    console.error(error);
    showToast('Mode Offline', 'Menggunakan draf offline. Silakan edit manual.', 'warning');
    
    if (appState.selectedServiceLine === 'tari') {
      const koreografer = document.getElementById('spec-koreografer')?.value.trim();
      const tema = document.getElementById('spec-tema')?.value.trim();
      document.getElementById('field-sinopsis').value = `Karya tari berjudul "${judul}"${koreografer ? ` karya koreografer ${koreografer}` : ''} merupakan ${jenis} yang mengangkat tema ${tema || '[tema perlu dilengkapi]'}. [Informasi latar belakang, konsep garapan, musik, dan makna karya perlu dilengkapi sesuai data spesifikasi].`;
    } else {
      document.getElementById('field-sinopsis').value = `Karya "${judul}" dengan pendekatan musikal yang disesuaikan dengan spesifikasi pesanan.`;
    }
  } finally { 
    btn.innerHTML = '✦ Generate Sinopsis AI dari Spesifikasi'; 
    btn.disabled = false; 
  }
}

async function handleOrderFormSubmit(e) {
  e.preventDefault();
  if (!appState.currentClientUser) return navigateTo('client');
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  const pkg = svc.packages[appState.selectedPackage];
  const basePrice = appState.customPrice || pkg.price;
  const hasVocalAddon = Boolean(document.getElementById('field-addon-vocal')?.checked);
  const addonAmount = hasVocalAddon ? Number(svc.addonPrice || 250000) : 0;
  const total = basePrice + addonAmount;
  
  const specs = [];
  const pushIfVal = (label, id) => {
    const v = document.getElementById(id)?.value.trim();
    if (v) specs.push({ key: label, val: v });
  };
  
  if (appState.selectedServiceLine === 'tari') {
    pushIfVal('Jenis Karya', 'field-jenis-tari');
    pushIfVal('Koreografer', 'spec-koreografer');
    pushIfVal('Asal Daerah/Komunitas', 'spec-asal');
    pushIfVal('Tema Karya', 'spec-tema');
    pushIfVal('Latar Belakang', 'spec-latar');
    pushIfVal('Sumber Inspirasi', 'spec-inspirasi');
    pushIfVal('Gagasan Utama', 'spec-gagasan');
    pushIfVal('Gambaran Isi Karya', 'spec-gambaran');
    pushIfVal('Perkembangan Penyajian', 'spec-perkembangan');
    pushIfVal('Karakter Gerakan', 'spec-karakter');
    pushIfVal('Sumber Gerak', 'spec-sumber-gerak');
    pushIfVal('Musik Pengiring', 'spec-musik');
    pushIfVal('Alat Musik/Instrumen', 'spec-instrumen');
    pushIfVal('Kostum & Tata Rias', 'spec-kostum');
    pushIfVal('Makna & Filosofi', 'spec-makna');
    pushIfVal('Pesan Karya', 'spec-pesan');
  } else if (appState.selectedServiceLine === 'digital') {
    pushIfVal('Tema', 'spec-tema');
    pushIfVal('Genre', 'spec-gaya');
    pushIfVal('Nuansa', 'spec-nuansa');
  } else {
    pushIfVal('Instrumen', 'spec-instrumen');
    pushIfVal('Format Notasi', 'spec-format');
  }

  if (hasVocalAddon) {
    specs.push({ key: 'Tambahan Vokal / Player', val: `+ ${formatRupiah(addonAmount)}` });
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
    durasi: document.getElementById('field-durasi').value,
    serviceLine: appState.selectedServiceLine, 
    serviceLineLabel: svc.label, 
    packageName: appState.customPrice ? 'Kustom' : pkg.label, 
    hasVocalAddon: hasVocalAddon,
    addonAmount: addonAmount,
    totalPrice: total, 
    dpAmount: total / 2, 
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
