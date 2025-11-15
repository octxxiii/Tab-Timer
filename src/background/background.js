// Tab Timer Background Script
// Unified version combining session tracking, wellness metrics, and hourly stats

// ===== State Management =====
let currentTabInfo = {
  tabId: null,
  domain: null,
  startTime: null,
  consecutiveStartTime: null
};

let sessions = []; // Session history
let currentSession = null;
let goals = {};
let notifications = {};
let lastNotificationTime = {};
let updateInterval = null;
let wellnessData = { consecutiveMinutes: 0 };
let saveTimer = null;

// ===== Date Helpers =====
function getYYYYMMDD(date = new Date()) {
  return date.toISOString().split('T')[0];
}

function getDateKey(date = new Date()) {
  return date.toISOString().split('T')[0];
}

function getWeekKey(date = new Date()) {
  const year = date.getFullYear();
  const firstDay = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.floor(dayOfYear / 7) + 1;
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

// ===== Storage Management =====
async function initializeStorage() {
  const today = getYYYYMMDD();
  const result = await chrome.storage.local.get([
    'tabTimes',
    'settings',
    'goals',
    'dailyStats',
    'siteMetadata',
    'sessions'
  ]);

  const initialData = {};
  if (!result.tabTimes) initialData.tabTimes = {};
  if (!result.settings) initialData.settings = { notifications: true };
  if (!result.goals) initialData.goals = {}; else goals = result.goals;
  if (!result.dailyStats) initialData.dailyStats = {};
  if (!result.siteMetadata) initialData.siteMetadata = {};
  if (!result.sessions) initialData.sessions = []; else sessions = result.sessions || [];

  // Ensure today's entry exists in dailyStats
  if (!result.dailyStats || !result.dailyStats[today]) {
    const stats = result.dailyStats || {};
    stats[today] = { domains: {}, hourly: Array(24).fill(0), visits: {}, totalTime: 0, sessionCount: 0 };
    initialData.dailyStats = stats;
  }

  if (Object.keys(initialData).length > 0) {
    await chrome.storage.local.set(initialData);
    console.log('Storage initialized:', initialData);
  }

  // Get current active tab on startup
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] && tabs[0].url) {
      console.log('Initializing with active tab:', tabs[0].url);
      await handleTabActivation(tabs[0].id, tabs[0].url);
    } else {
      // 활성 탭이 없으면 모든 창에서 찾기
      const allTabs = await chrome.tabs.query({ active: true });
      if (allTabs[0] && allTabs[0].url) {
        console.log('Initializing with active tab from any window:', allTabs[0].url);
        await handleTabActivation(allTabs[0].id, allTabs[0].url);
      }
    }
  } catch (error) {
    console.error('Error initializing active tab:', error);
  }
}

// ===== Session Management =====
function createSession(domain, tabId) {
  return {
    id: `${Date.now()}-${tabId}`,
    domain: domain,
    startTime: Date.now(),
    endTime: null,
    duration: 0,
    tabId: tabId
  };
}

async function endSession(session) {
  if (!session || session.endTime) {
    console.log('Session already ended or invalid:', session);
    return;
  }

  session.endTime = Date.now();
  session.duration = session.endTime - session.startTime;

  // 최소 세션 시간 (1초 미만은 무시)
  if (session.duration < 1000) {
    console.log('Session too short, ignoring:', session.duration, 'ms');
    return;
  }

  const domain = session.domain;
  const minutesSpent = session.duration / 60000;

  console.log(`Ending session: ${domain}, duration: ${Math.round(minutesSpent * 100) / 100} minutes`);

  // 세션 기록만 저장 (시간은 updateActiveTabTime에서 이미 추가됨)
  // 마지막 updateActiveTabTime 이후의 시간만 추가
  const result = await chrome.storage.local.get(['dailyStats', 'tabTimes', 'sessions']);
  const dailyStats = result.dailyStats || {};
  const tabTimes = result.tabTimes || {};
  let allSessions = result.sessions || [];

  // 마지막 updateActiveTabTime 이후의 시간 계산
  // currentTabInfo.startTime이 세션의 마지막 업데이트 시간이므로
  // 그 이후의 시간만 추가
  if (currentTabInfo.domain === domain && currentTabInfo.startTime) {
    const lastUpdateTime = currentTabInfo.startTime;
    const remainingTime = session.endTime - lastUpdateTime;
    if (remainingTime > 0 && remainingTime < 3600000) { // 1시간 이하만
      const remainingMinutes = remainingTime / 60000;
      const dateKey = getDateKey();
      const hour = new Date(session.startTime).getHours();

      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = { domains: {}, hourly: Array(24).fill(0), visits: {}, totalTime: 0, sessionCount: 0 };
      }

      if (!dailyStats[dateKey].domains[domain]) {
        dailyStats[dateKey].domains[domain] = 0;
      }
      dailyStats[dateKey].domains[domain] = (dailyStats[dateKey].domains[domain] || 0) + remainingMinutes;
      dailyStats[dateKey].totalTime = (dailyStats[dateKey].totalTime || 0) + remainingMinutes;
      dailyStats[dateKey].hourly[hour] = (dailyStats[dateKey].hourly[hour] || 0) + remainingMinutes;

      tabTimes[domain] = (tabTimes[domain] || 0) + remainingTime;

      console.log(`Added remaining time: ${Math.round(remainingMinutes * 100) / 100} minutes for ${domain}`);
    }
  }

  // 세션 카운트만 증가 (시간은 이미 추가됨)
  const dateKey = getDateKey();
  if (!dailyStats[dateKey]) {
    dailyStats[dateKey] = { domains: {}, hourly: Array(24).fill(0), visits: {}, totalTime: 0, sessionCount: 0 };
  }
  dailyStats[dateKey].sessionCount = (dailyStats[dateKey].sessionCount || 0) + 1;

  // Save session
  allSessions.push(session);
  if (allSessions.length > 1000) {
    allSessions = allSessions.slice(-1000);
  }

  // 메모리 상태도 업데이트
  sessions = allSessions;

  await chrome.storage.local.set({
    dailyStats,
    tabTimes,
    sessions: allSessions
  });

  console.log(`Session saved: ${domain}, total sessions: ${allSessions.length}, domain time: ${Math.round((dailyStats[dateKey].domains[domain] || 0) * 100) / 100} minutes`);

  // Check time limits
  checkTimeLimits(domain, dailyStats[dateKey].domains[domain]);
}

