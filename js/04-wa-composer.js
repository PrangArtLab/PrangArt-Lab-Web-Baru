function openProducerWaModal(intent = '') {
  const modal = document.getElementById('wa-producer-modal'); if (!modal) return;
  document.getElementById('wa-comp-name').value = appState.currentClientUser?.name || '';
  document.getElementById('wa-comp-intent').value = intent;
  updateWaComposerPreview();
  modal.classList.remove('hidden'); modal.classList.add('flex');
}
function closeProducerWaModal() { document.getElementById('wa-producer-modal')?.classList.add('hidden'); }
function updateWaComposerPreview() {
  const name = document.getElementById('wa-comp-name')?.value || '[Nama]';
  const intent = document.getElementById('wa-comp-intent')?.value || '[Pesan]';
  const text = `Halo Admin PrangArt Lab,\nSaya *${name}*.\n\n${intent}`;
  const preview = document.getElementById('wa-comp-preview');
  if (preview) preview.textContent = text;
  return text;
}
function submitProducerWaMessage() {
  const text = updateWaComposerPreview();
  const number = getStudioWhatsApp();
  if (!number) {
    if (typeof showToast === 'function') {
      showToast('Nomor Studio Belum Diatur', 'Admin perlu mengisi nomor WhatsApp studio di js/00-config.js.', 'warning');
    }
    return;
  }
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
  closeProducerWaModal();
}
