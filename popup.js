document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 참조
  const elements = {
<<<<<<< HEAD
    totalTime: document.getElementById('totalTime'),
    sessionCount: document.getElementById('sessionCount'),
    domainCount: document.getElementById('domainCount'),
    tabsList: document.getElementById('tabsList'),
    currentLimit: document.getElementById('currentLimit'),
    timeLimitMinutes: document.getElementById('timeLimitMinutes'),
    setTimeLimit: document.getElementById('setTimeLimit'),
    themeToggle: document.getElementById('themeToggle'),
    dashboardBtn: document.getElementById('dashboardBtn'),
    insightsBtn: document.getElementById('insightsBtn'),
    exportBtn: document.getElementById('exportBtn'),
    upgradeBtn: document.getElementById('upgradeBtn'),
    premiumBanner: document.getElementById('premiumBanner')
  };

  // 상태 관리
  let state = {
    isPremium: false,
    currentTheme: 'light',
    data: null,
    refreshInterval: null
  };

  // 초기화
  init();

  async function init() {
    // 테마 로드
    loadTheme();

    // 프리미엄 상태 확인
    await checkPremiumStatus();

    // 이벤트 리스너 설정
    setupEventListeners();

    // 데이터 로드
    await updateUI();

    // 자동 새로고침 시작
    startAutoRefresh();
  }

  // 테마 관리
  function loadTheme() {
    chrome.storage.local.get(['theme'], (result) => {
      state.currentTheme = result.theme || 'light';
      applyTheme(state.currentTheme);
    });
  }

  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    const icon = elements.themeToggle.querySelector('.material-icons-round');
    icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
  }

  function toggleTheme() {
    state.currentTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(state.currentTheme);
    chrome.storage.local.set({ theme: state.currentTheme });

    // 애니메이션 효과
    animateThemeToggle();
  }

  function animateThemeToggle() {
    const toggle = elements.themeToggle;
    toggle.style.transform = 'scale(1.2) rotate(180deg)';
    setTimeout(() => {
      toggle.style.transform = 'scale(1) rotate(0deg)';
    }, 300);
  }

  // 프리미엄 상태 확인
  async function checkPremiumStatus() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['isPremium'], (result) => {
        state.isPremium = result.isPremium || false;
        updatePremiumUI();
        resolve();
      });
    });
  }

  function updatePremiumUI() {
    if (state.isPremium) {
      elements.premiumBanner.style.display = 'none';
      // 프리미엄 기능 활성화
      elements.exportBtn.classList.add('premium-active');
      elements.insightsBtn.classList.add('premium-active');
    }
  }

  // 시간 포맷팅 (더 간결하게)
  function formatTime(ms) {
    if (ms < 1000) return '0초';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}시간 ${minutes % 60}분`;
    } else if (minutes > 0) {
      return `${minutes}분`;
    } else {
      return `${seconds}초`;
    }
  }

  // 간단한 시간 포맷 (카드용)
  function formatTimeShort(ms) {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}분`;
    }
  }

  // 도메인 아이콘 URL
  function getFaviconUrl(domain) {
    return `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
  }

  // 원형 프로그레스 바 생성
  function createProgressRing(percentage) {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return `
      <svg class="progress-ring" width="48" height="48">
        <circle class="progress-ring-circle" cx="24" cy="24" r="${radius}"></circle>
        <circle class="progress-ring-progress" cx="24" cy="24" r="${radius}"
                style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset}"></circle>
      </svg>
    `;
  }

  // UI 업데이트
  async function updateUI() {
    try {
      const response = await sendMessage('getDetailedStats');

      if (!response) {
        showEmptyState();
        return;
      }

      state.data = response;

      // 통계 카드 업데이트
      updateStatsCards(response);

      // 도메인 리스트 업데이트
      updateDomainsList(response);

      // 시간 제한 상태 업데이트
      updateTimeLimitStatus();

    } catch (error) {
      console.error('UI 업데이트 실패:', error);
      showError('데이터를 불러올 수 없습니다.');
    }
  }

  // 통계 카드 업데이트
  function updateStatsCards(data) {
    const todayData = data.today || {};
    const totalTime = todayData.totalTime || 0;
    const sessionCount = todayData.sessionCount || 0;
    const domainCount = Object.keys(todayData.domains || {}).length;

    // 애니메이션과 함께 값 업데이트
    animateValue(elements.totalTime, formatTimeShort(totalTime));
    animateValue(elements.sessionCount, sessionCount.toString());
    animateValue(elements.domainCount, domainCount.toString());

    // 카드 애니메이션
    document.querySelectorAll('.stat-card').forEach((card, index) => {
      card.style.animation = `fadeInUp 0.4s ease ${index * 0.1}s both`;
=======
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
>>>>>>> 50c445f804731a36dabad14ec59bddb6d0b7531e
    });

    limitItem.appendChild(siteSpan);
    limitItem.appendChild(timeSpan);
    limitItem.appendChild(removeButton);

    // Start countdown for this item
    startCountdown(site, limit);
    
    return limitItem;
  }

<<<<<<< HEAD
  // 값 애니메이션
  function animateValue(element, newValue) {
    if (element.textContent !== newValue) {
      element.style.transform = 'scale(1.1)';
      element.textContent = newValue;
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 200);
    }
  }

  // 도메인 리스트 업데이트
  function updateDomainsList(data) {
    const todayData = data.today || {};
    const domains = todayData.domains || {};
    const totalTime = todayData.totalTime || 0;

    if (Object.keys(domains).length === 0) {
      showEmptyState();
      return;
    }

    // 도메인별로 정렬
    const sortedDomains = Object.entries(domains)
      .sort(([, a], [, b]) => b.time - a.time)
      .slice(0, 10);

    const listHTML = sortedDomains.map(([domain, domainData], index) => {
      const percentage = totalTime > 0 ? Math.round((domainData.time / totalTime) * 100) : 0;

      return `
        <div class="domain-item" style="animation: fadeInLeft 0.3s ease ${index * 0.05}s both">
          <img src="${getFaviconUrl(domain)}" alt="${domain}" class="domain-favicon" 
               onerror="this.src='images/icon16.png'">
          <div class="domain-info">
            <div class="domain-name">${domain}</div>
            <div class="domain-stats">
              <span>${domainData.sessions} 세션</span>
              <span>평균 ${formatTime(domainData.time / domainData.sessions)}</span>
            </div>
          </div>
          <div class="domain-time">
            <div class="time-value">${formatTime(domainData.time)}</div>
            <div class="time-percent">${percentage}%</div>
          </div>
          ${createProgressRing(percentage)}
        </div>
      `;
    }).join('');

    elements.tabsList.innerHTML = listHTML;
  }

  // 빈 상태 표시
  function showEmptyState() {
    elements.tabsList.innerHTML = `
      <div class="empty-state">
        <span class="material-icons-round">hourglass_empty</span>
        <p>아직 기록된 데이터가 없습니다</p>
        <small>웹사이트를 방문하면 자동으로 시간이 추적됩니다</small>
      </div>
    `;
  }

  // 시간 제한 상태 업데이트
  async function updateTimeLimitStatus() {
    try {
      const response = await sendMessage('getTimeLimit');

      if (response && response.limits) {
        const globalLimit = response.limits['_global'];
        const domainLimits = Object.entries(response.limits)
          .filter(([domain]) => domain !== '_global');

        let statusHTML = '';

        if (globalLimit) {
          statusHTML += `
            <div class="limit-item">
              <span class="material-icons-round" style="font-size: 16px;">public</span>
              전체 제한: ${globalLimit}분
            </div>
          `;
        }

        if (domainLimits.length > 0) {
          statusHTML += `
            <div class="limit-item">
              <span class="material-icons-round" style="font-size: 16px;">language</span>
              ${domainLimits.length}개 사이트 제한 설정됨
            </div>
          `;
        }

        if (!statusHTML) {
          statusHTML = '<div class="text-secondary">시간 제한이 설정되지 않았습니다</div>';
        }

        elements.currentLimit.innerHTML = statusHTML;
      }
    } catch (error) {
      console.error('시간 제한 상태 로드 실패:', error);
    }
  }

  // 메시지 전송 헬퍼
  function sendMessage(action, data = {}) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action, ...data }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });
  }

  // 알림 표시
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <span class="material-icons-round">${type === 'success' ? 'check_circle' :
        type === 'error' ? 'error' : 'info'
      }</span>
      <span>${message}</span>
    `;

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // 오류 표시
  function showError(message) {
    showNotification(message, 'error');
  }

  // 성공 표시
  function showSuccess(message) {
    showNotification(message, 'success');
  }

  // 이벤트 리스너 설정
  function setupEventListeners() {
    // 테마 토글
    elements.themeToggle.addEventListener('click', toggleTheme);

    // 시간 제한 설정
    elements.setTimeLimit.addEventListener('click', setTimeLimit);
    elements.timeLimitMinutes.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') setTimeLimit();
    });

    // 빠른 액션 버튼들
    elements.dashboardBtn.addEventListener('click', openDashboard);
    elements.insightsBtn.addEventListener('click', showInsights);
    elements.exportBtn.addEventListener('click', exportData);

    // 업그레이드 버튼
    elements.upgradeBtn.addEventListener('click', upgradeToPremium);

    // 통계 카드 클릭
    document.querySelectorAll('.stat-card').forEach(card => {
      card.addEventListener('click', () => {
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          card.style.transform = 'scale(1)';
        }, 150);
=======
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
>>>>>>> 50c445f804731a36dabad14ec59bddb6d0b7531e
      });
    });
  }

