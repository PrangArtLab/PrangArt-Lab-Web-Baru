/* === BOOT: INISIALISASI SETELAH DOM SIAP (PRANGART LAB) === */
/* Fungsi global sudah di-expose oleh masing-masing file, jadi tidak perlu daftar Object.assign di sini. */

const SITE_CONTENT_KEY = 'prangart_public_site_content_v1';
let editableSiteContent = { portfolio: [], testimonials: [] };
try {
  const savedContent = JSON.parse(localStorage.getItem(SITE_CONTENT_KEY) || '{}');
  if (Array.isArray(savedContent.portfolio)) editableSiteContent.portfolio = savedContent.portfolio;
  if (Array.isArray(savedContent.testimonials)) editableSiteContent.testimonials = savedContent.testimonials;
} catch (_) {}

function escapeSiteText(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
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
      ? editableSiteContent.portfolio.map((item) => `<article class="portfolio-card">${item.image ? `<div class="portfolio-thumb" style="background-image:linear-gradient(135deg,rgba(17,24,39,.12),rgba(17,24,39,.18)),url('${escapeSiteText(item.image)}')"></div>` : '<div class="portfolio-thumb thumb-one"></div>'}<div class="portfolio-body"><span class="mini-label">${escapeSiteText(item.category)}</span><h3>${escapeSiteText(item.title)}</h3><p>${escapeSiteText(item.description)}</p></div></article>`).join('')
      : '<p class="site-content-empty">Portofolio akan tampil di sini setelah ditambahkan melalui panel admin.</p>';
  }

  if (testimonialGrid) {
    testimonialGrid.innerHTML = editableSiteContent.testimonials.length
      ? editableSiteContent.testimonials.map((item) => `<article class="testimonial-card"><p>“${escapeSiteText(item.quote)}”</p><div class="testimonial-meta"><strong>${escapeSiteText(item.name)}</strong><span>${escapeSiteText(item.role)}</span></div></article>`).join('')
      : '<p class="site-content-empty">Testimoni akan tampil di sini setelah ditambahkan melalui panel admin.</p>';
  }
}

function renderSiteContentAdmin() {
  const container = document.getElementById('site-content-admin-inner');
  if (!container) return;

  container.innerHTML = `
    <div class="grid lg:grid-cols-2 gap-8">
      <form id="site-portfolio-form" class="space-y-3"><h3 class="font-bold text-lg">Tambah portofolio</h3>
        <input name="title" required maxlength="100" placeholder="Judul karya" class="w-full bg-panel border border-border rounded-xl p-3" />
        <input name="category" required maxlength="60" placeholder="Kategori, mis. Musik Tari" class="w-full bg-panel border border-border rounded-xl p-3" />
        <input name="image" type="url" placeholder="URL gambar (opsional)" class="w-full bg-panel border border-border rounded-xl p-3" />
        <textarea name="description" required maxlength="300" placeholder="Deskripsi singkat" class="w-full bg-panel border border-border rounded-xl p-3"></textarea>
        <button class="btn-primary rounded-xl font-bold py-3 px-4">Simpan portofolio</button><div class="site-admin-list mt-4" id="site-portfolio-list"></div>
      </form>
      <form id="site-testimonial-form" class="space-y-3"><h3 class="font-bold text-lg">Tambah testimoni</h3>
        <input name="name" required maxlength="80" placeholder="Nama klien" class="w-full bg-panel border border-border rounded-xl p-3" />
        <input name="role" required maxlength="80" placeholder="Peran / organisasi" class="w-full bg-panel border border-border rounded-xl p-3" />
        <textarea name="quote" required maxlength="400" placeholder="Isi testimoni" class="w-full bg-panel border border-border rounded-xl p-3"></textarea>
        <button class="btn-primary rounded-xl font-bold py-3 px-4">Simpan testimoni</button><div class="site-admin-list mt-4" id="site-testimonial-list"></div>
      </form>
    </div>
  `;

  container.querySelector('#site-portfolio-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    editableSiteContent.portfolio.push({
      title: form.elements.title.value.trim(),
      category: form.elements.category.value.trim(),
      image: form.elements.image.value.trim(),
      description: form.elements.description.value.trim()
    });
    persistEditableSiteContent();
    form.reset();
    renderEditableHomeContent();
    adminActiveTab = 'content';
    renderAdminDashboard();
  });

  container.querySelector('#site-testimonial-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    editableSiteContent.testimonials.push({
      name: form.elements.name.value.trim(),
      role: form.elements.role.value.trim(),
      quote: form.elements.quote.value.trim()
    });
    persistEditableSiteContent();
    form.reset();
    renderEditableHomeContent();
    adminActiveTab = 'content';
    renderAdminDashboard();
  });

  renderSiteContentLists();
}

