function refreshClientPageUI() {
  const wall = document.getElementById('client-login-wall');
  const ws = document.getElementById('client-workspace-content');
  if (!appState.currentClientUser) { wall?.classList.remove('hidden'); ws?.classList.add('hidden'); return; }
  wall?.classList.add('hidden'); ws?.classList.remove('hidden'); renderClientWorkspace();
}

function renderClientWorkspace() {
  const ws = document.getElementById('client-workspace-content');
  if (!ws || !appState.currentClientUser) return;
  
  // UI TABS
  const tabsHtml = `
    <div class="flex gap-2 border-b border-border/60 pb-4 mb-6">
      <button type="button" onclick="appState.clientTab = 'projects'; renderClientWorkspace();" class="px-4 py-2 rounded-xl text-sm font-bold ${appState.clientTab === 'projects' ? 'bg-primary text-white shadow-glow' : 'bg-panel text-textMuted hover:text-textMain'}">Proyek Saya</button>
      <button type="button" onclick="appState.clientTab = 'settings'; renderClientWorkspace();" class="px-4 py-2 rounded-xl text-sm font-bold ${appState.clientTab === 'settings' ? 'bg-primary text-white shadow-glow' : 'bg-panel text-textMuted hover:text-textMain'}">Pengaturan Akun</button>
    </div>
  `;

  // JIKA TAB SETTINGS
  if (appState.clientTab === 'settings') {
    ws.innerHTML = `
      <div class="bg-surface border border-border/80 rounded-[2rem] p-8 shadow-premium space-y-6">
        ${tabsHtml}
        <div class="space-y-5 max-w-lg">
          <div>
            <h3 class="text-xl font-display font-bold text-textMain mb-4">Edit Profil</h3>
            <label class="block text-xs font-bold text-textMain mb-2">Nama Lengkap</label>
            <input type="text" id="set-name" value="${appState.currentClientUser.name}" class="w-full bg-panel border border-border/80 rounded-xl px-4 py-3 text-sm mb-3" />
            <label class="block text-xs font-bold text-textMain mb-2">No. WhatsApp</label>
            <input type="tel" id="set-wa" value="${appState.currentClientUser.wa || ''}" class="w-full bg-panel border border-border/80 rounded-xl px-4 py-3 text-sm mb-4" />
            <button type="button" onclick="updateClientProfile()" class="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold">Simpan Profil</button>
          </div>
          
          <hr class="border-border/60 my-6" />
          
          <div>
            <h3 class="text-xl font-display font-bold text-textMain mb-4">Ganti Kata Sandi</h3>
            <label class="block text-xs font-bold text-textMain mb-2">Kata Sandi Baru</label>
            <input type="password" id="set-pass" placeholder="Minimal 4 karakter" class="w-full bg-panel border border-border/80 rounded-xl px-4 py-3 text-sm mb-4" />
            <button type="button" onclick="updateClientPassword()" class="btn-outline px-6 py-2.5 rounded-xl text-xs font-bold">Ganti Sandi</button>
          </div>
          
          <hr class="border-border/60 my-6" />
          <button type="button" onclick="logoutClientUser()" class="w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm hover:bg-red-500 hover:text-white transition">Logout Akun</button>
        </div>
      </div>
    `;
    return;
  }

  // JIKA TAB PROJECTS
  const myProjects = appState.projects.filter(p => p.clientEmail === appState.currentClientUser.email);
  if (!myProjects.length) {
    ws.innerHTML = `
      <div class="bg-surface border border-border/80 rounded-[2rem] p-12 text-center shadow-premium">
        ${tabsHtml}
        <h3 class="text-2xl font-display font-bold text-textMain mb-4">Belum Ada Pengajuan</h3>
        <button type="button" onclick="navigateTo('order')" class="btn-primary px-8 py-3.5 rounded-xl text-sm font-bold mt-4">+ Buat Pengajuan Baru</button>
      </div>`;
    return;
  }

  if (!myProjects.some(p => p.id === appState.selectedClientProjectId)) appState.selectedClientProjectId = myProjects[0].id;
  const proj = myProjects.find(p => p.id === appState.selectedClientProjectId);

  ws.innerHTML = `
    <div class="bg-surface border border-border/80 rounded-[2rem] p-8 shadow-premium space-y-6">
      ${tabsHtml}
      <div class="flex flex-wrap justify-between items-center border-b border-border/60 pb-6 gap-4">
        <div>
          <span class="text-xs font-mono text-primary font-bold uppercase block mb-1">Proyek: ${proj.id}</span>
          <h2 class="text-3xl font-display font-bold text-textMain">${proj.judul}</h2>
        </div>
        <div class="flex gap-3">
          <button type="button" onclick="navigateTo('order')" class="btn-primary px-4 py-2 rounded-xl text-xs font-bold">+ Baru</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-panel border border-border/80 rounded-2xl p-6">
          <span class="text-xs text-primary font-bold uppercase">Status Proyek</span>
          <p class="text-lg text-textMain font-bold mt-2">${proj.productionStatus || 'Menunggu Pengerjaan'}</p>
        </div>
        <div class="bg-panel border border-border/80 rounded-2xl p-6">
          <span class="text-xs text-primary font-bold uppercase">Total Biaya</span>
          <p class="text-2xl text-textMain font-mono font-bold mt-2">${formatRupiah(proj.totalPrice)}</p>
          <p class="text-xs text-textMuted mt-1">Status: ${proj.dpStatus}</p>
        </div>
      </div>
    </div>
  `;
}

function updateClientProfile() {
  const newName = document.getElementById('set-name').value;
  const newWa = document.getElementById('set-wa').value;
  if(!newName) return showToast('Gagal', 'Nama tidak boleh kosong.', 'warning');
  
  appState.currentClientUser.name = newName;
  appState.currentClientUser.wa = newWa;
  
  // Update di array users
  const idx = appState.users.findIndex(u => u.email === appState.currentClientUser.email);
  if(idx > -1) appState.users[idx] = appState.currentClientUser;
  
  localStorage.setItem('prangart_current_user', JSON.stringify(appState.currentClientUser));
  syncUserToCloud(appState.currentClientUser);
  updateHeaderAuthBadge();
  showToast('Sukses', 'Profil berhasil diperbarui.');
}

function updateClientPassword() {
  const newPass = document.getElementById('set-pass').value;
  if (!newPass || newPass.length < 4) return showToast('Gagal', 'Sandi minimal 4 karakter.', 'warning');
  
  appState.currentClientUser.pass = newPass;
  const idx = appState.users.findIndex(u => u.email === appState.currentClientUser.email);
  if(idx > -1) appState.users[idx] = appState.currentClientUser;
  
  localStorage.setItem('prangart_current_user', JSON.stringify(appState.currentClientUser));
  syncUserToCloud(appState.currentClientUser);
  document.getElementById('set-pass').value = '';
  showToast('Sukses', 'Sandi berhasil diubah.');
}
