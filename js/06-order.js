const AI_QUOTA_STORAGE_KEY = 'prangart_ai_synopsis_quota_v1';
const AI_DAILY_LIMIT = 2;
const AI_COOLDOWN_MS = 10 * 60 * 1000; // 10 menit

function getTodayDateString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getUserAIQuotaState() {
  const email = appState.currentClientUser?.email || 'guest';
  const today = getTodayDateString();
  try {
    const raw = JSON.parse(localStorage.getItem(AI_QUOTA_STORAGE_KEY) || '{}');
    const record = raw[email];
    if (!record || record.date !== today) {
      return { date: today, count: 0, lastTimestamp: 0 };
    }
    return {
      date: today,
      count: Number(record.count || 0),
      lastTimestamp: Number(record.lastTimestamp || 0)
    };
  } catch (_) {
    return { date: today, count: 0, lastTimestamp: 0 };
  }
}

function saveUserAIQuotaState(state) {
  const email = appState.currentClientUser?.email || 'guest';
  try {
    const raw = JSON.parse(localStorage.getItem(AI_QUOTA_STORAGE_KEY) || '{}');
    raw[email] = state;
    localStorage.setItem(AI_QUOTA_STORAGE_KEY, JSON.stringify(raw));
  } catch (_) {}
}

function updateAIQuotaBanner() {
  const banner = document.getElementById('ai-quota-status-banner');
  if (!banner) return;
  const q = getUserAIQuotaState();
  const remaining = Math.max(0, AI_DAILY_LIMIT - q.count);
  const now = Date.now();
  const elapsed = now - q.lastTimestamp;

  let cooldownText = 'Siap digunakan sekarang';
  if (remaining === 0) {
    cooldownText = 'Kuota harian habis (reset besok)';
  } else if (q.lastTimestamp > 0 && elapsed < AI_COOLDOWN_MS) {
    const waitSec = Math.ceil((AI_COOLDOWN_MS - elapsed) / 1000);
    const min = Math.floor(waitSec / 60);
    const sec = waitSec % 60;
    cooldownText = `Jeda aktif — tunggu ${min} menit ${sec} detik lagi`;
  }

  banner.textContent = `Kuota Generate AI Hari Ini: ${q.count}/${AI_DAILY_LIMIT} terpakai (Sisa: ${remaining}x) • Status: ${cooldownText}`;
}

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
    renderAIDetailForm();
    updateAIQuotaBanner();
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
  
  if (appState.synopsisMode === 'ai') renderAIDetailForm();
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
  const inp = document.getElementById('custom-price-input');
  if (inp) inp.value = ''; 
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

function toggleNuansaOtherInput(val) {
  const wrap = document.getElementById('nuansa-other-wrapper');
  const inp = document.getElementById('spec-nuansa-other');
  if (!wrap || !inp) return;
  if (val === 'Other') {
    wrap.classList.remove('hidden');
    inp.required = true;
  } else {
    wrap.classList.add('hidden');
    inp.required = false;
    inp.value = '';
  }
}

