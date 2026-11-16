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

function addHomeLandingSections() {
  const home = document.getElementById('page-home');
  if (!home || home.querySelector('.home-services')) return;

  const styles = document.createElement('style');
  styles.textContent = `
    .home-services { padding: 72px 24px 84px; background: linear-gradient(180deg, rgb(var(--base)), rgba(var(--primary), .035)); }
    .home-services-inner { max-width: 1160px; margin: 0 auto; }
    .home-services-heading { max-width: 680px; margin-bottom: 32px; }
    .home-services-kicker { display:inline-block; margin-bottom:12px; color:rgb(var(--primary)); font:700 11px/1.3 'JetBrains Mono',monospace; letter-spacing:.16em; text-transform:uppercase; }
    .home-services-heading h2 { margin:0; color:rgb(var(--text-main)); font:700 clamp(30px,4vw,48px)/1.08 'Space Grotesk',sans-serif; letter-spacing:-.045em; }
    .home-services-heading p { max-width:580px; margin:14px 0 0; color:rgb(var(--text-muted)); line-height:1.75; }
    .home-services-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; }
    .home-service-card { min-height:225px; padding:26px; border:1px solid rgba(var(--border),.85); border-radius:24px; background:linear-gradient(145deg,rgba(var(--surface),.98),rgba(var(--panel),.72)); box-shadow:0 20px 50px -38px rgba(15,23,42,.35); transition:transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
    .home-service-card:hover { transform:translateY(-5px); border-color:rgba(var(--primary),.38); box-shadow:0 26px 52px -34px rgba(var(--primary),.4); }
    .home-service-card span { color:rgb(var(--primary)); font:700 10px/1.4 'JetBrains Mono',monospace; letter-spacing:.14em; text-transform:uppercase; }
    .home-service-card h3 { margin:18px 0 10px; color:rgb(var(--text-main)); font:700 22px/1.2 'Space Grotesk',sans-serif; letter-spacing:-.035em; }
    .home-service-card p { margin:0; color:rgb(var(--text-muted)); font-size:14px; line-height:1.75; }
    @media(max-width:760px) { .home-services { padding:54px 20px 62px; } .home-services-grid { grid-template-columns:1fr; } .home-service-card { min-height:0; } }
  `;
  document.head.appendChild(styles);

  const section = document.createElement('section');
  section.className = 'home-services';
  section.innerHTML = `
    <div class="home-services-inner">
      <header class="home-services-heading">
        <span class="home-services-kicker">Layanan utama</span>
        <h2>Musik yang menyatu dengan cerita dan visi Anda.</h2>
        <p>Dari komposisi pertunjukan hingga transkripsi, setiap karya dirancang dengan proses yang terarah dan sesuai kebutuhan.</p>
      </header>
      <div class="home-services-grid">
        <article class="home-service-card"><span>01 / Musik Tari</span><h3>Komposisi untuk pertunjukan</h3><p>Musik yang dibangun mengikuti karakter gerak, tempo, suasana, dan kebutuhan panggung.</p></article>
        <article class="home-service-card"><span>02 / Aransemen</span><h3>Musik untuk karya digital</h3><p>Aransemen untuk video, konten, dan brand yang memperkuat emosi serta identitas karya.</p></article>
        <article class="home-service-card"><span>03 / Transkripsi</span><h3>Audio menjadi notasi terstruktur</h3><p>Dokumentasikan ide musikal dalam bentuk yang lebih jelas untuk evaluasi atau produksi.</p></article>
      </div>
    </div>`;
  home.appendChild(section);
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme(); 
  updateHeaderAuthBadge(); 
  renderSop14Grid(); 
  renderFaqAccordion(); 
  renderPortfolioGrid();
  addHomeLandingSections();
  
  // Saat aplikasi dibuka atau dimuat ulang, selalu tampilkan beranda.
  navigateTo('home');
  
  // Set mode AI default ke manual
  setSynopsisMode('manual');
  
  initFirebaseSync();
});
