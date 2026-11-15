function closeWelcomeModal() {
  const m = document.getElementById('welcome-modal');
  m?.classList.add('hidden');
  m?.classList.remove('flex');
}

function openProducerWaModal(defaultIntent = '', defaultService = '', presetName = '', presetOrg = '') {
  const nameInput = document.getElementById('wa-comp-name');
  const orgInput = document.getElementById('wa-comp-org');
  const svcInput = document.getElementById('wa-comp-service');
  const intentInput = document.getElementById('wa-comp-intent');

  if (nameInput) nameInput.value = presetName || appState.currentClientUser?.name || '';
  if (orgInput) orgInput.value = presetOrg || (appState.currentClientUser ? `${appState.currentClientUser.instansi} - ${appState.currentClientUser.kota}` : '');
  if (svcInput && defaultService) {
    for (const opt of svcInput.options) {
      if (opt.value.toLowerCase().includes(defaultService.toLowerCase())) {
        svcInput.value = opt.value;
        break;
      }
    }
  }
  if (intentInput && defaultIntent) intentInput.value = defaultIntent;

  updateWaComposerPreview();
  const modal = document.getElementById('wa-producer-modal');
  modal?.classList.remove('hidden');
  modal?.classList.add('flex');
}

function closeProducerWaModal() {
  const modal = document.getElementById('wa-producer-modal');
  modal?.classList.add('hidden');
  modal?.classList.remove('flex');
}

function updateWaComposerPreview() {
  const name = document.getElementById('wa-comp-name')?.value.trim() || '[Nama Anda]';
  const org = document.getElementById('wa-comp-org')?.value.trim();
  const svc = document.getElementById('wa-comp-service')?.value || 'Produksi Musik Tari';
  const intent = document.getElementById('wa-comp-intent')?.value.trim() || '[Kebutuhan / Rencana Diskusi]';

  // SAPAAN DIUBAH MENJADI HALO ADMIN PRANGART LAB
  const msg =
    `Halo Admin PrangArt Lab,\n` +
    `Perkenalkan saya *${name}*${org ? ` (${org})` : ''}.\n` +
    `Layanan: *${svc}*\n\n` +
    `Hal yang ingin saya lakukan/diskusikan:\n${intent}`;

  const prev = document.getElementById('wa-comp-preview');
  if (prev) prev.textContent = msg;
  return msg;
}

function submitProducerWaMessage() {
  const name = document.getElementById('wa-comp-name')?.value.trim();
  const intent = document.getElementById('wa-comp-intent')?.value.trim();
  if (!name || !intent) {
    showToast('Lengkapi Pesan', 'Mohon isi Nama Anda dan hal yang ingin didiskusikan sebelum membuka WhatsApp.', 'warning');
    return;
  }
  const text = updateWaComposerPreview();
  const waUrl = `https://wa.me/${appState.settings.studioWhatsApp}?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank', 'noopener');
  closeProducerWaModal();
}

function launchWhatsAppProjectDiscussion(projId) {
  const proj = appState.projects.find(p => p.id === projId);
  if (!proj) return;
  const intent =
    `Diskusi Lanjutan Proyek (${proj.id}) - "${proj.judul}"\n` +
    `Layanan: ${proj.serviceLineLabel} (${proj.packageName})\n` +
    `Mohon konfirmasi hasil pemeriksaan materi & penawaran resmi.`;
  openProducerWaModal(intent, proj.serviceLineLabel, proj.clientName, `${proj.instansi} - ${proj.kota}`);
}

function sendClientRevisionNoteToWA(projId) {
  const proj = appState.projects.find(p => p.id === projId);
  if (!proj) return;
  const note = document.getElementById('client-revision-note')?.value.trim();
  if (!note) {
    showToast('Isi Catatan Revisi', 'Tuliskan poin revisi terlebih dahulu sebelum mengirim ke WhatsApp.', 'warning');
    return;
  }
  const intent =
    `Catatan Revisi Proyek (${proj.id}) - "${proj.judul}"\n` +
    `Detail Revisi:\n${note}`;
  openProducerWaModal(intent, proj.serviceLineLabel, proj.clientName, `${proj.instansi} - ${proj.kota}`);
}