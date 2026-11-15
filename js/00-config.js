function initTheme() {
  const savedTheme = localStorage.getItem('prangart_theme') || 'auto';
  setTheme(savedTheme, false);
}
function setTheme(mode, triggerUIUpdate = true) {
  localStorage.setItem('prangart_theme', mode);
  const applyTheme = () => {
    const isDark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    if (triggerUIUpdate) updateThemeIcon(mode);
    document.getElementById('theme-dropdown').classList.add('hidden');
  };
  applyTheme();
  if (!window.themeMediaQuery) {
    window.themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    window.themeMediaQuery.addEventListener('change', (e) => {
      if (localStorage.getItem('prangart_theme') === 'auto') {
        if (e.matches) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }
    });
  }
}
function toggleThemeDropdown() {
  document.getElementById('theme-dropdown').classList.toggle('hidden');
}
function updateThemeIcon(mode) {
  document.getElementById('theme-icon-dark').classList.add('hidden');
  document.getElementById('theme-icon-light').classList.add('hidden');
  document.getElementById('theme-icon-auto').classList.add('hidden');
  if (mode === 'dark') document.getElementById('theme-icon-dark').classList.remove('hidden');
  else if (mode === 'light') document.getElementById('theme-icon-light').classList.remove('hidden');
  else document.getElementById('theme-icon-auto').classList.remove('hidden');
}
document.addEventListener('click', function(event) {
  const dd = document.getElementById('theme-dropdown');
  const btn = dd?.previousElementSibling;
  if (dd && !dd.classList.contains('hidden') && !dd.contains(event.target) && !btn.contains(event.target)) {
    dd.classList.add('hidden');
  }
});

function showToast(title, message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const borderColor = type === 'error' ? 'border-l-red-500' : type === 'warning' ? 'border-l-amber-400' : 'border-l-emerald-400';
  const el = document.createElement('div');
  el.className = `pointer-events-auto bg-surface border border-border border-l-4 ${borderColor} rounded-xl p-4 shadow-2xl text-sm transition-all duration-200`;
  el.innerHTML = `
    <div class="flex items-start justify-between gap-3">
      <div>
        <strong class="text-textMain block font-bold">${title}</strong>
        <span class="text-textMuted block mt-1 leading-relaxed">${message}</span>
      </div>
      <button type="button" onclick="this.parentElement.parentElement.remove()" class="text-textMuted hover:text-textMain text-lg">×</button>
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
  // Fungsi ini dikosongkan karena elemen badge dihapus sesuai permintaan
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
