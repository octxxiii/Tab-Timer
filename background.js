let tabTimes = {};
let currentTab = null;
let timeLimits = {};
let notifications = {};
let lastNotificationTime = {};
let updateInterval;

// Initialize storage
chrome.storage.local.get(['tabTimes', 'settings'], (result) => {
  if (!result.tabTimes) {
    chrome.storage.local.set({ tabTimes: {} });
  }
  if (!result.settings) {
    chrome.storage.local.set({ settings: { notifications: true } });
  }
  
  // Get current active tab on startup
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      currentTab = {
        time: Date.now(),
        domain: getRootDomain(tabs[0].url)
      };
      startPeriodicUpdates();
    }
  });
});

// Update current tab time
function updateCurrentTabTime() {
  if (!currentTab || !currentTab.domain) return;

  const now = Date.now();
  const timeSpent = now - currentTab.time;
  
  // Only update if time difference is reasonable (less than 1 hour)
  if (timeSpent <= 0 || timeSpent >= 3600000) {
    currentTab.time = now;
    return;
  }

  console.log('Updating time for domain:', currentTab.domain, 'Time spent:', timeSpent);
  
  // Load current tab times
  chrome.storage.local.get(['tabTimes'], (result) => {
    const tabTimes = result.tabTimes || {};
    
    if (!tabTimes[currentTab.domain]) {
      tabTimes[currentTab.domain] = 0;
    }
    
    tabTimes[currentTab.domain] += timeSpent;
    console.log('New total time for', currentTab.domain, ':', tabTimes[currentTab.domain]);
    
    // Save to storage
    chrome.storage.local.set({ tabTimes }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error saving tab times:', chrome.runtime.lastError);
        return;
      }
      
      console.log('Tab times saved successfully');
      
      // Check time limit
      chrome.storage.local.get(['timeLimits'], (result) => {
        const timeLimits = result.timeLimits || {};
        if (timeLimits[currentTab.domain]) {
          const totalTimeSpent = tabTimes[currentTab.domain];
          const limitInMs = timeLimits[currentTab.domain] * 60000;
          
          if (totalTimeSpent > limitInMs) {
            createNotification(currentTab.domain, totalTimeSpent, timeLimits[currentTab.domain]);
          }
        }
      });
    });
  });
  
  // Update last active time
  currentTab.time = now;
}

// Start periodic updates
function startPeriodicUpdates() {
  stopPeriodicUpdates();  // Clear any existing interval first
  
  updateInterval = setInterval(() => {
    updateCurrentTabTime();
    
    // Notify popup to update UI
    try {
      chrome.runtime.sendMessage({ type: 'updateUI' }, (response) => {
        if (chrome.runtime.lastError) {
          console.debug('Popup is not open:', chrome.runtime.lastError.message);
          // This is normal when popup is closed, so we continue tracking
        }
      });
    } catch (error) {
      console.error('Error sending update message:', error);
      // Continue tracking even if message fails
    }
  }, 1000);
}

// Stop periodic updates
function stopPeriodicUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
}

// Helper function to safely parse URLs
function getRootDomain(url) {
  try {
    if (!url || url === 'chrome://newtab/' || url.startsWith('chrome://')) {
      return '';
    }
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    return domain.startsWith('www.') ? domain.substring(4) : domain;
  } catch (e) {
    console.error('Error parsing URL:', url, e);
    return '';
  }
}

// Check if notification should be shown
function shouldShowNotification(domain) {
  const now = Date.now();
  if (!lastNotificationTime[domain]) {
    return true;
  }
  // Show notification once every 5 minutes
  return (now - lastNotificationTime[domain]) > 5 * 60 * 1000;
}

// Create notification
function createNotification(domain, timeSpent, limit) {
  if (!shouldShowNotification(domain)) {
    return;
  }

  const notificationId = `time-limit-${domain}-${Date.now()}`;
  const minutesSpent = Math.floor(timeSpent / 60000);
  const minutesLimit = limit;
  
  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: 'images/icon128.png',
    title: 'Time Limit Alert',
    message: `You've spent ${minutesSpent} minutes on ${domain}. Your limit is ${minutesLimit} minutes.`,
    buttons: [
      { title: 'Dismiss' },
      { title: 'Add 5 Minutes' }
    ],
    requireInteraction: true,
    priority: 2
  });

  lastNotificationTime[domain] = Date.now();
  notifications[notificationId] = { domain, limit };
}

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  const notificationInfo = notifications[notificationId];
  if (!notificationInfo) return;

  if (buttonIndex === 1) { // "Add 5 Minutes" clicked
    chrome.storage.local.get(['timeLimits'], (result) => {
      const timeLimits = result.timeLimits || {};
      const domain = notificationInfo.domain;
      timeLimits[domain] = (timeLimits[domain] || 0) + 5;
      chrome.storage.local.set({ timeLimits });
    });
  }

  chrome.notifications.clear(notificationId);
  delete notifications[notificationId];
});