<<<<<<< HEAD
  // 시간 제한 설정
  async function setTimeLimit() {
    const minutes = elements.timeLimitMinutes.value;

    if (!minutes || minutes <= 0) {
      showError('올바른 시간을 입력해주세요.');
      return;
=======
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
>>>>>>> 50c445f804731a36dabad14ec59bddb6d0b7531e
    }

<<<<<<< HEAD
    try {
      elements.setTimeLimit.disabled = true;

      const response = await sendMessage('setTimeLimit', {
        minutes: parseInt(minutes)
      });

      if (response && response.success) {
        showSuccess('시간 제한이 설정되었습니다!');
        elements.timeLimitMinutes.value = '';
        await updateTimeLimitStatus();
      } else {
        throw new Error('설정 실패');
      }
    } catch (error) {
      showError('시간 제한 설정에 실패했습니다.');
    } finally {
      elements.setTimeLimit.disabled = false;
    }
  }

  // 대시보드 열기
  function openDashboard() {
    chrome.tabs.create({
      url: `https://octxxiii.github.io/tab-timer?extensionId=${chrome.runtime.id}`
    });
  }

  // 인사이트 표시
  async function showInsights() {
    if (!state.isPremium && Math.random() > 0.5) {
      showPremiumPrompt();
      return;
    }

    if (!state.data) return;

    const insights = generateInsights(state.data);

    elements.tabsList.innerHTML = `
      <div class="insights-container" style="animation: fadeIn 0.3s ease">
        <h3 style="margin-bottom: 20px;">
          <span class="material-icons-round" style="vertical-align: middle;">insights</span>
          오늘의 인사이트
        </h3>
        ${insights}
        <button class="btn-primary" style="margin-top: 20px; width: 100%;" onclick="location.reload()">
          <span class="material-icons-round">arrow_back</span>
          돌아가기
        </button>
      </div>
    `;
  }

  // 인사이트 생성
  function generateInsights(data) {
    const todayTotal = data.today?.totalTime || 0;
    const weeklyAvg = data.weekly?.reduce((sum, time) => sum + time, 0) / 7 || 0;
    const productivity = calculateProductivityScore(data.domains);

    const insights = [];

    // 시간 사용 패턴
    if (todayTotal > weeklyAvg * 1.2) {
      insights.push({
        type: 'warning',
        icon: 'trending_up',
        text: '오늘은 평소보다 20% 이상 더 많은 시간을 사용하고 있습니다.'
      });
    } else if (todayTotal < weeklyAvg * 0.8) {
      insights.push({
        type: 'success',
        icon: 'trending_down',
        text: '오늘은 평소보다 시간을 적게 사용하고 있습니다. 훌륭해요!'
      });
    }

    // 생산성 점수
    insights.push({
      type: productivity >= 60 ? 'success' : 'warning',
      icon: 'psychology',
      text: `생산성 점수: ${productivity}점 - ${getProductivityMessage(productivity)}`
    });

    // 가장 많이 사용한 사이트
    const topDomain = Object.entries(data.domains || {})
      .sort(([, a], [, b]) => b.totalTime - a.totalTime)[0];

    if (topDomain) {
      const [domain, domainData] = topDomain;
      const percentage = Math.round((domainData.totalTime / todayTotal) * 100);
      insights.push({
        type: 'info',
        icon: 'language',
        text: `${domain}에서 전체 시간의 ${percentage}%를 보냈습니다.`
      });
    }

    return insights.map(insight => `
      <div class="insight-card ${insight.type}">
        <span class="material-icons-round">${insight.icon}</span>
        <p>${insight.text}</p>
      </div>
    `).join('');
  }

  // 생산성 점수 계산
  function calculateProductivityScore(domains) {
    const productiveSites = ['github.com', 'stackoverflow.com', 'developer.mozilla.org', 'google.com'];
    const unproductiveSites = ['youtube.com', 'facebook.com', 'instagram.com', 'twitter.com', 'tiktok.com'];

    let productiveTime = 0;
    let unproductiveTime = 0;
    let totalTime = 0;

    Object.entries(domains || {}).forEach(([domain, data]) => {
      totalTime += data.totalTime;
      if (productiveSites.some(site => domain.includes(site))) {
        productiveTime += data.totalTime;
      } else if (unproductiveSites.some(site => domain.includes(site))) {
        unproductiveTime += data.totalTime;
      }
    });

    if (totalTime === 0) return 50;

    const score = Math.round(((productiveTime - unproductiveTime) / totalTime + 1) * 50);
    return Math.max(0, Math.min(100, score));
  }

  // 생산성 메시지
  function getProductivityMessage(score) {
    if (score >= 80) return '매우 생산적입니다!';
    if (score >= 60) return '균형이 잘 잡혀있습니다.';
    if (score >= 40) return '개선의 여지가 있습니다.';
    return '집중력 향상이 필요합니다.';
  }

  // 데이터 내보내기
  async function exportData() {
    if (!state.isPremium) {
      showPremiumPrompt();
      return;
    }

    try {
      const response = await sendMessage('exportData');

      if (response) {
        const dataStr = JSON.stringify(response, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `tab-timer-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
        showSuccess('데이터를 내보냈습니다!');
      }
    } catch (error) {
      showError('데이터 내보내기에 실패했습니다.');
    }
  }

  // 프리미엄 프롬프트 표시
  function showPremiumPrompt() {
    showNotification('이 기능은 프리미엄 버전에서 사용할 수 있습니다.', 'info');

    // 프리미엄 배너 강조
    elements.premiumBanner.style.animation = 'pulse 0.5s ease 2';
    setTimeout(() => {
      elements.premiumBanner.style.animation = '';
    }, 1000);
  }

  // 프리미엄 업그레이드
  function upgradeToPremium() {
    chrome.tabs.create({
      url: 'https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID'
    });
  }

  // 자동 새로고침
  function startAutoRefresh() {
    state.refreshInterval = setInterval(() => {
      updateUI();
    }, 5000); // 5초마다
  }

  // 정리
  window.addEventListener('unload', () => {
    if (state.refreshInterval) {
      clearInterval(state.refreshInterval);
    }
  });

  // CSS 애니메이션 추가
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeInLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    .text-secondary {
      color: var(--text-secondary);
      font-size: 14px;
    }
    
    .limit-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0;
      color: var(--text-secondary);
      font-size: 14px;
    }
    
    .insights-container {
      padding: 20px;
    }
    
    .insight-card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 12px;
      animation: fadeInUp 0.4s ease both;
    }
    
    .insight-card.success {
      background: #e8f5e9;
      color: #2e7d32;
    }
    
    .insight-card.warning {
      background: #fff3e0;
      color: #f57c00;
    }
    
    .insight-card.info {
      background: #e3f2fd;
      color: #1976d2;
    }
    
    .insight-card .material-icons-round {
      font-size: 24px;
      flex-shrink: 0;
    }
    
    .insight-card p {
      margin: 0;
      line-height: 1.5;
    }
    
    .premium-active {
      position: relative;
    }
    
    .premium-active::after {
      content: '✨';
      position: absolute;
      top: -5px;
      right: -5px;
      font-size: 12px;
    }
  `;
  document.head.appendChild(style);
=======
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
>>>>>>> 50c445f804731a36dabad14ec59bddb6d0b7531e
}); 