// ===== Time Tracking =====
async function updateActiveTabTime() {
  try {
    if (!currentTabInfo.tabId || !currentTabInfo.domain || !currentTabInfo.startTime) return;

    const now = Date.now();
    const timeSpent = now - currentTabInfo.startTime;
    const minutesSpent = timeSpent / 60000;
    const currentHour = new Date().getHours();
    const today = getYYYYMMDD();

    // Validate time spent (ignore unreasonable values)
    // 1시간 이상의 간격은 비정상적이므로 무시 (예: 컴퓨터가 꺼졌다 켜진 경우)
    if (timeSpent <= 0) {
      currentTabInfo.startTime = now;
      if (!currentTabInfo.consecutiveStartTime) currentTabInfo.consecutiveStartTime = now;
      return;
    }
    
    // 1시간 이상이면 마지막 저장 시간만큼만 추가하고 리셋
    if (timeSpent >= 3600000) {
      console.warn('Large time gap detected, resetting start time');
      currentTabInfo.startTime = now;
      if (!currentTabInfo.consecutiveStartTime) currentTabInfo.consecutiveStartTime = now;
      return;
    }

    let { tabTimes = {}, dailyStats = {} } = await chrome.storage.local.get(['tabTimes', 'dailyStats']);

    // Ensure today's stats exist
    if (!dailyStats[today]) {
      dailyStats[today] = { domains: {}, hourly: Array(24).fill(0), visits: {}, totalTime: 0, sessionCount: 0 };
    }
    if (!dailyStats[today].domains) dailyStats[today].domains = {};
    if (!dailyStats[today].hourly) dailyStats[today].hourly = Array(24).fill(0);
    if (!dailyStats[today].visits) dailyStats[today].visits = {};

    // Update daily domain time (같은 사이트의 모든 세션 시간 합산)
    // 제한 초과 여부와 관계없이 시간은 계속 추적됨
    const currentDomainTime = dailyStats[today].domains[currentTabInfo.domain] || 0;
    const newDomainTime = currentDomainTime + minutesSpent;
    dailyStats[today].domains[currentTabInfo.domain] = newDomainTime;
    dailyStats[today].hourly[currentHour] = (dailyStats[today].hourly[currentHour] || 0) + minutesSpent;
    
    // totalTime은 모든 도메인 시간의 합으로 재계산
    const allDomainTimes = Object.values(dailyStats[today].domains || {});
    dailyStats[today].totalTime = allDomainTimes.reduce((sum, time) => sum + time, 0);

    // Update total time
    tabTimes[currentTabInfo.domain] = (tabTimes[currentTabInfo.domain] || 0) + timeSpent;

    // Update wellness data
    if (currentTabInfo.consecutiveStartTime) {
      wellnessData.consecutiveMinutes = (now - currentTabInfo.consecutiveStartTime) / 60000;
    } else {
      wellnessData.consecutiveMinutes = 0;
    }

    // Save with debouncing
    debouncedSave({ tabTimes, dailyStats });

    // 디버깅: 주기적으로 로그 출력 (1분마다)
    if (Math.floor(minutesSpent) % 1 === 0 && Math.floor((timeSpent % 60000) / 1000) === 0) {
      const limitInfo = goals[currentTabInfo.domain]?.limit ? ` (제한: ${goals[currentTabInfo.domain].limit}분, 현재: ${Math.round(newDomainTime * 100) / 100}분)` : '';
      console.log(`Tracking ${currentTabInfo.domain}: ${Math.floor(minutesSpent)}분 ${Math.floor((timeSpent % 60000) / 1000)}초${limitInfo}`);
    }

    // Update start time for next interval
    currentTabInfo.startTime = now;

    // Check time limits (알림만 보냄, 시간 추적은 계속됨)
    checkTimeLimits(currentTabInfo.domain, dailyStats[today].domains[currentTabInfo.domain]);
  } catch (error) {
    console.error('Error in updateActiveTabTime:', error);
    // Reset tracking on error to prevent data corruption
    currentTabInfo.startTime = Date.now();
  }
}

// ===== Debounced Save =====
function debouncedSave(data) {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    chrome.storage.local.set(data).catch(err => {
      console.error('Error saving data:', err);
    });
  }, 1000);
}

// 즉시 저장 (중요한 데이터용)
async function saveImmediately(data) {
  try {
    await chrome.storage.local.set(data);
  } catch (err) {
    console.error('Error saving data immediately:', err);
  }
}

