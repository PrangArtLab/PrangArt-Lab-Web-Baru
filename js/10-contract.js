let activeContractDocData = null;

function getCreditTextByRole(role, directorName) {
  const cleanName = String(directorName || 'Fikri Yassaar Arrazaq').split(',')[0].trim();
  if (role === 'Composer') return `Musik: ${cleanName}`;
  if (role === 'Arranger') return `Aransemen: ${cleanName}`;
  if (role === 'Tim produksi saja') return `Produksi musik: PrangArt Lab`;
  return `Musik dan aransemen: ${cleanName}`;
}

function buildContractDataFromProject(proj) {
  const dpNominal = proj.dpAmount || Math.round((proj.totalPrice || 0) * 0.5);
  const pelunasanNominal = (proj.totalPrice || 0) - dpNominal;
  const role = proj.composerRole || 'Composer & Arranger';
  return {
    nomorPerjanjian: proj.contractNumber || `${proj.id.replace('PAL-', '')}/PAL-SPK/XI/2026`,
    tanggal: proj.createdAt || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    pihak1Nama: appState.settings.directorName,
    pihak1Alamat: appState.settings.studioAddress,
    pihak1Nik: appState.settings.directorIdNumber || '6472050000000001',
    nama: proj.clientName || '........................................',
    sanggar: proj.instansi || '........................................',
    alamatKlien: proj.alamat || proj.kota || '........................................',
    nikKlien: proj.nik || '........................................',
    namaTari: proj.judul || '........................................',
    jenisKarya: proj.jenisTari || proj.serviceLineLabel || 'Karya Musik',
    judulBerkas: proj.musicFileTitle || `${(proj.judul || 'Karya').replace(/\s+/g, '_')}_Final`,
    estimasi: proj.durasi || '.... : ....',
    formatFile: proj.deliverableFormat || 'MP3 / WAV / PDF',
    jumlahFormatted: Number(proj.totalPrice || 0).toLocaleString('id-ID') + ',00',
    jumlahTerbilang: `${numberToIndonesianWords(proj.totalPrice || 0)} Rupiah`,
    dpFormatted: formatRupiah(dpNominal),
    pelunasanFormatted: formatRupiah(pelunasanNominal),
    revisiJumlah: proj.revisionQuota || (proj.packageKey === 'pro' ? 'Unlimited (1 Bulan)' : '3x'),
    kedudukan: role,
    formatKredit: getCreditTextByRole(role, appState.settings.directorName),
    materiPihakKetiga: proj.thirdPartyMaterial || 'Tidak ada',
    kolaborator: proj.collaboratorNotes || 'Tidak ada kontributor tambahan',
    berkasMentah: proj.rawFilesIncluded ? `Diserahkan: ${proj.rawFilesDetail}` : 'Tidak diserahkan',
    catatanTambahan: proj.extraAttachmentNotes || proj.quoteNotes || '-',
    kotaPengadilan: proj.courtCity || 'Samarinda',
    serviceLine: proj.serviceLine || 'tari',
    serviceLineLabel: proj.serviceLineLabel || 'Produksi Musik',
    ticketId: proj.id || 'DRAFT',
    pengerjaanHari: proj.packageKey === 'dasar' ? '7 (Tujuh)' : '14 (Empat Belas)'
  };
}

function openDraftContractPreviewModal() {
  const u = appState.currentClientUser || {};
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  const pkg = svc.packages[appState.selectedPackage];
  const addonChecked = Boolean(document.getElementById('field-addon-vocal')?.checked);
  const basePrice = appState.customPrice ? appState.customPrice : pkg.price;
  const total = basePrice + (addonChecked ? svc.addonPrice : 0);
  
  const draftProj = {
    id: 'DRAFT',
    createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    clientName: document.getElementById('field-nama')?.value.trim() || u.name || '........................................',
    instansi: document.getElementById('field-instansi')?.value.trim() || u.instansi || '........................................',
    alamat: document.getElementById('field-alamat')?.value.trim() || u.alamat || '........................................',
    nik: document.getElementById('field-nik')?.value.trim() || u.nik || '........................................',
    judul: document.getElementById('field-judul')?.value.trim() || '........................................',
    jenisTari: document.getElementById('field-jenis-tari')?.value.trim() || svc.label,
    durasi: document.getElementById('field-durasi')?.value.trim() || '05:00',
    totalPrice: total,
    dpAmount: Math.round(total * 0.5),
    packageKey: appState.selectedPackage,
    revisionQuota: appState.selectedPackage === 'pro' ? 'Unlimited (1 Bulan)' : '3x',
    serviceLine: appState.selectedServiceLine,
    serviceLineLabel: svc.label
  };
  activeContractDocData = buildContractDataFromProject(draftProj);
  renderContractDocumentCanvas();
  document.getElementById('contract-sign-footer')?.classList.add('hidden');
  const modal = document.getElementById('contract-doc-modal');
  modal?.classList.remove('hidden');
  modal?.classList.add('flex');
}

