// Time limit management functions
function removeLimit(site) {
  if (!site) return;
  
  chrome.storage.local.get(['timeLimits', 'timerStartTimes'], (result) => {
    const timeLimits = result.timeLimits || {};
    const timerStartTimes = result.timerStartTimes || {};
    
    delete timeLimits[site];
    delete timerStartTimes[site];
    
    chrome.storage.local.set({ 
      timeLimits,
      timerStartTimes 
    }, () => {
      // Notify popup to update UI
      chrome.runtime.sendMessage({
        type: 'limitRemoved',
        site: site
      });
    });
  });
}

// Make functions available globally
window.removeLimit = removeLimit; 