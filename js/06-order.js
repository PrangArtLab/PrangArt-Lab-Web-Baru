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

/* === INJEKSI FORM PANJANG KE DALAM HTML === */
function renderDynamicSpecFields() {
  const c = document.getElementById('dynamic-spec-fields'); if(!c) return;
  const svc = appState.selectedServiceLine;
  
  if (svc === 'tari') {
    c.innerHTML = `
      <div class="space-y-6">
        <!-- A. IDENTITAS KARYA -->
        <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-4">
          <h4 class="text-sm font-bold text-primary mb-2">A. Identitas Karya</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label class="block text-xs font-bold mb-2">Nama Koreografer / Penata Tari *</label><input id="spec-koreografer" required class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Nama lengkap"/></div>
            <div><label class="block text-xs font-bold mb-2">Asal Daerah / Komunitas</label><input id="spec-asal" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Cth: Surakarta / Sanggar X"/></div>
          </div>
        </div>

        <!-- B. KONSEP PENCIPTAAN -->
        <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-4">
          <h4 class="text-sm font-bold text-primary mb-2">B. Konsep Penciptaan</h4>
          <div class="space-y-4">
            <div><label class="block text-xs font-bold mb-2">Tema Karya *</label><input id="spec-tema" required class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Cth: Pelestarian Alam"/></div>
            <div><label class="block text-xs font-bold mb-2">Latar Belakang Penciptaan</label><textarea id="spec-latar" rows="2" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Apa yang melatarbelakangi karya ini?"></textarea></div>
            <div><label class="block text-xs font-bold mb-2">Sumber Inspirasi</label><textarea id="spec-inspirasi" rows="2" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Dari mana inspirasi ini berasal?"></textarea></div>
            <div><label class="block text-xs font-bold mb-2">Gagasan Utama</label><textarea id="spec-gagasan" rows="2" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Apa gagasan utama yang ingin diangkat?"></textarea></div>
          </div>
        </div>

        <!-- C. KONSEP GARAPAN -->
        <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-4">
          <h4 class="text-sm font-bold text-primary mb-2">C. Konsep Garapan</h4>
          <div class="space-y-4">
            <div><label class="block text-xs font-bold mb-2">Gambaran Isi Karya *</label><textarea id="spec-gambaran" required rows="2" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Apa yang digambarkan atau diceritakan dalam tarian ini?"></textarea></div>
            <div><label class="block text-xs font-bold mb-2">Perkembangan Penyajian</label><textarea id="spec-perkembangan" rows="2" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Bagaimana alur dari awal, tengah, hingga akhir?"></textarea></div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label class="block text-xs font-bold mb-2">Karakter Gerakan</label><input id="spec-karakter" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Cth: Lembut, Tegas"/></div>
              <div><label class="block text-xs font-bold mb-2">Sumber Gerak</label><input id="spec-sumber-gerak" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Cth: Tradisi, Alam"/></div>
              <div><label class="block text-xs font-bold mb-2">Musik Pengiring</label><input id="spec-musik" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Cth: Tradisional Modern"/></div>
              <div><label class="block text-xs font-bold mb-2">Instrumen / Alat Musik</label><input id="spec-instrumen" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Cth: Gendang, Gong"/></div>
            </div>
            <div><label class="block text-xs font-bold mb-2">Kostum & Tata Rias</label><input id="spec-kostum" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Cth: Pakaian Adat Jawa"/></div>
          </div>
        </div>

        <!-- D. MAKNA & PESAN -->
        <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-4">
          <h4 class="text-sm font-bold text-primary mb-2">D. Makna dan Pesan</h4>
          <div class="space-y-4">
            <div><label class="block text-xs font-bold mb-2">Makna / Filosofi</label><textarea id="spec-makna" rows="2" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Nilai atau filosofi yang ingin disampaikan..."></textarea></div>
            <div><label class="block text-xs font-bold mb-2">Pesan untuk Penonton</label><textarea id="spec-pesan" rows="2" class="w-full bg-surface border rounded-xl px-4 py-2 text-sm" placeholder="Pesan moral / refleksi..."></textarea></div>
          </div>
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

/* === GENERATE PROMPT AI DENGAN DATA DARI HTML LAMA === */
async function generateAISynopsis() {
  const judul = document.getElementById('field-judul').value;
  const jenis = document.getElementById('field-jenis-tari').value;
  
  if (!judul) return showToast('Info', 'Isi Judul Karya dulu.', 'warning');
  
  const btn = document.getElementById('btn-ai-synopsis'); 
  btn.innerHTML = 'Menyusun...'; 
  btn.disabled = true;

  try {
    let promptText = "";
    
    if (appState.selectedServiceLine === 'tari') {
       const data = {
          koreografer: document.getElementById('spec-koreografer')?.value || '',
          asal: document.getElementById('spec-asal')?.value || '',
          tema: document.getElementById('spec-tema')?.value || '',
          latar: document.getElementById('spec-latar')?.value || '',
          inspirasi: document.getElementById('spec-inspirasi')?.value || '',
          gagasan: document.getElementById('spec-gagasan')?.value || '',
          gambaran: document.getElementById('spec-gambaran')?.value || '',
          perkembangan: document.getElementById('spec-perkembangan')?.value || '',
          karakter: document.getElementById('spec-karakter')?.value || '',
          sumber_gerak: document.getElementById('spec-sumber-gerak')?.value || '',
          musik: document.getElementById('spec-musik')?.value || '',
          instrumen: document.getElementById('spec-instrumen')?.value || '',
          kostum: document.getElementById('spec-kostum')?.value || '',
          makna: document.getElementById('spec-makna')?.value || '',
          pesan: document.getElementById('spec-pesan')?.value || ''
       };

       promptText = `
Anda adalah seorang penulis, pengkaji seni tari, dan dramaturg yang memahami koreografi, etnokoreologi, serta penulisan karya seni pertunjukan.
Buatlah sinopsis karya tari berdasarkan data yang saya berikan di bawah ini.
Susun tulisan secara profesional, sistematis, komunikatif, dan memiliki kedalaman artistik tanpa menggunakan bahasa yang berlebihan atau terlalu puitis.

Data Karya:
1. Identitas Karya: 
   - Judul: ${judul}
   - Koreografer: ${data.koreografer}
   - Asal Daerah/Komunitas: ${data.asal}
   - Jenis Karya: ${jenis}
2. Tema Karya: ${data.tema}
3. Latar Belakang Penciptaan: ${data.latar}
4. Ide dan Konsep Garapan (Sumber Inspirasi): ${data.inspirasi}
5. Gagasan Utama: ${data.gagasan}
6. Gambaran Isi Karya: ${data.gambaran}
7. Perkembangan Penyajian: ${data.perkembangan}
8. Konsep Gerak: Karakter (${data.karakter}), Sumber Gerak (${data.sumber_gerak})
9. Konsep Musik: ${data.musik} (Instrumen: ${data.instrumen})
10. Kostum dan Tata Rias: ${data.kostum}
11. Makna dan Filosofi: ${data.makna}
12. Pesan Karya: ${data.pesan}

Ketentuan Penulisan:
- Gunakan bahasa Indonesia yang baik dan benar.
- Gunakan gaya penulisan profesional untuk proposal, festival, pertunjukan, dan katalog karya tari.
- Susun dalam bentuk narasi yang utuh dan mengalir (bukan daftar poin).
- Hindari pengulangan gagasan, kalimat klise, dan ungkapan puitis yang tidak perlu.
- Jangan mengarang informasi, filosofi, simbol, sejarah, atau makna yang tidak diberikan. Apabila ada bagian yang kosong, jangan buat asumsi.
- Panjang sinopsis sekitar 150-250 kata.

Hasil Akhir:
Berikan HANYA teks sinopsisnya saja tanpa kalimat pengantar (seperti "Berikut adalah sinopsis...").
       `;
    } else if (appState.selectedServiceLine === 'digital') {
       promptText = `Buat sinopsis singkat dan profesional untuk lagu "${judul}" dengan genre ${document.getElementById('spec-gaya')?.value || 'bebas'}, tema ${document.getElementById('spec-tema')?.value || 'kehidupan'}, dan nuansa ${document.getElementById('spec-nuansa')?.value || 'emosional'}.`;
    } else {
       promptText = `Buatkan catatan transkripsi profesional untuk karya "${judul}" yang ditranskripsi untuk instrumen ${document.getElementById('spec-instrumen')?.value || 'musik'} dengan format ${document.getElementById('spec-format')?.value || 'notasi'}.`;
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
      const tema = document.getElementById('spec-tema')?.value || 'kehidupan';
      document.getElementById('field-sinopsis').value = `Karya tari berjudul "${judul}" ini merupakan sebuah interpretasi dari tema ${tema}. Melalui gerak yang dinamis dan penuh penghayatan, karya ini berusaha menyampaikan pesan estetis kepada penonton.\n\n*(Catatan: Sinopsis ini di-generate secara offline karena sistem AI sedang sibuk. Silakan edit bagian ini secara manual untuk melengkapinya).*`;
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
    specs.push({ key: 'Koreografer', val: document.getElementById('spec-koreografer')?.value });
    specs.push({ key: 'Tema', val: document.getElementById('spec-tema')?.value });
    specs.push({ key: 'Jenis Karya', val: document.getElementById('field-jenis-tari')?.value });
  } else if (appState.selectedServiceLine === 'digital') {
    specs.push({ key: 'Tema', val: document.getElementById('spec-tema')?.value });
    specs.push({ key: 'Genre', val: document.getElementById('spec-gaya')?.value });
  } else {
    specs.push({ key: 'Instrumen', val: document.getElementById('spec-instrumen')?.value });
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
