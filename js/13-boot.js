Object.assign(window, {
  appState, initFirebaseSync, showToast, formatRupiah, 
  initTheme, setTheme, toggleThemeDropdown, navigateTo, updateHeaderAuthBadge, 
  selectServiceAndGoOrder, renderSop14Grid, openProducerWaModal, closeProducerWaModal, 
  submitProducerWaMessage, updateWaComposerPreview, openClientAuthModal, closeClientAuthModal, 
  handleQuickClientRegister, handleClientPortalLogin, handleGoogleLogin, handleForgotPassword, 
  logoutClientUser, refreshOrderPageUI, setSynopsisMode, selectServiceLine, selectPackageTier, 
  handleCustomPrice, recalculateLivePrice, generateAISynopsis, handleOrderFormSubmit,
  renderPortfolioGrid, filterPortfolio, renderFaqAccordion, refreshClientPageUI, renderClientWorkspace,
  updateProfile, updatePass, verifyAdminPin, refreshAdminPageUI, renderAdminDashboard, syncProjectToCloud,
  closeCustomModal, openContractDocModal, closeContractDocModal, openOfficialDocModal, closeOfficialDocModal
});

document.addEventListener('DOMContentLoaded', () => {
  initTheme(); 
  updateHeaderAuthBadge(); 
  renderSop14Grid(); 
  renderFaqAccordion(); 
  renderPortfolioGrid();
  
  // LOGIKA REFRESH: Tetap di halaman yang sama
  const page = window.location.hash.replace('#', '') || 'home';
  navigateTo(page);
  
  // Set mode AI default ke manual
  setSynopsisMode('manual');
  
  initFirebaseSync();
});
