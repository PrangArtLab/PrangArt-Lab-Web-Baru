function verifyAdminPin(e) { e.preventDefault(); if(document.getElementById('admin-pin-input').value === appState.settings.adminPin){ appState.isAdminAuthenticated = true; refreshAdminPageUI(); } else showToast('Salah', 'PIN Salah', 'error'); }
function refreshAdminPageUI() {
  const gate = document.getElementById('admin-pin-gate'), ws = document.getElementById('admin-workspace-content');
  if (!appState.isAdminAuthenticated) { gate?.classList.remove('hidden'); ws?.classList.add('hidden'); return; }
  gate?.classList.add('hidden'); ws?.classList.remove('hidden'); renderAdminDashboard();
}
function renderAdminDashboard() {
  document.getElementById('admin-workspace-content').innerHTML = `<div class="bg-surface border p-8 rounded-3xl">
    <h2 class="text-2xl font-bold mb-4">Panel Admin</h2>
    ${appState.projects.length ? appState.projects.map(p => `<div class="border p-4 rounded-xl mb-2 flex justify-between"><div><strong>${p.judul}</strong><br><span class="text-xs">${p.clientName}</span></div><span class="text-emerald-500 font-bold">${p.dpStatus}</span></div>`).join('') : '<p>Belum ada proyek.</p>'}
  </div>`;
}