// ===== Tracking Control =====
function startTrackingUpdates() {
  stopTrackingUpdates();
  if (currentTabInfo.domain) {
    console.log('Starting tracking for:', currentTabInfo.domain, 'at', new Date().toISOString());
    if (!currentTabInfo.startTime) {
      currentTabInfo.startTime = Date.now();
      console.log('Set startTime to:', new Date(currentTabInfo.startTime).toISOString());
    }
    if (!currentTabInfo.consecutiveStartTime) {
      currentTabInfo.consecutiveStartTime = Date.now();
    }
    // 더 정확한 추적을 위해 3초마다 업데이트
    updateInterval = setInterval(() => {
      updateActiveTabTime();
    }, 3000);
    // 즉시 한 번 실행하여 초기 상태 저장
    updateActiveTabTime();
  } else {
    console.log('No active domain, tracking paused.');
    wellnessData.consecutiveMinutes = 0;
  }
}

function stopTrackingUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
    console.log('Tracking stopped.');
  }
}

// ===== URL Parsing =====
function getRootDomain(url) {
  try {
    if (!url || !url.startsWith('http')) {
      return null;
    }
    const urlObj = new URL(url);
    
    // Chrome internal pages
    if (urlObj.protocol === 'chrome:' ||
        urlObj.protocol === 'chrome-extension:' ||
        urlObj.protocol === 'edge:' ||
        urlObj.protocol === 'about:' ||
        urlObj.hostname === 'newtab') {
      return null;
    }

    let domain = urlObj.hostname;
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    return domain;
  } catch (e) {
    console.error('Error parsing URL:', url, e);
    return null;
  }
}

function isTrackableDomain(domain) {
  return domain && !domain.startsWith('chrome.');
}

// ===== Time Limit Management =====
function checkTimeLimits(domain, dailyTotalMinutes) {
  if (goals[domain] && goals[domain].limit !== undefined) {
    const limitInMinutes = goals[domain].limit;
    if (dailyTotalMinutes > limitInMinutes) {
      console.log(`[checkTimeLimits] Limit EXCEEDED for ${domain}. Current: ${Math.round(dailyTotalMinutes * 100) / 100}분, Limit: ${limitInMinutes}분`);
      console.log(`[checkTimeLimits] 시간 추적은 계속됩니다. 제한은 알림 목적이며 시간 기록을 멈추지 않습니다.`);
      createNotification(domain, dailyTotalMinutes, limitInMinutes);
    }
  }
}

function shouldShowNotification(domain) {
  const now = Date.now();
  return !lastNotificationTime[domain] || (now - lastNotificationTime[domain]) > 5 * 60 * 1000;
}

// 알림 다국어 텍스트
const notificationTranslations = {
  ko: {
    title: '시간 제한 알림',
    message: (domain, minutes, limit) => `${domain}에서 ${minutes}분 사용했습니다. 설정된 제한은 ${limit}분입니다.`,
    add15min: '15분 추가',
    closeTab: '눈물을 머금고 탭 닫기',
    closeNotification: '알림 닫기',
    extendedTitle: '시간 제한 연장',
    extendedMessage: (domain, limit) => `${domain}의 시간 제한이 ${limit}분으로 연장되었습니다.`
  },
  en: {
    title: 'Time Limit Alert',
    message: (domain, minutes, limit) => `You've used ${minutes} minutes on ${domain}. Your limit is ${limit} minutes.`,
    add15min: 'Add 15 min',
    closeTab: 'Close Tab (with tears)',
    closeNotification: 'Close',
    extendedTitle: 'Time Limit Extended',
    extendedMessage: (domain, limit) => `Time limit for ${domain} has been extended to ${limit} minutes.`
  }
};

async function getNotificationTexts() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['language'], (result) => {
      const lang = result.language || 'ko';
      resolve(notificationTranslations[lang] || notificationTranslations.ko);
    });
  });
}

function createNotification(domain, timeSpentMinutes, limitMinutes) {
  if (!shouldShowNotification(domain)) return;

  getNotificationTexts().then((texts) => {
    const notificationId = `time-limit-${domain}-${Date.now()}`;
    const minutesSpent = Math.floor(timeSpentMinutes);
    const message = texts.message(domain, minutesSpent, limitMinutes);
    
    const options = {
      type: 'basic',
      iconUrl: 'images/icon128.png',
      title: texts.title,
      message: message,
      buttons: [
        { title: texts.add15min },
        { title: texts.closeTab }
      ],
      requireInteraction: true,
      priority: 2
    };

    chrome.notifications.create(notificationId, options, (createdNotificationId) => {
      if (chrome.runtime.lastError) {
        console.error(`[createNotification] Error: ${chrome.runtime.lastError.message}`);
      } else {
        console.log(`[createNotification] Notification created: ${createdNotificationId}`);
        lastNotificationTime[domain] = Date.now();
        notifications[createdNotificationId] = { domain, limit: limitMinutes };
      }
    });
  });
}

chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  const notificationInfo = notifications[notificationId];
  if (!notificationInfo) return;

  const { domain, limit } = notificationInfo;
  const texts = await getNotificationTexts();

  // buttonIndex 0: 15분 추가, buttonIndex 1: 눈물을 머금고 탭 닫기
  // 알림 닫기는 알림 자체를 클릭하거나 X 버튼으로 닫을 수 있음
  if (buttonIndex === 0) {
    // 15분 추가: 시간 제한을 15분 연장
    chrome.storage.local.get(['goals'], (result) => {
      let currentGoals = result.goals || {};
      const currentLimit = currentGoals[domain]?.limit || limit;
      const newLimit = currentLimit + 15;
      
      currentGoals[domain] = {
        ...currentGoals[domain],
        limit: newLimit,
        category: currentGoals[domain]?.category || 'other',
        priority: currentGoals[domain]?.priority || 'medium'
      };
      
      goals = currentGoals;
      chrome.storage.local.set({ goals: currentGoals }).then(() => {
        console.log(`[Notification] Extended time limit for ${domain}: ${currentLimit}분 → ${newLimit}분`);
        // 알림 업데이트로 확인 메시지 표시
        chrome.notifications.create(`extended-${Date.now()}`, {
          type: 'basic',
          iconUrl: 'images/icon128.png',
          title: texts.extendedTitle,
          message: texts.extendedMessage(domain, newLimit),
          priority: 1
        });
      }).catch(err => {
        console.error('Error extending time limit:', err);
      });
    });
  } else if (buttonIndex === 1) {
    // 눈물을 머금고 탭 닫기: 현재 도메인의 모든 탭 닫기
    try {
      const allTabs = await chrome.tabs.query({});
      const tabsToClose = allTabs.filter(tab => {
        if (!tab.url) return false;
        try {
          const tabDomain = getRootDomain(tab.url);
          return tabDomain === domain;
        } catch (e) {
          return false;
        }
      });
      
      if (tabsToClose.length > 0) {
        const tabIds = tabsToClose.map(tab => tab.id);
        await chrome.tabs.remove(tabIds);
        console.log(`[Notification] Closed ${tabsToClose.length} tab(s) for ${domain}`);
      } else {
        console.log(`[Notification] No tabs found for ${domain}`);
      }
    } catch (error) {
      console.error('Error closing tabs:', error);
    }
  }
  // 알림 닫기는 알림 자체를 클릭하거나 X 버튼으로 닫을 수 있음

  chrome.notifications.clear(notificationId);
  delete notifications[notificationId];
});

// ===== Tab Event Handlers =====
async function handleTabActivation(tabId, url) {
  try {
    // Update time for previous tab BEFORE ending session
    if (currentTabInfo.tabId && currentTabInfo.tabId !== tabId) {
      await updateActiveTabTime();
    }

    // End previous session AFTER updating time
    if (currentSession) {
      console.log('Ending previous session:', currentSession.domain, 'duration:', (Date.now() - currentSession.startTime) / 1000, 'seconds');
      await endSession(currentSession);
      currentSession = null;
    }

    if (!url) {
      console.warn('No URL provided for tab activation');
      return;
    }

    const newDomain = getRootDomain(url);
    const today = getYYYYMMDD();

  if (isTrackableDomain(newDomain)) {
    if (newDomain !== currentTabInfo.domain) {
      console.log(`Switching active domain to: ${newDomain}`);
      currentTabInfo.domain = newDomain;
      currentTabInfo.tabId = tabId;
      currentTabInfo.startTime = Date.now();
      currentTabInfo.consecutiveStartTime = Date.now();
      wellnessData.consecutiveMinutes = 0;

      // Create new session
      currentSession = createSession(newDomain, tabId);

      // Increment visit count
      let { dailyStats = {} } = await chrome.storage.local.get(['dailyStats']);
      if (!dailyStats[today]) dailyStats[today] = { domains: {}, hourly: Array(24).fill(0), visits: {}, totalTime: 0, sessionCount: 0 };
      if (!dailyStats[today].visits) dailyStats[today].visits = {};
      dailyStats[today].visits[newDomain] = (dailyStats[today].visits[newDomain] || 0) + 1;
      await chrome.storage.local.set({ dailyStats });
    } else {
      currentTabInfo.tabId = tabId;
      if (!currentTabInfo.startTime) currentTabInfo.startTime = Date.now();
      if (!currentTabInfo.consecutiveStartTime) currentTabInfo.consecutiveStartTime = Date.now();
    }
    startTrackingUpdates();
  } else {
    console.log('New tab is not trackable, pausing tracking.');
    currentTabInfo.domain = null;
    currentTabInfo.tabId = tabId;
    currentTabInfo.startTime = null;
    currentTabInfo.consecutiveStartTime = null;
    wellnessData.consecutiveMinutes = 0;
    stopTrackingUpdates();
    }
  } catch (error) {
    console.error('Error in handleTabActivation:', error);
    // Reset state on error
    stopTrackingUpdates();
    currentTabInfo.domain = null;
    currentTabInfo.startTime = null;
  }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab && tab.url) {
      console.log('Tab activated:', activeInfo.tabId, tab.url);
      await handleTabActivation(activeInfo.tabId, tab.url);
    } else {
      console.warn('Tab activated but no URL:', activeInfo.tabId);
    }
  } catch (error) {
    console.error('Error in onActivated:', error);
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // URL이 변경되었거나 탭이 완전히 로드되었을 때
  if (changeInfo.url && tab && tab.active) {
    console.log(`URL changed for active tab ${tabId}: ${changeInfo.url}`);
    handleTabActivation(tabId, changeInfo.url);
  } else if (changeInfo.status === 'complete' && tab && tab.active && tab.url) {
    // 탭이 완전히 로드되었을 때도 추적 시작 (URL 변경 없이도)
    console.log(`Tab ${tabId} completed loading: ${tab.url}`);
    handleTabActivation(tabId, tab.url);
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    console.log('Window lost focus. Pausing tracking.');
    await updateActiveTabTime();
    stopTrackingUpdates();
    currentTabInfo.startTime = null;
    currentTabInfo.consecutiveStartTime = null;
    wellnessData.consecutiveMinutes = 0;
  } else {
    console.log('Window gained focus. Resuming tracking.');
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      handleTabActivation(tabs[0].id, tabs[0].url);
    }
  }
});

