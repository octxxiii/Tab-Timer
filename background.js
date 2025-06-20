<<<<<<< HEAD
let tabData = {
  domains: {},      // 도메인별 상세 데이터
  daily: {},        // 일별 통계
  sessions: []      // 세션 정보
};
let currentSession = null;
=======
let tabTimes = {};
let currentTabInfo = {
  tabId: null,
  domain: null,
  startTime: null,
  consecutiveStartTime: null // For wellness tracking
};
>>>>>>> 50c445f804731a36dabad14ec59bddb6d0b7531e
let timeLimits = {};
let goals = {};
let notifications = {};
let lastNotificationTime = {};
let updateInterval;
let wellnessData = { consecutiveMinutes: 0 }; // Simple consecutive time tracking

// Date helper
function getYYYYMMDD(date = new Date()) {
  return date.toISOString().split('T')[0];
}

// Initialize storage
<<<<<<< HEAD
chrome.storage.local.get(['tabData', 'timeLimits'], (result) => {
  if (result.tabData) {
    tabData = result.tabData;
=======
async function initializeStorage() {
  const today = getYYYYMMDD();
  const result = await chrome.storage.local.get(['tabTimes', 'settings', 'goals', 'dailyStats', 'siteMetadata']);
  
  const initialData = {};
  if (!result.tabTimes) initialData.tabTimes = {};
  if (!result.settings) initialData.settings = { notifications: true };
  if (!result.goals) initialData.goals = {}; else goals = result.goals; // Load existing goals
  if (!result.dailyStats) initialData.dailyStats = {};
  if (!result.siteMetadata) initialData.siteMetadata = {}; // { domain: { category: '...', productive: true/false } }

  // Ensure today's entry exists in dailyStats
  if (!result.dailyStats || !result.dailyStats[today]) {
    const stats = result.dailyStats || {};
    stats[today] = { domains: {}, hourly: Array(24).fill(0), visits: {} }; // Add hourly array and visits
    initialData.dailyStats = stats;
>>>>>>> 50c445f804731a36dabad14ec59bddb6d0b7531e
  }

  if (Object.keys(initialData).length > 0) {
    await chrome.storage.local.set(initialData);
    console.log('Storage initialized:', initialData);
  }
  
  // Get current active tab on startup
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
    handleTabActivation(tabs[0].id, tabs[0].url);
  }
}

// Update current tab time and daily stats
async function updateActiveTabTime() {
  if (!currentTabInfo.tabId || !currentTabInfo.domain || !currentTabInfo.startTime) return;

    const now = Date.now();
  const timeSpent = now - currentTabInfo.startTime; // Milliseconds spent since last update/activation
  const minutesSpent = timeSpent / 60000;
  const currentHour = new Date().getHours();
  const today = getYYYYMMDD();

  if (timeSpent <= 0 || timeSpent >= 3600000) { // Ignore unreasonable values (e.g., >1 hour jump)
    currentTabInfo.startTime = now;
    if (!currentTabInfo.consecutiveStartTime) currentTabInfo.consecutiveStartTime = now;
    return;
  }

  // Update total time (optional, can be derived from daily)
  let { tabTimes = {}, dailyStats = {} } = await chrome.storage.local.get(['tabTimes', 'dailyStats']);
  tabTimes[currentTabInfo.domain] = (tabTimes[currentTabInfo.domain] || 0) + timeSpent;

  // Ensure today's stats exist
  if (!dailyStats[today]) {
      dailyStats[today] = { domains: {}, hourly: Array(24).fill(0), visits: {} };
  }
  if (!dailyStats[today].domains) dailyStats[today].domains = {};
  if (!dailyStats[today].hourly) dailyStats[today].hourly = Array(24).fill(0);
  if (!dailyStats[today].visits) dailyStats[today].visits = {};

  // Update daily domain time
  dailyStats[today].domains[currentTabInfo.domain] = (dailyStats[today].domains[currentTabInfo.domain] || 0) + minutesSpent;
  // Update hourly stats
  dailyStats[today].hourly[currentHour] = (dailyStats[today].hourly[currentHour] || 0) + minutesSpent;

  // Update wellness data (consecutive time)
  if (currentTabInfo.consecutiveStartTime) {
    wellnessData.consecutiveMinutes = (now - currentTabInfo.consecutiveStartTime) / 60000;
  } else {
    wellnessData.consecutiveMinutes = 0;
  }

  // Save updated data
  await chrome.storage.local.set({ tabTimes, dailyStats });

  // Update start time for next interval
  currentTabInfo.startTime = now;

  // Check time limit using goals
  checkTimeLimits(currentTabInfo.domain, dailyStats[today].domains[currentTabInfo.domain]);
}

// Check time limits based on goals
function checkTimeLimits(domain, dailyTotalMinutes) {
  if (goals[domain] && goals[domain].limit !== undefined) { // Check if limit is defined
      const limitInMinutes = goals[domain].limit;
      console.log(`[checkTimeLimits] Checking domain: ${domain}, Daily Time: ${dailyTotalMinutes.toFixed(1)}m, Limit: ${limitInMinutes}m`);
      if (dailyTotalMinutes > limitInMinutes) {
          console.log(`[checkTimeLimits] Limit EXCEEDED for ${domain}. Attempting notification.`);
          createNotification(domain, dailyTotalMinutes, limitInMinutes);
      } else {
          // console.log(`[checkTimeLimits] Limit OK for ${domain}.`);
      }
  } else {
      // console.log(`[checkTimeLimits] No limit set or applicable for domain: ${domain}`);
  }
}

// Start periodic updates (renamed)
function startTrackingUpdates() {
  stopTrackingUpdates(); // Clear existing interval
  if (currentTabInfo.domain) { // Only start if we have a valid domain
     console.log('Starting tracking for:', currentTabInfo.domain);
     if (!currentTabInfo.startTime) currentTabInfo.startTime = Date.now();
     if (!currentTabInfo.consecutiveStartTime) currentTabInfo.consecutiveStartTime = Date.now();
     updateInterval = setInterval(updateActiveTabTime, 5000); // Update every 5 seconds
  } else {
      console.log('No active domain, tracking paused.');
      wellnessData.consecutiveMinutes = 0; // Reset consecutive time if no active domain
  }
}

// Stop periodic updates (renamed)
function stopTrackingUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
    console.log('Tracking stopped.');
    // Optionally update time one last time when stopping
    // updateActiveTabTime(); 
  }
  // Reset start times when tracking stops
  // currentTabInfo.startTime = null;
  // currentTabInfo.consecutiveStartTime = null; 
}