function renderSiteContentLists() {
  const portfolioList = document.getElementById('site-portfolio-list');
  const testimonialList = document.getElementById('site-testimonial-list');
  if (portfolioList) {
    portfolioList.innerHTML = editableSiteContent.portfolio
      .map((item, index) => `<div class="site-admin-row"><span>${escapeSiteText(item.title)}</span><button type="button" onclick="removeSiteContent('portfolio',${index})" class="text-red-500 font-bold ml-2">Hapus</button></div>`)
      .join('') || '<p class="text-sm text-textMuted">Belum ada portofolio.</p>';
  }
  if (testimonialList) {
    testimonialList.innerHTML = editableSiteContent.testimonials
      .map((item, index) => `<div class="site-admin-row"><span>${escapeSiteText(item.name)} — ${escapeSiteText(item.role)}</span><button type="button" onclick="removeSiteContent('testimonials',${index})" class="text-red-500 font-bold ml-2">Hapus</button></div>`)
      .join('') || '<p class="text-sm text-textMuted">Belum ada testimoni.</p>';
  }
}

function removeSiteContent(type, index) {
  if (!['portfolio', 'testimonials'].includes(type)) return;
  editableSiteContent[type].splice(index, 1);
  persistEditableSiteContent();
  renderEditableHomeContent();
  adminActiveTab = 'content';
  renderAdminDashboard();
}

Object.assign(window, { renderSiteContentAdmin, removeSiteContent, renderEditableHomeContent });

function addHomeLandingSections() {
  const home = document.getElementById('page-home');
  if (!home || home.querySelector('.home-services')) return;
  const section = document.createElement('section');
  section.className = 'home-services';
  section.innerHTML = `<div class="home-section-wrap">
    <header class="home-section-heading"><span class="home-kicker">Layanan utama</span><h2>Musik yang menyatu dengan cerita dan visi Anda.</h2></header>
    <div class="home-service-grid">
      <article class="home-service-card"><span class="service-tag">01 / Musik Tari</span><h3>Komposisi untuk pertunjukan</h3><p>Musik yang mengikuti karakter gerak, tempo, suasana, dan kebutuhan panggung.</p></article>
      <article class="home-service-card"><span class="service-tag">02 / Aransemen</span><h3>Musik untuk karya digital</h3><p>Aransemen untuk video, konten, dan brand yang memperkuat identitas karya.</p></article>
      <article class="home-service-card"><span class="service-tag">03 / Transkripsi</span><h3>Audio menjadi notasi terstruktur</h3><p>Dokumentasikan ide musikal untuk evaluasi atau produksi.</p></article>
    </div></div>`;
  home.appendChild(section);
}

function applyNonTraditionalCopyAndStyle() {
  if (document.getElementById('prangart-extra-style')) return;
  const style = document.createElement('style');
  style.id = 'prangart-extra-style';
  style.textContent = `
    .home-service-card::before{background:linear-gradient(90deg,rgb(var(--primary)),rgb(var(--accent)))}
    .card-tari,.card-digital,.card-transkripsi{background:linear-gradient(180deg,rgba(var(--primary),.035),rgba(var(--surface),.94))}
    .service-tag,.mini-label{color:rgb(var(--primary));border-color:rgba(var(--border),.8)}
  `;
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderFaqAccordion();
  renderPortfolioGrid();
  addHomeLandingSections();
  renderEditableHomeContent();
  applyNonTraditionalCopyAndStyle();
  setSynopsisMode('manual');
});
