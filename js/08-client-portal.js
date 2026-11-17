function refreshClientPageUI() {
  const wall = document.getElementById('client-login-wall'), ws = document.getElementById('client-workspace-content');
  if (!appState.currentClientUser) { wall?.classList.remove('hidden'); ws?.classList.add('hidden'); return; }
  wall?.classList.add('hidden'); ws?.classList.remove('hidden'); renderClientWorkspace();
}

function renderClientWorkspace() {
  const ws = document.getElementById('client-workspace-content'); if (!ws) return;
  
  const tabs = `
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4 mb-6">
      <div class="flex gap-2">
        <button onclick="appState.clientTab='projects'; renderClientWorkspace();" class="px-4 py-2 rounded-xl text-sm font-bold ${appState.clientTab==='projects'?'bg-primary text-white':'bg-panel text-textMuted'}">Proyek Saya</button>
        <button onclick="appState.clientTab='settings'; renderClientWorkspace();" class="px-4 py-2 rounded-xl text-sm font-bold ${appState.clientTab==='settings'?'bg-primary text-white':'bg-panel text-textMuted'}">Pengaturan Akun</button>
      </div>
      <button onclick="logoutClientUser()" class="px-4 py-2 rounded-xl text-sm font-bold bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition">Log Out</button>
    </div>`;

  if (appState.clientTab === 'settings') {
    ws.innerHTML = `<div class="bg-surface border border-border/80 p-8 rounded-3xl shadow-premium">${tabs}
      <div class="max-w-md space-y-4">
        <div><label class="block text-xs font-bold mb-2">Nama Lengkap</label><input type="text" id="set-name" value="${appState.currentClientUser.name}" class="w-full bg-panel border p-3 rounded-xl text-sm" /></div>
        <div><label class="block text-xs font-bold mb-2">No. WhatsApp</label><input type="tel" id="set-wa" value="${appState.currentClientUser.wa || ''}" class="w-full bg-panel border p-3 rounded-xl text-sm" /></div>
        <button onclick="updateProfile()" class="btn-primary w-full py-3 rounded-xl text-sm font-bold">Simpan Profil</button>
        <hr class="my-6 border-border/60"/>
        <div><label class="block text-xs font-bold mb-2">Sandi Baru</label><input type="password" id="set-pass" placeholder="Minimal 8 huruf & angka" class="w-full bg-panel border p-3 rounded-xl text-sm" /></div>
        <button onclick="updatePass()" class="btn-outline w-full py-3 rounded-xl text-sm font-bold">Ganti Sandi</button>
      </div>
    </div>`; return;
  }

  const myP = appState.projects.filter(p => p.clientEmail === appState.currentClientUser.email);
  if (!myP.length) return ws.innerHTML = `<div class="bg-surface rounded-3xl border border-border/80 p-8">${tabs}<div class="text-center py-8"><h3 class="text-xl font-bold mb-4">Belum ada proyek</h3><button onclick="navigateTo('order')" class="btn-primary px-6 py-2.5 rounded-xl font-bold">+ Buat Pengajuan</button></div></div>`;
  
  ws.innerHTML = `<div class="bg-surface border border-border/80 p-8 rounded-3xl shadow-premium">${tabs}
    <div class="flex justify-end mb-4">
      <button onclick="navigateTo('order')" class="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold">+ Ajukan Proyek Baru</button>
    </div>
    ${myP.map(p => `
      <div class="border border-border/80 p-5 rounded-2xl mb-4 flex flex-col md:flex-row justify-between md:items-center gap-4 bg-panel">
        <div>
          <strong class="block text-lg text-textMain">${p.judul}</strong>
          <span class="text-xs text-textMuted">${p.id}</span>
        </div>
        <div class="text-right">
          <span class="text-primary font-bold block text-lg">${formatRupiah(p.totalPrice)}</span>
          <div class="flex items-center gap-2 justify-end mt-1">
            <span class="text-xs bg-surface px-2 py-1 rounded border border-border">${p.dpStatus}</span>
            ${p.dpStatus === 'Belum Dibayar' ? `<button onclick="openPaymentModal('${p.id}')" class="text-xs bg-primary text-white px-3 py-1 rounded-lg font-bold hover:bg-primary/90 transition shadow-sm">Bayar DP</button>` : ''}
          </div>
        </div>
      </div>
    `).join('')}
  </div>`;
}

/* === FITUR LIHAT PEMBAYARAN (QRIS / BANK) === */
function openPaymentModal(projectId) {
  const p = appState.projects.find(x => x.id === projectId);
  if (!p) return;
  
  const modal = document.getElementById('custom-modal');
  document.getElementById('custom-modal-title').textContent = 'Instruksi Pembayaran DP';
  
  const methodsHTML = appState.settings.paymentMethods.map(m => {
    const isQris = m.type === 'qris';
    return `
      <div class="border border-border/80 rounded-xl p-4 mb-3 bg-panel flex gap-4 items-center">
        ${isQris ? `<img src="${m.number}" alt="QRIS" class="w-20 h-20 object-contain bg-white rounded-lg p-1" />` : `<div class="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold text-xs uppercase">${m.name.substring(0,4)}</div>`}
        <div class="flex-1">
          <strong class="block text-sm text-textMain">${m.name}</strong>
          <span class="block text-xs text-textMuted mt-1">${isQris ? 'Scan QRIS di samping' : 'No. Rek: ' + m.number}</span>
          <span class="block text-xs text-textMuted">a.n. ${m.holder}</span>
        </div>
      </div>
    `;
  }).join('');

  document.getElementById('custom-modal-body').innerHTML = `
    <div class="space-y-4 text-sm">
      <div class="bg-primary/5 p-4 rounded-xl border border-primary/20 text-center">
        <span class="block text-xs text-textMuted">Total Tagihan DP (50%)</span>
        <strong class="text-2xl text-primary font-bold">${formatRupiah(p.dpAmount)}</strong>
      </div>
      <p class="text-textMuted text-xs">Silakan transfer sesuai nominal di atas ke salah satu rekening berikut:</p>
      <div class="max-h-60 overflow-y-auto pr-1">
        ${methodsHTML}
      </div>
      <p class="text-xs text-red-500 font-semibold text-center mt-3">*Setelah transfer, harap konfirmasi ke WhatsApp Admin.</p>
      <button onclick="openProducerWaModal('Konfirmasi DP Proyek ${p.id} - ${p.judul}')" class="btn-primary w-full py-3 rounded-xl font-bold mt-2">Konfirmasi ke WA</button>
    </div>
  `;
  
  modal.classList.remove('hidden'); modal.classList.add('flex');
}