/* === LANGKAH 02: SPESIFIKASI SESUAI PAKET (DASAR / STANDAR / PRO) + OPSI SORAK === */
function renderDynamicSpecFields() {
  const c = document.getElementById('dynamic-spec-fields'); if(!c) return;
  const svc = appState.selectedServiceLine;
  const pkg = appState.selectedPackage; // 'dasar' | 'standar' | 'pro'
  
  const sorakOptionHTML = `
    <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-3">
      <label class="block text-xs font-bold">Tambahan Sorak (Opsi untuk Semua Paket) *</label>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label class="flex items-center gap-3 p-3.5 rounded-xl bg-surface border border-border cursor-pointer hover:border-primary transition">
          <input type="radio" name="spec-sorak" value="Tidak Perlu Sorak" checked class="w-4 h-4 accent-primary" />
          <span class="text-xs font-semibold">Tidak Perlu Sorak</span>
        </label>
        <label class="flex items-center gap-3 p-3.5 rounded-xl bg-surface border border-border cursor-pointer hover:border-primary transition">
          <input type="radio" name="spec-sorak" value="Ya, Tambahkan Sorak" class="w-4 h-4 accent-primary" />
          <span class="text-xs font-semibold">Ya, Tambahkan Sorak</span>
        </label>
      </div>
    </div>
  `;

  if (svc === 'tari') {
    if (pkg === 'dasar') {
      c.innerHTML = `
        <div class="space-y-5">
          <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-4">
            <span class="text-[11px] font-mono uppercase text-primary font-bold block">Spesifikasi Paket Dasar</span>
            <div>
              <label class="block text-xs font-bold mb-2">Nuansa Musik yang Diinginkan *</label>
              <select id="spec-nuansa-dasar" required onchange="toggleNuansaOtherInput(this.value)" class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm">
                <option value="Sakral / Ritual">Sakral / Ritual</option>
                <option value="Ceria / Enerjik">Ceria / Enerjik</option>
                <option value="Dramatis">Dramatis</option>
                <option value="Misterius">Misterius</option>
                <option value="Other">Other (Tulis sendiri)</option>
              </select>
            </div>
            <div id="nuansa-other-wrapper" class="hidden">
              <label class="block text-xs font-bold mb-2">Sebutkan Nuansa Musik Lainnya *</label>
              <input id="spec-nuansa-other" class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Syahdu, Megah, Melankolis..." />
            </div>
          </div>
          ${sorakOptionHTML}
        </div>
      `;
    } else if (pkg === 'standar') {
      c.innerHTML = `
        <div class="space-y-5">
          <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-4">
            <span class="text-[11px] font-mono uppercase text-primary font-bold block">Spesifikasi Paket Standar</span>
            <div>
              <label class="block text-xs font-bold mb-2">Struktur Tari *</label>
              <input id="spec-struktur-tari" required class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Opening – Orientasi Suasana – Bagian Tengah – Klimaks – Penutup" />
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">Jelaskan urutan nuansa musik yang diinginkan berdasarkan struktur tari *</label>
              <p class="text-[11px] text-textMuted mb-2">Sertakan perkiraan waktu adegan jika memungkinkan.</p>
              <div class="p-3.5 rounded-xl bg-surface/80 border border-border/60 text-[11px] font-mono text-textMuted mb-3 space-y-1">
                <strong class="text-textMain block font-sans mb-1">Contoh penulisan:</strong>
                <div>00:00–00:30 → Opening (sebutkan tempo)</div>
                <div>00:30–01:10 → Orientasi Suasana Cerita (sebutkan tempo)</div>
                <div>01:10–01:50 → Bagian Tengah (sebutkan tempo)</div>
                <div>01:50–02:30 → Klimaks (sebutkan tempo)</div>
                <div>02:30–Ending → Penutup (sebutkan tempo)</div>
              </div>
              <textarea id="spec-urutan-standar" rows="6" required placeholder="Tuliskan urutan struktur tari, perkiraan waktu adegan, dan tempo di sini..." class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-mono"></textarea>
            </div>
          </div>
          ${sorakOptionHTML}
        </div>
      `;
    } else {
      // PAKET PRO
      c.innerHTML = `
        <div class="space-y-5">
          <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-4">
            <span class="text-[11px] font-mono uppercase text-primary font-bold block">Spesifikasi Paket Pro</span>
            <div>
              <label class="block text-xs font-bold mb-2">Tautan Video Tari melalui Google Drive per bagian berdasarkan tempo <span class="text-textMuted font-normal">(jika memang diperlukan)</span></label>
              <textarea id="spec-gdrive-pro" rows="3" placeholder="Tempelkan link Google Drive per bagian/tempo di sini (pastikan akses link dibuka / Anyone with the link)..." class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm"></textarea>
            </div>
            <div>
              <label class="block text-xs font-bold mb-2">Urutan nuansa musik yang diinginkan berdasarkan alur tari dan/atau video tari yang Anda lampirkan *</label>
              <p class="text-[11px] text-textMuted mb-2">• Sertakan perkiraan waktu adegan.<br/>• Jelaskan apakah diawali dengan musik pembuka kemudian tari masuk, atau hanya diberi kode lalu langsung masuk ke gerakan.</p>
              <div class="p-3.5 rounded-xl bg-surface/80 border border-border/60 text-[11px] font-mono text-textMuted mb-3 space-y-1">
                <strong class="text-textMain block font-sans mb-1">Contoh deskripsi per video / per tempo:</strong>
                <div>Diawali musik pembuka 10 detik, lalu penari masuk:</div>
                <div>Video 1 / tempo 1 (Tempo 120 BPM)</div>
                <div>00:00–00:30 → Nuansa misterius, tempo lambat, pembukaan lembut</div>
                <div>00:30–01:10 → Mulai energik, ritme perkusi muncul (120 BPM)</div>
                <div class="pt-1">Video 2 / tempo 2 (Tempo 100 BPM)</div>
                <div>00:00–01:55 → Dramatis dan tegang</div>
                <div>01:50–02:30 → Pelan dan megah</div>
                <div>dst. sampai ending</div>
              </div>
              <textarea id="spec-urutan-pro" rows="8" required placeholder="Tuliskan penjelasan masuknya musik/tari serta rincian urutan nuansa per video/per tempo sampai ending..." class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-mono"></textarea>
            </div>
          </div>
          ${sorakOptionHTML}
        </div>
      `;
    }
  } else if (svc === 'digital') {
    c.innerHTML = `
      <div class="space-y-4">
        <div><label class="block text-xs font-bold mb-2">Tema Lagu / Karya *</label><input id="spec-tema" required class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Perpisahan"/></div>
        <div><label class="block text-xs font-bold mb-2">Gaya Musik / Genre *</label><input id="spec-gaya" required class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Pop Akustik"/></div>
        <div><label class="block text-xs font-bold mb-2">Nuansa / Mood *</label><input id="spec-nuansa" required class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Melankolis"/></div>
        ${sorakOptionHTML}
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
        ${sorakOptionHTML}
      </div>
    `;
  }
}

