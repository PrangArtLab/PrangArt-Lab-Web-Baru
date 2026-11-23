/* === DASHBOARD ADMIN & KELOLA KATALOG LAYANAN (PRANGART LAB) === */

function renderAdminCatalogEditor() {
  const container = document.getElementById('admin-catalog-editor');
  if (!container) return;

  container.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
      <div>
        <h3 class="text-base font-bold text-textMain">Pengaturan Tarif, Fasilitas &amp; Sistematika Layanan</h3>
        <p class="text-xs text-textMuted">Perubahan yang disimpan di sini otomatis memperbarui kalkulator dan rincian paket pada halaman Pemesanan Klien.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <button type="button" onclick="resetServiceCatalogToDefault()" class="px-4 py-2 rounded-xl border border-border bg-panel text-xs font-bold text-textMuted hover:text-textMain transition">
          ↺ Reset ke Tarif &amp; Deskripsi Standar
        </button>
        <button type="button" onclick="saveAdminCatalogChanges()" class="btn-primary px-5 py-2 rounded-xl text-xs font-bold">
          💾 Simpan Semua Perubahan Katalog
        </button>
      </div>
    </div>

    <div class="space-y-8">
      ${Object.entries(appState.serviceCatalog).map(([svcKey, svc]) => `
        <div class="p-5 sm:p-6 rounded-2xl bg-panel border border-border space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
            <span class="text-sm font-bold text-primary uppercase font-mono">${svc.label} (${svcKey})</span>
            <div class="flex items-center gap-2">
              <label class="text-xs text-textMuted">Add-on Vokal/Player (Rp):</label>
              <input type="number" id="cat-addon-${svcKey}" value="${Number(svc.addonPrice || 250000)}" class="w-32 bg-surface border border-border rounded-lg px-3 py-1.5 text-xs font-mono" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold mb-1.5">Deskripsi Umum Layanan</label>
            <textarea id="cat-overview-${svcKey}" rows="2" class="w-full bg-surface border border-border rounded-xl px-3.5 py-2 text-xs">${svc.overview || ''}</textarea>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            ${Object.entries(svc.packages).map(([pkgKey, pkg]) => {
              const isCustom = pkgKey === 'custom' || Boolean(pkg.isCustom);
              const featuresText = Array.isArray(pkg.features) ? pkg.features.join('\n') : (pkg.desc || '');
              return `
                <div class="p-4 rounded-xl bg-surface border ${isCustom ? 'border-primary/40' : 'border-border/80'} space-y-3">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-bold text-textMain">${pkg.label}</span>
                    ${isCustom ? `<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/15 text-primary font-bold">Custom (Tanpa Patokan)</span>` : ''}
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label class="block text-[11px] font-semibold text-textMuted mb-1">Label Paket</label>
                      <input type="text" id="cat-pkg-label-${svcKey}-${pkgKey}" value="${pkg.label || ''}" class="w-full bg-panel border border-border rounded-lg px-3 py-1.5 text-xs" />
                    </div>
                    <div>
                      <label class="block text-[11px] font-semibold text-textMuted mb-1">${isCustom ? 'Tarif Dasar (0 = Sesuai Kesepakatan)' : 'Harga Paket (Rp)'}</label>
                      <input type="number" id="cat-pkg-price-${svcKey}-${pkgKey}" value="${Number(pkg.price || 0)}" ${isCustom ? 'readonly' : ''} class="w-full bg-panel border border-border rounded-lg px-3 py-1.5 text-xs font-mono ${isCustom ? 'opacity-60' : ''}" />
                    </div>
                  </div>

                  <div>
                    <label class="block text-[11px] font-semibold text-textMuted mb-1">Badge Singkat</label>
                    <input type="text" id="cat-pkg-badge-${svcKey}-${pkgKey}" value="${pkg.badge || ''}" class="w-full bg-panel border border-border rounded-lg px-3 py-1.5 text-xs" />
                  </div>

                  <div>
                    <label class="block text-[11px] font-semibold text-textMuted mb-1">Ringkasan Paket</label>
                    <textarea id="cat-pkg-summary-${svcKey}-${pkgKey}" rows="2" class="w-full bg-panel border border-border rounded-lg px-3 py-1.5 text-xs">${pkg.summary || pkg.desc || ''}</textarea>
                  </div>

                  <div>
                    <label class="block text-[11px] font-semibold text-textMuted mb-1">Daftar Fasilitas &amp; Kualifikasi (1 poin per baris)</label>
                    <textarea id="cat-pkg-features-${svcKey}-${pkgKey}" rows="4" class="w-full bg-panel border border-border rounded-lg px-3 py-1.5 text-xs leading-relaxed">${featuresText}</textarea>
                  </div>

                  <div>
                    <label class="block text-[11px] font-semibold text-textMuted mb-1">Sistematika &amp; Alur Pengerjaan</label>
                    <textarea id="cat-pkg-workflow-${svcKey}-${pkgKey}" rows="2" class="w-full bg-panel border border-border rounded-lg px-3 py-1.5 text-xs">${pkg.workflow || ''}</textarea>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

async function saveAdminCatalogChanges() {
  Object.entries(appState.serviceCatalog).forEach(([svcKey, svc]) => {
    const addonInp = document.getElementById(`cat-addon-${svcKey}`);
    const overInp = document.getElementById(`cat-overview-${svcKey}`);
    if (addonInp) svc.addonPrice = Number(addonInp.value || 250000);
    if (overInp) svc.overview = overInp.value.trim();

    Object.entries(svc.packages).forEach(([pkgKey, pkg]) => {
      const isCustom = pkgKey === 'custom' || Boolean(pkg.isCustom);
      const lblInp = document.getElementById(`cat-pkg-label-${svcKey}-${pkgKey}`);
      const prcInp = document.getElementById(`cat-pkg-price-${svcKey}-${pkgKey}`);
      const bdgInp = document.getElementById(`cat-pkg-badge-${svcKey}-${pkgKey}`);
      const sumInp = document.getElementById(`cat-pkg-summary-${svcKey}-${pkgKey}`);
      const feaInp = document.getElementById(`cat-pkg-features-${svcKey}-${pkgKey}`);
      const wrkInp = document.getElementById(`cat-pkg-workflow-${svcKey}-${pkgKey}`);

      if (lblInp && lblInp.value.trim()) pkg.label = lblInp.value.trim();
      if (!isCustom && prcInp) pkg.price = Number(prcInp.value || 0);
      if (bdgInp) pkg.badge = bdgInp.value.trim();
      if (sumInp) pkg.summary = sumInp.value.trim();
      if (feaInp) {
        pkg.features = feaInp.value
          .split('\n')
          .map(line => line.trim())
          .filter(Boolean);
      }
      if (wrkInp) pkg.workflow = wrkInp.value.trim();
    });
  });

  try {
    localStorage.setItem('prangart_service_catalog_v2', JSON.stringify(appState.serviceCatalog));
    if (typeof syncCatalogToCloud === 'function') {
      await syncCatalogToCloud(appState.serviceCatalog);
    }
  } catch (err) {
    console.error(err);
  }

  if (typeof refreshOrderPageUI === 'function') refreshOrderPageUI();
  if (typeof showToast === 'function') {
    showToast('Tersimpan', 'Tarif, fasilitas, dan sistematika katalog layanan berhasil diperbarui.');
  }
}

async function resetServiceCatalogToDefault() {
  appState.serviceCatalog = JSON.parse(JSON.stringify(DEFAULT_SERVICE_CATALOG));
  try {
    localStorage.setItem('prangart_service_catalog_v2', JSON.stringify(appState.serviceCatalog));
    if (typeof syncCatalogToCloud === 'function') {
      await syncCatalogToCloud(appState.serviceCatalog);
    }
  } catch (err) {
    console.error(err);
  }
  renderAdminCatalogEditor();
  if (typeof refreshOrderPageUI === 'function') refreshOrderPageUI();
  if (typeof showToast === 'function') {
    showToast('Direset', 'Katalog dikembalikan ke tarif & rincian fasilitas standar.');
  }
}

Object.assign(window, {
  renderAdminCatalogEditor,
  saveAdminCatalogChanges,
  resetServiceCatalogToDefault
});