// Helper function to safely parse URLs
function getRootDomain(url) {
  try {
<<<<<<< HEAD
    const urlObj = new URL(url);

    // Chrome 내부 페이지 제외
    if (urlObj.protocol === 'chrome:' ||
      urlObj.protocol === 'chrome-extension:' ||
      urlObj.protocol === 'edge:' ||
      urlObj.protocol === 'about:' ||
      urlObj.hostname === 'newtab') {
      return null;
    }

    const domain = urlObj.hostname;
    return domain.startsWith('www.') ? domain.substring(4) : domain;
=======
    if (!url || !url.startsWith('http')) { // Ignore chrome://, file:// etc.
      return null;
    }
    const urlObj = new URL(url);
    let domain = urlObj.hostname;
    // Basic cleaning (remove www.)
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    // Add more specific rules if needed (e.g., remove co.uk)
    return domain;
>>>>>>> 50c445f804731a36dabad14ec59bddb6d0b7531e
  } catch (e) {
    console.error('Error parsing URL:', url, e);
    return null;
  }
}

// Determine if a domain should be tracked
function isTrackableDomain(domain) {
  // Filter out internal Chrome pages or empty values
  return domain && !domain.startsWith('chrome.');
}

// Notification function remains largely the same, uses limit from checkTimeLimits
function shouldShowNotification(domain) {
  const now = Date.now();
  // Limit notifications to once every 5 minutes per domain
  return !lastNotificationTime[domain] || (now - lastNotificationTime[domain]) > 5 * 60 * 1000;
}

function createNotification(domain, timeSpentMinutes, limitMinutes) {
  const shouldShow = shouldShowNotification(domain);
  console.log(`[createNotification] Attempting for ${domain}. Should show? ${shouldShow}`);
  
  if (!shouldShow) return;

  const notificationId = `time-limit-${domain}-${Date.now()}`;
  const minutesSpent = Math.floor(timeSpentMinutes);
  const message = `You've spent ${minutesSpent} minutes on ${domain}. Your limit is ${limitMinutes} minutes.`;
  const options = {
    type: 'basic',
    iconUrl: 'images/icon128.png', // Ensure this path is correct
    title: 'Time Limit Alert',
    message: message,
    buttons: [
      { title: 'Dismiss' },
      { title: 'Add 15 Minutes' }
    ],
    requireInteraction: true,
    priority: 2
  };

<<<<<<< HEAD
// 날짜 포맷터
function getDateKey(date = new Date()) {
  return date.toISOString().split('T')[0];
}

// 주차 계산
function getWeekKey(date = new Date()) {
  const year = date.getFullYear();
  const firstDay = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.floor(dayOfYear / 7) + 1;
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

// 세션 생성
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

// 데이터 저장 최적화 (디바운싱)
let saveTimer = null;
function saveData() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    chrome.storage.local.set({ tabData });
  }, 1000); // 1초 디바운스
}