function openContractDocModal(projId, enableSigning = false) {
  const proj = appState.projects.find(p => p.id === projId);
  if (!proj) return;
  activeContractDocData = buildContractDataFromProject(proj);
  renderContractDocumentCanvas();
  const footer = document.getElementById('contract-sign-footer');
  const cb = document.getElementById('sign-agreement-cb');
  const addrInp = document.getElementById('sign-client-address');
  const nikInp = document.getElementById('sign-client-nik');
  if (cb) cb.checked = false;
  if (addrInp) addrInp.value = proj.alamat || proj.kota || '';
  if (nikInp) nikInp.value = proj.nik || '';
  if (footer) {
    if (enableSigning && !proj.agreementSigned) {
      footer.classList.remove('hidden');
      footer.classList.add('flex');
    } else {
      footer.classList.add('hidden');
      footer.classList.remove('flex');
    }
  }
  const modal = document.getElementById('contract-doc-modal');
  modal?.classList.remove('hidden');
  modal?.classList.add('flex');
}

function closeContractDocModal() {
  const modal = document.getElementById('contract-doc-modal');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
}

async function confirmClientAdministrativeApproval() {
  const cb = document.getElementById('sign-agreement-cb');
  if (!cb?.checked) {
    showToast('Centang Persetujuan', 'Centang kotak persetujuan perjanjian terlebih dahulu.', 'warning');
    return;
  }
  const proj = appState.projects.find(p => p.id === activeContractDocData?.ticketId);
  if (!proj) return;
  const addrVal = document.getElementById('sign-client-address')?.value.trim();
  const nikVal = document.getElementById('sign-client-nik')?.value.trim();
  if (addrVal) proj.alamat = addrVal;
  if (nikVal) proj.nik = nikVal;

  proj.agreementSigned = true;
  proj.agreementSignedAt = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  proj.productionStatus = TRACKER_MILESTONES[3];
  await syncProjectToCloud(proj);
  closeContractDocModal();
  renderClientWorkspace();
  showToast('Perjanjian Disetujui', 'Tahap pembayaran telah dibuka untuk pesanan Anda.');
}

