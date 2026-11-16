function refreshClientPageUI() {
  const wall = document.getElementById('client-login-wall'), ws = document.getElementById('client-workspace-content');
  if (!appState.currentClientUser) { wall?.classList.remove('hidden'); ws?.classList.add('hidden'); return; }
  wall?.classList.add('hidden'); ws?.classList.remove('hidden'); renderClientWorkspace();
}

function renderClientWorkspace() {
  const ws = document.getElementById('client-workspace-content'); if (!ws) return;
  
  const tabs = `
    <div class="flex gap-2 border-b border-border/60 pb-4 mb-6">
      <button onclick="appState.clientTab='projects'; renderClientWorkspace();" class="px-4 py-2 rounded-xl text-sm font-bold ${appState.clientTab==='projects'?'bg-primary text-white':'bg-panel text-textMuted'}">Proyek Saya</button>
      <button onclick="appState.clientTab='settings'; renderClientWorkspace();" class="px-4 py-2 rounded-xl text-sm font-bold ${appState.clientTab==='settings'?'bg-primary text-white':'bg-panel text-textMuted'}">Pengaturan Akun</button>
    </div>`;

  // RENDER TAB SETTING
  if (appState.clientTab === 'settings') {
    ws.innerHTML = `<div class="bg-surface border border-border/80 p-8 rounded-3xl shadow-premium">${tabs}
      <div class="max-w-md space-y-4">
        <div><label class="block text-xs font-bold mb-2">Nama Lengkap</label><input type="text" id="set-name" value="${appState.currentClientUser.name}" class="w-full bg-panel border p-3 rounded-xl text-sm" /></div>
        <div><label class="block text-xs font-bold mb-2">No. WhatsApp</label><input type="tel" id="set-wa" value="${appState.currentClientUser.wa || ''}" class="w-full bg-panel border p-3 rounded-xl text-sm" /></div>
        <button onclick="updateProfile()" class="btn-primary w-full py-3 rounded-xl text-sm font-bold">Simpan Profil</button>
        <hr class="my-6 border-border/60"/>
        <div><label class="block text-xs font-bold mb-2">Sandi Baru</label><input type="password" id="set-pass" placeholder="Minimal 4 karakter" class="w-full bg-panel border p-3 rounded-xl text-sm" /></div>
        <button onclick="updatePass()" class="btn-outline w-full py-3 rounded-xl text-sm font-bold">Ganti Sandi</button>
        <button onclick="logoutClientUser()" class="w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm mt-4 hover:bg-red-500 hover:text-white transition">Logout</button>
      </div>
    </div>`; return;
  }

  // RENDER TAB PROYEK
  const myP = appState.projects.filter(p => p.clientEmail === appState.currentClientUser.email);
  if (!myP.length) return ws.innerHTML = `<div class="text-center p-10 bg-surface rounded-3xl border border-border/80">${tabs}<h3 class="text-xl font-bold mb-4">Belum ada proyek</h3><button onclick="navigateTo('order')" class="btn-primary px-6 py-2.5 rounded-xl font-bold">+ Buat Pengajuan</button></div>`;
  
  ws.innerHTML = `<div class="bg-surface border border-border/80 p-8 rounded-3xl shadow-premium">${tabs}
    ${myP.map(p => `<div class="border border-border/80 p-5 rounded-2xl mb-4 flex justify-between items-center bg-panel">
      <div><strong class="block text-lg text-textMain">${p.judul}</strong><span class="text-xs text-textMuted">${p.id}</span></div>
      <div class="text-right"><span class="text-primary font-bold block">${formatRupiah(p.totalPrice)}</span><span class="text-xs bg-surface px-2 py-1 rounded border border-border">${p.dpStatus}</span></div>
    </div>`).join('')}
  </div>`;
}

function updateProfile() {
  appState.currentClientUser.name = document.getElementById('set-name').value;
  appState.currentClientUser.wa = document.getElementById('set-wa').value;
  localStorage.setItem('prangart_current_user', JSON.stringify(appState.currentClientUser));
  updateHeaderAuthBadge(); showToast('Sukses', 'Profil diperbarui.');
}

function updatePass() {
  const p = document.getElementById('set-pass').value;
  if(p.length < 4) return showToast('Gagal', 'Sandi minimal 4 karakter.', 'warning');
  appState.currentClientUser.pass = p;
  localStorage.setItem('prangart_current_user', JSON.stringify(appState.currentClientUser));
  persistLocalState(); showToast('Sukses', 'Sandi diubah.');
}
