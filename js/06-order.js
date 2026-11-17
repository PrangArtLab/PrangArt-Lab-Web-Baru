function selectServiceLine(svcKey) {
  appState.selectedServiceLine = svcKey; 
  appState.customPrice = null;
  const inp = document.getElementById('custom-price-input');
  if(inp) inp.value = '';
  
  document.querySelectorAll('.svc-tab-btn').forEach(b => b.className = 'svc-tab-btn p-4 rounded-2xl border border-border bg-panel text-textMuted text-left');
  const active = document.getElementById(`svc-tab-${svcKey}`);
  if(active) active.className = 'svc-tab-btn p-4 rounded-2xl border border-primary bg-primary/10 text-primary text-left shadow-glow';
  
  // Sembunyikan atau tampilkan bagian sinopsis berdasarkan jenis layanan
  // Sinopsis HANYA muncul untuk "tari", dan disembunyikan untuk "digital" (non-tari) & "transkripsi"
  const synopsisSection = document.getElementById('field-sinopsis')?.closest('.space-y-4, div');
  if (synopsisSection) {
    if (svcKey === 'tari') {
      synopsisSection.style.display = 'block';
      const sinopsisInput = document.getElementById('field-sinopsis');
      if (sinopsisInput) sinopsisInput.required = true;
    } else {
      synopsisSection.style.display = 'none';
      const sinopsisInput = document.getElementById('field-sinopsis');
      if (sinopsisInput) sinopsisInput.required = false;
    }
  }

  renderPackageCards(); renderDynamicSpecFields(); recalculateLivePrice();
}
