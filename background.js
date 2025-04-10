let tabTimes = {};
let currentTab = null;

// Initialize storage
chrome.storage.local.get(['tabTimes'], (result) => {
  if (result.tabTimes) {
    tabTimes = result.tabTimes;
  }
});

// Track tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  const now = Date.now();
  
  if (currentTab) {
    const timeSpent = now - currentTab.time;
    const domain = currentTab.url;
    
    if (!tabTimes[domain]) {
      tabTimes[domain] = 0;
    }
    tabTimes[domain] += timeSpent;
    
    // Save to storage
    chrome.storage.local.set({ tabTimes });
  }
  
  // Get the new tab's URL
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    currentTab = {
      time: now,
      url: new URL(tab.url).hostname
    };
  });
});

// Reset data daily
function resetDailyData() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const timeUntilReset = tomorrow - now;
  
  setTimeout(() => {
    tabTimes = {};
    chrome.storage.local.set({ tabTimes });
    resetDailyData();
  }, timeUntilReset);
}

resetDailyData(); 