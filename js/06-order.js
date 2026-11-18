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

function parseDurationToSeconds(mmss) {
  if (!mmss) return null;
  const clean = String(mmss).trim();
  const match = clean.match(/^(\d{1,3}):([0-5]\d)$/);
  if (!match) return null;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

function validateTariDurationLimit() {
  if (appState.selectedServiceLine !== 'tari') return true;
  if (appState.selectedPackage !== 'standar' && appState.selectedPackage !== 'pro') return true;
  const durInput = document.getElementById('field-durasi');
  const warnEl = document.getElementById('durasi-limit-warning');
  if (!durInput) return true;

  const sec = parseDurationToSeconds(durInput.value);
  const isOver = sec !== null && sec > 420; // Maksimal 7 menit (420 detik)
  if (warnEl) warnEl.classList.toggle('hidden', !isOver);
  return !isOver;
}

/* === MODAL NASKAH PERJANJIAN PRODUKSI MUSIK LENGKAP === */
function openProductionAgreementModal() {
  const modal = document.getElementById('custom-modal');
  const titleEl = document.getElementById('custom-modal-title');
  const bodyEl = document.getElementById('custom-modal-body');
  if (!modal || !titleEl || !bodyEl) return;

  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  const pkg = svc.packages[appState.selectedPackage];
  const isCustomPkg = appState.selectedPackage === 'custom';
  const basePrice = isCustomPkg ? Number(appState.customPrice || 0) : (appState.customPrice || Number(pkg.price || 0));
  const hasVocalAddon = (appState.selectedServiceLine !== 'transkripsi') && Boolean(document.getElementById('field-addon-vocal')?.checked);
  const addonAmount = hasVocalAddon ? Number(svc.addonPrice || 250000) : 0;
  const totalPrice = basePrice + addonAmount;
  const dpAmount = totalPrice / 2;

  const clientName = document.getElementById('field-sanggar')?.value.trim() || appState.currentClientUser?.name || '[Nama Sanggar / Instansi / Klien]';
  const clientCity = document.getElementById('field-kota-provinsi')?.value.trim() || '[Kota, Provinsi]';
  const clientWa = document.getElementById('field-wa')?.value.trim() || appState.currentClientUser?.wa || '[Nomor WhatsApp]';
  const clientEmail = document.getElementById('field-email')?.value.trim() || appState.currentClientUser?.email || '[Email Klien]';
  const workTitle = document.getElementById('field-judul')?.value.trim() || '[Judul Karya]';
  const workDuration = document.getElementById('field-durasi')?.value.trim() || '[Durasi MM:SS]';

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  titleEl.textContent = 'SURAT PERJANJIAN KERJA SAMA PRODUKSI MUSIK';
  bodyEl.innerHTML = `
    <div class="space-y-4 text-xs sm:text-[13px] text-textMain max-h-[68vh] overflow-y-auto pr-2 leading-relaxed font-sans">
      <div class="text-center border-b border-border pb-4 space-y-1">
        <h3 class="text-sm sm:text-base font-bold uppercase tracking-wide">SURAT PERJANJIAN KERJA SAMA PRODUKSI MUSIK</h3>
        <p class="font-mono text-[11px] text-textMuted">Nomor: .../SPK-PA/PRANGART/${new Date().getFullYear()}</p>
        <p class="text-xs text-textMuted">PrangArt Lab — Music Production Studio</p>
      </div>

      <p>Pada hari ini, <strong>${todayFormatted}</strong>, telah dibuat dan disepakati Perjanjian Kerja Sama Produksi Musik antara kedua belah pihak sebagai berikut:</p>

      <div class="p-4 rounded-xl bg-panel border border-border/80 space-y-3">
        <div>
          <strong class="text-primary block">I. PIHAK PERTAMA (PENYEDIA JASA / PRODUSER MUSIK)</strong>
          <table class="w-full text-xs mt-1">
            <tr><td class="w-36 text-textMuted py-0.5">Nama Studio</td><td>: <strong>PrangArt Lab (PrangArt Studios)</strong></td></tr>
            <tr><td class="text-textMuted py-0.5">Perwakilan / Produser</td><td>: <strong>Fikri Yassaar Arrazaq, S.Sn.</strong></td></tr>
            <tr><td class="text-textMuted py-0.5">Kedudukan</td><td>: Kalimantan Timur, Indonesia</td></tr>
            <tr><td class="text-textMuted py-0.5">Bidang Jasa</td><td>: Komposisi Musik Tari, Aransemen Musik Non-Tari &amp; Transkripsi Musik</td></tr>
          </table>
        </div>
        <div class="pt-2 border-t border-border/60">
          <strong class="text-primary block">II. PIHAK KEDUA (PEMESAN / KLIEN)</strong>
          <table class="w-full text-xs mt-1">
            <tr><td class="w-36 text-textMuted py-0.5">Nama / Instansi</td><td>: <strong>${clientName}</strong></td></tr>
            <tr><td class="text-textMuted py-0.5">Alamat / Wilayah</td><td>: ${clientCity}</td></tr>
            <tr><td class="text-textMuted py-0.5">Kontak WhatsApp</td><td>: ${clientWa}</td></tr>
            <tr><td class="text-textMuted py-0.5">Alamat Email</td><td>: ${clientEmail}</td></tr>
          </table>
        </div>
      </div>

      <p>Kedua belah pihak sepakat untuk mengikatkan diri dalam perjanjian kerja sama produksi musik dengan syarat dan ketentuan sebagai berikut:</p>

      <div class="space-y-3.5 text-justify">
        <div>
          <strong class="block text-primary uppercase">PASAL 1 — OBJEK &amp; SPESIFIKASI PEKERJAAN</strong>
          <p>1. PIHAK KEDUA memberikan pekerjaan kepada PIHAK PERTAMA untuk memproduksi karya musik dengan rincian sebagai berikut:</p>
          <ul class="list-disc pl-5 mt-1 space-y-0.5 text-xs">
            <li><strong>Jenis Layanan:</strong> ${svc.label}</li>
            <li><strong>Paket Layanan:</strong> ${isCustomPkg || appState.customPrice ? pkg.label + ' (Kesepakatan Khusus)' : pkg.label}</li>
            <li><strong>Judul Karya / Proyek:</strong> ${workTitle}</li>
            <li><strong>Estimasi Durasi:</strong> ${workDuration}</li>
            <li><strong>Kualifikasi Paket:</strong> ${pkg.desc}</li>
          </ul>
          <p class="mt-1">2. PIHAK PERTAMA wajib melaksanakan produksi sesuai arahan konsep, referensi, sinopsis (khusus musik tari), maupun rincian teknis yang diserahkan PIHAK KEDUA dalam formulir pemesanan.</p>
        </div>

        <div>
          <strong class="block text-primary uppercase">PASAL 2 — BIAYA PRODUKSI &amp; TATA CARA PEMBAYARAN</strong>
          <p>1. Total nilai jasa produksi musik yang disepakati adalah sebesar <strong>${totalPrice > 0 ? formatRupiah(totalPrice) : 'Sesuai Kesepakatan (Belum Diisi)'}</strong>${hasVocalAddon ? ' (sudah termasuk tambahan vokal/session player)' : ''}.</p>
          <p>2. Pembayaran dilakukan dalam 2 (dua) tahap:</p>
          <ul class="list-disc pl-5 mt-1 space-y-0.5 text-xs">
            <li><strong>Tahap I (Uang Muka / Down Payment 50%):</strong> Sebesar <strong>${dpAmount > 0 ? formatRupiah(dpAmount) : '50% dari nilai kesepakatan'}</strong> wajib dibayarkan setelah kesepakatan konsep/kontrak sebelum proses produksi dimulai.</li>
            <li><strong>Tahap II (Pelunasan 50%):</strong> Sebesar <strong>${dpAmount > 0 ? formatRupiah(dpAmount) : '50% dari nilai kesepakatan'}</strong> dibayarkan setelah draf final disetujui dan sebelum penyerahan seluruh berkas master akhir.</li>
          </ul>
          <p class="mt-1">3. Selama pelunasan belum diterima oleh PIHAK PERTAMA, seluruh file yang dikirimkan kepada PIHAK KEDUA bersifat pratinjau (<em>preview/draft</em>) dan PIHAK PERTAMA berhak menahan berkas master kualitas penuh.</p>
        </div>

        <div>
          <strong class="block text-primary uppercase">PASAL 3 — JANGKA WAKTU &amp; TAHAPAN PENGERJAAN</strong>
          <p>1. Pengerjaan dimulai terhitung sejak PIHAK KEDUA melunasi DP 50% dan melengkapi seluruh bahan referensi yang dibutuhkan.</p>
          <p>2. Perkembangan pengerjaan dipantau melalui Ruang Klien PrangArt Lab mulai dari penyusunan konsep, pengiriman draf pertama, tahap revisi, hingga <em>mixing &amp; mastering</em> final.</p>
          <p>3. Jadwal penyerahan hasil akhir disesuaikan dengan tingkat kerumitan karya dan tenggat waktu yang disepakati bersama saat konsultasi.</p>
        </div>

        <div>
          <strong class="block text-primary uppercase">PASAL 4 — KETENTUAN REVISI</strong>
          <p>1. Hak revisi mengikuti kualifikasi paket yang dipilih:</p>
          <ul class="list-disc pl-5 mt-1 space-y-0.5 text-xs">
            <li><strong>Paket Dasar:</strong> Maksimal 2–3 kali revisi minor (penyesuaian keseimbangan volume, tempo ringan, atau aksen tanpa mengubah struktur dasar).</li>
            <li><strong>Paket Standar:</strong> Revisi penyesuaian dinamika, transisi adegan, dan keseimbangan instrumen sesuai struktur awal yang disepakati.</li>
            <li><strong>Paket Pro:</strong> <em>Unlimited</em> revisi dalam jangka waktu maksimal 1 (satu) bulan terhitung sejak draf pertama dikirimkan.</li>
            <li><strong>Paket Custom:</strong> Mengikuti kesepakatan khusus kedua belah pihak.</li>
          </ul>
          <p class="mt-1">2. Permintaan perubahan konsep total, penggantian tema besar, atau penambahan durasi signifikan di luar kesepakatan awal dihitung sebagai pekerjaan tambahan atau dikenakan biaya revisi ekstra sebesar <strong>Rp250.000 per sesi</strong>.</p>
        </div>

        <div>
          <strong class="block text-primary uppercase">PASAL 5 — PENYERAHAN HASIL AKHIR (DELIVERABLES)</strong>
          <p>Setelah pelunasan diterima penuh, PIHAK PERTAMA menyerahkan hasil produksi berupa file audio master format <strong>WAV (24-bit/44.1kHz atau 48kHz)</strong> dan <strong>MP3 (320kbps)</strong>, serta file tambahan (seperti <em>Stems/Multitrack</em> atau <em>Minus One</em>) apabila termasuk dalam paket yang dipilih.</p>
        </div>

        <div>
          <strong class="block text-primary uppercase">PASAL 6 — HAK CIPTA, LISENSI &amp; PENCANTUMAN KREDIT</strong>
          <p>1. Hak moral sebagai pencipta/penata musik tetap melekat pada PIHAK PERTAMA (PrangArt Lab) sesuai Undang-Undang Hak Cipta yang berlaku.</p>
          <p>2. PIHAK KEDUA memperoleh hak pakai penuh atas karya musik tersebut untuk kepentingan pementasan, perlombaan, publikasi acara, maupun distribusi digital sesuai peruntukan pesanan.</p>
          <p>3. Dalam setiap publikasi, buku acara, deskripsi video, maupun pengumuman pementasan, PIHAK KEDUA wajib mencantumkan kredit penata musik: <strong>"Music by PrangArt Lab"</strong> atau nama komposer yang bertugas (kecuali disepakati perjanjian <em>Full Buyout</em> khusus).</p>
          <p>4. PIHAK PERTAMA berhak mendokumentasikan cuplikan karya sebagai portofolio studio dengan tetap menghormati jadwal rilis perdana PIHAK KEDUA.</p>
        </div>

        <div>
          <strong class="block text-primary uppercase">PASAL 7 — PEMBATALAN, KETERLAMBATAN &amp; PENGARSIPAN</strong>
          <p>1. <strong>Pembatalan Sepihak:</strong> Apabila PIHAK KEDUA membatalkan pesanan secara sepihak setelah proses produksi berjalan, uang muka (DP 50%) yang telah dibayarkan tidak dapat dikembalikan (<em>non-refundable</em>).</p>
          <p>2. <strong>Keterlambatan Respon Klien:</strong> Apabila PIHAK KEDUA tidak memberikan tanggapan/konfirmasi revisi selama lebih dari <strong>14 (empat belas) hari kalender</strong> tanpa pemberitahuan, proyek dinyatakan selesai/diarsipkan sementara dan pengaktifan kembali menyesuaikan antrean jadwal studio.</p>
          <p>3. <strong>Keterlambatan Penyedia Jasa:</strong> Apabila PIHAK PERTAMA terlambat menyerahkan hasil melampaui tenggat waktu yang disepakati tanpa konfirmasi atau alasan darurat (<em>force majeure</em>), PIHAK KEDUA berhak memperoleh potongan biaya sebesar <strong>1%–2% per hari</strong> dari sisa pelunasan (maksimal 10%).</p>
        </div>

        <div>
          <strong class="block text-primary uppercase">PASAL 8 — PENYELESAIAN PERSELISIHAN &amp; PENUTUP</strong>
          <p>1. Segala perbedaan pendapat yang timbul dalam pelaksanaan perjanjian ini akan diselesaikan terlebih dahulu secara musyawarah untuk mufakat.</p>
          <p>2. Dengan mencentang kotak persetujuan pada formulir pemesanan online PrangArt Lab, PIHAK KEDUA menyatakan telah membaca, memahami, dan menyetujui seluruh isi Surat Perjanjian Kerja Sama Produksi Musik ini secara sah tanpa paksaan dari pihak mana pun.</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 pt-4 border-t border-border text-center text-xs">
        <div class="p-3 rounded-xl bg-panel/60">
          <span class="text-textMuted block">PIHAK PERTAMA,</span>
          <strong class="block mt-6 text-textMain">PrangArt Lab</strong>
          <span class="text-[11px] text-textMuted">Fikri Yassaar Arrazaq, S.Sn.</span>
        </div>
        <div class="p-3 rounded-xl bg-panel/60">
          <span class="text-textMuted block">PIHAK KEDUA,</span>
          <strong class="block mt-6 text-textMain">${clientName}</strong>
          <span class="text-[11px] text-textMuted">Pemesan / Klien</span>
        </div>
      </div>
    </div>
    <div class="mt-5 flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-border/60">
      <button type="button" onclick="acceptAgreementAndClose()" class="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold">
        ✓ Saya Setuju &amp; Tutup Perjanjian
      </button>
    </div>
  `;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function acceptAgreementAndClose() {
  const cb = document.getElementById('field-contract-agree');
  if (cb) cb.checked = true;
  closeCustomModal();
  if (typeof showToast === 'function') {
    showToast('Disetujui', 'Persetujuan Perjanjian Produksi Musik telah dicentang.');
  }
}

function refreshOrderPageUI() {
  selectServiceLine(appState.selectedServiceLine || 'tari');
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

function updateCustomPriceFieldUI() {
  const wrap = document.getElementById('custom-price-wrapper');
  const inp = document.getElementById('custom-price-input');
  if (!wrap || !inp) return;

  const isCustomPkg = (appState.selectedPackage === 'custom');
  if (isCustomPkg) {
    wrap.className = 'p-4 rounded-2xl bg-primary/10 border border-primary/40 space-y-2';
    inp.required = true;
    inp.placeholder = 'Wajib isi nominal harga sesuai kesepakatan diskusi (contoh: 2500000)';
    const lbl = wrap.querySelector('label');
    if (lbl) {
      lbl.innerHTML = 'Harga Kesepakatan Paket Custom (Rp) * <span class="text-primary font-semibold">(Wajib diisi manual sesuai hasil diskusi)</span>';
    }
  } else {
    wrap.className = 'space-y-1';
    inp.required = false;
    inp.placeholder = 'Contoh: 2500000 (Kosongkan jika mengikuti harga paket)';
    const lbl = wrap.querySelector('label');
    if (lbl) {
      lbl.innerHTML = 'Harga Kesepakatan Khusus (Rp) <span class="text-textMuted font-normal">(Opsional — isi jika ada penyesuaian harga hasil diskusi)</span>';
    }
  }
}

function selectServiceLine(svcKey) {
  if (!appState.serviceCatalog[svcKey]) svcKey = 'tari';
  appState.selectedServiceLine = svcKey;
  appState.customPrice = null;

  const inp = document.getElementById('custom-price-input');
  if (inp) inp.value = '';

  document.querySelectorAll('.svc-tab-btn').forEach((b) => {
    b.className = 'svc-tab-btn p-4 rounded-2xl border border-border bg-panel text-textMuted text-left transition cursor-pointer hover:border-primary/50';
  });
  const active = document.getElementById(`svc-tab-${svcKey}`);
  if (active) {
    active.className = 'svc-tab-btn p-4 rounded-2xl border border-primary bg-primary/10 text-primary text-left shadow-glow transition cursor-pointer';
  }

  // 1. Fitur Baca Perjanjian Produksi: wajib muncul di Musik Tari & Musik Non-Tari
  const contractBox = document.getElementById('contract-agreement-box');
  const contractCheck = document.getElementById('field-contract-agree');
  const requiresContract = (svcKey === 'tari' || svcKey === 'digital');
  if (contractBox && contractCheck) {
    contractBox.classList.toggle('hidden', !requiresContract);
    contractCheck.required = requiresContract;
  }

  // 2. Sinopsis: hanya untuk Musik Tari; Non-Tari & Transkripsi tanpa sinopsis
  const synopsisWrap = document.getElementById('synopsis-section-wrapper');
  const synopsisField = document.getElementById('field-sinopsis');
  const step3Heading = document.getElementById('step3-heading');
  const termsWrap = document.getElementById('terms-rules-wrapper');
  const isTari = (svcKey === 'tari');

  if (synopsisWrap && synopsisField) {
    synopsisWrap.classList.toggle('hidden', !isTari);
    synopsisField.required = isTari;
    if (!isTari) synopsisField.value = '';
  }
  if (step3Heading) {
    step3Heading.textContent = isTari ? 'Sinopsis Karya & Ketentuan' : 'Ketentuan & Aturan Layanan';
  }
  if (termsWrap) {
    termsWrap.className = isTari ? 'pt-6 border-t border-border/60' : '';
  }

  // 3. Label Referensi Utama & Tambahan Vokal sesuai layanan
  const videoLabel = document.getElementById('video-ref-label');
  const addonWrap = document.getElementById('addon-vocal-wrapper');
  if (videoLabel) {
    if (svcKey === 'tari') {
      videoLabel.textContent = 'Referensi Video Garapan Tari Umum (Opsional)';
    } else if (svcKey === 'digital') {
      videoLabel.textContent = 'Tautan / File Referensi Lagu atau Mood Musik (Opsional)';
    } else {
      videoLabel.textContent = 'Tautan / File Audio atau Video yang Akan Ditranskripsi *';
    }
  }
  if (addonWrap) {
    addonWrap.classList.toggle('hidden', svcKey === 'transkripsi');
    if (svcKey === 'transkripsi') {
      const cb = document.getElementById('field-addon-vocal');
      if (cb) cb.checked = false;
    }
  }

  renderIdentityFields();
  if (isTari && appState.synopsisMode === 'ai') renderAIDetailForm();
  renderPackageCards();
  updateCustomPriceFieldUI();
  renderDynamicSpecFields();
  recalculateLivePrice();
}

function toggleJenisTariOther(val) {
  const wrap = document.getElementById('jenis-tari-other-wrap');
  const inp = document.getElementById('field-jenis-tari-other');
  if (!wrap || !inp) return;
  if (val === 'Lain-lain') {
    wrap.classList.remove('hidden');
    inp.required = true;
  } else {
    wrap.classList.add('hidden');
    inp.required = false;
    inp.value = '';
  }
}

/* === IDENTITAS PEMESAN & DATA DASAR KARYA === */
function renderIdentityFields() {
  const container = document.getElementById('identity-fields-container');
  if (!container) return;
  const svc = appState.selectedServiceLine;
  const user = appState.currentClientUser || {};

  if (svc === 'tari') {
    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold mb-2">Nama Sanggar / Komunitas / Instansi / Individu *</label>
          <input id="field-sanggar" required value="${user.name || ''}" placeholder="Cth: Sanggar Seni Budaya / Nama Individu" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-2">Kota, Provinsi *</label>
          <input id="field-kota-provinsi" required placeholder="Cth: Samarinda, Kalimantan Timur" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-2">Nomor WhatsApp Aktif *</label>
          <input type="tel" id="field-wa" required value="${user.wa || ''}" placeholder="Cth: 081234567890" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-2">Email *</label>
          <input type="email" id="field-email" required value="${user.email || ''}" placeholder="email@contoh.com" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-2">Nama Lengkap Koreografer *</label>
          <input id="field-koreografer" required placeholder="Nama lengkap penata tari" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-2">Judul Tari / Nama Karya *</label>
          <input id="field-judul" required placeholder="Judul karya tari" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-2">Jenis Tari *</label>
          <select id="field-jenis-tari" required onchange="toggleJenisTariOther(this.value)" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm">
            <option value="Tari tradisional">Tari tradisional</option>
            <option value="Tari kreasi">Tari kreasi</option>
            <option value="Lain-lain">Lain-lain (Isi manual)</option>
          </select>
          <div id="jenis-tari-other-wrap" class="hidden mt-2">
            <input id="field-jenis-tari-other" placeholder="Tuliskan jenis tari Anda..." class="w-full bg-panel border border-border rounded-xl px-4 py-2.5 text-sm" />
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold mb-2">Latar Belakang Budaya / Daerah Tari *</label>
          <input id="field-budaya-daerah" required placeholder="Cth: Budaya Kutai / Dayak Kenyah / Melayu" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-xs font-bold mb-2">Estimasi Durasi Tari (MM:SS) * <span class="text-[11px] font-normal text-textMuted">(Paket Standar &amp; Pro maksimal 07:00 menit; di atas 7 menit wajib pilih Paket Custom)</span></label>
          <input id="field-durasi" required oninput="validateTariDurationLimit()" placeholder="Cth: 05:30" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm font-mono" />
          <p id="durasi-limit-warning" class="hidden text-xs text-red-500 font-semibold mt-1.5">
            ⚠️ Untuk Paket Standar dan Pro Musik Tari, durasi maksimal adalah 07:00 menit. Jika durasi lebih dari 7 menit, silakan pilih <strong>Paket Custom</strong> di Langkah 01.
          </p>
        </div>
      </div>
    `;
  } else if (svc === 'digital') {
    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold mb-2">Nama Lengkap Pemesan / Brand / Instansi *</label>
          <input id="field-sanggar" required value="${user.name || ''}" placeholder="Cth: Nama Pribadi / Perusahaan / Komunitas" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-2">Kota, Provinsi *</label>
          <input id="field-kota-provinsi" required placeholder="Cth: Samarinda, Kalimantan Timur" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-2">Nomor WhatsApp Aktif *</label>
          <input type="tel" id="field-wa" required value="${user.wa || ''}" placeholder="081234567890" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-2">Email *</label>
          <input type="email" id="field-email" required value="${user.email || ''}" placeholder="email@contoh.com" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-2">Judul Karya / Proyek Musik *</label>
          <input id="field-judul" required placeholder="Cth: Mars Instansi / Lagu Tema / Scoring Video" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-2">Estimasi Durasi Audio (MM:SS) *</label>
          <input id="field-durasi" required placeholder="Cth: 03:45" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm font-mono" />
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold mb-2">Nama Lengkap Pemesan / Institusi *</label>
          <input id="field-sanggar" required value="${user.name || ''}" placeholder="Nama pemesan / peneliti / lembaga" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-2">Nomor WhatsApp Aktif *</label>
          <input type="tel" id="field-wa" required value="${user.wa || ''}" placeholder="081234567890" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-2">Email *</label>
          <input type="email" id="field-email" required value="${user.email || ''}" placeholder="email@contoh.com" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-2">Judul Karya / Repertoar yang Ditranskripsi *</label>
          <input id="field-judul" required placeholder="Judul lagu / gending / komposisi" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-xs font-bold mb-2">Durasi Audio/Video Sumber (MM:SS) *</label>
          <input id="field-durasi" required placeholder="Cth: 04:20" class="w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm font-mono" />
        </div>
      </div>
    `;
  }
}

function renderPackageCards() {
  const grid = document.getElementById('package-cards-grid'); if(!grid) return;
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  
  grid.innerHTML = Object.entries(svc.packages).map(([k, p]) => {
    const isCustomPkg = (k === 'custom' || p.isCustom);
    const sel = appState.selectedPackage === k;
    const priceDisplay = isCustomPkg
      ? (appState.customPrice && sel ? formatRupiah(appState.customPrice) : 'Sesuai Kesepakatan')
      : formatRupiah(p.price);

    return `<button type="button" onclick="selectPackageTier('${k}')" class="p-5 rounded-2xl border text-left flex flex-col justify-between h-full transition cursor-pointer ${sel ? 'border-primary bg-primary/10 shadow-glow' : 'border-border bg-surface hover:border-primary/40'}">
      <div class="mb-3">
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm font-bold text-textMain">${p.label}</span>
          ${isCustomPkg ? `<span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-primary/15 text-primary font-bold">Manual</span>` : ''}
        </div>
        <span class="text-lg font-mono text-primary block mt-1">${priceDisplay}</span>
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
  updateCustomPriceFieldUI();
  renderDynamicSpecFields(); 
  validateTariDurationLimit();
  recalculateLivePrice();
  if (k === 'custom' && inp) {
    inp.focus();
  }
}

function handleCustomPrice(v) { 
  appState.customPrice = (v && Number(v) > 0) ? Number(v) : null; 
  renderPackageCards(); 
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

/* === TAMBAH CEKLIS STRUKTUR / SUASANA BARU SECARA DINAMIS (PAKET STANDAR & CUSTOM) === */
function addCustomStrukturCheckbox() {
  const input = document.getElementById('spec-struktur-new-input');
  const container = document.getElementById('struktur-checkbox-grid');
  if (!input || !container) return;

  const val = input.value.trim();
  if (!val) {
    return showToast('Info', 'Ketik nama suasana/struktur terlebih dahulu sebelum menekan tombol Tambah Ceklis.', 'warning');
  }

  const label = document.createElement('label');
  label.className = 'flex items-center gap-2.5 p-3 rounded-xl bg-surface border border-primary/40 cursor-pointer hover:border-primary transition';
  label.innerHTML = `
    <input type="checkbox" name="spec-struktur-check" value="${val.replace(/"/g, '&quot;')}" checked class="w-4 h-4 accent-primary" />
    <span class="text-xs font-semibold">${val}</span>
  `;
  container.appendChild(label);
  input.value = '';
  showToast('Ditambahkan', `"${val}" berhasil ditambahkan sebagai item ceklis baru.`);
}

/* === BARIS DINAMIS PAKET STANDAR (+ TAMBAH BAGIAN) === */
function addStandarSegmentRow(preset = {}) {
  const list = document.getElementById('standar-segments-list');
  if (!list) return;
  const idx = list.children.length + 1;
  const row = document.createElement('div');
  row.className = 'standar-segment-item p-4 rounded-xl bg-surface border border-border/80 space-y-3';
  row.innerHTML = `
    <div class="flex items-center justify-between">
      <span class="text-xs font-mono font-bold text-primary segment-title">Bagian #${idx}</span>
      ${idx > 1 ? `<button type="button" onclick="removeSegmentRow(this, 'standar-segments-list')" class="text-xs text-red-500 hover:underline font-semibold">Hapus</button>` : ''}
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label class="block text-[11px] font-bold mb-1">Perkiraan Durasi (Dari – Sampai) *</label>
        <input type="text" required class="seg-durasi w-full bg-panel border border-border rounded-lg px-3 py-2 text-xs font-mono" placeholder="Cth: 00:00 – 00:30" value="${preset.durasi || ''}" />
      </div>
      <div>
        <label class="block text-[11px] font-bold mb-1">Struktur / Nama Adegan *</label>
        <input type="text" required class="seg-struktur w-full bg-panel border border-border rounded-lg px-3 py-2 text-xs" placeholder="Cth: Opening / Klimaks" value="${preset.struktur || ''}" />
      </div>
      <div>
        <label class="block text-[11px] font-bold mb-1">Nuansa Musik &amp; Tempo *</label>
        <input type="text" required class="seg-nuansa w-full bg-panel border border-border rounded-lg px-3 py-2 text-xs" placeholder="Cth: Misterius, tempo lambat" value="${preset.nuansa || ''}" />
      </div>
      <div>
        <label class="block text-[11px] font-bold mb-1">Tautan / Link Referensi Bagian Ini (Opsional)</label>
        <input type="url" class="seg-link w-full bg-panel border border-border rounded-lg px-3 py-2 text-xs" placeholder="https://drive.google.com/..." value="${preset.link || ''}" />
      </div>
    </div>
  `;
  list.appendChild(row);
}

/* === BARIS DINAMIS PAKET PRO & CUSTOM (+ TAMBAH VIDEO / TEMPO) === */
function addProSegmentRow(preset = {}) {
  const list = document.getElementById('pro-segments-list');
  if (!list) return;
  const idx = list.children.length + 1;
  const row = document.createElement('div');
  row.className = 'pro-segment-item p-4 rounded-xl bg-surface border border-border/80 space-y-3';
  row.innerHTML = `
    <div class="flex items-center justify-between">
      <span class="text-xs font-mono font-bold text-primary segment-title">Video / Tempo #${idx}</span>
      ${idx > 1 ? `<button type="button" onclick="removeSegmentRow(this, 'pro-segments-list')" class="text-xs text-red-500 hover:underline font-semibold">Hapus</button>` : ''}
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label class="block text-[11px] font-bold mb-1">Label Video / Bagian *</label>
        <input type="text" required class="pro-label w-full bg-panel border border-border rounded-lg px-3 py-2 text-xs" placeholder="Cth: Video 1 / Tempo 1" value="${preset.label || ''}" />
      </div>
      <div>
        <label class="block text-[11px] font-bold mb-1">Tempo (BPM) *</label>
        <input type="text" required class="pro-bpm w-full bg-panel border border-border rounded-lg px-3 py-2 text-xs font-mono" placeholder="Cth: 120 BPM" value="${preset.bpm || ''}" />
      </div>
      <div>
        <label class="block text-[11px] font-bold mb-1">Durasi (Dari – Sampai) *</label>
        <input type="text" required class="pro-durasi w-full bg-panel border border-border rounded-lg px-3 py-2 text-xs font-mono" placeholder="Cth: 00:00 – 01:10" value="${preset.durasi || ''}" />
      </div>
    </div>
    <div>
      <label class="block text-[11px] font-bold mb-1">Tautan Video Google Drive Bagian Ini (Jika diperlukan)</label>
      <input type="url" class="pro-link w-full bg-panel border border-border rounded-lg px-3 py-2 text-xs" placeholder="https://drive.google.com/..." value="${preset.link || ''}" />
    </div>
    <div>
      <label class="block text-[11px] font-bold mb-1">Urutan Nuansa Musik &amp; Keterangan Masuknya Tari *</label>
      <textarea rows="2" required class="pro-desc w-full bg-panel border border-border rounded-lg px-3 py-2 text-xs" placeholder="Cth: 00:00–00:30 Nuansa misterius lambat; 00:30–01:10 Mulai energik perkusi masuk...">${preset.desc || ''}</textarea>
    </div>
  `;
  list.appendChild(row);
}

function removeSegmentRow(btn, listId) {
  const item = btn.closest('.standar-segment-item, .pro-segment-item');
  if (item) item.remove();
  const list = document.getElementById(listId);
  if (!list) return;
  Array.from(list.children).forEach((el, i) => {
    const title = el.querySelector('.segment-title');
    if (title) {
      title.textContent = listId === 'pro-segments-list' ? `Video / Tempo #${i + 1}` : `Bagian #${i + 1}`;
    }
  });
}

/* === LANGKAH 02: SPESIFIKASI LENGKAP SESUAI LAYANAN & PAKET === */
function renderDynamicSpecFields() {
  const c = document.getElementById('dynamic-spec-fields'); if(!c) return;
  const svc = appState.selectedServiceLine;
  const pkg = appState.selectedPackage;
  
  const sorakOptionHTML = `
    <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-3">
      <label class="block text-xs font-bold">Tambahan Sorak (Khusus Musik Tari) *</label>
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
            <span class="text-[11px] font-mono uppercase text-primary font-bold block">Spesifikasi Musik Tari — Paket Dasar</span>
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
            <div>
              <label class="block text-xs font-bold mb-2">Instrumen Dominan yang Diharapkan (Opsional)</label>
              <input id="spec-instrumen-tari" class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Gendang, Gong, Gambus, Piul, Suling..." />
            </div>
          </div>
          ${sorakOptionHTML}
        </div>
      `;
    } else if (pkg === 'standar') {
      c.innerHTML = `
        <div class="space-y-5">
          <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-[11px] font-mono uppercase text-primary font-bold">Spesifikasi Musik Tari — Paket Standar</span>
              <span class="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold">Maks. Durasi: 07:00 Menit</span>
            </div>

            <div class="space-y-3">
              <label class="block text-xs font-bold">Struktur Tari / Suasana (Bisa pilih lebih dari 1 dan tambah opsi ceklis baru) *</label>
              <div id="struktur-checkbox-grid" class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                ${['Opening', 'Orientasi Suasana Cerita', 'Bagian Tengah', 'Klimaks', 'Penutup'].map(st => `
                  <label class="flex items-center gap-2.5 p-3 rounded-xl bg-surface border border-border cursor-pointer hover:border-primary transition">
                    <input type="checkbox" name="spec-struktur-check" value="${st}" class="w-4 h-4 accent-primary" />
                    <span class="text-xs font-semibold">${st}</span>
                  </label>
                `).join('')}
              </div>
              <div class="flex flex-col sm:flex-row gap-2 pt-1">
                <input id="spec-struktur-new-input" class="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-sm" placeholder="Lainnya: ketik nama suasana/struktur lalu klik + Tambah Ceklis..." />
                <button type="button" onclick="addCustomStrukturCheckbox()" class="px-4 py-2.5 rounded-xl bg-primary/15 text-primary border border-primary/30 text-xs font-bold hover:bg-primary hover:text-white transition shrink-0">
                  + Tambah Ceklis
                </button>
              </div>
            </div>

            <div class="space-y-3 pt-3 border-t border-border/60">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label class="block text-xs font-bold">Urutan Nuansa Musik Berdasarkan Struktur Tari *</label>
                  <p class="text-[11px] text-textMuted">Sertakan perkiraan waktu adegan (dari – sampai), tempo, dan tautan referensi per bagian.</p>
                </div>
                <button type="button" onclick="addStandarSegmentRow()" class="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm">
                  + Tambah Bagian
                </button>
              </div>

              <div class="p-3 rounded-xl bg-surface/70 border border-border/60 text-[11px] font-mono text-textMuted">
                <strong class="text-textMain font-sans">Contoh:</strong> 00:00–00:30 → Opening (tempo lambat) | 00:30–01:10 → Orientasi Suasana Cerita (tempo sedang) | 01:50–02:30 → Klimaks (tempo cepat)
              </div>

              <div id="standar-segments-list" class="space-y-3"></div>
            </div>
          </div>
          ${sorakOptionHTML}
        </div>
      `;
      addStandarSegmentRow({ durasi: '00:00 – 00:30', struktur: 'Opening' });
    } else if (pkg === 'pro') {
      c.innerHTML = `
        <div class="space-y-5">
          <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <span class="text-[11px] font-mono uppercase text-primary font-bold">Spesifikasi Musik Tari — Paket Pro</span>
              <span class="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold">Maks. Durasi: 07:00 Menit</span>
            </div>

            <div>
              <label class="block text-xs font-bold mb-2">Keterangan Awal Masuknya Musik &amp; Tari *</label>
              <select id="spec-pro-intro-mode" required class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm">
                <option value="Diawali musik pembuka terlebih dahulu, kemudian penari masuk">Diawali musik pembuka terlebih dahulu, kemudian penari masuk</option>
                <option value="Hanya diberi kode/isyarat musik, lalu penari langsung masuk ke gerakan">Hanya diberi kode/isyarat musik, lalu penari langsung masuk ke gerakan</option>
                <option value="Musik dan gerakan tari masuk bersamaan sejak detik pertama">Musik dan gerakan tari masuk bersamaan sejak detik pertama</option>
              </select>
            </div>

            <div class="space-y-3 pt-3 border-t border-border/60">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label class="block text-xs font-bold">Rincian Video Google Drive, Tempo (BPM), Durasi &amp; Nuansa per Bagian *</label>
                  <p class="text-[11px] text-textMuted">Tambahkan baris untuk setiap video/tempo (Video 1/Tempo 1, Video 2/Tempo 2, dst. sampai ending).</p>
                </div>
                <button type="button" onclick="addProSegmentRow()" class="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm">
                  + Tambah Bagian / Tempo
                </button>
              </div>

              <div class="p-3 rounded-xl bg-surface/70 border border-border/60 text-[11px] font-mono text-textMuted space-y-0.5">
                <strong class="text-textMain font-sans block">Contoh per video / per tempo:</strong>
                <div>• Video 1 / tempo 1 — 120 BPM — 00:00–00:30: Nuansa misterius, tempo lambat; 00:30–01:10: Mulai energik, ritme perkusi muncul</div>
                <div>• Video 2 / tempo 2 — 100 BPM — 00:00–01:55: Dramatis dan tegang; 01:50–02:30: Pelan dan megah</div>
              </div>

              <div id="pro-segments-list" class="space-y-3"></div>
            </div>
          </div>
          ${sorakOptionHTML}
        </div>
      `;
      addProSegmentRow({ label: 'Video 1 / Tempo 1' });
    } else {
      c.innerHTML = `
        <div class="space-y-5">
          <div class="p-5 bg-panel border border-primary/40 rounded-2xl space-y-5">
            <div>
              <span class="text-[11px] font-mono uppercase text-primary font-bold block">Spesifikasi Musik Tari — Paket Custom Lengkap</span>
              <p class="text-xs text-textMuted mt-1">Untuk garapan durasi bebas (&gt; 7 menit), sendratari, kolaborasi instrumen khusus, atau struktur dramatik multi-babak.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold mb-2">Skala &amp; Format Garapan *</label>
                <select id="spec-custom-scale" required class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm">
                  <option value="Tari Tunggal / Duet / Trio">Tari Tunggal / Duet / Trio</option>
                  <option value="Tari Kelompok / Massal">Tari Kelompok / Massal</option>
                  <option value="Sendratari / Teater Tari">Sendratari / Teater Tari</option>
                  <option value="Musik Parade / Karnaval Budaya">Musik Parade / Karnaval Budaya</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold mb-2">Kebutuhan Instrumen Khusus *</label>
                <input id="spec-custom-instruments" required class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Full Gambus Kutai + Perkusi Dayak + String Orkestra" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold mb-2">Keterangan Awal Masuknya Musik &amp; Tari *</label>
              <input id="spec-pro-intro-mode" required class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Narasi pembuka 15 detik, kode gong 2x lalu penari masuk..." />
            </div>

            <div class="space-y-3 pt-3 border-t border-border/60">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label class="block text-xs font-bold">Rincian Adegan, Durasi, Tempo (BPM) &amp; Link Video per Babak *</label>
                  <p class="text-[11px] text-textMuted">Susun rincian tiap babak/adegan tanpa batasan 7 menit.</p>
                </div>
                <button type="button" onclick="addProSegmentRow()" class="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition shadow-sm">
                  + Tambah Babak / Bagian
                </button>
              </div>
              <div id="pro-segments-list" class="space-y-3"></div>
            </div>

            <div>
              <label class="block text-xs font-bold mb-2">Kebutuhan Output File &amp; Teknis Tambahan *</label>
              <input id="spec-custom-deliverables" required class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Master WAV + MP3 + Stems per instrumen + Click track" />
            </div>
          </div>
          ${sorakOptionHTML}
        </div>
      `;
      addProSegmentRow({ label: 'Babak 1 / Pembuka' });
    }
  } else if (svc === 'digital') {
    const isCustom = (pkg === 'custom');
    c.innerHTML = `
      <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-5">
        <span class="text-[11px] font-mono uppercase text-primary font-bold block">Spesifikasi Detail Musik Non-Tari (${appState.serviceCatalog.digital.packages[pkg].label})</span>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold mb-2">Jenis Kebutuhan Produksi *</label>
            <select id="nontari-jenis" required class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm">
              <option value="Aransemen Lagu Orisinal">Aransemen Lagu Orisinal</option>
              <option value="Aransemen Ulang / Cover / Remix">Aransemen Ulang / Cover / Remix</option>
              <option value="Scoring Film / Video / Konten">Scoring Film / Video / Konten</option>
              <option value="Jingle Brand / Iklan">Jingle Brand / Iklan</option>
              <option value="Mars / Himne Instansi">Mars / Himne Instansi</option>
              <option value="Backsound Podcast / Game">Backsound Podcast / Game</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold mb-2">Genre / Gaya Musik *</label>
            <input id="nontari-genre" required class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Pop Akustik, Sinematik Orkestra, Folk Etnik, Lo-Fi..." />
          </div>
          <div>
            <label class="block text-xs font-bold mb-2">Nuansa / Mood Utama *</label>
            <input id="nontari-nuansa" required class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Hangat, Megah, Melankolis, Semangat..." />
          </div>
          <div>
            <label class="block text-xs font-bold mb-2">Perkiraan Tempo (BPM) &amp; Nada Dasar (Jika ada)</label>
            <input id="nontari-tempo-key" class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: 95 BPM, Nada Dasar C Mayor / Bebas" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold mb-2">Susunan Instrumen yang Diinginkan *</label>
          <input id="nontari-instrumen" required class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Piano, Gitar Akustik, Bass, Drum, String Section, Suling..." />
        </div>

        <div>
          <label class="block text-xs font-bold mb-2">Struktur Lagu / Alur Dinamika Musik *</label>
          <textarea id="nontari-struktur" rows="3" required class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Intro (00:00–00:20) lembut → Verse 1 → Chorus megah → Bridge → Outro fade out..."></textarea>
        </div>

        <div>
          <label class="block text-xs font-bold mb-2">Lirik Lagu / Naskah Voice Over (Kosongkan jika instrumental)</label>
          <textarea id="nontari-lirik" rows="3" class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm" placeholder="Tempelkan lirik lagu atau naskah narasi di sini jika ada..."></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold mb-2">Target Penggunaan / Platform Rilis *</label>
            <input id="nontari-platform" required class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Spotify/YouTube, Film Pendek, Acara Resmi Instansi" />
          </div>
          <div>
            <label class="block text-xs font-bold mb-2">Format File Output yang Dibutuhkan *</label>
            <select id="nontari-output" required class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm">
              <option value="Master WAV (24-bit) + MP3 (320kbps)">Master WAV (24-bit) + MP3 (320kbps)</option>
              <option value="Master WAV + MP3 + Minus One / Karaoke">Master WAV + MP3 + Minus One / Karaoke</option>
              <option value="Full Package + Stems / Multitrack Terpisah">Full Package + Stems / Multitrack Terpisah</option>
            </select>
          </div>
        </div>

        ${isCustom ? `
          <div class="p-4 rounded-xl bg-surface border border-primary/40 space-y-3">
            <span class="text-xs font-bold text-primary block">Detail Lengkap Paket Custom Non-Tari</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold mb-1.5">Jumlah Trek / Lagu yang Diproduksi *</label>
                <input id="nontari-custom-count" required class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Cth: 1 Lagu Utama + 3 Versi Durasi (15s, 30s, 60s)" />
              </div>
              <div>
                <label class="block text-xs font-bold mb-1.5">Kebutuhan Lisensi / Hak Pakai Komersial *</label>
                <select id="nontari-custom-license" required class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm">
                  <option value="Lisensi Standar (Kredit PrangArt Studios)">Lisensi Standar (Kredit PrangArt Studios)</option>
                  <option value="Lisensi Komersial / Iklan Nasional">Lisensi Komersial / Iklan Nasional</option>
                  <option value="Full Buyout / Hak Cipta Eksklusif Klien">Full Buyout / Hak Cipta Eksklusif Klien</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold mb-1.5">Rincian Spesifikasi Kustom &amp; Catatan Teknis Produksi *</label>
              <textarea id="nontari-custom-detail" rows="3" required class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Jelaskan kebutuhan khusus seperti rekaman live instrumen tertentu, target loudness (LUFS), atau sinkronisasi timecode video..."></textarea>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  } else {
    const isCustom = (pkg === 'custom');
    c.innerHTML = `
      <div class="p-5 bg-panel border border-border/60 rounded-2xl space-y-5">
        <span class="text-[11px] font-mono uppercase text-primary font-bold block">Spesifikasi Detail Transkripsi Musik (${appState.serviceCatalog.transkripsi.packages[pkg].label})</span>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold mb-2">Jenis Transkripsi *</label>
            <select id="trans-jenis" required class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm">
              <option value="Melodi Utama + Simbol Akor">Melodi Utama + Simbol Akor</option>
              <option value="Vokal + Iringan Piano/Gitar">Vokal + Iringan Piano/Gitar</option>
              <option value="Instrumen Solo (Piano / Biola / Gitar / Suling)">Instrumen Solo (Piano / Biola / Gitar / Suling)</option>
              <option value="Ensambel / Full Band / Orkestra">Ensambel / Full Band / Orkestra</option>
              <option value="Musik Tradisional / Etnomusikologi">Musik Tradisional / Etnomusikologi</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold mb-2">Format Notasi yang Diminta *</label>
            <select id="trans-format-notasi" required class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm">
              <option value="Not Balok (Staff Notation)">Not Balok (Staff Notation)</option>
              <option value="Not Angka">Not Angka</option>
              <option value="Not Balok + Not Angka (Gabungan)">Not Balok + Not Angka (Gabungan)</option>
              <option value="Not Balok + Tablatur (TAB)">Not Balok + Tablatur (TAB)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold mb-2">Daftar Instrumen yang Harus Ditranskripsi *</label>
          <input id="trans-instrumen" required class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Vokal Soprano, Piul, Gambus, Kendang, Bass..." />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold mb-2">Format File Hasil yang Dibutuhkan *</label>
            <select id="trans-file-output" required class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm">
              <option value="PDF Siap Cetak">PDF Siap Cetak</option>
              <option value="PDF + Audio Simulasi MIDI / MP3">PDF + Audio Simulasi MIDI / MP3</option>
              <option value="PDF + MIDI + File Proyek (Sibelius / MuseScore / MusicXML)">PDF + MIDI + File Proyek (Sibelius / MuseScore / MusicXML)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold mb-2">Bagian Audio yang Ditranskripsi *</label>
            <input id="trans-bagian-waktu" required value="Full dari awal hingga akhir (00:00 – Ending)" class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Full lagu atau menit 01:15 – 03:40 saja" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold mb-2">Nada Dasar &amp; Birama (Jika sudah diketahui)</label>
            <input id="trans-nada-birama" class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: G Mayor, 4/4 (Kosongkan jika ingin dianalisis studio)" />
          </div>
          <div>
            <label class="block text-xs font-bold mb-2">Tujuan Penggunaan Partitur *</label>
            <input id="trans-tujuan" required class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Skripsi/Tesis, Lomba Paduan Suara, Hak Cipta, Dokumentasi" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold mb-2">Catatan Teknis Khusus (Opsional)</label>
          <textarea id="trans-catatan" rows="2" class="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm" placeholder="Cth: Tolong sertakan lirik di bawah notasi vokal, atau pisahkan partitur per alat musik..."></textarea>
        </div>

        ${isCustom ? `
          <div class="p-4 rounded-xl bg-surface border border-primary/40 space-y-3">
            <span class="text-xs font-bold text-primary block">Detail Lengkap Paket Custom Transkripsi</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold mb-1.5">Jumlah Repertoar / Karya *</label>
                <input id="trans-custom-count" required class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Cth: 3 Gending Tradisi / 1 Bundel Partitur" />
              </div>
              <div>
                <label class="block text-xs font-bold mb-1.5">Standar Penulisan / Analisis *</label>
                <select id="trans-custom-standard" required class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm">
                  <option value="Partitur Pertunjukan / Orkestrasi">Partitur Pertunjukan / Orkestrasi</option>
                  <option value="Transkripsi Deskriptif Etnomusikologi (Skripsi/Tesis)">Transkripsi Deskriptif Etnomusikologi (Skripsi/Tesis)</option>
                  <option value="Transkripsi Preskriptif / Bahan Ajar">Transkripsi Preskriptif / Bahan Ajar</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-xs font-bold mb-1.5">Rincian Kebutuhan Transkripsi Khusus / Sistem Laras Tradisi *</label>
              <textarea id="trans-custom-detail" rows="3" required class="w-full bg-panel border border-border rounded-xl px-3.5 py-2.5 text-sm" placeholder="Jelaskan detail khusus seperti pola tabuhan perkusi, simbol teknik bermain instrumen tradisional, atau pemisahan buku partitur..."></textarea>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
}

/* === FORMULIR DETAIL AI === */
function renderAIDetailForm() {
  const container = document.getElementById('ai-detail-form-container');
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-5">
      <div class="border-b border-border/60 pb-2">
        <h3 class="text-sm font-bold text-primary uppercase">Formulir Data Karya Tari (Bahan Penyusunan Sinopsis AI)</h3>
        <p class="text-[11px] text-textMuted mt-1">Judul karya, koreografer, asal daerah, dan jenis tari otomatis diambil dari isian Langkah 02. Lengkapi detail penciptaan &amp; garapan di bawah ini.</p>
      </div>

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
}

function recalculateLivePrice() {
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  const pkg = svc.packages[appState.selectedPackage];
  const isCustomPkg = (appState.selectedPackage === 'custom' || pkg.isCustom);
  const base = isCustomPkg ? Number(appState.customPrice || 0) : (appState.customPrice || Number(pkg.price || 0));
  const addonPrice = Number(svc.addonPrice || 250000);
  const isAddonChecked = (appState.selectedServiceLine !== 'transkripsi') && Boolean(document.getElementById('field-addon-vocal')?.checked);
  const addon = isAddonChecked ? addonPrice : 0;
  const total = base + addon;

  if (document.getElementById('calc-service-name')) {
    document.getElementById('calc-service-name').textContent = svc.label;
    document.getElementById('calc-pkg-name').textContent = (isCustomPkg || appState.customPrice) ? `${pkg.label} (Kesepakatan)` : pkg.label;
    document.getElementById('calc-pkg-price').textContent = (isCustomPkg && !appState.customPrice) ? 'Isi nominal manual' : formatRupiah(base);
    document.getElementById('calc-total-price').textContent = (isCustomPkg && !appState.customPrice) ? 'Menunggu nominal' : formatRupiah(total);

    const addonRow = document.getElementById('calc-addon-label')?.parentElement;
    if (addonRow) {
      addonRow.classList.toggle('hidden', !isAddonChecked);
      document.getElementById('calc-addon-label').textContent = 'Tambahan Vokal / Player';
      document.getElementById('calc-addon-price').textContent = '+ ' + formatRupiah(addonPrice);
    }
  }
}

function getResolvedJenisTari() {
  const sel = document.getElementById('field-jenis-tari')?.value || '';
  if (sel === 'Lain-lain') {
    return document.getElementById('field-jenis-tari-other')?.value.trim() || 'Lain-lain';
  }
  return sel || '(Belum diisi)';
}

/* === GENERATE SINOPSIS AI === */
async function generateAISynopsis() {
  const judul = document.getElementById('field-judul')?.value.trim();
  const jenis = getResolvedJenisTari();
  const koreografer = document.getElementById('field-koreografer')?.value.trim() || '(Belum tersedia / dikosongkan)';
  const asal = document.getElementById('field-budaya-daerah')?.value.trim() || document.getElementById('field-kota-provinsi')?.value.trim() || '(Belum tersedia / dikosongkan)';
  
  if (!judul) {
    return showToast('Perhatian', 'Isi Judul Tari / Nama Karya pada Langkah 02 terlebih dahulu.', 'warning');
  }

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
    const valOrEmpty = (id) => document.getElementById(id)?.value.trim() || '(Belum tersedia / dikosongkan)';
    const promptText = `PROMPT PENULISAN SINOPSIS KARYA TARI

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
2. Nama koreografer/penata tari: ${koreografer}
3. Asal daerah/komunitas/latar budaya: ${asal}
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

    let finalGeneratedText = '';
    if (window.firebaseAI) {
      const { getGenerativeModel } = await import('https://www.gstatic.com/firebasejs/11.6.1/firebase-ai.js');
      const model = getGenerativeModel(window.firebaseAI, { model: "gemini-1.5-flash" });
      const res = await model.generateContent(promptText);
      finalGeneratedText = (await res.response).text().trim();
    } else {
      throw new Error('Firebase AI offline');
    }

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
    const tema = document.getElementById('ai-tema')?.value.trim();
    const fallbackDraft = `Karya tari berjudul "${judul}" oleh koreografer ${koreografer} merupakan ${jenis} yang berakar pada budaya ${asal} dengan mengangkat tema ${tema || '[tema perlu dilengkapi]'}. [Informasi latar belakang, konsep garapan, musik, dan makna karya perlu dilengkapi sesuai data penciptaan].`;

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

  if (!validateTariDurationLimit()) {
    document.getElementById('field-durasi')?.focus();
    return showToast('Durasi Melebihi Batas', 'Paket Standar & Pro Musik Tari maksimal 07:00 menit. Silakan pilih Paket Custom untuk durasi lebih dari 7 menit.', 'error');
  }

  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  const pkg = svc.packages[appState.selectedPackage];
  const isCustomPkg = (appState.selectedPackage === 'custom' || pkg.isCustom);

  if (isCustomPkg && (!appState.customPrice || Number(appState.customPrice) <= 0)) {
    document.getElementById('custom-price-input')?.focus();
    return showToast('Harga Belum Diisi', 'Untuk Paket Custom, wajib mengisi nominal Harga Kesepakatan (Rp) sesuai hasil diskusi.', 'error');
  }

  const basePrice = isCustomPkg ? Number(appState.customPrice) : (appState.customPrice || Number(pkg.price || 0));
  const hasVocalAddon = (appState.selectedServiceLine !== 'transkripsi') && Boolean(document.getElementById('field-addon-vocal')?.checked);
  const addonAmount = hasVocalAddon ? Number(svc.addonPrice || 250000) : 0;
  const total = basePrice + addonAmount;
  
  const specs = [];
  const pushIfVal = (label, id) => {
    const v = document.getElementById(id)?.value.trim();
    if (v) specs.push({ key: label, val: v });
  };

  const requiresContract = (appState.selectedServiceLine === 'tari' || appState.selectedServiceLine === 'digital');
  if (requiresContract) {
    specs.push({ key: 'Persetujuan Kontrak PrangArt Studios', val: 'Disetujui Klien' });
  }

  const sanggarName = document.getElementById('field-sanggar')?.value.trim() || appState.currentClientUser.name;
  const waNumber = document.getElementById('field-wa')?.value.trim() || '';
  const contactEmail = document.getElementById('field-email')?.value.trim() || appState.currentClientUser.email;
  let sorakChoice = null;

  if (appState.selectedServiceLine === 'tari') {
    sorakChoice = document.querySelector('input[name="spec-sorak"]:checked')?.value || 'Tidak Perlu Sorak';
    specs.push({ key: 'Sanggar / Komunitas / Instansi / Individu', val: sanggarName });
    pushIfVal('Kota, Provinsi', 'field-kota-provinsi');
    specs.push({ key: 'Nomor WhatsApp Aktif', val: waNumber });
    specs.push({ key: 'Email', val: contactEmail });
    pushIfVal('Nama Lengkap Koreografer', 'field-koreografer');
    specs.push({ key: 'Jenis Tari', val: getResolvedJenisTari() });
    pushIfVal('Latar Belakang Budaya / Daerah Tari', 'field-budaya-daerah');

    if (appState.selectedPackage === 'dasar') {
      const nuansaSel = document.getElementById('spec-nuansa-dasar')?.value;
      const nuansaFinal = nuansaSel === 'Other' ? document.getElementById('spec-nuansa-other')?.value.trim() : nuansaSel;
      if (nuansaFinal) specs.push({ key: 'Nuansa Musik', val: nuansaFinal });
      pushIfVal('Instrumen Dominan', 'spec-instrumen-tari');
    } else if (appState.selectedPackage === 'standar') {
      const checkedStruktur = Array.from(document.querySelectorAll('input[name="spec-struktur-check"]:checked')).map(el => el.value);
      if (checkedStruktur.length) {
        specs.push({ key: 'Struktur Tari / Suasana Dipilih', val: checkedStruktur.join(', ') });
      }

      const segItems = Array.from(document.querySelectorAll('#standar-segments-list .standar-segment-item')).map((row, idx) => {
        const dur = row.querySelector('.seg-durasi')?.value.trim() || '-';
        const str = row.querySelector('.seg-struktur')?.value.trim() || '-';
        const nua = row.querySelector('.seg-nuansa')?.value.trim() || '-';
        const lnk = row.querySelector('.seg-link')?.value.trim();
        return `Bagian ${idx + 1} [${dur}] ${str} → ${nua}${lnk ? ` (Link: ${lnk})` : ''}`;
      });
      if (segItems.length) {
        specs.push({ key: 'Rincian Urutan Nuansa & Durasi (Standar)', val: segItems.join(' | ') });
      }
    } else if (appState.selectedPackage === 'pro') {
      pushIfVal('Awal Masuk Musik & Tari', 'spec-pro-intro-mode');
      const proItems = Array.from(document.querySelectorAll('#pro-segments-list .pro-segment-item')).map((row) => {
        const lbl = row.querySelector('.pro-label')?.value.trim() || 'Bagian';
        const bpm = row.querySelector('.pro-bpm')?.value.trim() || '-';
        const dur = row.querySelector('.pro-durasi')?.value.trim() || '-';
        const lnk = row.querySelector('.pro-link')?.value.trim();
        const dsc = row.querySelector('.pro-desc')?.value.trim() || '-';
        return `${lbl} (${bpm}, ${dur}): ${dsc}${lnk ? ` [GDrive: ${lnk}]` : ''}`;
      });
      if (proItems.length) {
        specs.push({ key: 'Rincian Video GDrive, Tempo & Nuansa (Pro)', val: proItems.join(' | ') });
      }
    } else {
      pushIfVal('Skala & Format Garapan', 'spec-custom-scale');
      pushIfVal('Kebutuhan Instrumen Khusus', 'spec-custom-instruments');
      pushIfVal('Awal Masuk Musik & Tari', 'spec-pro-intro-mode');
      const proItems = Array.from(document.querySelectorAll('#pro-segments-list .pro-segment-item')).map((row) => {
        const lbl = row.querySelector('.pro-label')?.value.trim() || 'Babak';
        const bpm = row.querySelector('.pro-bpm')?.value.trim() || '-';
        const dur = row.querySelector('.pro-durasi')?.value.trim() || '-';
        const lnk = row.querySelector('.pro-link')?.value.trim();
        const dsc = row.querySelector('.pro-desc')?.value.trim() || '-';
        return `${lbl} (${bpm}, ${dur}): ${dsc}${lnk ? ` [GDrive: ${lnk}]` : ''}`;
      });
      if (proItems.length) {
        specs.push({ key: 'Rincian Babak & Durasi (Custom)', val: proItems.join(' | ') });
      }
      pushIfVal('Output File & Teknis Tambahan', 'spec-custom-deliverables');
    }

    specs.push({ key: 'Tambahan Sorak', val: sorakChoice });
  } else if (appState.selectedServiceLine === 'digital') {
    specs.push({ key: 'Pemesan / Brand / Instansi', val: sanggarName });
    pushIfVal('Kota, Provinsi', 'field-kota-provinsi');
    specs.push({ key: 'Nomor WhatsApp Aktif', val: waNumber });
    specs.push({ key: 'Email', val: contactEmail });
    pushIfVal('Jenis Kebutuhan Produksi', 'nontari-jenis');
    pushIfVal('Genre / Gaya Musik', 'nontari-genre');
    pushIfVal('Nuansa / Mood Utama', 'nontari-nuansa');
    pushIfVal('Tempo (BPM) & Nada Dasar', 'nontari-tempo-key');
    pushIfVal('Susunan Instrumen', 'nontari-instrumen');
    pushIfVal('Struktur Lagu / Alur Dinamika', 'nontari-struktur');
    pushIfVal('Lirik / Naskah Voice Over', 'nontari-lirik');
    pushIfVal('Target Penggunaan / Platform', 'nontari-platform');
    pushIfVal('Format File Output', 'nontari-output');
    pushIfVal('Jumlah Trek / Lagu (Custom)', 'nontari-custom-count');
    pushIfVal('Lisensi / Hak Pakai (Custom)', 'nontari-custom-license');
    pushIfVal('Detail Khusus Paket Custom', 'nontari-custom-detail');
  } else {
    specs.push({ key: 'Pemesan / Institusi', val: sanggarName });
    specs.push({ key: 'Nomor WhatsApp Aktif', val: waNumber });
    specs.push({ key: 'Email', val: contactEmail });
    pushIfVal('Jenis Transkripsi', 'trans-jenis');
    pushIfVal('Format Notasi', 'trans-format-notasi');
    pushIfVal('Instrumen Ditranskripsi', 'trans-instrumen');
    pushIfVal('Format File Hasil', 'trans-file-output');
    pushIfVal('Bagian Audio Ditranskripsi', 'trans-bagian-waktu');
    pushIfVal('Nada Dasar & Birama', 'trans-nada-birama');
    pushIfVal('Tujuan Penggunaan Partitur', 'trans-tujuan');
    pushIfVal('Catatan Teknis Khusus', 'trans-catatan');
    pushIfVal('Jumlah Repertoar (Custom)', 'trans-custom-count');
    pushIfVal('Standar Penulisan / Analisis (Custom)', 'trans-custom-standard');
    pushIfVal('Detail Khusus Paket Custom', 'trans-custom-detail');
  }

  if (hasVocalAddon) {
    specs.push({ key: 'Tambahan Vokal / Session Player', val: `+ ${formatRupiah(addonAmount)}` });
  }

  const videoLink = document.getElementById('field-video-link')?.value || '';
  const videoFileInput = document.getElementById('field-video-file');
  const videoFileName = videoFileInput?.files[0] ? videoFileInput.files[0].name : '';
  const sinopsis = (appState.selectedServiceLine === 'tari') ? (document.getElementById('field-sinopsis')?.value || '') : '';

  const newP = { 
    id: `PAL-${Date.now()}`, 
    clientEmail: appState.currentClientUser.email, 
    clientName: sanggarName, 
    contactEmail: contactEmail,
    clientWa: waNumber,
    judul: document.getElementById('field-judul').value, 
    durasi: document.getElementById('field-durasi').value,
    serviceLine: appState.selectedServiceLine, 
    serviceLineLabel: svc.label, 
    packageName: isCustomPkg || appState.customPrice ? `${pkg.label} (Kesepakatan)` : pkg.label, 
    contractAgreed: requiresContract,
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

// Inisialisasi awal formulir order saat DOM siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => refreshOrderPageUI());
} else {
  refreshOrderPageUI();
}

// Ekspos seluruh fungsi order & tombol layanan ke global window
Object.assign(window, {
  refreshOrderPageUI,
  selectServiceLine,
  selectPackageTier,
  handleCustomPrice,
  recalculateLivePrice,
  setSynopsisMode,
  generateAISynopsis,
  handleOrderFormSubmit,
  openProductionAgreementModal,
  acceptAgreementAndClose,
  toggleJenisTariOther,
  toggleNuansaOtherInput,
  addCustomStrukturCheckbox,
  addStandarSegmentRow,
  addProSegmentRow,
  removeSegmentRow,
  validateTariDurationLimit,
  copyAIResultToClipboard
});
