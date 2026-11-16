Object.assign(window, {
  appState, initFirebaseSync, showToast, formatRupiah, numberToIndonesianWords, 
  triggerPngFileDownload, updateCloudSyncBadge, initTheme, setTheme, toggleThemeDropdown,
  navigateTo, updateHeaderAuthBadge, selectServiceAndGoOrder, renderSop14Grid,
  closeWelcomeModal, openProducerWaModal, closeProducerWaModal, updateWaComposerPreview, submitProducerWaMessage,
  openClientAuthModal, closeClientAuthModal, switchAuthModalTab, handleQuickClientRegister, handleQuickClientLogin, handleClientPortalLogin, logoutClientUser,
  refreshOrderPageUI, selectServiceLine, selectPackageTier, recalculateLivePrice, copyBankAccount, generateAISynopsis, handleOrderFormSubmit,
  filterPortfolio, renderPortfolioGrid, renderFaqAccordion, toggleFaqItem,
  refreshClientPageUI, renderClientWorkspace, changeClientPaymentScheme, uploadClientStagePayment, changePaymentMethodDisplay,
  openOfficialDocModal, closeOfficialDocModal, downloadOfficialDocPNG, sendInvoiceToWA,
  verifyAdminPin, refreshAdminPageUI, renderAdminDashboard, addPaymentMethod, removePaymentMethod,
  syncProjectToCloud, syncUserToCloud, syncStudioConfigToCloud, handleCustomPrice,
  restorePreviousSynopsis, addProSceneBlock, renderProSceneBlocks, 
  openContractDocModal, closeContractDocModal, downloadContractDocPNG, inspectPaymentProof, approvePayment, uploadAdminMaster
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
});
