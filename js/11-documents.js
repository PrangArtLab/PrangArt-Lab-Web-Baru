function openOfficialDocModal(id, type, stage) { showToast('Info', 'Membuka Invoice...'); }
function closeOfficialDocModal() { document.getElementById('official-doc-modal')?.classList.add('hidden'); }
function downloadOfficialDocPNG() { showToast('Info', 'Mengunduh Invoice...'); }
function sendInvoiceToWA() { openProducerWaModal('Ini Invoice saya'); }
