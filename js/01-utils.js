function showToast(title, message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const borderColor = type === 'error' ? 'border-l-red-500' : type === 'warning' ? 'border-l-amber-400' : 'border-l-emerald-400';
  const el = document.createElement('div');
  el.className = `pointer-events-auto bg-charcoal border border-borderline border-l-4 ${borderColor} rounded-xl p-3.5 shadow-2xl text-xs transition-all duration-200`;
  el.innerHTML = `
    <div class="flex items-start justify-between gap-2">
      <div>
        <strong class="text-ivory block">${title}</strong>
        <span class="text-ash block mt-0.5 leading-relaxed">${message}</span>
      </div>
      <button type="button" onclick="this.parentElement.parentElement.remove()" class="text-ash hover:text-ivory text-xs">×</button>
    </div>
  `;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 250); }, 4200);
}

function formatRupiah(num) {
  return 'Rp' + Number(num || 0).toLocaleString('id-ID');
}

function numberToIndonesianWords(n) {
  n = Math.floor(Number(n) || 0);
  if (n === 0) return 'Nol';
  const satuan = ['','Satu','Dua','Tiga','Empat','Lima','Enam','Tujuh','Delapan','Sembilan','Sepuluh','Sebelas'];
  function convert(x) {
    if (x < 12) return satuan[x];
    if (x < 20) return convert(x - 10) + ' Belas';
    if (x < 100) return convert(Math.floor(x / 10)) + ' Puluh' + (x % 10 ? ' ' + convert(x % 10) : '');
    if (x < 200) return 'Seratus' + (x - 100 ? ' ' + convert(x - 100) : '');
    if (x < 1000) return convert(Math.floor(x / 100)) + ' Ratus' + (x % 100 ? ' ' + convert(x % 100) : '');
    if (x < 2000) return 'Seribu' + (x - 1000 ? ' ' + convert(x - 1000) : '');
    if (x < 1000000) return convert(Math.floor(x / 1000)) + ' Ribu' + (x % 1000 ? ' ' + convert(x % 1000) : '');
    if (x < 1000000000) return convert(Math.floor(x / 1000000)) + ' Juta' + (x % 1000000 ? ' ' + convert(x % 1000000) : '');
    return convert(Math.floor(x / 1000000000)) + ' Miliar' + (x % 1000000000 ? ' ' + convert(x % 1000000000) : '');
  }
  return convert(n).trim();
}

function wrapCanvasText(ctx, text, maxWidth) {
  const paragraphs = String(text || '').split('\n');
  const lines = [];
  paragraphs.forEach(p => {
    const words = p.split(' ');
    let current = '';
    words.forEach(word => {
      const test = current ? current + ' ' + word : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else current = test;
    });
    if (current) lines.push(current);
  });
  return lines;
}

function triggerPngFileDownload(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function loadImageElement(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function updateCloudSyncBadge(statusText, isOnline) {
  const badge = document.getElementById('firebase-sync-badge');
  if (!badge) return;
  badge.textContent = statusText;
  badge.className = isOnline
    ? 'px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
    : 'px-2.5 py-0.5 rounded-full bg-acoustic border border-borderline text-ash';
}

function sanitizeDocId(raw) {
  return String(raw || 'item').toLowerCase().replace(/[^a-z0-9_-]/g, '_');
}

function prepareProjectForFirestore(proj) {
  const copy = { ...proj };
  const maxFieldLen = 650000;
  ['dpProofDataUrl','pelunasanProofDataUrl','previewAudioUrl','masterFileUrl'].forEach(key => {
    if (typeof copy[key] === 'string' && copy[key].length > maxFieldLen) copy[key] = '';
  });
  return copy;
}