// Track tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  // Update time for previous tab
  if (currentTab) {
    updateCurrentTabTime();
  }
  
  // Get the new tab's URL
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url) {
      const newDomain = getRootDomain(tab.url);
      if (newDomain && (!currentTab || newDomain !== currentTab.domain)) {
        currentTab = {
          time: Date.now(),
          domain: newDomain
        };
        startPeriodicUpdates();
      }
    }
  });
});

// Handle URL updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    // Update time for previous tab if it's the current tab
    if (currentTab && tabId === tab.id) {
      updateCurrentTabTime();
    }
    
    // Update current tab if it's the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
      if (activeTabs[0] && activeTabs[0].id === tabId) {
        const newDomain = getRootDomain(changeInfo.url);
        if (newDomain && (!currentTab || newDomain !== currentTab.domain)) {
          currentTab = {
            time: Date.now(),
            domain: newDomain
          };
          startPeriodicUpdates();
        }
      }
    });
  }
});

// Handle window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Window lost focus, pause tracking
    stopPeriodicUpdates();
  } else {
    // Window gained focus, resume tracking
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        currentTab = {
          time: Date.now(),
          domain: getRootDomain(tabs[0].url)
        };
        startPeriodicUpdates();
      }
    });
  }
});

// Handle browser startup
chrome.runtime.onStartup.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      currentTab = {
        time: Date.now(),
        domain: getRootDomain(tabs[0].url)
      };
      startPeriodicUpdates();
    }
  });
});

// Handle browser shutdown or extension reload
chrome.runtime.onSuspend.addListener(() => {
  updateCurrentTabTime();
  stopPeriodicUpdates();
});

// Reset daily stats at midnight
function resetDailyStats() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const timeUntilMidnight = midnight - now;

  setTimeout(() => {
    updateCurrentTabTime(); // Save final times before reset
    tabTimes = {};
    chrome.storage.local.set({ tabTimes });
    resetDailyStats(); // Set up next day's reset
  }, timeUntilMidnight);
}

// Start the daily reset cycle
resetDailyStats();

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
  } else if (request.type === 'getTabTimes') {
    chrome.storage.local.get(['tabTimes'], (result) => {
      sendResponse(result.tabTimes || {});
    });
    return true; // Required for async response
  }
});

// Track active tab time
let activeTabId = null;
let startTime = Date.now();

// Update time for active tab
function updateActiveTabTime() {
  if (!activeTabId) return;

  chrome.tabs.get(activeTabId, (tab) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }

    const domain = getRootDomain(tab.url);
    if (!domain) return;

    const elapsed = Date.now() - startTime;
    
    chrome.storage.local.get(['tabTimes'], (result) => {
      const tabTimes = result.tabTimes || {};
      tabTimes[domain] = (tabTimes[domain] || 0) + elapsed;
      
      chrome.storage.local.set({ tabTimes }, () => {
        startTime = Date.now();
      });
    });
  });
}

// Handle tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  if (activeTabId) {
    updateActiveTabTime();
  }
  activeTabId = activeInfo.tabId;
  startTime = Date.now();
});

// Handle tab URL updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    updateActiveTabTime();
    startTime = Date.now();
  }
});

// Handle windows focus change
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    if (activeTabId) {
      updateActiveTabTime();
    }
    activeTabId = null;
  } else {
    chrome.tabs.query({ active: true, windowId }, (tabs) => {
      if (tabs.length > 0) {
        if (activeTabId) {
          updateActiveTabTime();
        }
        activeTabId = tabs[0].id;
        startTime = Date.now();
      }
    });
  }
});

// Handle time limit notifications
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'timeLimitReached') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon48.png',
      title: 'Time Limit Reached',
      message: `You've reached your time limit for ${message.domain}`
    });
  }
  return true;
});

// Track active tabs and their time limits
let activeTabs = new Map();

// 탭과 알림 관리를 위한 매핑
let tabNotifications = new Map(); // 탭 ID와 알림 ID 매핑
let domainLimits = new Map(); // 도메인과 알림 ID 매핑

