function drawGoldPillBadge(ctx, x, y, w, h, label) {
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, '#b5892e');
  grad.addColorStop(0.5, '#e8c967');
  grad.addColorStop(1, '#b5892e');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();

  ctx.fillStyle = '#09090b';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(label, x + 18, y + 23);
}

function buildMusicalSpecSummaryLines(proj) {
  const s = proj.musicalSpec || {};
  const lines = [
    `• Jalur: ${proj.entryPath || 'Jalur A'} | Skema: ${proj.paymentScheme || 'DP 50%'} | Hak Ekonomi: Termasuk (Pasal 3)`
  ];
  if (s.mode === 'dasar') {
    lines.push(`• Tempo Utama: ${s.bpm} BPM  |  Nuansa Dominan: ${s.mood}`);
    lines.push(`• Instrumen Utama: ${(s.instruments || []).join(', ') || '-'}`);
  } else if (s.mode === 'standar') {
    (s.structures || []).forEach(st => {
      lines.push(`• [${st.time}] ${st.name}: ${st.detail}`);
    });
  } else if (s.mode === 'pro') {
    (s.scenes || []).forEach(sc => {
      lines.push(`• ${sc.title}: ${sc.detail}`);
    });
  } else if (s.mode === 'transkripsi') {
    lines.push(`• Jenis: ${s.format} | Detail: ${s.key} | Format Hasil: ${s.meter}`);
    lines.push(`• Rincian: ${s.detail}`);
  } else {
    lines.push(`• Genre: ${s.genre || '-'} | Tempo/Nada: ${s.tempo || '-'}`);
    lines.push(`• Uraian: ${s.detail || '-'}`);
  }
  return lines;
}

