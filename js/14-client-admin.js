/* === RUANG KLIEN & DASHBOARD ADMIN (PRANGART LAB) — RENDERER YANG SEBELUMNYA BELUM ADA === */

let adminActiveTab = 'content';

function escHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function isAdminSessionActive() {
  return Boolean(appState.isAdminUnlocked || localStorage.getItem('prangart_admin_unlocked') === 'true');
}

/* ================= RUANG KLIEN ================= */

function getClientProjects() {
  const user = appState.currentClientUser;
  if (!user || !user.email) return [];
  const email = String(user.email).toLowerCase();
  return (appState.projects || []).filter((p) => String(p.clientEmail || p.contactEmail || '').toLowerCase() === email);
}

function renderClientProjectCard(project) {
  const specs = (project.specs || [])
    .map((s) => `<li class="text-xs"><span class="text-textMuted">${escHtml(s.key)}:</span> ${escHtml(s.val)}</li>`)
    .join('');
  const payment = typeof renderClientPaymentBlock === 'function' ? renderClientPaymentBlock(project) : '';
  return `
    <article class="bg-surface border border-border/80 rounded-3xl p-6 space-y-4">
      <div class="flex flex-wrap justify-between gap-3">
        <div>
          <span class="text-[11px] font-mono text-primary font-bold uppercase">${escHtml(project.serviceLineLabel || '')}</span>
          <h3 class="text-lg font-bold text-textMain">${escHtml(project.judul)}</h3>
          <p class="text-xs text-textMuted">${escHtml(project.packageName || '')} • ID ${escHtml(project.id)}</p>
        </div>
        <div class="text-xs text-textMuted sm:text-right">Progres saat ini<br /><strong class="text-textMain">${escHtml(project.productionStatus || '-')}</strong></div>
      </div>
      ${payment}
      <details class="text-xs"><summary class="cursor-pointer font-bold text-textMain">Rincian pesanan</summary><ul class="mt-2 space-y-1">${specs}</ul></details>
    </article>`;
}

function renderClientPortal() {
  const box = document.getElementById('client-workspace-content');
  if (!box) return;
  const user = appState.currentClientUser;
  if (!user) { box.innerHTML = ''; return; }
  const projects = getClientProjects();
  box.innerHTML = `
    <div class="bg-surface border border-border/80 rounded-3xl p-6 sm:p-8">
      <span class="text-xs font-mono text-primary font-bold uppercase">Ruang Klien</span>
      <h2 class="text-2xl font-display font-bold mt-1">Halo, ${escHtml(user.name)}</h2>
      <p class="text-sm text-textMuted mt-1">Pantau status proyek dan pembayaran Anda di sini.</p>
    </div>
    <div class="space-y-5">
      ${projects.length
        ? projects.map((p) => renderClientProjectCard(p)).join('')
        : '<div class="bg-surface border border-dashed border-border rounded-3xl p-10 text-center text-sm text-textMuted">Belum ada proyek. Ajukan pesanan melalui menu Pemesanan.</div>'}
    </div>`;
}