// 세션 종료 및 데이터 업데이트
function endSession(session) {
  if (!session || session.endTime) return;

  session.endTime = Date.now();
  session.duration = session.endTime - session.startTime;

  const dateKey = getDateKey();
  const weekKey = getWeekKey();
  const domain = session.domain;

  // 도메인별 데이터 초기화
  if (!tabData.domains[domain]) {
    tabData.domains[domain] = {
      totalTime: 0,
      daily: {},
      weekly: {},
      sessions: []
    };
  }

  // 일별 데이터 초기화
  if (!tabData.daily[dateKey]) {
    tabData.daily[dateKey] = {
      domains: {},
      totalTime: 0,
      sessionCount: 0
    };
  }

  // 도메인별 일별 데이터 초기화
  if (!tabData.daily[dateKey].domains[domain]) {
    tabData.daily[dateKey].domains[domain] = {
      time: 0,
      sessions: 0
    };
  }

  // 데이터 업데이트
  tabData.domains[domain].totalTime += session.duration;
  tabData.domains[domain].sessions.push(session);
  tabData.domains[domain].daily[dateKey] = (tabData.domains[domain].daily[dateKey] || 0) + session.duration;
  tabData.domains[domain].weekly[weekKey] = (tabData.domains[domain].weekly[weekKey] || 0) + session.duration;

  tabData.daily[dateKey].totalTime += session.duration;
  tabData.daily[dateKey].sessionCount += 1;
  tabData.daily[dateKey].domains[domain].time += session.duration;
  tabData.daily[dateKey].domains[domain].sessions += 1;

  tabData.sessions.push(session);

  // 시간 제한 체크
  const todayTime = tabData.domains[domain].daily[dateKey] || 0;
  if (timeLimits[domain] && todayTime > timeLimits[domain] * 60000) {
    createNotification(domain, todayTime);
  }

  // 저장 (디바운싱됨)
  saveData();
}