// ===== Message Handling =====
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setTimeLimit') {
    const domain = getRootDomain(request.website);
    if (domain) {
      chrome.storage.local.get(['goals'], (result) => {
        let currentGoals = result.goals || {};
        currentGoals[domain] = {
          limit: Number.isFinite(parseInt(request.minutes)) ? parseInt(request.minutes) : 0,
          category: request.category || 'other',
          priority: request.priority || 'medium'
        };
        goals = currentGoals;
        chrome.storage.local.set({ goals: currentGoals }).then(() => {
          console.log('Goals updated:', currentGoals);
          sendResponse({ success: true });
        }).catch(err => {
          console.error('Error saving goals:', err);
          sendResponse({ success: false, message: err.message });
        });
      });
    } else {
      sendResponse({ success: false, message: 'Invalid website URL provided.' });
    }
    return true;

  } else if (request.action === 'getCurrentActive') {
    // 현재 활성 탭 정보만 빠르게 반환 (실시간 업데이트용)
    const currentTime = Date.now();
    let currentActiveTime = 0;
    let isActive = false;
    
    // 현재 추적 중인 탭이 있고 유효한지 확인
    if (currentTabInfo.domain && currentTabInfo.startTime) {
      const elapsed = currentTime - currentTabInfo.startTime;
      // 1시간 이상 경과했으면 비활성으로 간주 (시스템 슬립 등)
      if (elapsed > 0 && elapsed < 3600000) {
        currentActiveTime = elapsed / 60000; // 분 단위
        isActive = true;
      } else {
        // 비정상적인 시간 간격이면 초기화
        console.warn('Invalid time gap detected, resetting active tab info');
        currentTabInfo.startTime = null;
        isActive = false;
      }
    }
    
    sendResponse({
      success: true,
      currentActive: {
        domain: currentTabInfo.domain,
        startTime: currentTabInfo.startTime,
        elapsedMinutes: currentActiveTime,
        isActive: isActive
      }
    });
    return true;

  } else if (request.action === 'getDetailedStats') {
    console.log('Received request for detailed stats.');
    getDetailedStats().then(stats => {
      // 현재 활성 탭 정보 추가
      const currentTime = Date.now();
      let currentActiveTime = 0;
      if (currentTabInfo.domain && currentTabInfo.startTime) {
        const elapsed = currentTime - currentTabInfo.startTime;
        currentActiveTime = elapsed / 60000; // 분 단위
      }
      
      stats.currentActive = {
        domain: currentTabInfo.domain,
        startTime: currentTabInfo.startTime,
        elapsedMinutes: currentActiveTime,
        isActive: !!currentTabInfo.domain && !!currentTabInfo.startTime
      };
      
      console.log('Sending detailed stats:', stats);
      sendResponse({ success: true, data: stats });
    }).catch(err => {
      console.error('Error getting detailed stats:', err);
      sendResponse({ success: false, message: err.message });
    });
    return true; // Keep channel open for async response

  } else if (request.action === 'getTimeLimit') {
    chrome.storage.local.get(['goals', 'tabTimes'], (result) => {
      sendResponse({
        limits: result.goals || {},
        usage: result.tabTimes || {}
      });
    });
    return true;

  } else if (request.action === 'removeTimeLimit') {
    const domain = request.domain;
    if (!domain) {
      sendResponse({ success: false, message: 'Domain not provided' });
      return true;
    }
    
    // sendResponse를 클로저로 캡처하고 한 번만 호출되도록 보장
    let responseSent = false;
    const safeSendResponse = (response) => {
      if (!responseSent) {
        responseSent = true;
        try {
          sendResponse(response);
        } catch (e) {
          console.error('Error sending response:', e);
        }
      }
    };
    
    // chrome.storage.local.get을 Promise로 변환하여 사용
    chrome.storage.local.get(['goals'], (result) => {
      if (chrome.runtime.lastError) {
        safeSendResponse({ success: false, message: chrome.runtime.lastError.message || 'Failed to get goals' });
        return;
      }
      
      try {
        const currentGoals = result.goals || {};
        
        if (!currentGoals[domain]) {
          safeSendResponse({ success: false, message: 'Time limit not found' });
          return;
        }
        
        delete currentGoals[domain];
        goals = currentGoals;
        
        chrome.storage.local.set({ goals: currentGoals }, () => {
          if (chrome.runtime.lastError) {
            safeSendResponse({ success: false, message: chrome.runtime.lastError.message || 'Failed to save changes' });
          } else {
            console.log(`Time limit removed for ${domain}`);
            safeSendResponse({ success: true });
          }
        });
      } catch (error) {
        console.error('Error in removeTimeLimit handler:', error);
        safeSendResponse({ success: false, message: error.message || 'Unknown error occurred' });
      }
    });
    return true;

  } else if (request.action === 'exportData') {
    chrome.storage.local.get(['tabTimes', 'dailyStats', 'goals', 'sessions'], (result) => {
      sendResponse({
        tabTimes: result.tabTimes,
        dailyStats: result.dailyStats,
        goals: result.goals,
        sessions: result.sessions,
        exportDate: new Date().toISOString()
      });
    });
    return true;

  } else if (request.type === 'updateUI') {
    sendResponse({ success: true, message: 'Background received UI update request.' });

  } else if (request.action === 'openPopup') {
    console.log("Received request to open popup.");
    if (chrome.action && chrome.action.openPopup) {
      chrome.action.openPopup({}, () => {
        if (chrome.runtime.lastError) {
          console.error("Error opening popup:", chrome.runtime.lastError.message);
          sendResponse({ success: false, message: chrome.runtime.lastError.message });
        } else {
          console.log("Popup opened successfully via API.");
          sendResponse({ success: true });
        }
      });
    } else {
      sendResponse({ success: false, message: 'API not available to open popup.' });
    }
    return true;
  }
});

