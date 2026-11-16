Object.assign(window, {
  appState, initFirebaseSync, showToast, formatRupiah,
  initTheme, setTheme, toggleThemeDropdown, navigateTo, updateHeaderAuthBadge,
  selectServiceAndGoOrder, renderSop14Grid, openProducerWaModal, closeProducerWaModal,
  submitProducerWaMessage, updateWaComposerPreview, openClientAuthModal, closeClientAuthModal,
  handleQuickClientRegister, handleClientPortalLogin, handleGoogleLogin, handleForgotPassword,
  logoutClientUser, refreshOrderPageUI, setSynopsisMode, selectServiceLine, selectPackageTier,
  handleCustomPrice, recalculateLivePrice, generateAISynopsis, handleOrderFormSubmit,
  renderPortfolioGrid, filterPortfolio, renderFaqAccordion, refreshClientPageUI, renderClientWorkspace,
  updateProfile, updatePass, verifyAdminPin, refreshAdminPageUI, renderAdminDashboard, syncProjectToCloud,
  closeCustomModal, openContractDocModal, closeContractDocModal, openOfficialDocModal, closeOfficialDocModal
});

const SITE_CONTENT_KEY = 'prangart_public_site_content_v1';
let editableSiteContent = { portfolio: [], testimonials: [] };
try {
  const savedContent = JSON.parse(localStorage.getItem(SITE_CONTENT_KEY) || '{}');
  if (Array.isArray(savedContent.portfolio)) editableSiteContent.portfolio = savedContent.portfolio;
  if (Array.isArray(savedContent.testimonials)) editableSiteContent.testimonials = savedContent.testimonials;
} catch (_) {}

function escapeSiteText(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}
function persistEditableSiteContent() {
  localStorage.setItem(SITE_CONTENT_KEY, JSON.stringify(editableSiteContent));
}
function renderEditableHomeContent() {
  const portfolioGrid = document.querySelector('#page-home .portfolio-grid');
  const testimonialGrid = document.querySelector('#page-home .testimonial-grid');
  if (portfolioGrid) {
    portfolioGrid.innerHTML = editableSiteContent.portfolio.length
      ? editableSiteContent.portfolio.map(item => `<article class="portfolio-card">${item.image ? `<div class="portfolio-thumb" style="background-image:linear-gradient(135deg,rgba(17,24,39,.12),rgba(17,24,39,.18)),url('${escapeSiteText(item.image)}')"></div>` : ''}<div class="portfolio-body"><span class="mini-label">${escapeSiteText(item.category)}</span><h3>${escapeSiteText(item.title)}</h3><p>${escapeSiteText(item.description)}</p></div></article>`).join('')
      : '<p class="site-content-empty">Portofolio pilihan segera hadir.</p>';
  }
  if (testimonialGrid) {
    testimonialGrid.innerHTML = editableSiteContent.testimonials.length
      ? editableSiteContent.testimonials.map(item => `<article class="testimonial-card"><p>“${escapeSiteText(item.quote)}”</p><div class="testimonial-meta"><strong>${escapeSiteText(item.name)}</strong><span>${escapeSiteText(item.role)}</span></div></article>`).join('')
      : '<p class="site-content-empty">Testimoni klien akan ditampilkan di sini.</p>';
  }
}

