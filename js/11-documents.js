function openOfficialDocModal(projectId, docType = 'invoice', stage = 'dp') {
  appState.docModalState = { projectId, docType, stage };
  const stageSel = document.getElementById('doc-stage-select');
  if (stageSel) stageSel.value = stage;
  renderOfficialDocument();
  const modal = document.getElementById('official-doc-modal');
  modal?.classList.remove('hidden');
  modal?.classList.add('flex');
}

function closeOfficialDocModal() {
  const modal = document.getElementById('official-doc-modal');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
}

function switchOfficialDocType(docType) {
  appState.docModalState.docType = docType;
  renderOfficialDocument();
}

function switchOfficialDocStage(stage) {
  appState.docModalState.stage = stage;
  renderOfficialDocument();
}

function getOfficialDocComputedData() {
  const { projectId, docType, stage } = appState.docModalState;
  const proj = appState.projects.find(p => p.id === projectId);
  if (!proj) return null;
  const pelunasanAmt = proj.totalPrice - proj.dpAmount;
  const amount = stage === 'dp' ? proj.dpAmount : stage === 'lunas' ? pelunasanAmt : proj.totalPrice;
  const stageLabel =
    stage === 'dp'
      ? `Uang Muka / DP 50% — ${proj.serviceLineLabel} "${proj.judul}" (${proj.packageName})`
      : stage === 'lunas'
        ? `Pelunasan Musik — ${proj.serviceLineLabel} "${proj.judul}" (${proj.packageName})`
        : `Pembayaran Penuh 100% — ${proj.serviceLineLabel} "${proj.judul}" (${proj.packageName})`;

  return {
    proj, docType, stage, amount,
    amountFormatted: formatRupiah(amount) + ',00',
    terbilang: `${numberToIndonesianWords(amount)} Rupiah`,
    description: stageLabel,
    docNumber: `${docType === 'invoice' ? 'INV' : 'KWT'}/${proj.id}/${stage.toUpperCase()}`,
    dateText: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  };
}