// 탭 변경 추적 개선
chrome.tabs.onActivated.addListener((activeInfo) => {
  // 이전 세션 종료
  if (currentSession) {
    endSession(currentSession);
  }

  // 새 탭 정보 가져오기
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      const domain = getRootDomain(tab.url);
      if (domain && !domain.startsWith('chrome')) {
        currentSession = createSession(domain, activeInfo.tabId);
      }
=======
  console.log(`[createNotification] Creating notification with ID: ${notificationId}, Options:`, options);
  
  chrome.notifications.create(notificationId, options, (createdNotificationId) => {
      if (chrome.runtime.lastError) {
          console.error(`[createNotification] Error creating notification: ${chrome.runtime.lastError.message}`);
      } else {
          console.log(`[createNotification] Notification created successfully: ${createdNotificationId}`);
          lastNotificationTime[domain] = Date.now();
          notifications[createdNotificationId] = { domain, limit: limitMinutes };
      }
  });
}

// Handle notification button clicks (adjust for new goal structure)
chrome.notifications.onButtonClicked.addListener(async (notificationId, buttonIndex) => {
  const notificationInfo = notifications[notificationId];
  if (!notificationInfo) return;

  if (buttonIndex === 1) { // "Add 15 Minutes" clicked
      const domain = notificationInfo.domain;
      if (goals[domain]) {
          goals[domain].limit = (goals[domain].limit || 0) + 15;
          await chrome.storage.local.set({ goals });
          console.log(`Added 15 minutes to limit for ${domain}. New limit: ${goals[domain].limit}`);
          // Reset last notification time to allow immediate next notification if still over limit
          // delete lastNotificationTime[domain]; 
      }
  }

  chrome.notifications.clear(notificationId);
  delete notifications[notificationId];
});

// ---- Tab Event Handlers ----

async function handleTabActivation(tabId, url) {
    // Update time for the previously active tab before switching
    if (currentTabInfo.tabId && currentTabInfo.tabId !== tabId) {
        await updateActiveTabTime();
    }

    const newDomain = getRootDomain(url);
    const today = getYYYYMMDD();

    if (isTrackableDomain(newDomain)) {
        if (newDomain !== currentTabInfo.domain) {
            console.log(`Switching active domain to: ${newDomain}`);
            // Different domain, reset consecutive time and start time
            currentTabInfo.domain = newDomain;
            currentTabInfo.tabId = tabId;
            currentTabInfo.startTime = Date.now();
            currentTabInfo.consecutiveStartTime = Date.now(); // Reset consecutive
            wellnessData.consecutiveMinutes = 0;

            // Increment visit count for the new domain today
            let { dailyStats = {} } = await chrome.storage.local.get(['dailyStats']);
            if (!dailyStats[today]) dailyStats[today] = { domains: {}, hourly: Array(24).fill(0), visits: {} };
            if (!dailyStats[today].visits) dailyStats[today].visits = {};
            dailyStats[today].visits[newDomain] = (dailyStats[today].visits[newDomain] || 0) + 1;
            await chrome.storage.local.set({ dailyStats });

        } else {
            // Same domain, just update tabId and ensure start time is set
            currentTabInfo.tabId = tabId;
            if (!currentTabInfo.startTime) currentTabInfo.startTime = Date.now();
            if (!currentTabInfo.consecutiveStartTime) currentTabInfo.consecutiveStartTime = Date.now(); // Ensure consecutive time starts
        }
        startTrackingUpdates(); // Start or restart tracking
    } else {
        console.log('New tab is not trackable (e.g., chrome://), pausing tracking.');
        // New tab is not trackable, stop tracking and reset consecutive time
        currentTabInfo.domain = null;
        currentTabInfo.tabId = tabId;
        currentTabInfo.startTime = null;
        currentTabInfo.consecutiveStartTime = null;
        wellnessData.consecutiveMinutes = 0;
        stopTrackingUpdates();
    }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        if (tab && tab.url) {
            handleTabActivation(activeInfo.tabId, tab.url);
        }
    } catch (error) {
        console.error('Error in onActivated:', error);
>>>>>>> 50c445f804731a36dabad14ec59bddb6d0b7531e
    }
});

<<<<<<< HEAD
// URL 업데이트 처리 개선
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && currentSession && tabId === currentSession.tabId) {
    // 현재 세션 종료
    endSession(currentSession);

    // 새 세션 시작
    const domain = getRootDomain(changeInfo.url);
    if (domain && !domain.startsWith('chrome')) {
      currentSession = createSession(domain, tabId);
    } else {
      currentSession = null;
    }
=======
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Ensure the change is relevant (URL changed) and the tab is active
    if (changeInfo.url && tab.active) {
        console.log(`URL changed for active tab ${tabId}: ${changeInfo.url}`);
        // Treat URL change like a new activation
        handleTabActivation(tabId, changeInfo.url);
    }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        // Lost focus - update time and stop tracking
        console.log('Window lost focus. Pausing tracking.');
        await updateActiveTabTime();
        stopTrackingUpdates();
        currentTabInfo.startTime = null; // Reset start time when focus lost
        currentTabInfo.consecutiveStartTime = null; // Reset consecutive time
        wellnessData.consecutiveMinutes = 0;
    } else {
        // Gained focus - find active tab and resume
        console.log('Window gained focus. Resuming tracking.');
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
            handleTabActivation(tabs[0].id, tabs[0].url);
        }
    }
});

