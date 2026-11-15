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
    nomorPerjanjian: proj.contractNumber || `${proj.id.replace('PAL-2026-', '')}/PAL-SPK/XI/2026`,
    tanggal: proj.createdAt || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
    pihak1Nama: appState.settings.directorName, pihak1Alamat: appState.settings.studioAddress, pihak1Nik: appState.settings.directorIdNumber || '6472050000000001',
    nama: proj.clientName, sanggar: proj.instansi, alamatKlien: proj.alamat || proj.kota, nikKlien: proj.nik,
    namaTari: proj.judul, jenisKarya: proj.jenisTari, judulBerkas: proj.musicFileTitle, estimasi: proj.durasi,
    formatFile: proj.deliverableFormat, jumlahFormatted: Number(proj.totalPrice || 0).toLocaleString('id-ID') + ',00',
    jumlahTerbilang: `${numberToIndonesianWords(proj.totalPrice || 0)} Rupiah`, dpFormatted: formatRupiah(dpNominal), pelunasanFormatted: formatRupiah(pelunasanNominal),
    revisiJumlah: proj.revisionQuota || '6', kedudukan: role, formatKredit: getCreditTextByRole(role, appState.settings.directorName),
    materiPihakKetiga: proj.thirdPartyMaterial || 'Tidak ada', kolaborator: proj.collaboratorNotes || 'Tidak ada kontributor tambahan',
    berkasMentah: proj.rawFilesIncluded ? `Diserahkan: ${proj.rawFilesDetail}` : 'Tidak diserahkan',
    catatanTambahan: proj.extraAttachmentNotes || proj.quoteNotes || '-', kotaPengadilan: proj.courtCity || 'Samarinda',
    serviceLine: proj.serviceLine || 'tari', ticketId: proj.id || 'DRAFT'
  };
}

function openDraftContractPreviewModal() {
  const u = appState.currentClientUser || {};
  const svc = appState.serviceCatalog[appState.selectedServiceLine];
  const pkg = svc.packages[appState.selectedPackage];
  const addonChecked = Boolean(document.getElementById('field-addon-vocal')?.checked);
  const total = pkg.price + (addonChecked ? svc.addonPrice : 0);
  const draftProj = {
    id: 'DRAFT', createdAt: new Date().toLocaleDateString('id-ID'), clientName: document.getElementById('field-nama')?.value || u.name || '........',
    instansi: document.getElementById('field-instansi')?.value || u.instansi || '........', alamat: document.getElementById('field-alamat')?.value || u.alamat || '........',
    nik: document.getElementById('field-nik')?.value || u.nik || '........', judul: document.getElementById('field-judul')?.value || '........',
    jenisTari: document.getElementById('field-jenis-tari')?.value || svc.label, durasi: document.getElementById('field-durasi')?.value || '05:00',
    totalPrice: total, dpAmount: Math.round(total * 0.5), revisionQuota: 'Sesuai Kesepakatan', serviceLine: appState.selectedServiceLine
  };
  activeContractDocData = buildContractDataFromProject(draftProj);
  renderContractDocumentCanvas();
  document.getElementById('contract-sign-footer')?.classList.add('hidden');
  const modal = document.getElementById('contract-doc-modal'); modal?.classList.remove('hidden'); modal?.classList.add('flex');
}

function openContractDocModal(projId, enableSigning = false) {
  const proj = appState.projects.find(p => p.id === projId);
  if (!proj) return;
  activeContractDocData = buildContractDataFromProject(proj);
  renderContractDocumentCanvas();
  const footer = document.getElementById('contract-sign-footer');
  if (document.getElementById('sign-agreement-cb')) document.getElementById('sign-agreement-cb').checked = false;
  if (document.getElementById('sign-client-address')) document.getElementById('sign-client-address').value = proj.alamat || proj.kota || '';
  if (document.getElementById('sign-client-nik')) document.getElementById('sign-client-nik').value = proj.nik || '';
  if (footer) { if (enableSigning && !proj.agreementSigned) { footer.classList.remove('hidden'); footer.classList.add('flex'); } else { footer.classList.add('hidden'); footer.classList.remove('flex'); } }
  const modal = document.getElementById('contract-doc-modal'); modal?.classList.remove('hidden'); modal?.classList.add('flex');
}