function downloadOfficialReceipt(projectId) {
  const project = (appState.projects || []).find((p) => p.id === projectId);
  if (!project || !getProjectPaymentAccess(project).canDownloadLunasDocument) {
    showToast('Belum Tersedia', 'Bukti Lunas tersedia setelah pelunasan 100% diverifikasi Admin.', 'warning');
    return;
  }
  const html = `<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Bukti Lunas ${escHtml(project.id)}</title></head>
<body style="font-family:sans-serif;max-width:700px;margin:40px auto;color:#111">
<h1>Bukti Lunas / Kuitansi</h1><p>PrangArt Lab — Music Production Studio</p>
<table border="1" cellpadding="8" style="border-collapse:collapse;width:100%">
<tr><td>No. Proyek</td><td>${escHtml(project.id)}</td></tr>
<tr><td>Klien</td><td>${escHtml(project.clientName)}</td></tr>
<tr><td>Judul</td><td>${escHtml(project.judul)}</td></tr>
<tr><td>Paket</td><td>${escHtml(project.packageName)}</td></tr>
<tr><td>Total</td><td>${formatRupiah(project.totalPrice)}</td></tr>
<tr><td>Status</td><td><strong>LUNAS</strong></td></tr>
</table>
<p style="margin-top:30px;font-size:12px">Dokumen ini diterbitkan setelah pelunasan diverifikasi Admin.</p>
</body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `bukti-lunas-${sanitizeDocId(project.id)}.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ================= DASHBOARD ADMIN ================= */

function findProjectById(id) {
  return (appState.projects || []).find((p) => p.id === id);
}

function renderAdminProjectRow(p) {
  const access = getProjectPaymentAccess(p);
  const stage = access.isFullyPaid ? 'Lunas 100%' : access.isDpVerified ? 'DP 50% terverifikasi' : 'Menunggu DP 50%';
  const milestoneOptions = TRACKER_MILESTONES
    .map((m) => `<option value="${escHtml(m)}" ${m === p.productionStatus ? 'selected' : ''}>${escHtml(m)}</option>`)
    .join('');
  return `
    <div class="bg-surface border border-border/80 rounded-2xl p-5 space-y-3">
      <div class="flex flex-wrap justify-between gap-2">
        <div>
          <strong class="text-textMain">${escHtml(p.judul)}</strong>
          <p class="text-xs text-textMuted">${escHtml(p.clientName)} • ${escHtml(p.contactEmail || '')} • ${escHtml(p.clientWa || '')}</p>
          <p class="text-xs text-textMuted">${escHtml(p.packageName || '')} • Total ${formatRupiah(p.totalPrice)} • DP ${formatRupiah(p.dpAmount)}</p>
        </div>
        <span class="text-xs font-mono font-bold text-primary self-start">${stage}</span>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" onclick="adminVerifyDp('${p.id}')" class="px-3 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold">Verifikasi DP 50%</button>
        <button type="button" onclick="adminVerifyLunas('${p.id}')" class="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">Verifikasi Lunas 100%</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <select onchange="adminSetProgress('${p.id}', this.value)" class="bg-panel border border-border rounded-xl px-3 py-2 text-xs">${milestoneOptions}</select>
        <div class="flex gap-2">
          <input id="master-${p.id}" value="${escHtml(p.masterFileUrl || '')}" placeholder="Link Master File (Google Drive)" class="flex-1 bg-panel border border-border rounded-xl px-3 py-2 text-xs" />
          <button type="button" onclick="adminSaveMaster('${p.id}')" class="px-3 py-2 rounded-xl border border-border bg-panel text-xs font-bold">Simpan Link</button>
        </div>
      </div>
    </div>`;
}

function renderAdminDashboard() {
  const box = document.getElementById('admin-workspace-content');
  if (!box || !isAdminSessionActive()) return;
  const projects = appState.projects || [];
  box.innerHTML = `
    <div class="bg-surface border border-border rounded-3xl p-6 sm:p-8 mb-6 flex flex-wrap justify-between items-center gap-3">
      <div>
        <span class="text-xs font-mono text-primary font-bold uppercase">Admin</span>
        <h2 class="text-2xl font-bold">Dashboard PrangArt Lab</h2>
        <p class="text-sm text-textMuted">${projects.length} proyek tercatat.</p>
      </div>
      <button type="button" onclick="performUniversalLogout('admin')" class="px-4 py-2 rounded-xl border border-border bg-panel text-xs font-bold">Keluar Admin</button>
    </div>
    <section class="space-y-4 mb-10">
      <h3 class="font-bold text-lg">Proyek & Pembayaran</h3>
      ${projects.length ? projects.map((p) => renderAdminProjectRow(p)).join('') : '<p class="text-sm text-textMuted">Belum ada proyek masuk.</p>'}
    </section>
    <section class="bg-surface border border-border rounded-3xl p-6 sm:p-8 mb-10">
      <h3 class="font-bold text-lg mb-4">Konten Beranda & Portofolio</h3>
      <div id="site-content-admin-inner"></div>
    </section>
    <section class="bg-surface border border-border rounded-3xl p-6 sm:p-8">
      <div id="admin-catalog-editor"></div>
    </section>`;
  if (typeof renderSiteContentAdmin === 'function') renderSiteContentAdmin();
  if (typeof renderAdminCatalogEditor === 'function') renderAdminCatalogEditor();
}

async function patchProject(id, patch) {
  const list = appState.projects || [];
  const idx = list.findIndex((p) => p.id === id);
  if (idx < 0) { showToast('Tidak Ditemukan', 'Proyek tidak ada di daftar.', 'error'); return; }
  list[idx] = { ...list[idx], ...patch };
  saveLocalProjectsBackup();
  await syncProjectToCloud(list[idx]);
  showToast('Tersimpan', 'Perubahan proyek disimpan (cadangan lokal + cloud bila tersedia).');
  renderAdminDashboard();
}

async function adminVerifyDp(id) {
  const p = findProjectById(id); if (!p) return;
  if (!confirm(`Verifikasi DP 50% untuk "${p.judul}"?`)) return;
  await patchProject(id, { paymentStage: 'DP_TERVERIFIKASI', dpStatus: 'DP 50% Terverifikasi', productionStatus: TRACKER_MILESTONES[2] });
}

async function adminVerifyLunas(id) {
  const p = findProjectById(id); if (!p) return;
  if (!confirm(`Verifikasi pelunasan 100% untuk "${p.judul}"? Bukti Lunas dan Master File akan terbuka untuk klien.`)) return;
  await patchProject(id, {
    paymentStage: 'LUNAS',
    dpStatus: 'Lunas 100%',
    finalPaymentStatus: 'Lunas',
    productionStatus: TRACKER_MILESTONES[6],
    canDownloadReceipt: true,
    canDownloadMaster: true
  });
}

async function adminSetProgress(id, milestone) {
  if (!findProjectById(id)) return;
  await patchProject(id, { productionStatus: milestone });
}

async function adminSaveMaster(id) {
  const input = document.getElementById(`master-${id}`);
  const url = (input?.value || '').trim();
  if (url && !/^https?:\/\//i.test(url)) {
    showToast('Tautan Tidak Valid', 'Gunakan tautan yang diawali https://', 'warning');
    return;
  }
  await patchProject(id, { masterFileUrl: url });
}

function refreshAdminDashboard() {
  if (isAdminSessionActive()) renderAdminDashboard();
}

function resetAdminPin() {
  showToast('Ganti PIN Admin', 'PIN diatur di js/00-config.js pada konstanta ADMIN_PIN. Ubah nilainya lalu unggah ulang file tersebut.', 'warning');
}

/* ================= PORTOFOLIO & BERANDA ================= */

function renderPortfolioPage() {
  const source = typeof editableSiteContent !== 'undefined' ? editableSiteContent.portfolio : [];
  appState.portfolioItems = (source || []).map((item) => ({
    title: item.title,
    category: item.category,
    culture: item.category,
    desc: item.description
  }));
  if (!appState.portfolioFilter) appState.portfolioFilter = 'Semua';
  renderPortfolioGrid();
  const grid = document.getElementById('portfolio-grid');
  if (grid && !appState.portfolioItems.length) {
    grid.innerHTML = '<p class="text-sm text-textMuted">Portofolio akan tampil di sini setelah ditambahkan melalui panel admin.</p>';
  }
}

function renderHomePortfolioPreview() {
  if (typeof renderEditableHomeContent === 'function') renderEditableHomeContent();
}

/* ================= ALIAS KOMPATIBILITAS ================= */

function renderClientWorkspace() { renderClientPortal(); }
function refreshClientDashboard() { renderClientPortal(); }
function renderAdminWorkspace() { renderAdminDashboard(); }
function updateHeaderAuthUI() { if (typeof renderHeaderAuth === 'function') renderHeaderAuth(); }

Object.assign(window, {
  renderClientPortal,
  renderClientWorkspace,
  refreshClientDashboard,
  renderClientProjectCard,
  downloadOfficialReceipt,
  renderAdminDashboard,
  refreshAdminDashboard,
  renderAdminWorkspace,
  resetAdminPin,
  adminVerifyDp,
  adminVerifyLunas,
  adminSetProgress,
  adminSaveMaster,
  renderPortfolioPage,
  renderHomePortfolioPreview,
  updateHeaderAuthUI
});
