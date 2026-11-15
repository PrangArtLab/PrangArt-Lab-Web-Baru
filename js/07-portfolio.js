function filterPortfolio(cat) {
  appState.portfolioFilter = cat;
  document.querySelectorAll('.pf-filter-btn').forEach(btn => {
    if (btn.textContent.trim() === cat) {
      btn.className = 'pf-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gold text-obsidian';
    } else {
      btn.className = 'pf-filter-btn px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-charcoal text-ash border border-borderline';
    }
  });
  renderPortfolioGrid();
}

function renderPortfolioGrid() {
  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;
  const list = appState.portfolioFilter === 'Semua'
    ? appState.portfolioItems
    : appState.portfolioItems.filter(i => i.category === appState.portfolioFilter);

  grid.innerHTML = list.map(item => `
    <div class="bg-charcoal border border-borderline hover:border-gold/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition">
      <div class="space-y-2">
        <div class="flex items-center justify-between text-[11px] font-mono">
          <span class="text-gold font-bold">${item.category}</span>
          <span class="text-ash">${item.duration}</span>
        </div>
        <h3 class="text-base font-bold text-ivory">${item.title}</h3>
        <span class="text-[11px] text-emerald-400 block">${item.culture}</span>
        <p class="text-xs text-ash leading-relaxed">${item.desc}</p>
      </div>
      <div class="flex items-center gap-2 pt-2 border-t border-borderline">
        <button type="button" onclick="playSampleTone(${item.freq || 220}, '${item.title.replace(/'/g, "\\'")}')" class="btn-ghost-gold flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>Sampel Audio</span>
        </button>
        <button type="button" onclick="openProducerWaModal('Saya tertarik diskusi karya serupa: ${item.title.replace(/'/g, "\\'")}', '${item.category}')" class="btn-gold px-3.5 py-2 rounded-xl text-xs font-bold">Diskusi</button>
      </div>
    </div>
  `).join('');
}

function playSampleTone(baseFreq, title) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 1.875];
    notes.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, ctx.currentTime + idx * 0.25);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.25 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.25);
      osc.stop(ctx.currentTime + idx * 0.25 + 0.65);
    });
    showToast('Memutar Sampel', `Cuplikan melodi: ${title}`);
  } catch (_) {}
}

function renderFaqAccordion() {
  const list = document.getElementById('faq-accordion-list');
  if (!list) return;
  list.innerHTML = appState.faqs.map((f, idx) => `
    <div class="bg-charcoal border border-borderline rounded-xl overflow-hidden">
      <button type="button" onclick="toggleFaqItem(${idx})" class="w-full px-4 py-3.5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-ivory hover:text-gold transition">
        <span>${f.q}</span>
        <span id="faq-icon-${idx}" class="text-gold font-mono text-base">+</span>
      </button>
      <div id="faq-body-${idx}" class="hidden px-4 pb-4 text-xs text-ash leading-relaxed border-t border-borderline/60 pt-3">${f.a}</div>
    </div>
  `).join('');
}

function toggleFaqItem(idx) {
  const body = document.getElementById(`faq-body-${idx}`);
  const icon = document.getElementById(`faq-icon-${idx}`);
  if (!body) return;
  const isHidden = body.classList.contains('hidden');
  body.classList.toggle('hidden');
  if (icon) icon.textContent = isHidden ? '−' : '+';
}