function closeContractDocModal() {
  const modal = document.getElementById('contract-doc-modal'); modal?.classList.add('hidden'); modal?.classList.remove('flex');
}

async function confirmClientAdministrativeApproval() {
  if (!document.getElementById('sign-agreement-cb')?.checked) { showToast('Centang Persetujuan', 'Centang kotak persetujuan.', 'warning'); return; }
  const proj = appState.projects.find(p => p.id === activeContractDocData?.ticketId);
  if (!proj) return;
  proj.alamat = document.getElementById('sign-client-address')?.value || proj.alamat;
  proj.nik = document.getElementById('sign-client-nik')?.value || proj.nik;
  proj.agreementSigned = true; proj.agreementSignedAt = new Date().toLocaleDateString('id-ID'); proj.productionStatus = TRACKER_MILESTONES[3];
  await syncProjectToCloud(proj); closeContractDocModal(); renderClientWorkspace(); showToast('Disetujui', 'Tahap pembayaran dibuka.');
}

function renderContractDocumentCanvas() {
  const d = activeContractDocData;
  const canvasEl = document.getElementById('contract-doc-canvas');
  const headingEl = document.getElementById('contract-modal-heading');
  if (!d || !canvasEl) return;
  const isTranskripsi = d.serviceLine === 'transkripsi';
  const docMainTitle = isTranskripsi ? 'PERSETUJUAN PENAWARAN & KETENTUAN TRANSKRIPSI MUSIK' : 'PERJANJIAN PRODUKSI MUSIK';
  if (headingEl) headingEl.textContent = `${docMainTitle} — PrangArt Lab`;

  canvasEl.innerHTML = `
    <div class="space-y-5 text-neutral-900 text-xs sm:text-[13px] leading-relaxed">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b-2 border-neutral-900 pb-4">
        <div class="flex items-center gap-3"><img src="${LOGO_URL}" class="w-14 h-14 object-contain" /><div><p class="text-xs font-bold uppercase">PRANGART LAB</p><h2 class="text-lg font-bold uppercase">${docMainTitle}</h2><p class="text-xs">Nomor: <strong>${d.nomorPerjanjian}</strong> | Tanggal: <strong>${d.tanggal}</strong></p></div></div>
      </div>
      <table class="w-full border-collapse border border-neutral-900 text-xs">
        <tbody>
          <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-3 font-bold w-40 align-top bg-neutral-100">PIHAK PERTAMA</td><td class="p-3 space-y-0.5"><p>Nama: <strong>${d.pihak1Nama}</strong></p><p>Kedudukan: ${d.kedudukan}</p><p>Pemilik PrangArt Lab</p><p>Alamat: ${d.pihak1Alamat}</p><p>NIK: ${d.pihak1Nik}</p></td></tr>
          <tr><td class="border-r border-neutral-900 p-3 font-bold align-top bg-neutral-100">PIHAK KEDUA</td><td class="p-3 space-y-0.5"><p>Nama: <strong>${d.nama}</strong></p><p>Instansi: ${d.sanggar}</p><p>Alamat: ${d.alamatKlien}</p><p>NIK: ${d.nikKlien}</p></td></tr>
        </tbody>
      </table>
      <p>Para Pihak sepakat mengikatkan diri dengan ketentuan berikut.</p>
      <div class="space-y-1.5">
        <h3 class="font-bold uppercase text-sm">RINGKASAN KESEPAKATAN</h3>
        <table class="w-full border-collapse border border-neutral-900 text-xs">
          <tbody>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold w-52 bg-neutral-50">Karya</td><td class="p-2"><strong>${d.namaTari}</strong> (${d.jenisKarya})</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">File & Durasi</td><td class="p-2">${d.formatFile}, est. <strong>${d.estimasi}</strong> menit</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Harga</td><td class="p-2"><strong>Rp${d.jumlahFormatted}</strong> (<em>${d.jumlahTerbilang}</em>)</td></tr>
            <tr class="border-b border-neutral-900"><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Pembayaran</td><td class="p-2">50% (${d.dpFormatted}), 50% (${d.pelunasanFormatted})</td></tr>
            <tr><td class="border-r border-neutral-900 p-2 font-semibold bg-neutral-50">Hak Ekonomi</td><td class="p-2">Dialihkan otomatis setelah pelunasan</td></tr>
          </tbody>
        </table>
      </div>
      <div class="space-y-3.5 pt-2">
        <div><h4 class="font-bold uppercase">PASAL 1 — OBJEK DAN PENYERAHAN</h4><p>PIHAK PERTAMA melaksanakan pekerjaan sesuai kedudukannya (${d.kedudukan}) di Lampiran A.</p></div>
        <div><h4 class="font-bold uppercase">PASAL 2 — HARGA DAN PEMBAYARAN</h4><p>Harga <strong>Rp${d.jumlahFormatted}</strong>. Pembayaran DP 50% & Pelunasan 50%.</p></div>
        <div><h4 class="font-bold uppercase">PASAL 3 — PENGALIHAN HAK EKONOMI</h4><p>Setelah pelunasan, hak ekonomi dialihkan otomatis kepada PIHAK KEDUA (tunduk pada Pasal 18 UU No. 28 Tahun 2014).</p></div>
        <div><h4 class="font-bold uppercase">PASAL 4 — KREDIT DAN HAK MORAL</h4><p>Format kredit: <strong>"${d.formatKredit}"</strong>.</p></div>
        <div><h4 class="font-bold uppercase">PASAL 5 - 9</h4><p>Kolaborasi, materi pihak ketiga, portofolio, revisi, dan penyelesaian perselisihan diatur sesuai kesepakatan tertulis.</p></div>
      </div>
      <div class="pt-4">
        <p>Dibuat di: <strong>${d.kotaPengadilan}</strong> | Tanggal: <strong>${d.tanggal}</strong></p>
        <table class="w-full border-collapse border border-neutral-900 text-center mt-2 text-xs">
          <tbody><tr><td class="border-r border-neutral-900 p-3 pt-16"><p class="font-bold underline">${d.pihak1Nama}</p><p>PrangArt Lab</p></td><td class="p-3 pt-16"><p class="font-bold underline">${d.nama}</p><p>${d.sanggar}</p></td></tr></tbody>
        </table>
      </div>
    </div>
  `;
}