// ===== External Message Handling =====
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  const allowedOrigins = [
    'https://octxxiii.github.io',
    'http://localhost'
  ];

  const senderOrigin = new URL(sender.url).origin;
  const isAllowed = allowedOrigins.some(origin => senderOrigin.startsWith(origin));

  if (!isAllowed) {
    sendResponse({ error: 'Unauthorized domain.' });
    return;
  }

  // Use same handlers as internal messages
  if (request.action === 'getDetailedStats') {
    getDetailedStats().then(stats => {
      sendResponse({ success: true, data: stats });
    }).catch(err => {
      sendResponse({ success: false, message: err.message });
    });
    return true;
  }
});

// ===== Statistics Calculation =====
async function getDetailedStats() {
  console.log('Calculating detailed stats...');
  const { dailyStats = {}, goals = {}, siteMetadata = {} } = await chrome.storage.local.get(['dailyStats', 'goals', 'siteMetadata']);
  const today = getYYYYMMDD();
  const currentMonth = today.substring(0, 7);
  const currentYear = today.substring(0, 4);
  const todayStats = dailyStats[today] || { domains: {}, hourly: Array(24).fill(0), visits: {}, totalTime: 0, sessionCount: 0 };

  function getStatsForPeriod(period) {
    const aggregated = { domains: {}, totalMinutes: 0, daysCount: 0 };
    let firstDate = null;
    for (const date in dailyStats) {
      if (date.startsWith(period)) {
        aggregated.daysCount++;
        if (!firstDate || date < firstDate) firstDate = date;
        const dayData = dailyStats[date];
        // totalTime이 있으면 사용, 없으면 domains 합계 사용
        const dayTotal = dayData.totalTime || Object.values(dayData.domains || {}).reduce((sum, time) => sum + time, 0);
        aggregated.totalMinutes += dayTotal;
        // 도메인별 집계도 유지
        for (const domain in dayData.domains) {
          const minutes = dayData.domains[domain];
          aggregated.domains[domain] = (aggregated.domains[domain] || 0) + minutes;
        }
      }
    }
    return { ...aggregated, firstDate };
  }

  // Daily Stats - 도메인별 시간을 모든 세션에서 집계
  const domainTotals = { ...todayStats.domains };
  
  // 오늘의 모든 세션에서 도메인별 시간 집계 (같은 사이트의 모든 세션 합산)
  const todaySessions = (await chrome.storage.local.get(['sessions'])).sessions || [];
  const todayKey = getYYYYMMDD();
  todaySessions.forEach(session => {
    if (session && session.domain && session.startTime) {
      const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
      if (sessionDate === todayKey && session.duration) {
        const sessionMinutes = session.duration / 60000;
        domainTotals[session.domain] = (domainTotals[session.domain] || 0) + sessionMinutes;
      }
    }
  });

  // totalTime 재계산
  const calculatedTotalTime = Object.values(domainTotals).reduce((sum, time) => sum + time, 0);

  const daily = {
    totalTime: calculatedTotalTime || todayStats.totalTime || 0,
    domains: domainTotals, // 집계된 도메인별 시간
    hourlyLabels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}`),
    hourlyData: todayStats.hourly.map(m => Math.round(m)),
    peakHour: findPeakHour(todayStats.hourly),
    sessionCount: todayStats.sessionCount || 0,
    domainCount: Object.keys(domainTotals).length
  };

  // Weekly comparison (last 7 days)
  const weeklyStats = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = getDateKey(date);
    const dayData = dailyStats[key];
    weeklyStats.push(dayData ? (dayData.totalTime || Object.values(dayData.domains || {}).reduce((sum, time) => sum + time, 0)) : 0);
  }
  daily.weeklyData = weeklyStats;
  daily.weeklyLabels = ['월', '화', '수', '목', '금', '토', '일'];

  // Monthly Stats - 주별 집계
  const monthlyAggregated = getStatsForPeriod(currentMonth);
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  
  // 주차별 집계 함수 (월 기준 주차 - 일요일 시작)
  const getWeekNumberInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // 해당 월의 1일
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0(일요일) ~ 6(토요일)
    
    // 1일이 속한 주의 일요일 날짜 계산
    // 일요일이면 1일, 월요일이면 -6일 전(이전 달), 화요일이면 -5일 전...
    const firstSunday = firstDayOfWeek === 0 ? 1 : 1 - firstDayOfWeek;
    
    // 현재 날짜가 속한 주의 일요일 날짜 계산
    const currentDayOfWeek = date.getDay();
    const currentSunday = day - currentDayOfWeek;
    
    // 주차 계산: (현재 주의 일요일 - 첫 주의 일요일) / 7 + 1
    // 음수나 0이 나올 수 있으므로 최소 1주차로 보정
    const weekNumber = Math.floor((currentSunday - firstSunday) / 7) + 1;
    
    return Math.max(1, weekNumber);
  };
  
  // 이번 달의 주차별 데이터 집계
  const weeklyData = {}; // { weekNumber: totalMinutes }
  const year = parseInt(currentMonth.substring(0, 4));
  const month = parseInt(currentMonth.substring(5, 7)) - 1; // 0-based
  
  // 이번 달의 모든 날짜를 주차별로 집계
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentMonth}-${String(day).padStart(2, '0')}`;
    const date = new Date(year, month, day);
    const weekNum = getWeekNumberInMonth(date);
    
    // 해당 날짜의 데이터가 있으면 주차별로 집계
    if (dailyStats[dateStr]) {
      const dayTotal = dailyStats[dateStr].totalTime || Object.values(dailyStats[dateStr].domains || {}).reduce((s, t) => s + t, 0);
      if (!weeklyData[weekNum]) {
        weeklyData[weekNum] = 0;
      }
      weeklyData[weekNum] += dayTotal;
    }
  }
  
  // 주차별 레이블과 데이터 생성
  const weekNumbers = Object.keys(weeklyData).map(Number).sort((a, b) => a - b);
  
  // 현재 날짜의 주차 계산
  const currentDate = new Date();
  const currentWeekNum = getWeekNumberInMonth(currentDate);
  
  // 최대 주차 계산 (데이터가 있으면 그 중 최대값, 없으면 현재 주차)
  const maxWeek = weekNumbers.length > 0 ? Math.max(...weekNumbers, currentWeekNum) : Math.max(currentWeekNum, 1);
  
  const trendLabels = [];
  const trendData = [];
  
  // 1주차부터 최대 주차까지 모든 주차 포함 (데이터가 없는 주차는 0으로)
  for (let week = 1; week <= maxWeek; week++) {
    trendLabels.push(`${week}주차`);
    trendData.push(Math.round(weeklyData[week] || 0));
  }
  
  console.log('월간 주별 집계:', weeklyData, '현재 주차:', currentWeekNum, '레이블:', trendLabels, '데이터:', trendData);
  
  const monthlyGoalDays = calculateGoalDays(currentMonth, dailyStats, goals);

  const monthly = {
    averageTime: monthlyAggregated.daysCount > 0 ? Math.round(monthlyAggregated.totalMinutes / monthlyAggregated.daysCount) : 0,
    goalDays: monthlyGoalDays,
    totalDays: daysInMonth,
    trendLabels: trendLabels,
    trendData: trendData,
  };

  // 년간 사용량 (월별)
  const yearlyAggregated = getStatsForPeriod(currentYear);
  const monthLabels = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const monthlyTotals = monthLabels.map((_, i) => {
    const monthStr = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
    const monthStats = getStatsForPeriod(monthStr);
    return Math.round(monthStats.totalMinutes);
  });
  const monthlyAverages = monthLabels.map((_, i) => {
    const monthStr = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
    const monthStats = getStatsForPeriod(monthStr);
    return monthStats.daysCount > 0 ? Math.round(monthStats.totalMinutes / monthStats.daysCount) : 0;
  });
  const peakMonthIndex = monthlyTotals.indexOf(Math.max(...monthlyTotals));

  const yearly = {
    totalTime: Math.round(yearlyAggregated.totalMinutes),
    peakMonth: monthLabels[peakMonthIndex] || 'N/A',
    dailyAverage: yearlyAggregated.daysCount > 0 ? Math.round(yearlyAggregated.totalMinutes / yearlyAggregated.daysCount) : 0,
    monthlyLabels: monthLabels,
    monthlyTotals: monthlyTotals,
    monthlyAverages: monthlyAverages
  };

  // Site Stats
  const allTimeDomainTotals = {};
  Object.values(dailyStats).forEach(day => {
    Object.entries(day.domains || {}).forEach(([domain, time]) => {
      allTimeDomainTotals[domain] = (allTimeDomainTotals[domain] || 0) + time;
    });
  });
  const sortedDomains = Object.entries(allTimeDomainTotals).sort(([, a], [, b]) => b - a);
  const topSites = sortedDomains.slice(0, 5);
  const categoryUsage = calculateCategoryUsage(allTimeDomainTotals, goals, siteMetadata);
  const siteAnalysis = calculateSiteAnalysis(todayStats.visits, allTimeDomainTotals, goals, siteMetadata);

  const sites = {
    topSitesLabels: topSites.map(([domain]) => domain),
    topSitesData: topSites.map(([, time]) => Math.round(time)),
    categoryLabels: Object.keys(categoryUsage),
    categoryData: Object.values(categoryUsage).map(t => Math.round(t)),
    analysisData: siteAnalysis
  };

  // Wellness Stats
  const totalScreenTimeToday = daily.totalTime;
  const productiveTimeToday = calculateProductiveTime(todayStats.domains, goals, siteMetadata);
  const consecutiveMinutes = Math.round(wellnessData.consecutiveMinutes);

  const wellness = {
    totalScreenTime: totalScreenTimeToday,
    productiveTime: productiveTimeToday,
    consecutiveHours: Math.floor(consecutiveMinutes / 60)
  };

  return {
    daily,
    monthly,
    yearly,
    sites,
    wellness,
    dailyStats, // 전체 dailyStats 포함 (통계 뷰에서 사용)
    monthlyAggregated // 월간 집계 데이터 (전체 통계에서 사용)
  };
}