// ---- Message Handling ----

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // console.log('Message received:', request); // Log all messages for debugging

  if (request.action === 'setTimeLimit') {
    // ... (existing setTimeLimit code) ...
    const domain = getRootDomain(request.website); // Use the helper to clean the domain
    if (domain) {
      // Load current goals, update, then save
      chrome.storage.local.get(['goals'], (result) => {
          let currentGoals = result.goals || {};
          currentGoals[domain] = {
            // Ensure limit is a number, default to 0 if invalid
            limit: Number.isFinite(parseInt(request.minutes)) ? parseInt(request.minutes) : 0,
            category: request.category || 'other', // Default category
            priority: request.priority || 'medium' // Default priority
          };
          goals = currentGoals; // Update in-memory goals as well
          chrome.storage.local.set({ goals: currentGoals }).then(() => {
            console.log('Goals updated:', currentGoals);
    sendResponse({ success: true });
          }).catch(err => {
              console.error('Error saving goals:', err);
              sendResponse({ success: false, message: err.message });
          });
      });
    } else {
        console.warn(`setTimeLimit failed for invalid website: ${request.website}`);
        sendResponse({ success: false, message: 'Invalid website URL provided.' });
    }
    return true; // Indicates asynchronous response is intended

  } else if (request.action === 'getDetailedStats') {
    // ... (existing getDetailedStats code) ...
    console.log('Received request for detailed stats.');
    getDetailedStats().then(stats => {
      // console.log('Sending detailed stats:', stats); // Log data being sent
      sendResponse({ success: true, data: stats });
    }).catch(err => {
        console.error('Error getting detailed stats:', err);
        sendResponse({ success: false, message: err.message });
    });
    return true; // Indicates asynchronous response

  } else if (request.type === 'updateUI') {
    // ... (existing updateUI code) ...
      sendResponse({ success: true, message: 'Background received UI update request.' });

  } else if (request.action === 'openPopup') {
      console.log("Received request to open popup.");
      // Use chrome.action API (Manifest V3) to programmatically open the popup
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
          console.warn("chrome.action.openPopup API is not available.");
          sendResponse({ success: false, message: 'API not available to open popup.' });
      }
      return true; // Indicates asynchronous response
  }
  // Add other message handlers if necessary

  // If message is not handled, returning true might cause issues if sendResponse is never called.
  // Consider returning false or undefined for unhandled messages.
  // return false; 
});

// --- Statistics Calculation --- (Needs implementation)

