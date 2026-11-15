function drawGoldPillBadge(ctx, x, y, w, h, label) {
  ctx.fillStyle = '#8b5cf6'; // Violet
  ctx.beginPath(); ctx.roundRect(x, y, w, h, h / 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 16px "Space Grotesk", sans-serif'; ctx.textAlign = 'left'; ctx.fillText(label, x + 18, y + 23);
}

function buildMusicalSpecSummaryLines(proj) {
  const s = proj.musicalSpec || {};
  const lines = [`• Jalur: ${proj.entryPath || 'Jalur A'} | Skema: ${proj.paymentScheme || 'DP 50%'}`];
  if (s.mode === 'dasar') lines.push(`• Tempo: ${s.bpm} BPM (${s.mood})`, `• Instrumen: ${(s.instruments || []).join(', ')}`);
  else if (s.mode === 'standar') (s.structures || []).forEach(st => lines.push(`• [${st.time}] ${st.name}: ${st.detail}`));
  else if (s.mode === 'pro') (s.scenes || []).forEach(sc => lines.push(`• ${sc.title}: ${sc.detail}`));
  else if (s.mode === 'transkripsi') lines.push(`• Format: ${s.format} | ${s.key} | ${s.meter}`, `• Detail: ${s.detail}`);
  else lines.push(`• Genre: ${s.genre} | Tempo: ${s.tempo}`, `• Uraian: ${s.detail}`);
  return lines;
}

async function generateBriefCardPNGDataUrl(proj) {
  const c = document.createElement('canvas'); c.width = 1600; c.height = 900;
  const ctx = c.getContext('2d');
  const bgGrad = ctx.createLinearGradient(0, 0, 1600, 900);
  bgGrad.addColorStop(0, '#020617'); bgGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, 1600, 900);

  ctx.strokeStyle = '#8b5cf6'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(0, 75); ctx.quadraticCurveTo(95, 65, 165, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1360, 900); ctx.quadraticCurveTo(1470, 810, 1600, 730); ctx.stroke();

  const logoImg = await loadImageElement(LOGO_URL);
  if (logoImg) ctx.drawImage(logoImg, 65, 28, 78, 78);
  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 28px "Space Grotesk", serif'; ctx.textAlign = 'left'; ctx.fillText('PrangArt Lab', 158, 66);
  ctx.fillStyle = '#8b5cf6'; ctx.font = '14px "Outfit", sans-serif'; ctx.fillText('Music Production Studio', 160, 90);

  ctx.fillStyle = '#f8fafc'; ctx.font = 'italic bold 36px "Space Grotesk", serif'; ctx.textAlign = 'center'; ctx.fillText(`— ${proj.judul} —`, 1010, 78, 1050);

  const drawSectionBox = (x, y, w, h) => {
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)'; ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(x, y, w, h, 16); ctx.fill(); ctx.stroke();
  };

  drawSectionBox(45, 145, 610, 165);
  drawGoldPillBadge(ctx, 60, 127, 230, 34, 'Informasi Pemesan');
  ctx.textAlign = 'left'; ctx.font = '16px "Outfit", sans-serif';
  const infoRows = [['Nama', proj.clientName], ['Email', proj.clientEmail], ['WhatsApp', proj.wa], ['Kota', proj.kota]];
  infoRows.forEach((r, idx) => {
    const ry = 186 + idx * 29; ctx.fillStyle = '#8b5cf6'; ctx.fillText(r[0], 70, ry); ctx.fillText(':', 225, ry);
    ctx.fillStyle = '#f8fafc'; ctx.fillText(r[1] || '-', 242, ry, 390);
  });

  drawSectionBox(685, 145, 870, 165);
  drawGoldPillBadge(ctx, 700, 127, 215, 34, 'Identitas Karya');
  const idRows = [['Sanggar / Instansi', proj.instansi], ['Koreografer', proj.koreografer], ['Komposer', appState.settings.directorName]];
  idRows.forEach((r, idx) => {
    const ry = 192 + idx * 36; ctx.fillStyle = '#8b5cf6'; ctx.fillText(r[0], 710, ry); ctx.fillText(':', 990, ry);
    ctx.fillStyle = '#f8fafc'; ctx.fillText(r[1] || '-', 1010, ry, 520);
  });

  drawSectionBox(45, 345, 1510, 165);
  drawGoldPillBadge(ctx, 60, 327, 165, 34, 'Sinopsis');
  ctx.fillStyle = '#f8fafc'; ctx.font = '16px "Outfit", sans-serif';
  wrapCanvasText(ctx, proj.sinopsis, 1450).slice(0, 5).forEach((line, idx) => ctx.fillText(line, 70, 388 + idx * 25));

  drawSectionBox(45, 545, 490, 165);
  drawGoldPillBadge(ctx, 60, 527, 210, 34, 'Referensi Musik');
  ctx.fillStyle = '#f8fafc'; ctx.font = '15px "Outfit", sans-serif';
  wrapCanvasText(ctx, `Layanan: ${proj.serviceLineLabel}\nPaket: ${proj.packageName} (${proj.durasi})\nLink: ${proj.referensi}`, 445).slice(0, 5).forEach((line, idx) => ctx.fillText(line, 70, 588 + idx * 24));

  drawSectionBox(45, 740, 490, 88);
  drawGoldPillBadge(ctx, 60, 722, 225, 34, 'Tambahan Layanan');
  ctx.fillStyle = proj.addonSelected ? '#34d399' : '#94a3b8'; ctx.font = 'bold 16px "Outfit", sans-serif';
  ctx.fillText(proj.addonSelected ? `YA — ${proj.addonLabel}` : 'Tidak Menggunakan Tambahan', 70, 788, 445);

  drawSectionBox(565, 545, 990, 283);
  drawGoldPillBadge(ctx, 580, 527, 340, 34, 'Uraian Nuansa / Tempo / Struktur');
  ctx.fillStyle = '#f8fafc'; ctx.font = '15px "Outfit", sans-serif';
  buildMusicalSpecSummaryLines(proj).slice(0, 9).forEach((line, idx) => ctx.fillText(line, 590, 588 + idx * 25, 940));

  ctx.strokeStyle = 'rgba(139, 92, 246, 0.45)'; ctx.beginPath(); ctx.moveTo(45, 848); ctx.lineTo(1555, 848); ctx.stroke();

  ctx.fillStyle = '#8b5cf6'; ctx.font = 'bold 16px "Outfit", sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('PrangArt Lab  |  WA: 08977230597  |  prangart.studios@gmail.com', 55, 878);
  ctx.textAlign = 'right'; ctx.fillText(`Kode: ${proj.id} • Est: ${formatRupiah(proj.totalPrice)}`, 1545, 878);

  return c.toDataURL('image/png');
}

