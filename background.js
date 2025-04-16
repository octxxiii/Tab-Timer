let tabTimes = {};
let currentTabInfo = {
  tabId: null,
  domain: null,
  startTime: null,
  consecutiveStartTime: null // For wellness tracking
};
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
  if (goals[domain] && goals[domain].limit) {
      const limitInMinutes = goals[domain].limit;
      if (dailyTotalMinutes > limitInMinutes) {
          createNotification(domain, dailyTotalMinutes, limitInMinutes);
      }
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
  } catch (e) {
    console.error('Error parsing URL:', url, e);
    return null;
  }
}

// Notification function remains largely the same, uses limit from checkTimeLimits
function shouldShowNotification(domain) {
  const now = Date.now();
  // Limit notifications to once every 5 minutes per domain
  return !lastNotificationTime[domain] || (now - lastNotificationTime[domain]) > 5 * 60 * 1000;
}

function createNotification(domain, timeSpentMinutes, limitMinutes) {
  if (!shouldShowNotification(domain)) return;

  const notificationId = `time-limit-${domain}-${Date.now()}`;
  const minutesSpent = Math.floor(timeSpentMinutes);
  const message = `You've spent ${minutesSpent} minutes on ${domain}. Your limit is ${limitMinutes} minutes.`;
  
  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: 'images/icon128.png',
    title: 'Time Limit Alert',
    message: message,
    buttons: [
      { title: 'Dismiss' },
      { title: 'Add 15 Minutes' } // Changed label
    ],
    requireInteraction: true,
    priority: 2
  });

  lastNotificationTime[domain] = Date.now();
  notifications[notificationId] = { domain, limit: limitMinutes }; // Store limit used for notification
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

    if (newDomain) {
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
    }
});

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