async function getDetailedStats() {
  console.log('Calculating detailed stats...');
  const { dailyStats = {}, goals = {}, siteMetadata = {} } = await chrome.storage.local.get(['dailyStats', 'goals', 'siteMetadata']);
  const today = getYYYYMMDD();
  const currentMonth = today.substring(0, 7);
  const currentYear = today.substring(0, 4);
  const todayStats = dailyStats[today] || { domains: {}, hourly: Array(24).fill(0), visits: {} };

  // --- Helper: Get data for a period ---
  function getStatsForPeriod(period) { // period = 'YYYY-MM-DD', 'YYYY-MM', or 'YYYY'
    const aggregated = { domains: {}, totalMinutes: 0, daysCount: 0 };
    let firstDate = null;
    for (const date in dailyStats) {
      if (date.startsWith(period)) {
        aggregated.daysCount++;
        if (!firstDate || date < firstDate) firstDate = date;
        const dayData = dailyStats[date];
        for (const domain in dayData.domains) {
          const minutes = dayData.domains[domain];
          aggregated.domains[domain] = (aggregated.domains[domain] || 0) + minutes;
          aggregated.totalMinutes += minutes;
        }
      }
    }
    return { ...aggregated, firstDate };
  }

  // --- Calculate Daily Stats ---
  const daily = {
    totalTime: Object.values(todayStats.domains).reduce((sum, time) => sum + time, 0),
    hourlyLabels: Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}`),
    hourlyData: todayStats.hourly.map(m => Math.round(m)),
    peakHour: findPeakHour(todayStats.hourly),
    // Weekly comparison (last 7 days vs previous 7 days)
    // ... (Implementation needs iteration over last 14 days of dailyStats)
    currentWeekData: [], // Placeholder
    previousWeekData: [], // Placeholder
    weeklyComparisonLabels: ['월', '화', '수', '목', '금', '토', '일'] // Placeholder
  };

  // --- Calculate Monthly Stats ---
  const monthlyAggregated = getStatsForPeriod(currentMonth);
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const trendLabels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}일`);
  const trendData = trendLabels.map(dayLabel => {
      const dayNum = parseInt(dayLabel.replace('일', ''));
      const dateStr = `${currentMonth}-${String(dayNum).padStart(2, '0')}`;
      if (dailyStats[dateStr]) {
          return Math.round(Object.values(dailyStats[dateStr].domains).reduce((s, t) => s + t, 0));
      } return 0;
  });
  // Goal days calculation needs iteration and comparison with goals
  const monthlyGoalDays = calculateGoalDays(currentMonth, dailyStats, goals);

  const monthly = {
    averageTime: monthlyAggregated.daysCount > 0 ? Math.round(monthlyAggregated.totalMinutes / monthlyAggregated.daysCount) : 0,
    goalDays: monthlyGoalDays,
    totalDays: daysInMonth,
    trendLabels: trendLabels,
    trendData: trendData,
  };

  // --- Calculate Yearly Stats ---
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
      peakMonth: monthLabels[peakMonthIndex],
      dailyAverage: yearlyAggregated.daysCount > 0 ? Math.round(yearlyAggregated.totalMinutes / yearlyAggregated.daysCount) : 0,
      monthlyLabels: monthLabels,
      monthlyTotals: monthlyTotals,
      monthlyAverages: monthlyAverages
  };

  // --- Calculate Site Stats ---
  // Combine all time data (or use tabTimes for simplicity)
  const allTimeDomainTotals = {}; 
  Object.values(dailyStats).forEach(day => {
      Object.entries(day.domains).forEach(([domain, time]) => {
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

  // --- Calculate Wellness Stats ---
  // Basic calculation, needs refinement based on productive time definition
  const totalScreenTimeToday = daily.totalTime;
  // Productive time needs category/metadata info
  const productiveTimeToday = calculateProductiveTime(todayStats.domains, goals, siteMetadata);
  const consecutiveMinutes = Math.round(wellnessData.consecutiveMinutes);

  const wellness = {
      totalScreenTime: totalScreenTimeToday,
      productiveTime: productiveTimeToday,
      consecutiveHours: Math.floor(consecutiveMinutes / 60) // Use current session's consecutive time
  };

  return {
    daily,
    monthly,
    yearly,
    sites,
    wellness
  };
}

// --- Helper functions for stats calc ---
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
            let dailyTotal = 0;
            let goalMet = true; // Assume met until proven otherwise
            for (const domain in dayData) {
                dailyTotal += dayData[domain];
                if (goals[domain] && goals[domain].limit && dayData[domain] > goals[domain].limit) {
                    goalMet = false;
                    // Break inner loop if one goal is missed for the day?
                    // Depends on definition: Is it *all* goals met or *any* goal met?
                    // Assuming *all* goals must be met for the day to count.
                    break; 
                }
            }
            // Check if *any* goal exists for the day before incrementing?
            // Let's count if at least one goal was set for a site visited that day.
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
    const productiveCategories = ['work', 'study']; // Define productive categories
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
    const domains = Object.keys(allTimeDomainTotals); // Or use domains visited today?
    domains.sort((a, b) => allTimeDomainTotals[b] - allTimeDomainTotals[a]); // Sort by total time
    
    for (const domain of domains.slice(0, 20)) { // Limit analysis table size
        const totalTime = Math.round(allTimeDomainTotals[domain] || 0);
        const visitCount = visits[domain] || 0; // Using today's visits for simplicity
        const productivityScore = calculateProductivityScore(domain, goals, siteMetadata); // Needs definition
        analysis.push({
            name: domain,
            totalTime: totalTime,
            visits: visitCount, 
            // avgTime calculation needs proper visit tracking (total time / visits)
            productivityScore: productivityScore
        });
    }
    return analysis;
}

function calculateProductivityScore(domain, goals, siteMetadata) {
    // Placeholder: Score based on category or explicit metadata
    const productiveCategories = ['work', 'study'];
    const category = (goals[domain] && goals[domain].category) || (siteMetadata[domain] && siteMetadata[domain].category);
    if ((siteMetadata[domain] && siteMetadata[domain].productive === true) || productiveCategories.includes(category)) {
        return 80; // Example score
    } else if ((siteMetadata[domain] && siteMetadata[domain].productive === false) || ['entertainment', 'social'].includes(category)){
        return 20; // Example score
    }
    return 50; // Neutral default
}

// Initialize on install/update/startup
chrome.runtime.onInstalled.addListener(initializeStorage);
chrome.runtime.onStartup.addListener(initializeStorage);

// Initial call in case startup event doesn't fire reliably
initializeStorage();

// Add cleanup logic for old dailyStats data (optional)
// function cleanupOldData() { ... } 

// 일간/주간 통계 데이터 업데이트
async function updateStatistics(domain, time) {
  try {
    const stats = await new Promise((resolve) => {
      chrome.storage.local.get(['dailyStats', 'weeklyStats', 'lastUpdate'], resolve);
    });

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentWeek = getWeekNumber(now);
    
    // 일간 통계 업데이트
    const dailyStats = stats.dailyStats || {};
    if (!dailyStats[today]) {
      dailyStats[today] = {};
    }
    dailyStats[today][domain] = (dailyStats[today][domain] || 0) + time;

    // 주간 통계 업데이트
    const weeklyStats = stats.weeklyStats || {};
    if (!weeklyStats[currentWeek]) {
      weeklyStats[currentWeek] = {};
    }
    weeklyStats[currentWeek][domain] = (weeklyStats[currentWeek][domain] || 0) + time;

    // 오래된 데이터 정리
    cleanupOldData(dailyStats, weeklyStats);

    // 저장
    await chrome.storage.local.set({
      dailyStats,
      weeklyStats,
      lastUpdate: now.getTime()
    });
  } catch (error) {
    console.error('Error updating statistics:', error);
>>>>>>> 50c445f804731a36dabad14ec59bddb6d0b7531e
  }
}

<<<<<<< HEAD
// 데이터 정리 함수 (오래된 세션 제거)
function cleanupOldData() {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

  // 오래된 세션 제거 (최대 1000개 세션만 유지)
  if (tabData.sessions.length > 1000) {
    tabData.sessions = tabData.sessions
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, 1000);
  }

  // 30일이 지난 세션 제거
  tabData.sessions = tabData.sessions.filter(session =>
    session.startTime > thirtyDaysAgo
  );

  // 도메인별 세션도 정리
  Object.keys(tabData.domains).forEach(domain => {
    if (tabData.domains[domain].sessions.length > 100) {
      tabData.domains[domain].sessions = tabData.domains[domain].sessions
        .sort((a, b) => b.startTime - a.startTime)
        .slice(0, 100);
    }

    tabData.domains[domain].sessions = tabData.domains[domain].sessions.filter(
      session => session.startTime > sevenDaysAgo
    );

    // 세션이 없는 도메인 제거
    if (tabData.domains[domain].sessions.length === 0 &&
      tabData.domains[domain].totalTime === 0) {
      delete tabData.domains[domain];
    }
  });

  // 오래된 일별 데이터 제거
  const cutoffDate = new Date(thirtyDaysAgo);
  const cutoffKey = getDateKey(cutoffDate);

  Object.keys(tabData.daily).forEach(dateKey => {
    if (dateKey < cutoffKey) {
      delete tabData.daily[dateKey];
    }
  });

  saveData();
}
=======
// 주차 계산 함수
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${weekNo}`;
}

// 오래된 데이터 정리
function cleanupOldData(dailyStats, weeklyStats) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const twelveWeeksAgo = new Date(now.getTime() - (12 * 7 * 24 * 60 * 60 * 1000));
>>>>>>> 50c445f804731a36dabad14ec59bddb6d0b7531e

  // 30일 이상 된 일간 데이터 삭제
  Object.keys(dailyStats).forEach(date => {
    if (new Date(date) < thirtyDaysAgo) {
      delete dailyStats[date];
    }
  });

<<<<<<< HEAD
// 메시지 리스너 개선
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getDetailedStats':
      const dateKey = getDateKey();
      const weekKey = getWeekKey();

      // 오늘의 통계
      const todayStats = tabData.daily[dateKey] || { domains: {}, totalTime: 0 };

      // 주간 통계 계산
      const weeklyStats = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = getDateKey(date);
        const dayData = tabData.daily[key];
        weeklyStats.push(dayData ? dayData.totalTime : 0);
      }

      sendResponse({
        today: todayStats,
        weekly: weeklyStats,
        domains: tabData.domains
      });
      break;

    case 'setTimeLimit':
      if (request.domain) {
        timeLimits[request.domain] = request.minutes;
      } else {
        // 전역 시간 제한
        timeLimits['_global'] = request.minutes;
      }
      chrome.storage.local.set({ timeLimits });
      sendResponse({ success: true });
      break;

    case 'getTimeLimit':
      sendResponse({
        limits: timeLimits,
        usage: tabData.domains
      });
      break;

    case 'exportData':
      sendResponse({
        tabData: tabData,
        exportDate: new Date().toISOString()
      });
      break;

    default:
      // 기존 메시지 처리 유지
      if (request.action === 'checkTimeLimit') {
        if (timeLimit && timeLimitStart) {
          const elapsedMinutes = Math.floor((Date.now() - timeLimitStart) / 60000);
          const remainingMinutes = timeLimit - elapsedMinutes;
          sendResponse({ remaining: remainingMinutes });
        } else {
          sendResponse({ remaining: null });
        }
      }
  }

  return true; // 비동기 응답 허용
});

// 외부 웹사이트(대시보드)에서의 메시지 처리
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
  // 보안: 승인된 도메인에서만 메시지 허용
  const allowedOrigins = [
    'https://octxxiii.github.io',
    'http://localhost'
  ];

  const senderOrigin = new URL(sender.url).origin;
  const isAllowed = allowedOrigins.some(origin => senderOrigin.startsWith(origin));

  if (!isAllowed) {
    sendResponse({ error: '권한이 없는 도메인입니다.' });
    return;
  }

  // 내부 메시지 핸들러와 동일한 로직 사용
  switch (request.action) {
    case 'getDetailedStats':
      const dateKey = getDateKey();
      const weekKey = getWeekKey();

      // 오늘의 통계
      const todayStats = tabData.daily[dateKey] || { domains: {}, totalTime: 0 };

      // 주간 통계 계산
      const weeklyStats = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = getDateKey(date);
        const dayData = tabData.daily[key];
        weeklyStats.push(dayData ? dayData.totalTime : 0);
      }

      sendResponse({
        today: todayStats,
        weekly: weeklyStats,
        domains: tabData.domains,
        daily: tabData.daily
      });
      break;

    case 'setTimeLimit':
      if (request.domain) {
        timeLimits[request.domain] = request.minutes;
      } else {
        // 전역 시간 제한
        timeLimits['_global'] = request.minutes;
      }
      chrome.storage.local.set({ timeLimits });
      sendResponse({ success: true });
      break;

    case 'getTimeLimit':
      sendResponse({
        limits: timeLimits,
        usage: tabData.domains
      });
      break;

    case 'exportData':
      sendResponse({
        tabData: tabData,
        exportDate: new Date().toISOString()
      });
      break;

    default:
      sendResponse({ error: '알 수 없는 액션입니다.' });
  }

  return true; // 비동기 응답 허용
});

// 주기적인 데이터 정리 실행 (하루에 한 번)
setInterval(() => {
  cleanupOldData();
}, 24 * 60 * 60 * 1000);

// 초기 정리 실행
setTimeout(() => {
  cleanupOldData();
}, 5000); // 5초 후 실행

// 브라우저 종료 시 현재 세션 저장
chrome.runtime.onSuspend.addListener(() => {
  if (currentSession) {
    endSession(currentSession);
  }
  // 즉시 저장
  chrome.storage.local.set({ tabData });
});

// 윈도우 포커스 변경 감지 (선택사항)
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // 브라우저가 포커스를 잃음 - 현재 세션 일시 정지
    if (currentSession && !currentSession.paused) {
      currentSession.pausedAt = Date.now();
      currentSession.paused = true;
    }
  } else {
    // 브라우저가 포커스를 받음 - 세션 재개
    if (currentSession && currentSession.paused) {
      const pauseDuration = Date.now() - currentSession.pausedAt;
      currentSession.startTime += pauseDuration; // 일시정지 시간만큼 시작 시간 조정
      currentSession.paused = false;
      delete currentSession.pausedAt;
    }
=======
  // 12주 이상 된 주간 데이터 삭제
  Object.keys(weeklyStats).forEach(week => {
    const [year, weekNum] = week.split('-W');
    const weekDate = getDateOfWeek(parseInt(weekNum), parseInt(year));
    if (weekDate < twelveWeeksAgo) {
      delete weeklyStats[week];
    }
  });
}

// 주차의 시작 날짜 계산
function getDateOfWeek(week, year) {
  const date = new Date(year, 0, 1 + (week - 1) * 7);
  date.setDate(date.getDate() - date.getDay() + 1);
  return date;
}

// 탭 시간 업데이트 시 통계도 함께 업데이트
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    const domain = getRootDomain(tab.url);
    
    if (domain && isTrackableDomain(domain)) {
      const data = await new Promise((resolve) => {
        chrome.storage.local.get(['tabTimes'], resolve);
      });
      
      const tabTimes = data.tabTimes || {};
      const previousTime = tabTimes[domain] || 0;
      const timeSpent = Date.now() - (lastActiveTime || Date.now());
      
      if (timeSpent > 0 && timeSpent < 24 * 60 * 60 * 1000) { // 하루 이내의 시간만 기록
        await updateStatistics(domain, timeSpent);
      }
    }
  } catch (error) {
    console.error('Error in tab activation handler:', error);
>>>>>>> 50c445f804731a36dabad14ec59bddb6d0b7531e
  }
}); 