function renderSiteContentAdmin() {
  const workspace = document.getElementById('admin-workspace-content');
  if (!workspace || document.getElementById('site-content-admin')) return;
  const editor = document.createElement('section');
  editor.id = 'site-content-admin';
  editor.className = 'mt-8 space-y-6';
  editor.innerHTML = `<div class="bg-surface border border-border rounded-3xl p-6 sm:p-8">
    <span class="home-kicker">Konten beranda</span><h2 class="text-2xl font-display font-bold mb-6">Kelola portofolio &amp; testimoni</h2>
    <div class="grid lg:grid-cols-2 gap-8">
      <form id="site-portfolio-form" class="space-y-3"><h3 class="font-bold text-lg">Tambah portofolio</h3>
        <input name="title" required maxlength="100" placeholder="Judul karya" class="w-full bg-panel border border-border rounded-xl p-3" />
        <input name="category" required maxlength="60" placeholder="Kategori, mis. Musik Tari" class="w-full bg-panel border border-border rounded-xl p-3" />
        <input name="image" type="url" placeholder="URL gambar (opsional)" class="w-full bg-panel border border-border rounded-xl p-3" />
        <textarea name="description" required maxlength="300" placeholder="Deskripsi singkat" class="w-full bg-panel border border-border rounded-xl p-3"></textarea>
        <button class="btn-primary rounded-xl font-bold">Simpan portofolio</button><div class="site-admin-list" id="site-portfolio-list"></div>
      </form>
      <form id="site-testimonial-form" class="space-y-3"><h3 class="font-bold text-lg">Tambah testimoni</h3>
        <input name="name" required maxlength="80" placeholder="Nama klien" class="w-full bg-panel border border-border rounded-xl p-3" />
        <input name="role" required maxlength="80" placeholder="Peran / organisasi" class="w-full bg-panel border border-border rounded-xl p-3" />
        <textarea name="quote" required maxlength="400" placeholder="Isi testimoni" class="w-full bg-panel border border-border rounded-xl p-3"></textarea>
        <button class="btn-primary rounded-xl font-bold">Simpan testimoni</button><div class="site-admin-list" id="site-testimonial-list"></div>
      </form>
    </div><p class="text-xs text-textMuted mt-6">Konten tersimpan di browser ini saja, belum tersinkron ke perangkat pengunjung lain.</p>
  </div>`;
  workspace.appendChild(editor);
  editor.querySelector('#site-portfolio-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    editableSiteContent.portfolio.push({ title: form.elements.title.value.trim(), category: form.elements.category.value.trim(), image: form.elements.image.value.trim(), description: form.elements.description.value.trim() });
    persistEditableSiteContent(); form.reset(); renderEditableHomeContent(); editor.remove(); renderSiteContentAdmin();
  });
  editor.querySelector('#site-testimonial-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    editableSiteContent.testimonials.push({ name: form.elements.name.value.trim(), role: form.elements.role.value.trim(), quote: form.elements.quote.value.trim() });
    persistEditableSiteContent(); form.reset(); renderEditableHomeContent(); editor.remove(); renderSiteContentAdmin();
  });
  renderSiteContentLists();
}
function renderSiteContentLists() {
  const portfolioList = document.getElementById('site-portfolio-list');
  const testimonialList = document.getElementById('site-testimonial-list');
  if (portfolioList) portfolioList.innerHTML = editableSiteContent.portfolio.map((item, index) => `<div class="site-admin-row"><span>${escapeSiteText(item.title)}</span><button type="button" onclick="removeSiteContent('portfolio',${index})">Hapus</button></div>`).join('') || '<p class="text-sm text-textMuted">Belum ada portofolio.</p>';
  if (testimonialList) testimonialList.innerHTML = editableSiteContent.testimonials.map((item, index) => `<div class="site-admin-row"><span>${escapeSiteText(item.name)} — ${escapeSiteText(item.role)}</span><button type="button" onclick="removeSiteContent('testimonials',${index})">Hapus</button></div>`).join('') || '<p class="text-sm text-textMuted">Belum ada testimoni.</p>';
}
function removeSiteContent(type, index) {
  if (!['portfolio', 'testimonials'].includes(type)) return;
  editableSiteContent[type].splice(index, 1);
  persistEditableSiteContent(); renderEditableHomeContent();
  document.getElementById('site-content-admin')?.remove(); renderSiteContentAdmin();
}
const originalRenderAdminDashboard = renderAdminDashboard;
renderAdminDashboard = function() { originalRenderAdminDashboard(); renderSiteContentAdmin(); };
Object.assign(window, { renderAdminDashboard, removeSiteContent });