/* === FORMULIR DETAIL AI (HANYA MUNCUL KETIKA PILIH OPSI GENERATE AI DI LANGKAH 03) === */
function renderAIDetailForm() {
  const container = document.getElementById('ai-detail-form-container');
  if (!container) return;
  const svc = appState.selectedServiceLine;

  if (svc === 'tari') {
    container.innerHTML = `
      <div class="space-y-5">
        <div class="border-b border-border/60 pb-2">
          <h3 class="text-sm font-bold text-primary uppercase">Formulir Data Karya Tari (Bahan Penyusunan Sinopsis AI)</h3>
          <p class="text-[11px] text-textMuted mt-1">Isi detail konsep karya Anda di bawah ini untuk dijadikan bahan dasar penyusunan sinopsis oleh AI.</p>
        </div>

        <!-- A. IDENTITAS KARYA -->
        <div class="p-4 bg-surface border border-border/80 rounded-xl space-y-3">
          <h4 class="text-xs font-bold text-primary uppercase">A. Identitas Karya</h4>
          <p class="text-[11px] text-textMuted">*1. Judul karya tari &amp; 4. Jenis karya otomatis diambil dari isian Langkah 02.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold mb-1.5">2. Nama koreografer/penata tari:</label>
              <input id="ai-koreografer" class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Nama lengkap penata tari" />
            </div>
            <div>
              <label class="block text-xs font-bold mb-1.5">3. Asal daerah/komunitas (jika ada):</label>
              <input id="ai-asal" class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Cth: Samarinda / Sanggar..." />
            </div>
          </div>
        </div>

        <!-- B. KONSEP PENCIPTAAN -->
        <div class="p-4 bg-surface border border-border/80 rounded-xl space-y-3">
          <h4 class="text-xs font-bold text-primary uppercase">B. Konsep Penciptaan</h4>
          <div>
            <label class="block text-xs font-bold mb-1.5">5. Tema karya:</label>
            <input id="ai-tema" class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Pokok persoalan atau gagasan utama" />
          </div>
          <div>
            <label class="block text-xs font-bold mb-1.5">6. Apa yang melatarbelakangi penciptaan karya ini?</label>
            <textarea id="ai-latar" rows="2" class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Fenomena, tradisi, budaya, atau pengalaman..."></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold mb-1.5">7. Dari mana sumber inspirasi karya ini berasal?</label>
            <textarea id="ai-inspirasi" rows="2" class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Sumber inspirasi karya..."></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold mb-1.5">8. Apa gagasan utama yang ingin diangkat melalui tarian ini?</label>
            <textarea id="ai-gagasan" rows="2" class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Gagasan utama..."></textarea>
          </div>
        </div>

        <!-- C. KONSEP GARAPAN -->
        <div class="p-4 bg-surface border border-border/80 rounded-xl space-y-3">
          <h4 class="text-xs font-bold text-primary uppercase">C. Konsep Garapan</h4>
          <div>
            <label class="block text-xs font-bold mb-1.5">9. Apa yang digambarkan atau diceritakan dalam tarian ini?</label>
            <textarea id="ai-gambaran" rows="2" class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Substansi atau cerita yang ditampilkan..."></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold mb-1.5">10. Bagaimana perkembangan penyajian tari dari awal, tengah, hingga akhir?</label>
            <textarea id="ai-perkembangan" rows="2" class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Alur dari awal, tengah, hingga akhir..."></textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold mb-1.5">11. Bagaimana karakter gerakan dalam tarian ini?</label>
              <input id="ai-karakter" class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Lembut, tegas, dinamis, energik, lincah..." />
            </div>
            <div>
              <label class="block text-xs font-bold mb-1.5">12. Sumber gerakan tari (tradisi, masyarakat, alam, eksplorasi)?</label>
              <input id="ai-sumber-gerak" class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Jelaskan sumber gerak..." />
            </div>
            <div>
              <label class="block text-xs font-bold mb-1.5">13. Musik pengiring (gambaran musik yang digunakan):</label>
              <input id="ai-musik" class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Tradisional, modern, perpaduan, instrumental..." />
            </div>
            <div>
              <label class="block text-xs font-bold mb-1.5">14. Alat musik/instrumen (nama alat musik atau bunyinya):</label>
              <input id="ai-instrumen" class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Gendang, gong, gambus, piul, suling, rebana..." />
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold mb-1.5">15. Kostum dan tata rias seperti apa yang digunakan?</label>
            <input id="ai-kostum" class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Terinspirasi pakaian adat, masyarakat, karakter..." />
          </div>
        </div>

        <!-- D. MAKNA DAN PESAN KARYA -->
        <div class="p-4 bg-surface border border-border/80 rounded-xl space-y-3">
          <h4 class="text-xs font-bold text-primary uppercase">D. Makna dan Pesan Karya</h4>
          <div>
            <label class="block text-xs font-bold mb-1.5">16. Apakah terdapat makna, filosofi, atau nilai tertentu?</label>
            <textarea id="ai-makna" rows="2" class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Nilai atau filosofi karya..."></textarea>
          </div>
          <div>
            <label class="block text-xs font-bold mb-1.5">17. Apa pesan yang ingin disampaikan kepada penonton?</label>
            <textarea id="ai-pesan" rows="2" class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Pesan untuk penonton..."></textarea>
          </div>
        </div>

        <!-- CATATAN PENGISIAN -->
        <div class="p-4 bg-surface/60 border border-border/60 rounded-xl text-[11px] text-textMuted space-y-1">
          <strong class="text-textMain block uppercase mb-1">Catatan Pengisian:</strong>
          <p>• Gunakan bahasa sederhana sesuai pemahaman masing-masing koreografer.</p>
          <p>• Tidak harus menggunakan istilah teknis seni tari maupun musik.</p>
          <p>• Untuk pertanyaan yang tidak diketahui atau tidak relevan, boleh dikosongkan.</p>
          <p>• Tidak perlu membuat jawaban panjang. Cukup jelaskan informasi sesuai konsep karya.</p>
          <p>• Pastikan informasi yang diberikan sesuai dengan karya yang benar-benar diciptakan.</p>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="p-4 bg-surface border border-border/80 rounded-xl space-y-3">
        <label class="block text-xs font-bold">Ceritakan Gambaran / Latar Belakang Karya Anda untuk Disusun AI</label>
        <textarea id="ai-general-notes" rows="3" class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Tuliskan poin-poin utama mengenai karya ini..."></textarea>
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

/* === GENERATE SINOPSIS AI (LIMIT 2X/HARI + COOLDOWN 10 MENIT + COPY KE KOLOM SINOPSIS) === */
async function generateAISynopsis() {
  const judul = document.getElementById('field-judul')?.value.trim();
  const jenis = document.getElementById('field-jenis-tari')?.value.trim() || '(Belum diisi)';
  
  if (!judul) {
    return showToast('Perhatian', 'Isi Judul Karya pada Langkah 02 terlebih dahulu.', 'warning');
  }

  // Cek Kuota Harian & Jeda 10 Menit
  const quota = getUserAIQuotaState();
  const now = Date.now();

  if (quota.count >= AI_DAILY_LIMIT) {
    updateAIQuotaBanner();
    return showToast('Batas Tercapai', 'Batas generate AI per akun hanya 2 kali per hari. Silakan coba lagi besok.', 'error');
  }

  if (quota.lastTimestamp > 0 && (now - quota.lastTimestamp) < AI_COOLDOWN_MS) {
    const waitSec = Math.ceil((AI_COOLDOWN_MS - (now - quota.lastTimestamp)) / 1000);
    const min = Math.floor(waitSec / 60);
    const sec = waitSec % 60;
    updateAIQuotaBanner();
    return showToast('Waktu Jeda Aktif', `Harap tunggu ${min} menit ${sec} detik lagi sebelum generate berikutnya.`, 'warning');
  }

  const btn = document.getElementById('btn-ai-synopsis');
  const loadingNote = document.getElementById('ai-loading-note');
  const resultBox = document.getElementById('ai-result-box');
  const resultPreview = document.getElementById('ai-generated-preview');

  btn.innerHTML = 'Memproses Generate AI...';
  btn.disabled = true;
  loadingNote?.classList.remove('hidden');

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
2. Nama koreografer/penata tari: ${valOrEmpty('ai-koreografer')}
3. Asal daerah/komunitas (jika ada): ${valOrEmpty('ai-asal')}
4. Jenis karya: ${jenis}

B. KONSEP PENCIPTAAN
5. Tema karya: ${valOrEmpty('ai-tema')}
6. Apa yang melatarbelakangi penciptaan karya ini?: ${valOrEmpty('ai-latar')}
7. Dari mana sumber inspirasi karya ini berasal?: ${valOrEmpty('ai-inspirasi')}
8. Apa gagasan utama yang ingin diangkat melalui tarian ini?: ${valOrEmpty('ai-gagasan')}

C. KONSEP GARAPAN
9. Apa yang digambarkan atau diceritakan dalam tarian ini?: ${valOrEmpty('ai-gambaran')}
10. Bagaimana perkembangan penyajian tari dari awal, tengah, hingga akhir?: ${valOrEmpty('ai-perkembangan')}
11. Bagaimana karakter gerakan dalam tarian ini?: ${valOrEmpty('ai-karakter')}
12. Sumber gerakan tari: ${valOrEmpty('ai-sumber-gerak')}
13. Musik pengiring: ${valOrEmpty('ai-musik')}
14. Alat musik/instrumen: ${valOrEmpty('ai-instrumen')}
15. Kostum dan tata rias: ${valOrEmpty('ai-kostum')}

D. MAKNA DAN PESAN KARYA
16. Makna, filosofi, atau nilai tertentu: ${valOrEmpty('ai-makna')}
17. Pesan untuk penonton: ${valOrEmpty('ai-pesan')}`;
    } else {
      promptText = `Susun sinopsis/deskripsi karya profesional (120-200 kata) dalam bahasa Indonesia untuk karya "${judul}" (${jenis}) berdasarkan catatan berikut: ${valOrEmpty('ai-general-notes')}. Berikan hanya teks sinopsisnya saja.`;
    }

    let finalGeneratedText = '';
    if (window.firebaseAI) {
      const { getGenerativeModel } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-ai.js');
      const model = getGenerativeModel(window.firebaseAI, { model: "gemini-1.5-flash" });
      const res = await model.generateContent(promptText);
      finalGeneratedText = (await res.response).text().trim();
    } else {
      throw new Error('Firebase AI offline');
    }

    // Catat penggunaan kuota & mulai jeda 10 menit
    saveUserAIQuotaState({
      date: getTodayDateString(),
      count: quota.count + 1,
      lastTimestamp: Date.now()
    });
    updateAIQuotaBanner();

    if (resultPreview && resultBox) {
      resultPreview.value = finalGeneratedText;
      resultBox.classList.remove('hidden');
    }
    showToast('Selesai', 'Hasil sinopsis AI siap. Silakan tinjau dan salin ke kolom Sinopsis.');

  } catch (error) {
    console.error(error);
    const koreografer = document.getElementById('ai-koreografer')?.value.trim();
    const tema = document.getElementById('ai-tema')?.value.trim();
    const fallbackDraft = `Karya tari berjudul "${judul}"${koreografer ? ` karya koreografer ${koreografer}` : ''} merupakan ${jenis} yang mengangkat tema ${tema || '[tema perlu dilengkapi]'}. [Informasi latar belakang, konsep garapan, musik, dan makna karya perlu dilengkapi sesuai data penciptaan].`;

    saveUserAIQuotaState({
      date: getTodayDateString(),
      count: quota.count + 1,
      lastTimestamp: Date.now()
    });
    updateAIQuotaBanner();

    if (resultPreview && resultBox) {
      resultPreview.value = fallbackDraft;
      resultBox.classList.remove('hidden');
    }
    showToast('Draf Tersedia', 'Draf disusun dalam mode cadangan. Silakan tinjau dan salin ke kolom Sinopsis.', 'warning');
  } finally {
    btn.innerHTML = '✦ Generate Sinopsis AI';
    btn.disabled = false;
    loadingNote?.classList.add('hidden');
  }
}

