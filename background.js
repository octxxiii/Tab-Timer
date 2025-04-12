let tabTimes = {};
let currentTab = null;
let timeLimits = {};
let notifications = {};

// Initialize storage
chrome.storage.local.get(['tabTimes', 'timeLimits'], (result) => {
  if (result.tabTimes) {
    tabTimes = result.tabTimes;
  }
  if (result.timeLimits) {
    timeLimits = result.timeLimits;
  }
});

// Get root domain from URL
function getRootDomain(url) {
  try {
    const domain = new URL(url).hostname;
    return domain.startsWith('www.') ? domain.substring(4) : domain;
  } catch (e) {
    return null;
  }
}

// Create notification
function createNotification(domain, timeSpent) {
  const notificationId = `time-limit-${domain}-${Date.now()}`;
  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: 'images/icon128.png',
    title: '시간 제한 알림',
    message: `${domain}에서 ${Math.floor(timeSpent / 60000)}분 이상 머물렀습니다. 다른 일을 시작해보세요!`,
    priority: 2
  });
  notifications[notificationId] = true;
}

// Track tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  const now = Date.now();
  
  if (currentTab) {
    const timeSpent = now - currentTab.time;
    const domain = currentTab.domain;
    
    if (domain) {
      if (!tabTimes[domain]) {
        tabTimes[domain] = 0;
      }
      tabTimes[domain] += timeSpent;
      
      // Check time limit
      if (timeLimits[domain] && timeSpent > timeLimits[domain] * 60000) {
        createNotification(domain, timeSpent);
      }
      
      // Save to storage
      chrome.storage.local.set({ tabTimes });
    }
  }
  
  // Get the new tab's URL
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      currentTab = {
        time: now,
        domain: getRootDomain(tab.url)
      };
    }
  });
});

// Handle URL updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && currentTab && tabId === tab.id) {
    const now = Date.now();
    const timeSpent = now - currentTab.time;
    const oldDomain = currentTab.domain;
    
    if (oldDomain) {
      if (!tabTimes[oldDomain]) {
        tabTimes[oldDomain] = 0;
      }
      tabTimes[oldDomain] += timeSpent;
      
      // Check time limit
      if (timeLimits[oldDomain] && timeSpent > timeLimits[oldDomain] * 60000) {
        createNotification(oldDomain, timeSpent);
      }
    }
    
    currentTab = {
      time: now,
      domain: getRootDomain(changeInfo.url)
    };
    
    chrome.storage.local.set({ tabTimes });
  }
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

// 시간 제한 설정 저장
let timeLimit = null;
let timeLimitStart = null;

// 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setTimeLimit') {
    timeLimit = request.minutes;
    timeLimitStart = Date.now();
    sendResponse({ success: true });
  } else if (request.action === 'getTimeLimit') {
    sendResponse({ minutes: timeLimit });
  } else if (request.action === 'checkTimeLimit') {
    if (timeLimit && timeLimitStart) {
      const elapsedMinutes = Math.floor((Date.now() - timeLimitStart) / 60000);
      const remainingMinutes = timeLimit - elapsedMinutes;
      sendResponse({ remaining: remainingMinutes });
    } else {
      sendResponse({ remaining: null });
    }
  } else if (request.type === 'setTimeLimit') {
    timeLimits[request.domain] = request.minutes;
    chrome.storage.local.set({ timeLimits });
    sendResponse({ success: true });
  } else if (request.type === 'getTimeLimits') {
    sendResponse({ timeLimits });
  }
}); 