/* === PENENTU STATUS PEMBAYARAN & HAK UNDUH DOKUMEN (TERKUNCI SEBELUM LUNAS) === */
function getProjectPaymentAccess(project) {
  const dpStatusLower = String(project.dpStatus || '').toLowerCase();
  const prodStatusLower = String(project.productionStatus || '').toLowerCase();
  const finalStatusLower = String(project.finalPaymentStatus || '').toLowerCase();

  // Lunas penuh hanya jika Admin sudah memverifikasi pelunasan 100%
  const isFullyPaid =
    project.paymentStage === 'LUNAS' ||
    finalStatusLower === 'lunas' ||
    dpStatusLower.includes('lunas 100%') ||
    dpStatusLower === 'lunas' ||
    prodStatusLower.includes('7. pelunasan & penyerahan master');

  // DP 50% sudah diverifikasi Admin (namun belum lunas 100%)
  const isDpVerified =
    !isFullyPaid && (
      project.paymentStage === 'DP_TERVERIFIKASI' ||
      dpStatusLower.includes('dp terverifikasi') ||
      dpStatusLower.includes('dp 50% lunas') ||
      dpStatusLower.includes('sudah bayar dp')
    );

  // Tahap awal: baru mengirim pengajuan & wajib membayar DP 50% terlebih dahulu
  const isAwaitingDp = !isFullyPaid && !isDpVerified;

  return {
    isAwaitingDp,
    isDpVerified,
    isFullyPaid,
    // Kuitansi/Bukti Lunas & Master File TERKUNCI selama isFullyPaid === false
    canDownloadLunasDocument: isFullyPaid,
    canDownloadMasterFile: isFullyPaid
  };
}

/* === RENDER BLOK STATUS PEMBAYARAN DI KARTU PROYEK KLIEN === */
function renderClientPaymentBlock(project) {
  const access = getProjectPaymentAccess(project);
  const total = Number(project.totalPrice || 0);
  const dp = Number(project.dpAmount || total / 2);
  const sisa = Math.max(0, total - dp);

  if (access.isAwaitingDp) {
    return `
      <div class="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-2.5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs font-bold text-amber-400">⏳ Tahap 1: Menunggu Pembayaran DP 50%</span>
          <span class="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
            Wajib DP: ${formatRupiah(dp)}
          </span>
        </div>
        <p class="text-xs text-textMuted leading-relaxed">
          Pengajuan Anda telah tercatat. Silakan lakukan pembayaran <strong>DP 50% (${formatRupiah(dp)})</strong> dari total biaya <strong>${formatRupiah(total)}</strong> lalu kirimkan bukti transfer ke WhatsApp Studio agar proses produksi segera dimulai.
        </p>
        <div class="flex flex-wrap items-center gap-2 pt-1">
          <a href="https://wa.me/6281234567890?text=${encodeURIComponent(`Halo PrangArt Lab, saya ingin konfirmasi pembayaran DP 50% untuk proyek "${project.judul}" (ID: ${project.id}) sebesar ${formatRupiah(dp)}.`)}"
             target="_blank" rel="noopener"
             class="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition">
            Konfirmasi Pembayaran DP via WA
          </a>
          <span class="text-[11px] text-textMuted italic">
            * Bukti Lunas &amp; Master File terkunci hingga pelunasan 100% diverifikasi Admin.
          </span>
        </div>
      </div>
    `;
  }

  if (access.isDpVerified) {
    return `
      <div class="p-4 rounded-xl bg-sky-500/10 border border-sky-500/40 space-y-2.5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xs font-bold text-sky-400">⚙ Tahap 2: DP 50% Terverifikasi • Sedang Diproduksi</span>
          <span class="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">
            Sisa Pelunasan: ${formatRupiah(sisa)}
          </span>
        </div>
        <p class="text-xs text-textMuted leading-relaxed">
          Pembayaran DP 50% (<strong>${formatRupiah(dp)}</strong>) telah dikonfirmasi Admin. Proyek sedang dikerjakan sesuai milestone. Sisa pelunasan sebesar <strong>${formatRupiah(sisa)}</strong> dibayarkan saat karya selesai sebelum penyerahan master.
        </p>
        <div class="text-[11px] text-textMuted italic">
          🔒 Dokumen Bukti Lunas &amp; Master File akan terbuka otomatis setelah pelunasan 100% diverifikasi.
        </div>
      </div>
    `;
  }

  // Tahap 3: Lunas 100% Terverifikasi Admin -> Baru tampilkan tombol unduh Bukti Lunas & Master File
  return `
    <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-xs font-bold text-emerald-400">✓ Tahap 3: Pembayaran Lunas 100% Terverifikasi</span>
        <span class="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
          Total Lunas: ${formatRupiah(total)}
        </span>
      </div>
      <p class="text-xs text-textMuted">
        Terima kasih. Pembayaran telah lunas 100%. Anda sekarang dapat mengunduh Bukti Lunas / Kuitansi Resmi dan Master File karya Anda.
      </p>
      <div class="flex flex-wrap items-center gap-2.5 pt-1">
        <button type="button" onclick="downloadOfficialReceipt('${project.id}')"
          class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition cursor-pointer">
          ⬇ Unduh Bukti Lunas / Kuitansi
        </button>
        ${project.masterFileUrl ? `
          <a href="${project.masterFileUrl}" target="_blank" rel="noopener"
             class="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 transition">
            ⬇ Unduh Master File
          </a>
        ` : ''}
      </div>
    </div>
  `;
}

window.getProjectPaymentAccess = getProjectPaymentAccess;
window.renderClientPaymentBlock = renderClientPaymentBlock;
