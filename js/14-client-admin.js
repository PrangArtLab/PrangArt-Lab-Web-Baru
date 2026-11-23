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
    <div class="bg-surface border border-border/80 rounded-3xl p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <span class="text-xs font-mono text-primary font-bold uppercase">Ruang Klien</span>
        <h2 class="text-2xl font-display font-bold mt-1">Halo, ${escHtml(user.name)}</h2>
        <p class="text-sm text-textMuted mt-1">Pantau status proyek dan pembayaran Anda di sini.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" onclick="navigateTo('order')" class="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold">+ Ajukan Pesanan</button>
        <button type="button" onclick="document.getElementById('account-settings').scrollIntoView({behavior:'smooth'})" class="btn-outline px-5 py-2.5 rounded-xl text-xs font-bold">Pengaturan Akun</button>
      </div>
    </div>
    <div class="space-y-5">
      ${projects.length
        ? projects.map((p) => renderClientProjectCard(p)).join('')
        : '<div class="bg-surface border border-dashed border-border rounded-3xl p-10 text-center text-sm text-textMuted">Belum ada proyek. <button type="button" onclick="navigateTo(\'order\')" class="text-primary font-bold underline">Ajukan pesanan sekarang</button></div>'}
    </div>
    ${renderAccountSettingsCard(user)}`;
}

function renderAccountSettingsCard(user) {
  const inputCls = 'w-full bg-panel border border-border rounded-xl px-4 py-3 text-sm';
  return `
    <section id="account-settings" class="bg-surface border border-border/80 rounded-3xl p-6 sm:p-8 space-y-8">
      <div>
        <span class="text-xs font-mono text-primary font-bold uppercase">Akun</span>
        <h3 class="text-xl font-bold mt-1">Pengaturan Akun</h3>
      </div>
      <form id="form-account-profile" onsubmit="saveAccountProfile(event)" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold mb-2">Nama Lengkap</label>
          <input id="acc-name" required value="${escHtml(user.name)}" class="${inputCls}" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-2">No. WhatsApp</label>
          <input id="acc-wa" type="tel" value="${escHtml(user.wa || '')}" class="${inputCls}" />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-xs font-bold mb-2">Email (tidak dapat diubah)</label>
          <input value="${escHtml(user.email || '')}" disabled class="${inputCls} opacity-60" />
        </div>
        <div class="sm:col-span-2">
          <button type="submit" class="btn-primary px-6 py-3 rounded-xl text-sm font-bold">Simpan Profil</button>
        </div>
      </form>
      <div class="pt-6 border-t border-border/60">
        <h4 class="font-bold mb-4">Ganti Kata Sandi</h4>
        <form id="form-account-pass" onsubmit="changeAccountPassword(event)" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input id="acc-pass-old" type="password" required placeholder="Kata sandi lama" class="${inputCls}" />
          <input id="acc-pass-new" type="password" required minlength="6" placeholder="Kata sandi baru (min. 6)" class="${inputCls}" />
          <input id="acc-pass-confirm" type="password" required minlength="6" placeholder="Ulangi kata sandi baru" class="${inputCls}" />
          <div class="sm:col-span-3">
            <button type="submit" class="btn-primary px-6 py-3 rounded-xl text-sm font-bold">Ubah Kata Sandi</button>
          </div>
        </form>
      </div>
    </section>`;
}

async function saveAccountProfile(event) {
  event.preventDefault();
  const user = appState.currentClientUser;
  if (!user) return;
  const name = document.getElementById('acc-name').value.trim();
  const wa = document.getElementById('acc-wa').value.trim();
  if (!name) {
    showToast('Data Kurang', 'Nama wajib diisi.', 'warning');
    return;
  }
  const updated = { ...user, name, wa };
  appState.currentClientUser = updated;
  saveLocalAccount(updated);
  try { localStorage.setItem('prangart_active_client', JSON.stringify(updated)); } catch (_) {}

  const fbUser = window.firebaseAuth?.currentUser;
  if (fbUser && typeof window.updateProfile === 'function') {
    try { await window.updateProfile(fbUser, { displayName: name }); } catch (_) {}
  }
  renderHeaderAuth();
  renderClientPortal();
  showToast('Profil Tersimpan', 'Perubahan profil berhasil disimpan.');
}

async function changeAccountPassword(event) {
  event.preventDefault();
  const user = appState.currentClientUser;
  if (!user) return;
  const oldPass = document.getElementById('acc-pass-old').value;
  const newPass = document.getElementById('acc-pass-new').value;
  const confirmPass = document.getElementById('acc-pass-confirm').value;

  if (newPass.length < 6) {
    showToast('Kata Sandi Terlalu Pendek', 'Minimal 6 karakter.', 'warning');
    return;
  }
  if (newPass !== confirmPass) {
    showToast('Tidak Cocok', 'Konfirmasi kata sandi berbeda.', 'warning');
    return;
  }
  if (newPass === oldPass) {
    showToast('Kata Sandi Sama', 'Gunakan kata sandi yang berbeda dari sebelumnya.', 'warning');
    return;
  }

  const email = String(user.email || '').toLowerCase();
  const localAccount = getAllLocalAccounts()[email];
  const fbUser = window.firebaseAuth?.currentUser;

  try {
    if (fbUser && typeof window.updatePassword === 'function') {
      // Firebase mewajibkan verifikasi ulang kata sandi lama sebelum mengganti
      const cred = await window.signInWithEmailAndPassword(window.firebaseAuth, email, oldPass);
      await window.updatePassword(cred.user, newPass);
    } else {
      if (!localAccount || localAccount.password !== oldPass) {
        throw Object.assign(new Error('wrong password'), { code: 'local/wrong-password' });
      }
    }
    if (localAccount) saveLocalAccount({ ...localAccount, password: newPass });
    document.getElementById('form-account-pass')?.reset();
    showToast('Kata Sandi Diubah', 'Gunakan kata sandi baru saat masuk berikutnya.');
  } catch (err) {
    console.error('Ubah kata sandi gagal:', err);
    let msg = 'Gagal mengubah kata sandi. Coba lagi.';
    if (['auth/invalid-credential', 'auth/wrong-password', 'local/wrong-password'].includes(err?.code)) {
      msg = 'Kata sandi lama tidak sesuai.';
    } else if (err?.code === 'auth/requires-recent-login') {
      msg = 'Silakan keluar lalu masuk lagi, kemudian ulangi perubahan kata sandi.';
    } else if (err?.code === 'auth/weak-password') {
      msg = 'Kata sandi terlalu lemah (minimal 6 karakter).';
    }
    showToast('Gagal', msg, 'error');
  }
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
  updateHeaderAuthUI,
  saveAccountProfile,
  changeAccountPassword
});