// ===== Helper Functions =====
function findPeakHour(hourlyData) {
  if (!hourlyData || hourlyData.length === 0) return 'N/A';
  const maxUsage = Math.max(...hourlyData);
  const peakIndex = hourlyData.indexOf(maxUsage);
  return peakIndex !== -1 ? `${String(peakIndex).padStart(2, '0')}:00` : 'N/A';
}

function calculateGoalDays(monthStr, dailyStats, goals) {
  let count = 0;
  for (const date in dailyStats) {
    if (date.startsWith(monthStr)) {
      const dayData = dailyStats[date].domains;
      let goalMet = true;
      for (const domain in dayData) {
        if (goals[domain] && goals[domain].limit && dayData[domain] > goals[domain].limit) {
          goalMet = false;
          break;
        }
      }
      const hasRelevantGoal = Object.keys(dayData).some(domain => goals[domain] && goals[domain].limit);
      if (hasRelevantGoal && goalMet) {
        count++;
      }
    }
  }
  return count;
}

function calculateCategoryUsage(allTimeDomainTotals, goals, siteMetadata) {
  const usage = {};
  for (const domain in allTimeDomainTotals) {
    const category = (goals[domain] && goals[domain].category) || (siteMetadata[domain] && siteMetadata[domain].category) || 'other';
    usage[category] = (usage[category] || 0) + allTimeDomainTotals[domain];
  }
  return usage;
}

