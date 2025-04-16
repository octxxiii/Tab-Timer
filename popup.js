document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 참조
  const elements = {
    tabList: document.getElementById('tabsList'),
    totalTime: document.getElementById('totalTime'),
    mostUsed: document.getElementById('mostUsed'),
    showMore: document.getElementById('showMore'),
    limitType: document.getElementById('limitType'),
    siteUrl: document.getElementById('siteUrl'),
    timeLimitMinutes: document.getElementById('timeLimitMinutes'),
    setTimeLimit: document.getElementById('setTimeLimit'),
    limitsList: document.getElementById('limitsList'),
    currentLimit: document.getElementById('currentLimit'),
    openDashboardButton: document.getElementById('openDashboardButton')
  };

  // Check for required elements and handle missing ones gracefully
  const requiredElements = ['tabList', 'totalTime', 'mostUsed', 'showMore', 'limitsList', 'openDashboardButton'];
  let missingElements = false;
  
  requiredElements.forEach(elementId => {
    if (!elements[elementId]) {
      console.error(`Required element "${elementId}" not found in the DOM`);
      missingElements = true;
    }
  });

  if (missingElements) {
    console.warn('Some required elements are missing. Some features may not work properly.');
    return; // Exit early if required elements are missing
  }

  let isShowingAll = false;
  let currentTabs = {};
  let startTimes = {};
  let timerStartTimes = {}; // Store timer start times separately from tab times
  let updateInterval = null;
  let countdownIntervals = {};

  // Get root domain from URL
  function getRootDomain(url) {
    try {
      if (!url) return '';
      const domain = new URL(url).hostname;
      return domain.startsWith('www.') ? domain.substring(4) : domain;
    } catch (e) {
      console.error('Error parsing URL:', e);
      return '';
    }
  }

  // Format time with error handling
  function formatTime(ms) {
    try {
      if (typeof ms !== 'number' || isNaN(ms)) {
        console.warn('Invalid time value:', ms);
        return '0h 0m 0s';
      }
      const seconds = Math.floor(ms / 1000) % 60;
      const minutes = Math.floor(ms / 60000) % 60;
      const hours = Math.floor(ms / 3600000);
      return `${hours}h ${minutes}m ${seconds}s`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '0h 0m 0s';
    }
  }

  function createTabItem(domain, time) {
    const tabItem = document.createElement('div');
    tabItem.className = 'tab-item';
    
    const domainSpan = document.createElement('span');
    domainSpan.className = 'domain';
    domainSpan.title = domain;
    domainSpan.textContent = domain;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'time';
    timeSpan.textContent = formatTime(time);

    tabItem.appendChild(domainSpan);
    tabItem.appendChild(timeSpan);
    
    return tabItem;
  }

  function createLimitItem(site, limit) {
    const limitItem = document.createElement('div');
    limitItem.className = 'limit-item';
    
    const siteSpan = document.createElement('span');
    siteSpan.textContent = site;

    const timeSpan = document.createElement('span');
    timeSpan.setAttribute('data-domain', site);
    timeSpan.setAttribute('data-limit', limit);
    timeSpan.textContent = formatTime(limit);

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-limit-btn';
    removeButton.textContent = 'Remove';
    removeButton.dataset.site = site;
    
    removeButton.addEventListener('click', () => {
      if (typeof removeLimit === 'function') {
        // Clear the countdown interval when removing
        if (countdownIntervals[site]) {
          clearInterval(countdownIntervals[site]);
          delete countdownIntervals[site];
        }
        removeLimit(site);
      }
    });

    limitItem.appendChild(siteSpan);
    limitItem.appendChild(timeSpan);
    limitItem.appendChild(removeButton);

    // Start countdown for this item
    startCountdown(site, limit);
    
    return limitItem;
  }

  function startCountdown(site, initialLimit) {
    // Clear existing interval if any
    if (countdownIntervals[site]) {
      clearInterval(countdownIntervals[site]);
    }

    const startTime = Date.now();
    
    countdownIntervals[site] = setInterval(() => {
      const timeSpan = document.querySelector(`.limit-item span[data-domain="${site}"]`);
      if (!timeSpan) {
        clearInterval(countdownIntervals[site]);
        delete countdownIntervals[site];
        return;
      }

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, initialLimit - elapsed);
      
      timeSpan.textContent = formatTime(remaining);

      // If time is up
      if (remaining <= 0) {
        clearInterval(countdownIntervals[site]);
        delete countdownIntervals[site];
        
        // Notify background script
        chrome.runtime.sendMessage({
          type: 'timeLimitReached',
          domain: site
        });
      }
    }, 1000);
  }

  // Update time in real-time
  function startRealtimeUpdates() {
    if (updateInterval) {
      clearInterval(updateInterval);
    }

    // Store initial times
    chrome.storage.local.get(['tabTimes', 'timeLimits', 'timerStartTimes'], (result) => {
      currentTabs = result.tabTimes || {};
      const timeLimits = result.timeLimits || {};
      timerStartTimes = result.timerStartTimes || {};
      
      // Initialize start times for tabs
      Object.keys(currentTabs).forEach(domain => {
        startTimes[domain] = Date.now();
      });

      // Initialize timer start times for new limits
      Object.keys(timeLimits).forEach(domain => {
        if (!timerStartTimes[domain]) {
          timerStartTimes[domain] = Date.now();
        }
      });

      // Save timer start times
      chrome.storage.local.set({ timerStartTimes });

      // Update times every second
      updateInterval = setInterval(() => {
        const now = Date.now();
        
        // Update each active tab's time
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            const domain = getRootDomain(tabs[0].url);
            if (domain) {
              // Update tab time if exists
              if (currentTabs[domain] !== undefined) {
                const elapsed = now - (startTimes[domain] || now);
                const timeElement = document.querySelector(`.tab-item .domain[title="${domain}"]`)?.nextElementSibling;
                if (timeElement) {
                  const totalTime = currentTabs[domain] + elapsed;
                  timeElement.textContent = formatTime(totalTime);
                  
                  // Update total time
                  const allTimes = Object.values(currentTabs).reduce((sum, time) => sum + time, 0) + elapsed;
                  elements.totalTime.textContent = formatTime(allTimes);
                }
              }

              // Update all time limits
              Object.entries(timeLimits).forEach(([limitDomain, limitValue]) => {
                const limitItem = document.querySelector(`.limit-item span[data-domain="${limitDomain}"]`);
                if (limitItem) {
                  const timerElapsed = now - (timerStartTimes[limitDomain] || now);
                  const remainingTime = Math.max(0, limitValue - timerElapsed);
                  limitItem.textContent = formatTime(remainingTime);

                  // Alert when time limit is reached
                  if (remainingTime === 0) {
                    chrome.runtime.sendMessage({
                      type: 'timeLimitReached',
                      domain: limitDomain
                    });
                  }
                }
              });
            }
          }
        });
      }, 1000);
    });
  }

  // Update UI with error handling
  async function updateUI() {
    try {
      console.log('Updating UI...');
      
      const result = await new Promise((resolve) => {
        chrome.storage.local.get(['tabTimes'], resolve);
      });

      currentTabs = result.tabTimes || {};
      // Reset start times when UI updates
      Object.keys(currentTabs).forEach(domain => {
        startTimes[domain] = Date.now();
      });

      const tabs = result.tabTimes || {};
      console.log('Current tabs data:', tabs);

      if (!elements.tabList) {
        throw new Error('tabList element not found');
      }

      elements.tabList.innerHTML = '';
      
      const sortedTabs = Object.entries(tabs)
        .sort(([, a], [, b]) => b - a);

      console.log('Sorted tabs:', sortedTabs);

      function updateTabDisplay() {
        if (!elements.tabList || !elements.showMore) return;

        const displayCount = isShowingAll ? sortedTabs.length : 3;
        elements.tabList.innerHTML = '';
        
        if (sortedTabs.length === 0) {
          const emptyMessage = document.createElement('div');
          emptyMessage.className = 'tab-item';
          emptyMessage.textContent = 'No tracking data available';
          elements.tabList.appendChild(emptyMessage);
          elements.showMore.style.display = 'none';
          return;
        }
        
        sortedTabs.slice(0, displayCount).forEach(([domain, time]) => {
          elements.tabList.appendChild(createTabItem(domain, time));
        });

        elements.showMore.style.display = sortedTabs.length > 3 ? 'block' : 'none';
        elements.showMore.textContent = isShowingAll ? 'Show Less' : 'Show More';
      }

      // Remove existing event listener if any
      const oldListener = elements.showMore.onclick;
      if (oldListener) {
        elements.showMore.removeEventListener('click', oldListener);
      }

      // Add new event listener
      elements.showMore.addEventListener('click', () => {
        isShowingAll = !isShowingAll;
        updateTabDisplay();
      });

      updateTabDisplay();
      
      // Update total time and most used site
      const totalTime = Object.values(tabs).reduce((sum, time) => sum + time, 0);
      elements.totalTime.textContent = formatTime(totalTime);
      
      if (sortedTabs.length > 0) {
        elements.mostUsed.textContent = sortedTabs[0][0];
      }
      
      console.log('UI update completed');
    } catch (error) {
      console.error('Error updating UI:', error);
      if (elements.tabList) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = 'Error loading tracking data. Please try again.';
        elements.tabList.appendChild(errorDiv);
      }
    }
  }

  // Storage change listener
  const storageChangeHandler = (changes) => {
    console.log('Storage changed:', changes);
    if (changes.tabTimes) {
      console.log('Tab times changed:', changes.tabTimes);
      updateUI();
    }
    if (changes.timeLimits) {
      updateCurrentLimit();
    }
  };

  // Remove existing listeners if any
  chrome.storage.onChanged.removeListener(storageChangeHandler);
  
  // Add new listener
  chrome.storage.onChanged.addListener(storageChangeHandler);

  // Message listener for real-time updates
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message:', message);
    if (message.type === 'updateUI') {
  updateUI();
      sendResponse({ success: true });
    }
    return true; // Keep the message channel open for async response
  });

  // Time limit type change handler
  elements.limitType.addEventListener('change', () => {
    elements.siteUrl.classList.toggle('hidden', elements.limitType.value === 'current');
  });

  // Set time limit handler
  elements.setTimeLimit.addEventListener('click', () => {
    const minutes = parseInt(elements.timeLimitMinutes.value);
    if (isNaN(minutes) || minutes < 1) {
      alert('Please enter a valid number of minutes');
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const site = elements.limitType.value === 'current' 
        ? getRootDomain(tabs[0].url)
        : elements.siteUrl.value.trim();

      if (!site) {
        alert('Please enter a valid site URL');
          return;
      }

      const timeLimit = minutes * 60 * 1000; // Convert to milliseconds

        chrome.storage.local.get(['timeLimits'], (result) => {
          const timeLimits = result.timeLimits || {};
        timeLimits[site] = timeLimit;
          
          chrome.storage.local.set({ timeLimits }, () => {
          console.log('Time limit saved:', { site, timeLimit });
          updateCurrentLimit();
          elements.timeLimitMinutes.value = '';
          elements.siteUrl.value = '';
        });
      });
    });
  });

  // Update current limit display
  function updateCurrentLimit() {
    if (!elements.limitsList) return;
    
    chrome.storage.local.get(['timeLimits'], (result) => {
      const timeLimits = result.timeLimits || {};
      elements.limitsList.innerHTML = '';
      
      // Clear all existing intervals
      Object.keys(countdownIntervals).forEach(site => {
        clearInterval(countdownIntervals[site]);
        delete countdownIntervals[site];
      });
      
      Object.entries(timeLimits).forEach(([site, limit]) => {
        elements.limitsList.appendChild(createLimitItem(site, limit));
      });
    });
  }

  // Remove time limit
  function removeLimit(site) {
    chrome.storage.local.get(['timeLimits', 'timerStartTimes'], (result) => {
      const timeLimits = result.timeLimits || {};
      const timerStartTimes = result.timerStartTimes || {};
      
      delete timeLimits[site];
      delete timerStartTimes[site];
      
      chrome.storage.local.set({ 
        timeLimits,
        timerStartTimes 
      }, () => {
        updateCurrentLimit();
      });
    });
  }

  // Message handling with proper origin checking
  window.addEventListener('message', async (event) => {
    try {
      // Allow messages from naver.com and its subdomains
      const allowedOrigins = [
        'https://www.naver.com',
        'https://shopsquare.naver.com',
        'https://recoshopping.naver.com'
      ];
      
      if (!allowedOrigins.includes(event.origin)) {
        console.warn('Received message from untrusted origin:', event.origin);
        return;
      }

      const { type, data } = event.data;
      
      switch (type) {
        case 'UPDATE_TIME':
          await updateTimeDisplay(data);
          break;
        case 'UPDATE_LIMIT':
          await updateTimeLimit(data);
          break;
        default:
          console.log('Unknown message type:', type);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  // Updated sendMessage function with proper origin targeting
  function sendMessage(type, data, targetOrigin) {
    try {
      // If no specific target origin is provided, default to current origin
      const origin = targetOrigin || window.location.origin;
      
      // Get the target window
      const targetWindow = window.parent || window.opener || window;
      
      // Send message with proper origin
      targetWindow.postMessage({ type, data }, origin);
    } catch (error) {
      console.error('Error sending message:', error, 'to origin:', targetOrigin);
    }
  }

  // Update time display with error handling
  async function updateTimeDisplay(data) {
    try {
      const { tabId, time } = data;
      const timeElement = document.querySelector(`[data-tab-id="${tabId}"]`);
      if (timeElement) {
        timeElement.textContent = formatTime(time);
      }
    } catch (error) {
      console.error('Error updating time display:', error);
    }
  }

  // Update time limit with error handling
  async function updateTimeLimit(data) {
    try {
      const { domain, limit } = data;
      const limitElement = document.querySelector(`[data-domain="${domain}"]`);
      if (limitElement) {
        limitElement.textContent = formatTime(limit);
      }
    } catch (error) {
      console.error('Error updating time limit:', error);
    }
  }

  // Cleanup on popup close
  window.addEventListener('unload', () => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
    Object.values(countdownIntervals).forEach(interval => {
      clearInterval(interval);
    });
    countdownIntervals = {};
  });

  // Initial UI update and start real-time updates
  updateUI().then(() => {
    startRealtimeUpdates();
  updateCurrentLimit();
  });

  // 대시보드로 데이터 전송하는 함수
  async function sendDataToDashboard() {
    try {
      const data = await new Promise((resolve) => {
        chrome.storage.local.get(['tabTimes', 'dailyStats', 'weeklyStats', 'timeLimits'], resolve);
      });

      // 디지털 웰빙 점수 계산
      const totalUsageTime = Object.values(data.tabTimes || {}).reduce((sum, time) => sum + time, 0);
      const productivityScore = calculateProductivityScore(data.tabTimes || {});
      const stressLevel = calculateStressLevel(totalUsageTime);
      const detoxScore = calculateDetoxScore(totalUsageTime);

      const dashboardData = {
        type: 'TAB_TIMER_DATA',
        data: {
          dailyStats: data.dailyStats || {},
          weeklyStats: data.weeklyStats || {},
          timeLimits: data.timeLimits || {},
          wellbeingMetrics: {
            detoxScore,
            productivityScore,
            stressLevel
          }
        }
      };

      // postMessage를 통해 대시보드로 데이터 전송
      window.localStorage.setItem('tabTimerData', JSON.stringify(dashboardData));
    } catch (error) {
      console.error('Error sending data to dashboard:', error);
    }
  }

  // 생산성 점수 계산 (0-100)
  function calculateProductivityScore(tabTimes) {
    const productiveDomainsRegex = /^(github\.com|docs\.google\.com|notion\.so|stackoverflow\.com)$/i;
    const distractingDomainsRegex = /^(youtube\.com|facebook\.com|twitter\.com|instagram\.com)$/i;
    
    let productiveTime = 0;
    let distractingTime = 0;
    
    Object.entries(tabTimes).forEach(([domain, time]) => {
      if (productiveDomainsRegex.test(domain)) {
        productiveTime += time;
      } else if (distractingDomainsRegex.test(domain)) {
        distractingTime += time;
      }
    });

    const totalTime = productiveTime + distractingTime;
    if (totalTime === 0) return 0;
    
    return Math.round((productiveTime / totalTime) * 100);
  }

  // 스트레스 레벨 계산 (0-100)
  function calculateStressLevel(totalUsageTime) {
    const HOUR = 3600000; // 1시간 (밀리초)
    const maxHealthyUsage = 8 * HOUR; // 8시간을 최대 건강한 사용 시간으로 설정
    
    return Math.min(100, Math.round((totalUsageTime / maxHealthyUsage) * 100));
  }

  // 디지털 디톡스 점수 계산 (0-100)
  function calculateDetoxScore(totalUsageTime) {
    const HOUR = 3600000;
    const targetUsage = 6 * HOUR; // 목표 사용 시간 6시간
    
    if (totalUsageTime <= targetUsage) {
      return 100 - Math.round((totalUsageTime / targetUsage) * 50); // 최대 100점
    } else {
      return Math.max(0, 50 - Math.round(((totalUsageTime - targetUsage) / targetUsage) * 50)); // 최소 0점
    }
  }

  // 대시보드 열기 버튼 이벤트 리스너 추가
  if (elements.openDashboardButton) {
    elements.openDashboardButton.addEventListener('click', async () => {
      try {
        // 현재 저장된 데이터 가져오기
        const data = await chrome.storage.local.get(['tabTimes', 'timeLimits']);
        
        // 데이터 가공
        const processedData = {
          totalTime: Object.values(data.tabTimes || {}).reduce((sum, time) => sum + time, 0),
          topSites: Object.entries(data.tabTimes || {})
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5),
          timeLimits: data.timeLimits || {}
        };

        // URL 파라미터로 데이터 전달
        const encodedData = encodeURIComponent(JSON.stringify(processedData));
        const dashboardUrl = `https://octxxiii.github.io/tab-timer-pages/#daily?data=${encodedData}`;
        
        // 새 탭에서 대시보드 열기
        chrome.tabs.create({ url: dashboardUrl });
      } catch (error) {
        console.error('Error opening dashboard:', error);
      }
    });
  }

  async function openDashboard() {
    const data = await chrome.storage.local.get(['dailyStats', 'weeklyStats']);
    // localStorage를 통해 데이터 전달
    localStorage.setItem('tabTimerData', JSON.stringify(data));
    window.open('https://octxxiii.github.io/tab-timer-pages/#daily');
  }

  function updateDailyStats(dailyStats) {
    const today = new Date().toISOString().split('T')[0];
    const todayData = dailyStats[today] || {};
    
    // 총 사용 시간
    const totalTime = Object.values(todayData).reduce((sum, time) => sum + time, 0);
    
    // 가장 많이 사용한 상위 5개 사이트
    const topSites = Object.entries(todayData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([domain, time]) => ({
        domain,
        hours: Math.floor(time / 3600000),
        minutes: Math.floor((time % 3600000) / 60000)
      }));

    // HTML 업데이트
    const dailySection = document.querySelector('#daily');
    dailySection.innerHTML = `
      <h2>오늘의 브라우징</h2>
      <div class="total-time">
        <h3>총 사용 시간</h3>
        <p>${Math.floor(totalTime / 3600000)}시간 ${Math.floor((totalTime % 3600000) / 60000)}분</p>
      </div>
      <div class="top-sites">
        <h3>자주 방문한 사이트</h3>
        <ul>
          ${topSites.map(site => `
            <li>
              <span class="domain">${site.domain}</span>
              <span class="time">${site.hours}시간 ${site.minutes}분</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  function updateWeeklyAnalysis(weeklyStats) {
    const currentWeek = getCurrentWeek();
    const weekData = weeklyStats[currentWeek] || {};
    
    // 생산적인 사이트와 비생산적인 사이트 분류
    const productiveSites = ['github.com', 'docs.google.com', 'notion.so'];
    const distractingSites = ['youtube.com', 'facebook.com', 'twitter.com'];
    
    let productiveTime = 0;
    let distractingTime = 0;
    
    Object.entries(weekData).forEach(([domain, time]) => {
      if (productiveSites.includes(domain)) productiveTime += time;
      if (distractingSites.includes(domain)) distractingTime += time;
    });

    const weeklySection = document.querySelector('#weekly');
    weeklySection.innerHTML = `
      <h2>주간 사용 패턴</h2>
      <div class="productivity-ratio">
        <h3>생산성 비율</h3>
        <div class="progress-bar">
          <div class="progress" style="width: ${(productiveTime / (productiveTime + distractingTime)) * 100}%"></div>
        </div>
        <p>생산적 활동: ${Math.floor(productiveTime / 3600000)}시간</p>
        <p>비생산적 활동: ${Math.floor(distractingTime / 3600000)}시간</p>
      </div>
    `;
  }

  function updateGoals(timeLimits) {
    const goalsSection = document.querySelector('#goals');
    goalsSection.innerHTML = `
      <h2>사용 시간 목표</h2>
      <div class="current-limits">
        <h3>설정된 제한</h3>
        <ul>
          ${Object.entries(timeLimits).map(([domain, limit]) => `
            <li>
              <span class="domain">${domain}</span>
              <span class="limit">${Math.floor(limit / 60000)}분</span>
              <div class="progress-bar">
                <div class="progress" style="width: ${(getDailyUsage(domain) / limit) * 100}%"></div>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  function updateWellbeingInsights(dailyStats, weeklyStats) {
    const insights = [];
    
    // 과다 사용 감지
    const todayTotal = getTodayTotalTime(dailyStats);
    if (todayTotal > 8 * 3600000) { // 8시간 초과
      insights.push('오늘 화면 시간이 8시간을 초과했습니다. 잠시 휴식을 취하는 것은 어떨까요?');
    }
    
    // 생산성 패턴 분석
    const productiveRatio = getProductiveTimeRatio(weeklyStats);
    if (productiveRatio < 0.4) { // 40% 미만
      insights.push('이번 주는 생산적인 활동 비율이 낮습니다. 집중 시간을 늘려보세요.');
    }

    const insightsSection = document.querySelector('#insights');
    insightsSection.innerHTML = `
      <h2>맞춤 인사이트</h2>
      <ul class="insights-list">
        ${insights.map(insight => `<li>${insight}</li>`).join('')}
      </ul>
    `;
  }

  // URL에서 데이터 파라미터 읽기
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
  const data = JSON.parse(decodeURIComponent(urlParams.get('data') || '{}'));
  
  // 데이터 표시 함수 호출
  updateDailyStats(data.dailyStats);
  updateWeeklyAnalysis(data.weeklyStats);
  updateWellbeingInsights(data.dailyStats, data.weeklyStats);
}); 