function addHomeLandingSections() {
  const home = document.getElementById('page-home');
  if (!home || home.querySelector('.home-services')) return;
  const styles = document.createElement('style');
  styles.textContent = `
    .home-services{padding:72px 24px 84px;background:linear-gradient(180deg,rgb(var(--base)),rgba(var(--primary),.035))}
    .home-services-inner{max-width:1160px;margin:0 auto}.home-services-heading{max-width:680px;margin-bottom:32px}
    .home-services-kicker{display:inline-block;margin-bottom:12px;color:rgb(var(--primary));font:700 11px/1.3 'JetBrains Mono',monospace;letter-spacing:.16em;text-transform:uppercase}
    .home-services-heading h2{margin:0;color:rgb(var(--text-main));font:700 clamp(30px,4vw,48px)/1.08 'Space Grotesk',sans-serif;letter-spacing:-.045em}
    .home-services-heading p{max-width:580px;margin:14px 0 0;color:rgb(var(--text-muted));line-height:1.75}
    .home-services-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
    .home-service-card{min-height:225px;padding:26px;border:1px solid rgba(var(--border),.85);border-radius:24px;background:linear-gradient(145deg,rgba(var(--surface),.98),rgba(var(--panel),.72));box-shadow:0 20px 50px -38px rgba(15,23,42,.35);transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}
    .home-service-card:hover{transform:translateY(-5px);border-color:rgba(var(--primary),.38);box-shadow:0 26px 52px -34px rgba(var(--primary),.4)}
    .home-service-card span{color:rgb(var(--primary));font:700 10px/1.4 'JetBrains Mono',monospace;letter-spacing:.14em;text-transform:uppercase}
    .home-service-card h3{margin:18px 0 10px;color:rgb(var(--text-main));font:700 22px/1.2 'Space Grotesk',sans-serif;letter-spacing:-.035em}
    .home-service-card p,.site-content-empty{margin:0;color:rgb(var(--text-muted));font-size:14px;line-height:1.75}
    .site-admin-list{display:grid;gap:8px;margin-top:14px}.site-admin-row{display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid rgba(var(--border),.8);border-radius:12px;padding:10px 12px;font-size:13px}.site-admin-row button{color:#dc2626;font-weight:700}
    @media(max-width:760px){.home-services{padding:54px 20px 62px}.home-services-grid{grid-template-columns:1fr}.home-service-card{min-height:0}}
  `;
  document.head.appendChild(styles);
  const section = document.createElement('section');
  section.className = 'home-services';
  section.innerHTML = `<div class="home-services-inner">
    <header class="home-services-heading"><span class="home-services-kicker">Layanan utama</span><h2>Musik yang menyatu dengan cerita dan visi Anda.</h2><p>Dari komposisi pertunjukan hingga transkripsi, setiap karya dirancang sesuai kebutuhan.</p></header>
    <div class="home-services-grid">
      <article class="home-service-card"><span>01 / Musik Tari</span><h3>Komposisi untuk pertunjukan</h3><p>Musik yang mengikuti karakter gerak, tempo, suasana, dan kebutuhan panggung.</p></article>
      <article class="home-service-card"><span>02 / Aransemen</span><h3>Musik untuk karya digital</h3><p>Aransemen untuk video, konten, dan brand yang memperkuat identitas karya.</p></article>
      <article class="home-service-card"><span>03 / Transkripsi</span><h3>Audio menjadi notasi terstruktur</h3><p>Dokumentasikan ide musikal untuk evaluasi atau produksi.</p></article>
    </div></div>`;
  home.appendChild(section);
}

function applyNonTraditionalCopyAndStyle() {
  const style = document.createElement('style');
  style.textContent = `
    .home-hero{background:radial-gradient(ellipse at 50% 35%,rgba(var(--primary),.13),transparent 40%),radial-gradient(ellipse at 12% 20%,rgba(var(--accent),.10),transparent 30%),linear-gradient(145deg,rgb(var(--surface)),rgb(var(--base)) 78%)}
    .home-hero::before{content:none!important}.home-hero::after{content:none!important}.home-hero .home-hero-actions::after{content:none!important}
    .home-service-card::before{background:linear-gradient(90deg,rgb(var(--primary)),rgb(var(--accent)))}
    .card-tari,.card-digital,.card-transkripsi{background:linear-gradient(180deg,rgba(var(--primary),.035),rgba(var(--surface),.94))}
    .service-tag,.mini-label{color:rgb(var(--primary));border-color:rgba(var(--border),.8)}
  `;
  document.head.appendChild(style);
  document.querySelectorAll('#page-home .card-tari h3').forEach(heading => { heading.textContent = 'Komposisi untuk pertunjukan'; });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateHeaderAuthBadge();
  renderSop14Grid();
  renderFaqAccordion();
  renderPortfolioGrid();
  addHomeLandingSections();
  renderEditableHomeContent();
  applyNonTraditionalCopyAndStyle();
  navigateTo('home');
  setSynopsisMode('manual');
  initFirebaseSync();
});