function calculateProductiveTime(domainTimes, goals, siteMetadata) {
  let productiveMinutes = 0;
  const productiveCategories = ['work', 'study'];
  for (const domain in domainTimes) {
    const category = (goals[domain] && goals[domain].category) || (siteMetadata[domain] && siteMetadata[domain].category);
    const isProductive = (siteMetadata[domain] && siteMetadata[domain].productive) || productiveCategories.includes(category);
    if (isProductive) {
      productiveMinutes += domainTimes[domain];
    }
  }
  return Math.round(productiveMinutes);
}

function calculateSiteAnalysis(visits = {}, allTimeDomainTotals, goals, siteMetadata) {
  const analysis = [];
  const domains = Object.keys(allTimeDomainTotals);
  domains.sort((a, b) => allTimeDomainTotals[b] - allTimeDomainTotals[a]);

  for (const domain of domains.slice(0, 20)) {
    const totalTime = Math.round(allTimeDomainTotals[domain] || 0);
    const visitCount = visits[domain] || 0;
    const productivityScore = calculateProductivityScore(domain, goals, siteMetadata);
    analysis.push({
      name: domain,
      totalTime: totalTime,
      visits: visitCount,
      productivityScore: productivityScore
    });
  }
  return analysis;
}

function calculateProductivityScore(domain, goals, siteMetadata) {
  const productiveCategories = ['work', 'study'];
  const category = (goals[domain] && goals[domain].category) || (siteMetadata[domain] && siteMetadata[domain].category);
  if ((siteMetadata[domain] && siteMetadata[domain].productive === true) || productiveCategories.includes(category)) {
    return 80;
  } else if ((siteMetadata[domain] && siteMetadata[domain].productive === false) || ['entertainment', 'social'].includes(category)) {
    return 20;
  }
  return 50;
}

// ===== Data Cleanup =====
// 저장소 크기 추정 (JSON 문자열 길이로 근사치 계산)
function estimateStorageSize(data) {
  return new Blob([JSON.stringify(data)]).size;
}

// 10MB 제한에 가까워지면 오래된 데이터부터 삭제
async function cleanupOldDataIfNeeded() {
  try {
    const allData = await chrome.storage.local.get(null);
    const currentSize = estimateStorageSize(allData);
    const maxSize = 9 * 1024 * 1024; // 9MB (10MB의 90%, 여유 공간 확보)
    
    if (currentSize < maxSize) {
      return; // 크기 제한 내에 있으면 정리 불필요
    }

    console.log(`Storage size: ${(currentSize / 1024 / 1024).toFixed(2)}MB, cleaning up old data...`);
    
    const dailyStats = allData.dailyStats || {};
    let sessions = allData.sessions || [];
    
    // 날짜별로 정렬 (오래된 것부터)
    const sortedDates = Object.keys(dailyStats).sort();
    
    let deletedDates = 0;
    let newSize = currentSize;
    
    // 오래된 dailyStats부터 삭제
    for (const dateKey of sortedDates) {
      if (newSize < maxSize) break;
      
      const dateData = dailyStats[dateKey];
      const dateSize = estimateStorageSize({ [dateKey]: dateData });
      delete dailyStats[dateKey];
      newSize -= dateSize;
      deletedDates++;
    }
    
    // 세션도 오래된 것부터 삭제 (날짜순 정렬)
    if (newSize >= maxSize && sessions.length > 0) {
      sessions.sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
      const sessionsToKeep = Math.floor(sessions.length * 0.8); // 최신 80%만 유지
      sessions = sessions.slice(-sessionsToKeep);
      newSize = estimateStorageSize({ ...allData, dailyStats, sessions });
    }
    
    // 데이터 저장
    await chrome.storage.local.set({ dailyStats, sessions });
    
    // 사용자에게 알림
    if (deletedDates > 0) {
      const notificationId = `storage-cleanup-${Date.now()}`;
      chrome.notifications.create(notificationId, {
        type: 'basic',
        iconUrl: 'images/icon128.png',
        title: 'Tab Timer - 저장소 정리',
        message: `저장소가 가득 차서 ${deletedDates}일치 오래된 데이터가 삭제되었습니다.`,
        buttons: [{ title: '확인' }]
      });
      
      // 5초 후 알림 자동 닫기
      setTimeout(() => {
        chrome.notifications.clear(notificationId);
      }, 5000);
    }
    
    console.log(`Cleanup complete. Deleted ${deletedDates} days of data. New size: ${(newSize / 1024 / 1024).toFixed(2)}MB`);
  } catch (error) {
    console.error('Error in cleanupOldDataIfNeeded:', error);
  }
}

// ===== Initialization =====
console.log('Tab Timer Background Script: Initializing...');
chrome.runtime.onInstalled.addListener(() => {
  console.log('Tab Timer: Extension installed, initializing storage...');
  initializeStorage();
});
chrome.runtime.onStartup.addListener(() => {
  console.log('Tab Timer: Browser startup, initializing storage...');
  initializeStorage();
});
initializeStorage();
console.log('Tab Timer Background Script: Initialized');

// Periodic storage check (once per day)
setInterval(() => {
  cleanupOldDataIfNeeded();
}, 24 * 60 * 60 * 1000);

// Initial storage check after 5 seconds
setTimeout(() => {
  cleanupOldDataIfNeeded();
}, 5000);

// Save on suspend
chrome.runtime.onSuspend.addListener(async () => {
  console.log('Extension suspending, saving current state...');
  if (currentTabInfo.tabId && currentTabInfo.domain && currentTabInfo.startTime) {
    await updateActiveTabTime();
  }
  if (currentSession) {
    endSession(currentSession);
  }
  stopTrackingUpdates();
});