function renderOfficialDocument() {
  const data = getOfficialDocComputedData();
  const canvasEl = document.getElementById('official-doc-canvas');
  if (!data || !canvasEl) return;

  const invBtn = document.getElementById('doc-type-invoice');
  const kwtBtn = document.getElementById('doc-type-kuitansi');
  if (data.docType === 'invoice') {
    invBtn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gold text-obsidian';
    kwtBtn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-acoustic text-ash border border-borderline';
  } else {
    kwtBtn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gold text-obsidian';
    invBtn.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-acoustic text-ash border border-borderline';
  }

  if (data.docType === 'invoice') {
    canvasEl.innerHTML = `
      <div class="relative font-serif text-neutral-900 space-y-6 p-2">
        <div class="flex items-start justify-between gap-4">
          <div class="flex flex-col items-center">
            <img src="${LOGO_URL}" alt="PrangArt Lab" class="w-16 h-16 object-contain" />
            <strong class="text-xs mt-1">PrangArt Lab</strong>
          </div>
          <h1 class="text-4xl sm:text-5xl font-normal tracking-tight">Invoice</h1>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm pt-2">
          <div class="space-y-0.5">
            <p>Jl. Wiraguna Gang 4</p>
            <p>Kel. Sidodadi, Samarinda</p>
            <p class="text-xs">Email : ${appState.settings.studioEmail}</p>
            <p class="text-xs">WhatsApp: 08977230597</p>
          </div>
          <div class="sm:text-right space-y-1">
            <p><strong>No:</strong> ${data.docNumber}</p>
            <p><strong>Tanggal:</strong> ${data.dateText}</p>
            <p><strong>Nama:</strong> ${data.proj.clientName} (${data.proj.instansi})</p>
          </div>
        </div>

        <table class="w-full border-collapse border border-neutral-900 text-sm">
          <thead>
            <tr class="border-b border-neutral-900">
              <th class="border-r border-neutral-900 p-3 text-center font-normal w-2/3">Deskripsi</th>
              <th class="p-3 text-center font-bold w-1/3">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-neutral-900">
              <td class="border-r border-neutral-900 p-5 align-top min-h-[120px]">
                <p class="font-semibold">${data.description}</p>
                <p class="text-xs text-neutral-600 mt-1 italic">Terbilang: ${data.terbilang}</p>
              </td>
              <td class="p-5 text-right font-bold align-top">${data.amountFormatted}</td>
            </tr>
            <tr>
              <td class="border-r border-neutral-900 p-3 text-center font-semibold">Total</td>
              <td class="p-3 text-right font-bold">${data.amountFormatted}</td>
            </tr>
          </tbody>
        </table>

        <div class="text-center text-3xl font-bold text-neutral-200 tracking-wide select-none py-2">PrangArt Lab</div>

        <div class="flex flex-col items-end pt-4 space-y-4">
          <p class="font-semibold">${appState.settings.directorName}</p>
          <p class="italic text-2xl font-serif">Terima kasih!</p>
        </div>
      </div>
    `;
  } else {
    canvasEl.innerHTML = `
      <div class="font-serif text-neutral-900 space-y-6 p-2">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b-2 border-neutral-900 pb-4">
          <div class="flex items-center gap-3">
            <img src="${LOGO_URL}" alt="PrangArt Lab" class="w-16 h-16 object-contain" />
            <div>
              <h2 class="text-2xl font-bold leading-none">PrangArt Lab</h2>
              <p class="text-xs font-bold mt-1">Home Music Production Studio</p>
              <p class="text-[11px]">Email: ${appState.settings.studioEmail} &nbsp; WhatsApp: 08977230597</p>
            </div>
          </div>
          <h1 class="text-4xl font-normal">Kuitansi</h1>
        </div>

        <div class="space-y-4 text-sm">
          <div class="flex gap-4"><span class="w-40 font-bold">Nomor:</span><span class="font-mono font-bold">${data.docNumber}</span></div>
          <div class="flex gap-4"><span class="w-40 font-bold">Sudah terima dari:</span><span class="flex-1 border-b border-neutral-800 pb-1 font-semibold">${data.proj.clientName} — ${data.proj.instansi}</span></div>
          <div class="flex gap-4"><span class="w-40 font-bold">Banyaknya uang:</span><span class="flex-1 border-b border-neutral-800 pb-1 italic font-semibold">${data.terbilang}</span></div>
          <div class="flex gap-4"><span class="w-40 font-bold">Untuk pembayaran:</span><span class="flex-1 border-b border-neutral-800 pb-1">${data.description}</span></div>
        </div>

        <div class="flex flex-wrap items-end justify-between gap-6 pt-6">
          <div class="bg-neutral-200 px-6 py-3 font-bold text-lg border border-neutral-400">${data.amountFormatted}</div>
          <div class="text-center space-y-14">
            <div>
              <p class="font-bold">Samarinda, ${data.dateText}</p>
              <p class="text-xs">Penerima,</p>
            </div>
            <p class="font-bold border-t border-neutral-900 pt-1 px-4">${appState.settings.directorName}</p>
          </div>
        </div>
      </div>
    `;
  }
}

