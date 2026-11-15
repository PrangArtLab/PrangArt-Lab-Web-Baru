Object.assign(window, {
  appState,
  persistLocalState,
  initFirebaseSync,
  showToast,
  formatRupiah,
  numberToIndonesianWords,
  triggerPngFileDownload,
  updateCloudSyncBadge,

  navigateTo,
  updateHeaderAuthBadge,
  selectServiceAndGoOrder,
  renderSop14Grid,
  openGitHubPagesGuideModal,

  closeWelcomeModal,
  openProducerWaModal,
  closeProducerWaModal,
  updateWaComposerPreview,
  submitProducerWaMessage,
  launchWhatsAppProjectDiscussion,
  sendClientRevisionNoteToWA,

  openClientAuthModal,
  closeClientAuthModal,
  switchAuthModalTab,
  handleQuickClientRegister,
  handleQuickClientLogin,
  handleClientPortalLogin,
  logoutClientUser,

  refreshOrderPageUI,
  selectServiceLine,
  selectPackageTier,
  addBasicInstrument,
  removeBasicInstrument,
  toggleStandarStructCard,
  addProSceneBlock,
  removeProSceneBlock,
  recalculateLivePrice,
  copyBankAccount,
  generateAISynopsis,
  restorePreviousSynopsis,
  handleOrderFormSubmit,

  filterPortfolio,
  renderPortfolioGrid,
  playSampleTone,
  renderFaqAccordion,
  toggleFaqItem,

  refreshClientPageUI,
  renderClientWorkspace,
  changeClientPaymentScheme,
  uploadClientStagePayment,
  confirmClientFinalReceipt,
  downloadMasterAsset,

  generateBriefCardPNGDataUrl,
  downloadCurrentBriefPNG,
  sendBriefCardToProducerWA,
  openBriefCardModal,
  closeBriefCardModal,

  openDraftContractPreviewModal,
  openContractDocModal,
  closeContractDocModal,
  confirmClientAdministrativeApproval,
  downloadContractDocPNG,

  openOfficialDocModal,
  closeOfficialDocModal,
  switchOfficialDocType,
  switchOfficialDocStage,
  downloadOfficialDocPNG,

  verifyAdminPin,
  refreshAdminPageUI,
  renderAdminDashboard,
  renderAdminInspector,
  issueOfficialQuotation,
  updateAdminProjectStage,
  verifyProjectPayment,
  inspectPaymentProof,
  closeCustomModal,
  uploadStudioDeliverable,
  saveStudioSettings,
  addPortfolioItem,
  removePortfolioItem,
  syncProjectToCloud,
  syncUserToCloud,
  syncStudioConfigToCloud,
  uploadFileToFirebaseStorage
});

document.addEventListener('DOMContentLoaded', () => {
  updateHeaderAuthBadge();
  renderSop14Grid();
  renderFaqAccordion();
  renderPortfolioGrid();
  navigateTo('home');
  initFirebaseSync();

  setTimeout(() => {
    const wm = document.getElementById('welcome-modal');
    wm?.classList.remove('hidden');
    wm?.classList.add('flex');
  }, 350);
});