async function generateBriefCardPNGDataUrl(proj) {
  const c = document.createElement('canvas');
  c.width = 1600;
  c.height = 900;
  const ctx = c.getContext('2d');

  const bgGrad = ctx.createLinearGradient(0, 0, 1600, 900);
  bgGrad.addColorStop(0, '#09090b');
  bgGrad.addColorStop(0.5, '#12110e');
  bgGrad.addColorStop(1, '#09090b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1600, 900);

  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, 75); ctx.quadraticCurveTo(95, 65, 165, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1360, 900); ctx.quadraticCurveTo(1470, 810, 1600, 730); ctx.stroke();

  const logoImg = await loadImageElement(LOGO_URL);
  if (logoImg) ctx.drawImage(logoImg, 65, 28, 78, 78);
  ctx.fillStyle = '#f4f4f5';
  ctx.font = 'bold 28px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText('PrangArt Lab', 158, 66);
  ctx.fillStyle = '#d4af37';
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('— Seni • Budaya • Kreasi —', 160, 90);

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(430, 32); ctx.lineTo(430, 102); ctx.stroke();

  ctx.fillStyle = '#f4f4f5';
  ctx.font = 'italic bold 36px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`——  ${proj.judul}  ——`, 1010, 78, 1050);

  const drawSectionBox = (x, y, w, h) => {
    ctx.fillStyle = 'rgba(18, 18, 21, 0.92)';
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 16);
    ctx.fill();
    ctx.stroke();
  };

  drawSectionBox(45, 145, 610, 165);
  drawGoldPillBadge(ctx, 60, 127, 230, 34, 'Informasi Pemesan');
  ctx.textAlign = 'left';
  ctx.font = '16px "Plus Jakarta Sans", sans-serif';
  const infoRows = [
    ['Nama Lengkap', proj.clientName],
    ['Email', proj.clientEmail],
    ['Nomor WhatsApp', proj.wa],
    ['Asal Pemesan', proj.kota]
  ];
  infoRows.forEach((r, idx) => {
    const ry = 186 + idx * 29;
    ctx.fillStyle = '#d4af37';
    ctx.fillText(r[0], 70, ry);
    ctx.fillText(':', 225, ry);
    ctx.fillStyle = '#f4f4f5';
    ctx.fillText(r[1] || '-', 242, ry, 390);
  });

  drawSectionBox(685, 145, 870, 165);
  drawGoldPillBadge(ctx, 700, 127, 215, 34, 'Identitas Karya');
  const idRows = [
    ['Sanggar / Komunitas / Instansi', proj.instansi],
    ['Koreografer / Pencipta', proj.koreografer],
    ['Penata Musik / Komposer', appState.settings.directorName]
  ];
  idRows.forEach((r, idx) => {
    const ry = 192 + idx * 36;
    ctx.fillStyle = '#d4af37';
    ctx.fillText(r[0], 710, ry);
    ctx.fillText(':', 990, ry);
    ctx.fillStyle = '#f4f4f5';
    ctx.fillText(r[1] || '-', 1010, ry, 520);
  });

  drawSectionBox(45, 345, 1510, 165);
  drawGoldPillBadge(ctx, 60, 327, 165, 34, 'Sinopsis');
  ctx.fillStyle = '#f4f4f5';
  ctx.font = '16px "Plus Jakarta Sans", sans-serif';
  wrapCanvasText(ctx, proj.sinopsis, 1450).slice(0, 5).forEach((line, idx) => {
    ctx.fillText(line, 70, 388 + idx * 25);
  });

  drawSectionBox(45, 545, 490, 165);
  drawGoldPillBadge(ctx, 60, 527, 210, 34, 'Referensi Musik');
  ctx.fillStyle = '#f4f4f5';
  ctx.font = '15px "Plus Jakarta Sans", sans-serif';
  const refSummary = `Layanan: ${proj.serviceLineLabel}\nPaket: ${proj.packageName} (${proj.durasi})\nLink: ${proj.referensi}`;
  wrapCanvasText(ctx, refSummary, 445).slice(0, 5).forEach((line, idx) => {
    ctx.fillText(line, 70, 588 + idx * 24);
  });

  drawSectionBox(45, 740, 490, 88);
  drawGoldPillBadge(ctx, 60, 722, 225, 34, 'Tambahan Layanan');
  ctx.fillStyle = proj.addonSelected ? '#34d399' : '#a1a1aa';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  const vokalTxt = proj.addonSelected
    ? `YA — ${proj.addonLabel} (+${formatRupiah(proj.addonPrice)})`
    : 'Tidak Menggunakan Tambahan Vokal/Partitur';
  ctx.fillText(vokalTxt, 70, 788, 445);

  drawSectionBox(565, 545, 990, 283);
  drawGoldPillBadge(ctx, 580, 527, 340, 34, 'Uraian Nuansa / Tempo / Struktur');
  ctx.fillStyle = '#f4f4f5';
  ctx.font = '15px "Plus Jakarta Sans", sans-serif';
  buildMusicalSpecSummaryLines(proj).slice(0, 9).forEach((line, idx) => {
    ctx.fillText(line, 590, 588 + idx * 25, 940);
  });

  ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
  ctx.beginPath(); ctx.moveTo(45, 848); ctx.lineTo(1555, 848); ctx.stroke();

  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('IG: prangart.studios    |    WA: 08977230597    |    Email: prangart.studios@gmail.com', 55, 878);
  ctx.textAlign = 'right';
  ctx.fillText(`Kode: ${proj.id} • Estimasi: ${formatRupiah(proj.totalPrice)} (${proj.paymentScheme})`, 1545, 878);

  return c.toDataURL('image/png');
}

async function downloadCurrentBriefPNG() {
  const proj = appState.projects.find(p => p.id === appState.activeBriefProjectId);
  if (!proj) return;
  const url = await generateBriefCardPNGDataUrl(proj);
  triggerPngFileDownload(url, `Kartu-Brief-PrangArt-${proj.id}.png`);
}

function sendBriefCardToProducerWA() {
  const proj = appState.projects.find(p => p.id === appState.activeBriefProjectId);
  if (!proj) return;
  const intent =
    `Pengajuan Kebutuhan (${proj.id}) - ${proj.entryPath}\n` +
    `Judul Karya: ${proj.judul}\n` +
    `Layanan: ${proj.serviceLineLabel} - ${proj.packageName}\n` +
    `Estimasi Biaya: ${formatRupiah(proj.totalPrice)} (Rencana: ${proj.paymentScheme})\n` +
    `Saya lampirkan Gambar Kartu Brief PrangArt Lab untuk pemeriksaan materi & diskusi penawaran.`;
  openProducerWaModal(intent, proj.serviceLineLabel, proj.clientName, `${proj.instansi} - ${proj.kota}`);
}

async function openBriefCardModal(projId) {
  const proj = appState.projects.find(p => p.id === projId);
  if (!proj) return;
  appState.activeBriefProjectId = projId;
  const url = await generateBriefCardPNGDataUrl(proj);
  document.getElementById('modal-brief-img').src = url;
  const modal = document.getElementById('brief-card-modal');
  modal?.classList.remove('hidden');
  modal?.classList.add('flex');
}

function closeBriefCardModal() {
  const modal = document.getElementById('brief-card-modal');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
}