// 시간 제한 체크 함수
async function checkTimeLimits() {
  console.log('Checking time limits...');

  try {
    const result = await chrome.storage.local.get(['timeLimits', 'tabTimes']);
    const timeLimits = result.timeLimits || {};
    const tabTimes = result.tabTimes || {};

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs.length) return;

    const currentTab = tabs[0];
    const domain = getRootDomain(currentTab.url);
    
    if (timeLimits[domain] && tabTimes[domain]) {
      const timeSpentMinutes = Math.floor(tabTimes[domain] / 60000);
      const limitMinutes = timeLimits[domain];

      if (timeSpentMinutes >= limitMinutes) {
        // 알림 생성
        const notificationId = `time-limit-${domain}-${Date.now()}`;
        await chrome.notifications.create(notificationId, {
          type: 'basic',
          iconUrl: 'images/icon128.png',
          title: '시간 제한 알림',
          message: `${domain} 사이트의 사용 시간(${limitMinutes}분)이 초과되었습니다.`,
          requireInteraction: true,
          priority: 2,
          buttons: [
            { title: '5분 더 사용' },
            { title: '알림 닫기' }
          ]
        });

        // 탭과 알림 ID 매핑 저장
        tabNotifications.set(currentTab.id, notificationId);
        domainLimits.set(domain, notificationId);

        // 시간 제한 설정 제거
        const updatedTimeLimits = { ...timeLimits };
        delete updatedTimeLimits[domain];
        await chrome.storage.local.set({ timeLimits: updatedTimeLimits });

        // 탭 흔들기 효과
        await shakeTab(currentTab.id);

        // 알림음 재생
        const audio = new Audio(chrome.runtime.getURL('notification.mp3'));
        await audio.play().catch(console.error);
      }
    }
  } catch (error) {
    console.error('Error checking time limits:', error);
  }
}

// 탭이 닫힐 때 관련 알림 제거
chrome.tabs.onRemoved.addListener((tabId) => {
  const notificationId = tabNotifications.get(tabId);
  if (notificationId) {
    chrome.notifications.clear(notificationId);
    tabNotifications.delete(tabId);
    
    // 도메인 매핑에서도 제거
    for (const [domain, nId] of domainLimits.entries()) {
      if (nId === notificationId) {
        domainLimits.delete(domain);
        break;
      }
    }
  }
});

// 알림 버튼 클릭 처리
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  const domain = notificationId.split('-')[2]; // time-limit-domain-timestamp 형식에서 도메인 추출
  
  if (buttonIndex === 0) { // "5분 더 사용" 버튼
    // 새로운 5분 제한 설정
    const result = await chrome.storage.local.get(['timeLimits']);
    const timeLimits = result.timeLimits || {};
    timeLimits[domain] = 5; // 5분으로 새로 설정
    await chrome.storage.local.set({ timeLimits });
    
    // 시작 시간 재설정
    const startTime = Date.now();
    await chrome.storage.local.set({
      [`startTime_${domain}`]: startTime
    });
  }
  
  // 알림 제거
  chrome.notifications.clear(notificationId);
  
  // 매핑에서 제거
  for (const [tabId, nId] of tabNotifications.entries()) {
    if (nId === notificationId) {
      tabNotifications.delete(tabId);
      break;
    }
  }
  domainLimits.delete(domain);
});

// 알림이 닫힐 때 처리
chrome.notifications.onClosed.addListener((notificationId) => {
  // 매핑에서 제거
  for (const [tabId, nId] of tabNotifications.entries()) {
    if (nId === notificationId) {
      tabNotifications.delete(tabId);
      break;
    }
  }
  
  const domain = notificationId.split('-')[2];
  domainLimits.delete(domain);
});

// 1분마다 시간 제한 체크
setInterval(checkTimeLimits, 60000);

// 초기 설정
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['timeLimits'], (result) => {
    if (!result.timeLimits) {
      chrome.storage.local.set({ timeLimits: {} });
    }
  });
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const domain = new URL(tab.url).hostname;
    const startTime = Date.now();
    
    // 시작 시간을 storage에 저장
    chrome.storage.local.set({
      [`startTime_${domain}`]: startTime
    });
    
    activeTabs.set(tabId, {
      domain,
      startTime
    });
  }
});

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  activeTabs.delete(tabId);
});

// Function to shake the tab
async function shakeTab(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const originalStyle = document.body.style.cssText;
        const shakeAnimation = `
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
        `;
        
        // Add animation style
        const style = document.createElement('style');
        style.textContent = shakeAnimation;
        document.head.appendChild(style);
        
        // Apply shake animation
        document.body.style.animation = 'shake 0.5s ease-in-out';
        
        // Remove animation after it completes
        setTimeout(() => {
          document.body.style.cssText = originalStyle;
          style.remove();
        }, 500);
      }
    });
  } catch (error) {
    console.error('Error shaking tab:', error);
  }
} 