function downloadContractDocPNG() {
  const d = activeContractDocData;
  if (!d) return;
  const c = document.createElement('canvas'); c.width = 1240; c.height = 1754;
  const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.fillStyle = '#171717';
  ctx.font = 'bold 26px Georgia, serif'; ctx.textAlign = 'center'; ctx.fillText('PERJANJIAN PRODUKSI MUSIK', 620, 80);
  ctx.font = '16px Georgia, serif'; ctx.fillText(`Nomor: ${d.nomorPerjanjian} | Tanggal: ${d.tanggal}`, 620, 110);
  ctx.textAlign = 'left'; let y = 160;
  const writeLine = (txt) => { ctx.font = '16px Georgia, serif'; wrapCanvasText(ctx, txt, 1080).forEach(line => { ctx.fillText(line, 80, y); y += 23; }); };
  writeLine(`PIHAK PERTAMA: ${d.pihak1Nama} (PrangArt Lab)`);
  writeLine(`PIHAK KEDUA: ${d.nama} — ${d.sanggar}`);
  y += 10;
  writeLine(`Karya: "${d.namaTari}" (${d.jenisKarya}). Harga: Rp${d.jumlahFormatted} (${d.jumlahTerbilang}). Pengalihan hak ekonomi berlaku otomatis setelah pelunasan.`);
  const sigY = 1480;
  ctx.textAlign = 'center'; ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText('PIHAK PERTAMA', 320, sigY); ctx.fillText(d.pihak1Nama, 320, sigY + 120);
  ctx.fillText('PIHAK KEDUA', 920, sigY); ctx.fillText(d.nama, 920, sigY + 120);
  triggerPngFileDownload(c.toDataURL('image/png'), `Perjanjian-${d.ticketId}.png`);
  showToast('Diunduh', 'Dokumen Perjanjian siap dikirim.');
}
