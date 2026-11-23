function initTheme() {
  const savedTheme = localStorage.getItem('prangart_theme') || 'auto';
  setTheme(savedTheme, false);
}
function setTheme(mode, triggerUIUpdate = true) {
  localStorage.setItem('prangart_theme', mode);
  const apply = () => {
    const isDark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
    if (triggerUIUpdate) updateThemeIcon(mode);
    document.getElementById('theme-dropdown')?.classList.add('hidden');
  };
  apply();
}
function toggleThemeDropdown() { document.getElementById('theme-dropdown')?.classList.toggle('hidden'); }
function updateThemeIcon(mode) {
  ['theme-icon-dark', 'theme-icon-light', 'theme-icon-auto'].forEach(id => document.getElementById(id)?.classList.add('hidden'));
  if (mode === 'dark') document.getElementById('theme-icon-dark')?.classList.remove('hidden');
  else if (mode === 'light') document.getElementById('theme-icon-light')?.classList.remove('hidden');
  else document.getElementById('theme-icon-auto')?.classList.remove('hidden');
}
document.addEventListener('click', function(event) {
  const dd = document.getElementById('theme-dropdown');
  const btn = dd?.previousElementSibling;
  if (dd && !dd.classList.contains('hidden') && !dd.contains(event.target) && !btn?.contains(event.target)) dd.classList.add('hidden');
});

function showToast(title, message, type = 'success') {
  const container = document.getElementById('toast-container'); if (!container) return;
  const border = type === 'error' ? 'border-l-red-500' : type === 'warning' ? 'border-l-amber-400' : 'border-l-emerald-400';
  const el = document.createElement('div');
  el.className = `pointer-events-auto bg-surface border border-border border-l-4 ${border} rounded-xl p-4 shadow-2xl text-sm transition-all duration-300 animate-fade-in mb-2`;
  el.innerHTML = `<div class="flex justify-between gap-2"><div><strong class="text-textMain block">${title}</strong><span class="text-textMuted block mt-1">${message}</span></div><button onclick="this.parentElement.parentElement.remove()" class="text-textMuted hover:text-textMain">×</button></div>`;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 4500);
}
function formatRupiah(num) { return 'Rp' + Number(num || 0).toLocaleString('id-ID'); }
function numberToIndonesianWords(n) { return "Rupiah"; }
function triggerPngFileDownload(url, name) { const a = document.createElement('a'); a.href = url; a.download = name; a.click(); }
function sanitizeDocId(raw) { return String(raw || 'item').toLowerCase().replace(/[^a-z0-9_-]/g, '_'); }
function prepareProjectForFirestore(p) { return p; }