async function downloadOfficialDocPNG() {
  const data = getOfficialDocComputedData();
  if (!data) return;
  const c = document.createElement('canvas');
  c.width = 1240;
  c.height = data.docType === 'invoice' ? 1650 : 760;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, c.width, c.height);

  const logoImg = await loadImageElement(LOGO_URL);
  ctx.fillStyle = '#171717';

  if (data.docType === 'invoice') {
    if (logoImg) ctx.drawImage(logoImg, 90, 70, 110, 110);
    ctx.font = 'bold 20px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('PrangArt Lab', 145, 205);

    ctx.font = '72px Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText('Invoice', 1140, 155);

    ctx.textAlign = 'left';
    ctx.font = '21px Georgia, serif';
    ctx.fillText('Jl. Wiraguna Gang 4', 90, 275);
    ctx.fillText('Kel. Sidodadi, Samarinda', 90, 305);
    ctx.font = '18px Georgia, serif';
    ctx.fillText(`Email : ${appState.settings.studioEmail}`, 90, 335);
    ctx.fillText('WhatsApp: 08977230597', 90, 362);

    ctx.textAlign = 'right';
    ctx.font = '21px Georgia, serif';
    ctx.fillText(`No: ${data.docNumber}`, 1140, 275);
    ctx.fillText(`Tanggal: ${data.dateText}`, 1140, 305);
    ctx.fillText(`Nama: ${data.proj.clientName}`, 1140, 335);

    ctx.strokeStyle = '#171717';
    ctx.lineWidth = 2;
    ctx.strokeRect(90, 420, 1050, 420);
    ctx.beginPath(); ctx.moveTo(90, 485); ctx.lineTo(1140, 485); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(90, 770); ctx.lineTo(1140, 770); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(760, 420); ctx.lineTo(760, 840); ctx.stroke();

    ctx.textAlign = 'center';
    ctx.font = '22px Georgia, serif';
    ctx.fillText('Deskripsi', 425, 460);
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText('Jumlah', 950, 460);

    ctx.textAlign = 'left';
    ctx.font = '20px Georgia, serif';
    wrapCanvasText(ctx, data.description, 630).forEach((line, idx) => {
      ctx.fillText(line, 115, 535 + idx * 30);
    });
    ctx.font = 'italic 18px Georgia, serif';
    wrapCanvasText(ctx, `Terbilang: ${data.terbilang}`, 630).forEach((line, idx) => {
      ctx.fillText(line, 115, 655 + idx * 26);
    });

    ctx.textAlign = 'right';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText(data.amountFormatted, 1115, 535);
    ctx.fillText(data.amountFormatted, 1115, 813);

    ctx.textAlign = 'center';
    ctx.font = '22px Georgia, serif';
    ctx.fillText('Total', 425, 813);

    ctx.fillStyle = '#e5e5e5';
    ctx.font = 'bold 64px Georgia, serif';
    ctx.fillText('PrangArt Lab', 620, 990);

    ctx.fillStyle = '#171717';
    ctx.textAlign = 'right';
    ctx.font = '22px Georgia, serif';
    ctx.fillText(appState.settings.directorName, 1140, 1160);
    ctx.font = 'italic 44px Georgia, serif';
    ctx.fillText('Terima kasih!', 1140, 1265);
  } else {
    if (logoImg) ctx.drawImage(logoImg, 70, 45, 95, 95);
    ctx.textAlign = 'left';
    ctx.font = 'bold 42px Georgia, serif';
    ctx.fillText('PrangArt Lab', 180, 92);
    ctx.font = 'bold 18px Georgia, serif';
    ctx.fillText('Home Music Production Studio', 182, 120);
    ctx.font = '15px Georgia, serif';
    ctx.fillText(`Email: ${appState.settings.studioEmail}   WhatsApp: 08977230597`, 182, 144);

    ctx.textAlign = 'right';
    ctx.font = '56px Georgia, serif';
    ctx.fillText('Kuitansi', 1170, 125);

    ctx.strokeStyle = '#171717';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(70, 165); ctx.lineTo(1170, 165); ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = 'bold 21px Georgia, serif';
    ctx.fillText(`Nomor:  ${data.docNumber}`, 70, 225);

    const drawFieldRow = (label, val, y) => {
      ctx.font = 'bold 21px Georgia, serif';
      ctx.fillText(label, 70, y);
      ctx.font = '20px Georgia, serif';
      ctx.fillText(val, 310, y, 840);
      ctx.beginPath(); ctx.moveTo(300, y + 10); ctx.lineTo(1170, y + 10); ctx.stroke();
    };

    drawFieldRow('Sudah terima dari:', `${data.proj.clientName} — ${data.proj.instansi}`, 300);
    drawFieldRow('Banyaknya uang:', data.terbilang, 375);
    drawFieldRow('Untuk pembayaran:', data.description, 450);

    ctx.fillStyle = '#d4d4d4';
    ctx.fillRect(300, 525, 290, 62);
    ctx.fillStyle = '#171717';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.fillText(data.amountFormatted, 320, 565);

    ctx.textAlign = 'center';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText(`Samarinda, ${data.dateText}`, 1010, 515);
    ctx.font = '18px Georgia, serif';
    ctx.fillText('Penerima,', 1010, 542);
    ctx.beginPath(); ctx.moveTo(880, 655); ctx.lineTo(1140, 655); ctx.stroke();
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText(appState.settings.directorName, 1010, 685);
  }

  triggerPngFileDownload(c.toDataURL('image/png'), `${data.docType.toUpperCase()}-PrangArt-${data.proj.id}.png`);
  showToast('Dokumen Diunduh', `${data.docType === 'invoice' ? 'Invoice' : 'Kuitansi'} PNG siap dikirim ke konsumen.`);
}