function renderPortfolioGrid() {
  const grid = document.getElementById('portfolio-grid'); if(!grid) return;
  const list = appState.portfolioFilter === 'Semua' ? appState.portfolioItems : appState.portfolioItems.filter(i => i.category === appState.portfolioFilter);
  grid.innerHTML = list.map(item => `<div class="bg-surface border border-border rounded-2xl p-6"><h3 class="font-bold text-lg text-textMain">${item.title}</h3><p class="text-xs text-textMuted mt-1">${item.culture}</p><p class="text-sm mt-3">${item.desc}</p></div>`).join('');
}
function filterPortfolio(c) { appState.portfolioFilter = c; renderPortfolioGrid(); }
function renderFaqAccordion() { const el = document.getElementById('faq-accordion-list'); if(el) el.innerHTML = appState.faqs.map(f => `<div class="bg-surface border p-4 rounded-xl"><strong class="text-sm font-bold text-textMain">${f.q}</strong><p class="text-xs text-textMuted mt-2">${f.a}</p></div>`).join(''); }