function copyAIResultToClipboard() {
  const preview = document.getElementById('ai-generated-preview');
  const targetField = document.getElementById('field-sinopsis');
  if (!preview || !preview.value.trim()) return;

  navigator.clipboard?.writeText(preview.value).catch(() => {});
  if (targetField && !targetField.value.trim()) {
    targetField.value = preview.value;
    showToast('Disalin & Ditempel', 'Hasil AI berhasil disalin dan otomatis ditempel ke kolom Sinopsis. Silakan tinjau kembali.');
  } else {
    showToast('Tersalin', 'Teks hasil AI disalin ke clipboard. Silakan tempel (paste) ke kolom Sinopsis dan tinjau kembali.');
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

  const sorakChoice = document.querySelector('input[name="spec-sorak"]:checked')?.value || 'Tidak Perlu Sorak';
  
  if (appState.selectedServiceLine === 'tari') {
    pushIfVal('Jenis Karya', 'field-jenis-tari');
    if (appState.selectedPackage === 'dasar') {
      const nuansaSel = document.getElementById('spec-nuansa-dasar')?.value;
      const nuansaFinal = nuansaSel === 'Other' ? document.getElementById('spec-nuansa-other')?.value.trim() : nuansaSel;
      if (nuansaFinal) specs.push({ key: 'Nuansa Musik', val: nuansaFinal });
    } else if (appState.selectedPackage === 'standar') {
      pushIfVal('Struktur Tari', 'spec-struktur-tari');
      pushIfVal('Urutan Nuansa Musik (Standar)', 'spec-urutan-standar');
    } else {
      pushIfVal('Tautan Video GDrive per Bagian/Tempo', 'spec-gdrive-pro');
      pushIfVal('Urutan Nuansa Musik (Pro)', 'spec-urutan-pro');
    }
  } else if (appState.selectedServiceLine === 'digital') {
    pushIfVal('Tema', 'spec-tema');
    pushIfVal('Genre', 'spec-gaya');
    pushIfVal('Nuansa', 'spec-nuansa');
  } else {
    pushIfVal('Instrumen', 'spec-instrumen');
    pushIfVal('Format Notasi', 'spec-format');
  }

  specs.push({ key: 'Opsi Sorak', val: sorakChoice });
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
    sorakOption: sorakChoice,
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

Object.assign(window, {
  toggleNuansaOtherInput, copyAIResultToClipboard
});
