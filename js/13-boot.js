Object.assign(window, {
  appState, persistLocalState, initFirebaseSync, showToast, formatRupiah, numberToIndonesianWords, triggerPngFileDownload,
  initTheme, setTheme, toggleThemeDropdown, navigateTo, updateHeaderAuthBadge, selectServiceAndGoOrder, renderSop14Grid,
  closeWelcomeModal, openProducerWaModal, closeProducerWaModal, updateWaComposerPreview, submitProducerWaMessage,
  launchWhatsAppProjectDiscussion, sendClientRevisionNoteToWA, openClientAuthModal, closeClientAuthModal, switchAuthModalTab,
  handleQuickClientRegister, handleQuickClientLogin, handleClientPortalLogin, logoutClientUser, refreshOrderPageUI,
  selectServiceLine, selectPackageTier, addBasicInstrument, removeBasicInstrument, toggleStandarStructCard, addProSceneBlock,
  removeProSceneBlock, recalculateLivePrice, copyBankAccount, generateAISynopsis, restorePreviousSynopsis, handleOrderFormSubmit,
  filterPortfolio, renderPortfolioGrid, playSampleTone, renderFaqAccordion, toggleFaqItem, refreshClientPageUI, renderClientWorkspace,
  changeClientPaymentScheme, uploadClientStagePayment, confirmClientFinalReceipt, downloadMasterAsset, changePaymentMethodDisplay,
  copyBankAccountNumber, generateBriefCardPNGDataUrl, downloadCurrentBriefPNG, sendBriefCardToProducerWA, openBriefCardModal,
  closeBriefCardModal, openDraftContractPreviewModal, openContractDocModal, closeContractDocModal, confirmClientAdministrativeApproval,
  downloadContractDocPNG, openOfficialDocModal, closeOfficialDocModal, switchOfficialDocType, switchOfficialDocStage,
  downloadOfficialDocPNG, sendInvoiceToWA, verifyAdminPin, refreshAdminPageUI, renderAdminDashboard, renderAdminInspector,
  issueOfficialQuotation, updateAdminProjectStage, verifyProjectPayment, inspectPaymentProof, closeCustomModal,
  uploadStudioDeliverable, saveStudioSettings, addPaymentMethod, removePaymentMethod, addPortfolioItem, removePortfolioItem,
  syncProjectToCloud, syncUserToCloud, syncStudioConfigToCloud, uploadFileToFirebaseStorage, openGitHubPagesGuideModal
});

document.addEventListener('DOMContentLoaded', () => {
  initTheme(); 
  updateHeaderAuthBadge();
  renderSop14Grid();
  renderFaqAccordion();
  renderPortfolioGrid();
  
  const initialPage = window.location.hash.replace('#', '') || 'home';
  navigateTo(initialPage);

  initFirebaseSync();

  if (!window.location.hash) {
    setTimeout(() => {
      const wm = document.getElementById('welcome-modal');
      if (wm) { wm.classList.remove('hidden'); wm.classList.add('flex'); }
    }, 350);
  }
});