function renderContractDocumentCanvas() {
  const d = activeContractDocData;
  const canvasEl = document.getElementById('contract-doc-canvas');
  const headingEl = document.getElementById('contract-modal-heading');
  if (!d || !canvasEl) return;

  const isTranskripsi = d.serviceLine === 'transkripsi';
  const docMainTitle = isTranskripsi
    ? 'PERSETUJUAN PENAWARAN & KETENTUAN LAYANAN TRANSKRIPSI'
    : 'PERJANJIAN ARANSEMEN & PRODUKSI MUSIK';

  if (headingEl) headingEl.textContent = `${docMainTitle} — PrangArt Lab`;

  const checkMark = (target) => (d.kedudukan === target ? '[ ✓ ]' : '[   ]');
  const isNoCollab = d.kolaborator.toLowerCase().includes('tidak ada');

  canvasEl.innerHTML = `
    <div class="space-y-5 text-neutral-900 text-xs sm:text-[13px] leading-relaxed">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b-2 border-neutral-900 pb-4">
        <div class="flex items-center gap-3">
          <img src="${LOGO_URL}" alt="PrangArt Lab" class="w-14 h-14 object-contain" />
          <div>
            <p class="text-xs font-bold tracking-widest uppercase">PRANGART LAB</p>
            <h2 class="text-lg sm:text-xl font-bold uppercase">${docMainTitle}</h2>
            <p class="text-xs">Nomor: <strong>${d.nomorPerjanjian}</strong> &nbsp;|&nbsp; Tanggal: <strong>${d.tanggal}</strong></p>
          </div>
        </div>
      </div>

      <table class="w-full border-collapse border border-neutral-900 text-xs">
        <tbody>
          <tr class="border-b border-neutral-900">
            <td class="border-r border-neutral-900 p-3 font-bold w-40 align-top bg-neutral-100">PIHAK PERTAMA</td>
            <td class="p-3 space-y-0.5">
              <p>Nama: <strong>${d.pihak1Nama}</strong></p>
              <p>Pemilik usaha <strong>PrangArt Lab</strong></p>
              <p>Alamat: ${d.pihak1Alamat}</p>
              <p>Nomor Identitas: ${d.pihak1Nik}</p>
            </td>
          </tr>
          <tr>
            <td class="border-r border-neutral-900 p-3 font-bold align-top bg-neutral-100">PIHAK KEDUA</td>
            <td class="p-3 space-y-0.5">
              <p>Nama: <strong>${d.nama}</strong></p>
              <p>Instansi/Sanggar/Komunitas/Individu: <strong>${d.sanggar}</strong></p>
              <p>Alamat: ${d.alamatKlien}</p>
              <p>Nomor Identitas: ${d.nikKlien}</p>
            </td>
          </tr>
        </tbody>
      </table>

      <p>Para Pihak sepakat mengikatkan diri dengan ketentuan berikut.</p>

      <div class="space-y-1.5">
        <h3 class="font-bold uppercase text-sm">RINGKASAN KESEPAKATAN</h3>
        <table class="w-full border-collapse border border-neutral-900 text-xs">
          <tbody>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold w-52 bg-neutral-50">Karya</td><td class="p-2"><strong>${d.namaTari}</strong> (${d.jenisKarya}), berkas <strong>${d.judulBerkas}</strong></td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">File yang diterima</td><td class="p-2">${d.formatFile}, durasi <strong>${d.estimasi}</strong> menit</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Harga</td><td class="p-2"><strong>Rp${d.jumlahFormatted}</strong> (<em>${d.jumlahTerbilang}</em>)</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Pembayaran</td><td class="p-2">50% (${d.dpFormatted}) di awal, 50% (${d.pelunasanFormatted}) setelah draf final disetujui.</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Revisi</td><td class="p-2"><strong>${d.revisiJumlah}</strong></td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Waktu Pengerjaan</td><td class="p-2">Maksimal ${d.pengerjaanHari} hari.</td></tr>
          </tbody>
        </table>
      </div>

      <div class="space-y-3.5 pt-2">
        <div>
          <h4 class="font-bold uppercase">PASAL 1 — OBJEK DAN PENYERAHAN</h4>
          <ol class="list-decimal pl-5 space-y-1 mt-1">
            <li>PIHAK PERTAMA melaksanakan pekerjaan sesuai spesifikasi yang disepakati sebelum produksi dimulai.</li>
            <li>PIHAK PERTAMA menyerahkan berkas final sesuai format. Berkas proyek mentah, multitrack, sesi DAW, dan preset tidak diserahkan kecuali dicantumkan secara tegas dan disepakati.</li>
          </ol>
        </div>

        <div>
          <h4 class="font-bold uppercase">PASAL 2 — HARGA DAN PEMBAYARAN</h4>
          <ol class="list-decimal pl-5 space-y-1 mt-1">
            <li>Harga keseluruhan adalah <strong>Rp${d.jumlahFormatted}</strong> (<em>${d.jumlahTerbilang}</em>).</li>
            <li>Pembayaran dilakukan dalam dua termin: (a) 50% sebelum produksi dimulai; dan (b) 50% setelah draf final disetujui.</li>
            <li>Permintaan di luar paket standar atau penambahan instrumen khusus dikonsultasikan dan dikenakan biaya tambahan yang disepakati tertulis.</li>
          </ol>
        </div>

        <div>
          <h4 class="font-bold uppercase">PASAL 3 — KETENTUAN REVISI</h4>
          <ol class="list-decimal pl-5 space-y-1 mt-1">
            <li>Paket Dasar mencakup kuota maksimal <strong>3x revisi</strong>.</li>
            <li>Paket Pro mencakup <strong>revisi tidak terbatas (unlimited)</strong> dengan batas waktu klaim maksimal 1 bulan setelah penyelesaian proyek.</li>
            <li>Revisi di luar ketentuan/kuota tersebut dikenakan biaya tambahan sebesar <strong>Rp250.000 per sesi</strong>.</li>
          </ol>
        </div>

        <div>
          <h4 class="font-bold uppercase">PASAL 4 — RESIKO & PEMBATALAN</h4>
          <ol class="list-decimal pl-5 space-y-1 mt-1">
            <li>Apabila materi telah dikirimkan dan tidak terdapat respons dari klien selama lebih dari <strong>14 hari</strong>, proyek akan dicatat sebagai selesai sementara atau diarsipkan.</li>
            <li>Pembatalan proyek secara sepihak di tengah jalan mengakibatkan Down Payment (DP) bersifat <strong>non-refundable (hangus)</strong> sebagai kompensasi atas waktu dan tenaga kerja yang telah berjalan.</li>
          </ol>
        </div>

        <div>
          <h4 class="font-bold uppercase">PASAL 5 — KETERLAMBATAN</h4>
          <ol class="list-decimal pl-5 space-y-1 mt-1">
            <li>PrangArt Lab berkomitmen menyelesaikan proyek tepat waktu (7 hari untuk Paket Dasar, 14 hari untuk Paket Standar/Pro).</li>
            <li>Apabila terjadi keterlambatan penyerahan materi tanpa konfirmasi perpanjangan sebelumnya, klien berhak mendapatkan potongan harga sebesar <strong>1% hingga 2% per hari</strong> dari sisa pelunasan, dengan batas maksimal potongan <strong>10%</strong> dari sisa pelunasan. DP tetap sah sebagai hak pengerjaan awal.</li>
          </ol>
        </div>
        
        <div>
          <h4 class="font-bold uppercase">PASAL 6 — PENYELESAIAN PERSELISIHAN</h4>
          <ol class="list-decimal pl-5 space-y-1 mt-1">
             <li>Perselisihan diselesaikan terlebih dahulu melalui musyawarah. Jika tidak tercapai kesepakatan, Para Pihak dapat menempuh jalur hukum dengan domisili pada Pengadilan Negeri <strong>${d.kotaPengadilan}</strong>.</li>
          </ol>
        </div>
      </div>

      <div class="pt-4">
        <p>Dibuat dan ditandatangani di: <strong>${d.kotaPengadilan}</strong> &nbsp;|&nbsp; Pada tanggal: <strong>${d.tanggal}</strong></p>
        <table class="w-full border-collapse border border-neutral-900 text-center mt-2 text-xs">
          <thead>
            <tr class="border-b border-neutral-900 bg-neutral-100">
              <th class="border-r border-neutral-900 p-2 w-1/2">PIHAK PERTAMA</th>
              <th class="p-2 w-1/2">PIHAK KEDUA</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border-r border-neutral-900 p-3 pt-16">
                <p class="font-bold underline">${d.pihak1Nama}</p>
                <p>PrangArt Lab</p>
              </td>
              <td class="p-3 pt-16">
                <p class="font-bold underline">${d.nama}</p>
                <p>${d.sanggar}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function downloadContractDocPNG() {
  const d = activeContractDocData;
  if (!d) return;
  const c = document.createElement('canvas');
  c.width = 1240;
  c.height = 1754;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#171717';

  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('PRANGART LAB', 620, 65);
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText('PERJANJIAN PRODUKSI MUSIK', 620, 98);
  ctx.font = '17px Georgia, serif';
  ctx.fillText(`Nomor: ${d.nomorPerjanjian}   |   Tanggal: ${d.tanggal}`, 620, 126);

  ctx.beginPath(); ctx.moveTo(80, 144); ctx.lineTo(1160, 144); ctx.stroke();

  ctx.textAlign = 'left';
  let y = 176;
  const lh = 23;

  const writeLine = (txt, bold = false) => {
    ctx.font = `${bold ? 'bold ' : ''}16px Georgia, serif`;
    wrapCanvasText(ctx, txt, 1080).forEach(line => {
      ctx.fillText(line, 80, y);
      y += lh;
    });
  };

  writeLine(`PIHAK PERTAMA: ${d.pihak1Nama} (Pemilik usaha PrangArt Lab)`, true);
  writeLine(`Alamat: ${d.pihak1Alamat} | No. Identitas: ${d.pihak1Nik}`);
  writeLine(`PIHAK KEDUA: ${d.nama} — ${d.sanggar}`, true);
  writeLine(`Alamat: ${d.alamatKlien} | No. Identitas: ${d.nikKlien}`);
  y += 6;
  writeLine(`PASAL 1 (Objek): Karya "${d.namaTari}" (${d.jenisKarya}), durasi ${d.estimasi} menit, format ${d.formatFile}.`);
  y += 5;
  writeLine(`PASAL 2 (Harga & Pembayaran): Rp${d.jumlahFormatted} (${d.jumlahTerbilang}). DP 50%: ${d.dpFormatted}, Pelunasan: ${d.pelunasanFormatted}.`);
  y += 5;
  writeLine(`PASAL 3 (Revisi): Kuota ${d.revisiJumlah}. Revisi di luar kuota dikenakan biaya Rp250.000 per sesi.`);
  y += 5;
  writeLine(`PASAL 4 (Pembatalan): Klien tidak merespon >14 hari = selesai sementara. Batal sepihak = DP hangus (non-refundable).`);
  y += 5;
  writeLine(`PASAL 5 (Keterlambatan): PrangArt Lab terlambat tanpa kesepakatan = potongan 1%-2% per hari dari sisa pelunasan (maks 10%).`);

  const sigY = Math.max(y + 50, 1480);
  ctx.textAlign = 'center';
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText('PIHAK PERTAMA', 320, sigY);
  ctx.fillText(d.pihak1Nama, 320, sigY + 125);
  ctx.fillText('PrangArt Lab', 320, sigY + 150);

  ctx.fillText('PIHAK KEDUA', 920, sigY);
  ctx.fillText(d.nama, 920, sigY + 125);
  ctx.fillText(d.sanggar, 920, sigY + 150);

  triggerPngFileDownload(c.toDataURL('image/png'), `Perjanjian-PrangArtLab-${d.ticketId}.png`);
  showToast('Dokumen Diunduh', 'Perjanjian Produksi Musik PrangArt Lab siap dikirim.');
}