async function downloadCurrentBriefPNG() {
  const proj = appState.projects.find(p => p.id === appState.activeBriefProjectId);
  if (!proj) return;
  triggerPngFileDownload(await generateBriefCardPNGDataUrl(proj), `Kartu-Brief-${proj.id}.png`);
}

function sendBriefCardToProducerWA() {
  const proj = appState.projects.find(p => p.id === appState.activeBriefProjectId);
  if (!proj) return;
  openProducerWaModal(`Pengajuan Kebutuhan (${proj.id})\nJudul: ${proj.judul}\nLayanan: ${proj.serviceLineLabel}\nEstimasi: ${formatRupiah(proj.totalPrice)}\nMohon periksa materi & diskusi penawaran.`, proj.serviceLineLabel, proj.clientName, proj.instansi);
}

async function openBriefCardModal(projId) {
  const proj = appState.projects.find(p => p.id === projId);
  if (!proj) return;
  appState.activeBriefProjectId = projId;
  document.getElementById('modal-brief-img').src = await generateBriefCardPNGDataUrl(proj);
  const modal = document.getElementById('brief-card-modal');
  modal?.classList.remove('hidden'); modal?.classList.add('flex');
}

function closeBriefCardModal() {
  const modal = document.getElementById('brief-card-modal');
  modal?.classList.add('hidden'); modal?.classList.remove('flex');
}
