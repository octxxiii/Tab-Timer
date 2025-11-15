// Tab Timer Popup Script
// Unified version with modern UI and full feature support

document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 참조
  const elements = {
    totalTime: document.getElementById('totalTime'),
    currentLimit: document.getElementById('currentLimit'),
    timeLimitMinutes: document.getElementById('timeLimitMinutes'),
    setTimeLimit: document.getElementById('setTimeLimit'),
    themeToggle: document.getElementById('themeToggle'),
    upgradeBtn: document.getElementById('upgradeBtn'),
    premiumBanner: document.getElementById('premiumBanner'),
    // 뷰 요소
    sitesList: document.getElementById('sitesList'),
    dashboardContent: document.getElementById('dashboardContent'),
    siteDetailContent: document.getElementById('siteDetailContent'),
    siteDetailTitle: document.getElementById('siteDetailTitle')
  };

  // 상태 관리
  let state = {
    isPremium: false,
    currentTheme: 'light',
    currentLanguage: 'ko', // 'ko' 또는 'en'
    data: null,
    refreshInterval: null,
    realtimeUpdateFrame: null,
    currentView: 'home',
    selectedDomain: null,
    selectedSession: null,
    lastFullUpdate: null,
    lastActiveInfo: null, // 마지막으로 받은 활성 탭 정보
    lastUpdateTime: null, // 마지막 업데이트 시간
    dashboardUpdateInterval: null, // 대시보드 업데이트 인터벌
    sitesUpdateInterval: null, // 사이트 뷰 업데이트 인터벌
    dashboardAccordionState: {} // 대시보드 아코디언 상태 저장
  };

  // 언어 텍스트
  const translations = {
    ko: {
      autoTrack: '자동 추적',
      autoTrackDesc: '탭 전환 시 자동으로 시간 추적',
      notifications: '알림',
      notificationsDesc: '시간 제한 도달 시 알림 표시',
      language: '언어',
      languageDesc: '인터페이스 언어 선택',
      exportData: '데이터 내보내기',
      exportDataDesc: '모든 추적 데이터를 JSON 파일로 내보냅니다',
      clearData: '데이터 초기화',
      clearDataDesc: '모든 추적 데이터를 삭제합니다. 이 작업은 되돌릴 수 없습니다.',
      deleteAllData: '모든 데이터 삭제',
      exporting: '내보내는 중...',
      settingsSaved: '설정이 저장되었습니다.',
      timeLimitSettings: '현재 사이트 시간 제한 설정',
      enterMinutes: '분 단위로 입력',
      set: '설정',
      todayTotalTime: '오늘 총 사용 시간',
      home: '홈',
      dashboard: '대시보드',
      sites: '사이트',
      settings: '설정',
      dailyUsage: '일간 사용량',
      weeklyUsage: '주간 사용량',
      monthlyUsage: '월간 사용량',
      yearlyUsage: '년간 사용량',
      topSites: '상위 사이트',
      overallStats: '전체 통계',
      totalRecordedDays: '총 기록 일수',
      trackedSites: '추적된 사이트 수',
      monthlyAverage: '월간 평균',
      allSites: '모든 사이트',
      siteDetail: '사이트 상세',
      noData: '데이터가 없습니다',
      hour: '시',
      week: '주차',
      day: '일',
      sitesCount: '개',
      weekdays: ['월', '화', '수', '목', '금', '토', '일'],
      year: '년',
      month: '월',
      cannotLoadData: '데이터를 불러올 수 없습니다',
      noSitesRecorded: '아직 기록된 사이트가 없습니다',
      dailyAverage: '일일 평균',
      todayUsage: '오늘 사용 시간',
      hourlyUsage: '시간대별 사용량',
      totalUsageTime: '총 사용 시간',
      percentageOfTotal: '전체 대비 비율',
      minute: '분',
      minutes: '분',
      hour: '시간',
      hours: '시간',
      hourSuffix: '시', // 시간대 표시용 (0시, 1시)
      second: '초',
      seconds: '초',
      overLimit: '제한 초과',
      remaining: '남음',
      used: '사용',
      limitExceeded: '제한 초과',
      noTimeLimitSet: '시간 제한이 설정되지 않았습니다',
      appSubtitle: '당신의 시간을 더 가치있게'
    },
    en: {
      autoTrack: 'Auto Tracking',
      autoTrackDesc: 'Automatically track time when switching tabs',
      notifications: 'Notifications',
      notificationsDesc: 'Show notifications when time limit is reached',
      language: 'Language',
      languageDesc: 'Select interface language',
      exportData: 'Export Data',
      exportDataDesc: 'Export all tracking data as a JSON file',
      clearData: 'Clear Data',
      clearDataDesc: 'Delete all tracking data. This action cannot be undone.',
      deleteAllData: 'Delete All Data',
      exporting: 'Exporting...',
      settingsSaved: 'Settings saved.',
      timeLimitSettings: 'Current Site Time Limit Settings',
      enterMinutes: 'Enter in minutes',
      set: 'Set',
      todayTotalTime: 'Today\'s Total Usage Time',
      home: 'Home',
      dashboard: 'Dashboard',
      sites: 'Sites',
      settings: 'Settings',
      dailyUsage: 'Daily Usage',
      weeklyUsage: 'Weekly Usage',
      monthlyUsage: 'Monthly Usage',
      yearlyUsage: 'Yearly Usage',
      topSites: 'Top Sites',
      overallStats: 'Overall Statistics',
      totalRecordedDays: 'Total Recorded Days',
      trackedSites: 'Tracked Sites',
      monthlyAverage: 'Monthly Average',
      allSites: 'All Sites',
      siteDetail: 'Site Detail',
      noData: 'No data available',
      hour: 'h',
      week: 'week',
      day: 'day',
      sitesCount: '',
      weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      year: '',
      month: '',
      cannotLoadData: 'Cannot load data',
      noSitesRecorded: 'No sites recorded yet',
      dailyAverage: 'Daily Average',
      todayUsage: 'Today\'s Usage Time',
      hourlyUsage: 'Hourly Usage',
      totalUsageTime: 'Total Usage Time',
      percentageOfTotal: 'Percentage of Total',
      minute: 'min',
      minutes: 'min',
      hour: 'h',
      hours: 'h',
      hourSuffix: 'h', // 시간대 표시용 (0h, 1h)
      second: 's',
      seconds: 's',
      overLimit: 'Over Limit',
      remaining: 'remaining',
      used: 'Used',
      limitExceeded: 'Limit Exceeded',
      noTimeLimitSet: 'No time limit set',
      appSubtitle: 'Make your time more valuable'
    }
  };

  // 현재 언어의 텍스트 가져오기
  function t(key) {
    return translations[state.currentLanguage]?.[key] || translations.ko[key] || key;
  }

  // 초기화
  init();

  async function init() {
    // 테마 로드
    loadTheme();

    // 언어 로드
    loadLanguage();

    // 프리미엄 상태 확인
    await checkPremiumStatus();

    // 이벤트 리스너 설정
    setupEventListeners();

    // 뷰 시스템 초기화
    setupViewSystem();

    // 데이터 로드
    await updateUI();

    // 광고 초기화
    await updateAdDisplay();

    // 자동 새로고침 시작
    startAutoRefresh();
  }

  // ===== View System =====
  function setupViewSystem() {
    // 네비게이션 버튼 (이벤트 리스너 중복 방지)
    document.querySelectorAll('.nav-btn').forEach(btn => {
      // 기존 리스너 제거 후 새로 등록
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const viewName = newBtn.getAttribute('data-view');
        if (viewName) {
          switchView(viewName);
        }
      });
    });

    // 뒤로가기 버튼 (이벤트 리스너 중복 방지)
    const backFromSiteDetail = document.getElementById('backFromSiteDetail');
    if (backFromSiteDetail) {
      backFromSiteDetail.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        switchView('sites');
      });
    }


    const backFromSettings = document.getElementById('backFromSettings');
    if (backFromSettings) {
      backFromSettings.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        switchView('home');
      });
    }

  }

  function switchView(viewName) {
    // 유효성 검사
    if (!viewName) {
      console.warn('switchView: viewName is required');
      return;
    }

    // 이미 같은 뷰에 있으면 무시 (무한 루프 방지)
    if (state.currentView === viewName) {
      return;
    }

    // 모든 뷰 숨기기
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });

    // 모든 네비게이션 버튼 비활성화
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // 선택한 뷰 표시
    const targetView = document.getElementById(`${viewName}View`);
    if (!targetView) {
      console.warn(`switchView: View "${viewName}View" not found`);
      return;
    }
    targetView.classList.add('active');

    // 네비게이션 버튼 활성화
    const navBtn = document.querySelector(`.nav-btn[data-view="${viewName}"]`);
    if (navBtn) {
      navBtn.classList.add('active');
    }

    state.currentView = viewName;

    // 뷰별 데이터 로드
    if (viewName === 'dashboard') {
      loadDashboard();
      // 대시보드도 실시간 업데이트
      if (state.dashboardUpdateInterval) {
        clearInterval(state.dashboardUpdateInterval);
      }
      state.dashboardUpdateInterval = setInterval(() => {
        if (state.currentView === 'dashboard') {
          loadDashboard();
        }
      }, 3000);
    } else if (viewName === 'sites') {
      loadSitesList();
      // 사이트 뷰도 실시간 업데이트
      if (state.sitesUpdateInterval) {
        clearInterval(state.sitesUpdateInterval);
      }
      state.sitesUpdateInterval = setInterval(() => {
        if (state.currentView === 'sites') {
          loadSitesList();
        }
      }, 3000);
    } else if (viewName === 'settings') {
      showSettings();
    } else {
      // 다른 뷰로 전환 시 인터벌 정리
      if (state.dashboardUpdateInterval) {
        clearInterval(state.dashboardUpdateInterval);
        state.dashboardUpdateInterval = null;
      }
      if (state.sitesUpdateInterval) {
        clearInterval(state.sitesUpdateInterval);
        state.sitesUpdateInterval = null;
      }
    }
  }

  // ===== Theme Management =====
  function loadTheme() {
    chrome.storage.local.get(['theme'], (result) => {
      state.currentTheme = result.theme || 'light';
      applyTheme(state.currentTheme);
    });
  }

  // ===== Language Management =====
  function loadLanguage() {
    chrome.storage.local.get(['language', 'dashboardAccordionState'], (result) => {
      state.currentLanguage = result.language || 'ko';
      state.dashboardAccordionState = result.dashboardAccordionState || {};
      updateLanguage();
    });
  }

  function saveDashboardAccordionState() {
    chrome.storage.local.set({ dashboardAccordionState: state.dashboardAccordionState });
  }

  function updateLanguage() {
    // 네비게이션 버튼 텍스트 업데이트 (아이콘이 아닌 텍스트 span만)
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      const view = btn.getAttribute('data-view');
      // material-icons-round가 아닌 span 찾기 (텍스트 span)
      const spans = btn.querySelectorAll('span');
      const textSpan = Array.from(spans).find(span => !span.classList.contains('material-icons-round'));
      if (textSpan) {
        if (view === 'home') {
          textSpan.textContent = t('home');
        } else if (view === 'dashboard') {
          textSpan.textContent = t('dashboard');
        } else if (view === 'sites') {
          textSpan.textContent = t('sites');
        } else if (view === 'settings') {
          textSpan.textContent = t('settings');
        }
      }
    });

    // 홈 뷰의 텍스트 업데이트
    const totalTimeLabel = document.querySelector('.stat-label');
    if (totalTimeLabel) {
      totalTimeLabel.textContent = t('todayTotalTime');
    }

    // 시간 제한 설정 섹션 제목 업데이트
    const timeLimitTitle = document.querySelector('.time-limit-section .section-title');
    if (timeLimitTitle) {
      const icon = timeLimitTitle.querySelector('.material-icons-round');
      if (icon) {
        timeLimitTitle.innerHTML = `<span class="material-icons-round">alarm</span> ${t('timeLimitSettings')}`;
      }
    }

    // 시간 제한 입력 필드 placeholder 업데이트
    const timeLimitInput = document.getElementById('timeLimitMinutes');
    if (timeLimitInput) {
      timeLimitInput.placeholder = t('enterMinutes');
    }

    // 시간 제한 설정 버튼 텍스트 업데이트
    const setTimeLimitBtn = document.getElementById('setTimeLimit');
    if (setTimeLimitBtn) {
      const icon = setTimeLimitBtn.querySelector('.material-icons-round');
      if (icon) {
        setTimeLimitBtn.innerHTML = `<span class="material-icons-round">check</span> ${t('set')}`;
      }
    }

    // 설정 뷰가 열려있으면 새로고침
    if (state.currentView === 'settings') {
      showSettings();
    }

    // 시간 제한 상태도 업데이트
    updateTimeLimitStatus();

    // 대시보드와 사이트 뷰가 열려있으면 새로고침
    if (state.currentView === 'dashboard') {
      loadDashboard();
    } else if (state.currentView === 'sites') {
      loadSitesList();
    } else if (state.currentView === 'siteDetail' && state.selectedDomain) {
      showSiteDetail(state.selectedDomain);
    }

    // HTML의 정적 텍스트 업데이트
    // 사이트 뷰의 제목 업데이트
    const sitesView = document.getElementById('sitesView');
    if (sitesView) {
      const sectionTitle = sitesView.querySelector('.section-title');
      if (sectionTitle) {
        const icon = sectionTitle.querySelector('.material-icons-round');
        if (icon) {
          sectionTitle.innerHTML = `<span class="material-icons-round">language</span> ${t('allSites')}`;
        }
      }
    }

    // 사이트 상세 뷰의 제목 업데이트 (도메인이 선택되지 않은 경우에만)
    const siteDetailTitle = document.getElementById('siteDetailTitle');
    if (siteDetailTitle && !state.selectedDomain) {
      siteDetailTitle.textContent = t('siteDetail');
    }

    // 앱 서브타이틀 업데이트
    const appSubtitle = document.querySelector('.app-subtitle');
    if (appSubtitle) {
      appSubtitle.textContent = t('appSubtitle');
    }
  }

  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    if (elements.themeToggle) {
      const icon = elements.themeToggle.querySelector('.material-icons-round');
      if (icon) {
        icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
      }
    }
  }

  function toggleTheme() {
    state.currentTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(state.currentTheme);
    chrome.storage.local.set({ theme: state.currentTheme });
    animateThemeToggle();
  }

  function animateThemeToggle() {
    if (elements.themeToggle) {
      elements.themeToggle.style.transform = 'scale(1.2) rotate(180deg)';
      setTimeout(() => {
        elements.themeToggle.style.transform = 'scale(1) rotate(0deg)';
      }, 300);
    }
  }

  // ===== Premium Status =====
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
    // 프리미엄 배너 항상 숨김
    if (elements.premiumBanner) {
      elements.premiumBanner.style.display = 'none';
    }
    if (state.isPremium) {
      if (elements.exportBtn) elements.exportBtn.classList.add('premium-active');
      // 프리미엄 관련 UI 업데이트
    }
    // Update ad display based on premium status
    updateAdDisplay();
  }

  // ===== Advertisement Management =====
  async function updateAdDisplay() {
    const adContainer = document.getElementById('adContainer');
    if (!adContainer) return;

    // 광고 기능은 현재 비활성화 (테스트 완료 후 활성화)
    // 광고 활성화 시 src/popup/adIntegration.js 참고
    adContainer.innerHTML = '';
    adContainer.style.display = 'none';
  }

  // Track ad events
  function trackAdEvent(event, adType = 'banner') {
    chrome.storage.local.get(['adStats'], (result) => {
      const adStats = result.adStats || {
        impressions: {},
        clicks: {},
        closes: {},
        lastUpdated: Date.now()
      };

      if (!adStats[event + 's']) {
        adStats[event + 's'] = {};
      }

      adStats[event + 's'][adType] = (adStats[event + 's'][adType] || 0) + 1;
      adStats.lastUpdated = Date.now();

      chrome.storage.local.set({ adStats });
    });
  }

  // ===== Time Formatting =====
  // 분 단위만 표시 (초 단위 제거)
  function formatTimeMinutes(minutes) {
    if (!minutes || minutes < 0) return `0${t('minute')}`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hours > 0) {
      // 0분일 때는 분을 표시하지 않음
      if (mins === 0) {
        return `${hours}${t('hour')}`;
      }
      return `${hours}${t('hour')} ${mins}${t('minute')}`;
    }
    if (mins > 0) {
      return `${mins}${t('minute')}`;
    }
    return `0${t('minute')}`;
  }

  function formatTimeShort(minutes) {
    if (!minutes || minutes < 0) return state.currentLanguage === 'ko' ? `0${t('minute')}` : '0m';
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hours > 0) {
      // 0분일 때는 분을 표시하지 않음
      if (mins === 0) {
        return state.currentLanguage === 'ko' 
          ? `${hours}${t('hour')}`
          : `${hours}h`;
      }
      return state.currentLanguage === 'ko' 
        ? `${hours}${t('hour')} ${mins}${t('minute')}`
        : `${hours}h ${mins}m`;
    }
    if (mins > 0) {
      return state.currentLanguage === 'ko' ? `${mins}${t('minute')}` : `${mins}m`;
    }
    return state.currentLanguage === 'ko' ? `0${t('minute')}` : '0m';
  }
  
  // 초 단위까지 정확한 포맷팅
  function formatTimeWithSeconds(totalSeconds) {
    if (!totalSeconds || totalSeconds < 0) return `0${t('second')}`;
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    
    if (hours > 0) {
      return `${hours}${t('hour')} ${mins}${t('minute')} ${secs}${t('second')}`;
    }
    if (mins > 0) {
      return `${mins}${t('minute')} ${secs}${t('second')}`;
    }
    return `${secs}${t('second')}`;
  }

  // ===== UI Components =====
  function getFaviconUrl(domain) {
    return `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
  }

  function createProgressRing(percentage) {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    return `
      <svg class="progress-ring" width="36" height="36">
        <circle class="progress-ring-circle" cx="18" cy="18" r="${radius}"></circle>
        <circle class="progress-ring-progress" cx="18" cy="18" r="${radius}"
                style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset}"></circle>
      </svg>
    `;
  }

  // ===== UI Update =====
  async function updateUI() {
    try {
      console.log('Popup: Requesting detailed stats...');
      const response = await sendMessage('getDetailedStats');
      console.log('Popup: Received response:', response);

      if (!response || !response.success || !response.data) {
        console.warn('Popup: No data received, showing empty state');
        showEmptyState();
        return;
      }

      state.data = response.data;

      // 활성 탭 정보 저장
      if (response.data.currentActive) {
        state.lastActiveInfo = response.data.currentActive;
        state.lastUpdateTime = Date.now();
      }

      // 현재 뷰에 따라 데이터 다시 로드
      if (state.currentView === 'sites') {
        loadSitesList();
      } else if (state.currentView === 'dashboard') {
        loadDashboard();
      }

      // 통계 카드 업데이트 (실시간 시간 포함)
      updateStatsCards(response.data);

      // 시간 제한 상태 업데이트
      updateTimeLimitStatus();

    } catch (error) {
      console.error('UI 업데이트 실패:', error);
      showError('데이터를 불러올 수 없습니다.');
    }
  }

  function updateStatsCards(data) {
    const daily = data.daily || {};
    let totalTime = daily.totalTime || 0; // minutes

    // 현재 활성 탭의 실시간 시간 추가
    const currentActive = data.currentActive || {};
    if (currentActive.isActive && currentActive.startTime) {
      const now = Date.now();
      const elapsed = now - currentActive.startTime;
      const elapsedMinutes = elapsed / 60000;
      // 저장된 시간 + 실시간 경과 시간
      totalTime = totalTime + elapsedMinutes;
    }

    if (elements.totalTime) {
      // 실시간 업데이트는 애니메이션 없이 바로 업데이트
      const currentText = elements.totalTime.textContent;
      const newText = formatTimeShort(totalTime);
      if (currentText !== newText) {
        elements.totalTime.textContent = newText;
      }
    }

    // 카드 애니메이션 (첫 로드 시에만)
    if (!state.data) {
      const statCard = document.querySelector('.stat-card');
      if (statCard) {
        statCard.style.animation = `fadeInUp 0.4s ease 0s both`;
      }
    }
  }

  function animateValue(element, newValue) {
    if (!element) return;
    if (element.textContent !== newValue) {
      element.style.transform = 'scale(1.1)';
      element.textContent = newValue;
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 200);
    }
  }

  function updateDomainsList(data) {
    const daily = data.daily || {};
    let domains = daily.domains || {};
    let totalTime = daily.totalTime || 0;
    const currentActive = data.currentActive || {};

    if (!elements.tabsList) return;

    // 현재 활성 탭의 실시간 시간 추가
    if (currentActive.isActive && currentActive.startTime && currentActive.domain) {
      const now = Date.now();
      const elapsed = now - currentActive.startTime;
      const elapsedMinutes = elapsed / 60000;
      totalTime = totalTime + elapsedMinutes;
    }

    // 도메인별로 정렬 (분 단위) - 모든 세션 합산된 시간
    const domainsCopy = { ...domains };
    
    // 현재 활성 도메인의 실시간 시간 추가
    if (currentActive.isActive && currentActive.domain && currentActive.startTime) {
      const now = Date.now();
      const elapsed = now - currentActive.startTime;
      const elapsedMinutes = elapsed / 60000;
      const savedTime = domainsCopy[currentActive.domain] || 0;
      domainsCopy[currentActive.domain] = savedTime + elapsedMinutes;
    }

    const sortedDomains = Object.entries(domainsCopy)
      .filter(([domain, minutes]) => minutes > 0) // 0분 이상만 표시
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    if (sortedDomains.length === 0 && !currentActive.isActive) {
      showEmptyState();
      return;
    }

    const listHTML = sortedDomains.map(([domain, minutes], index) => {
      const percentage = totalTime > 0 ? Math.round((minutes / totalTime) * 100) : 0;
      const isActive = currentActive.domain === domain && currentActive.isActive;
      const activeClass = isActive ? 'active-domain' : '';

      return `
        <div class="domain-item ${activeClass}" style="animation: fadeInLeft 0.3s ease ${index * 0.05}s both" data-domain="${domain}" data-action="site-detail" data-site="${domain}">
          <img src="${getFaviconUrl(domain)}" alt="${domain}" class="domain-favicon" 
               onerror="this.src='images/icon16.png'">
          <div class="domain-info">
            <div class="domain-name">${domain}${isActive ? ' <span style="color: var(--primary); font-size: 10px;">●</span>' : ''}</div>
            <div class="domain-stats">
              <span>${formatTimeMinutes(minutes)}</span>
            </div>
          </div>
          <div class="domain-time">
            <div class="time-value">${formatTimeMinutes(minutes)}</div>
            <div class="time-percent">${percentage}%</div>
          </div>
          ${createProgressRing(percentage)}
        </div>
      `;
    }).join('');

    elements.tabsList.innerHTML = listHTML;
    
    // 이벤트 리스너 추가 (CSP 준수)
    elements.tabsList.querySelectorAll('[data-action="site-detail"]').forEach(item => {
      item.addEventListener('click', () => {
        const domain = item.getAttribute('data-site');
        if (domain) showSiteDetail(domain);
      });
    });
  }

  function showEmptyState() {
    if (!elements.tabsList) return;
    elements.tabsList.innerHTML = `
      <div class="empty-state">
        <span class="material-icons-round">hourglass_empty</span>
        <p>아직 기록된 데이터가 없습니다</p>
        <small>웹사이트를 방문하면 자동으로 시간이 추적됩니다</small>
      </div>
    `;
  }

  async function updateTimeLimitStatus() {
    try {
      const response = await sendMessage('getTimeLimit');
      const statsResponse = await sendMessage('getDetailedStats');

      if (!elements.currentLimit) return;

      if (response && response.limits) {
        const domainLimits = Object.entries(response.limits)
          .filter(([domain]) => domain !== '_global');

        let statusHTML = '';

        if (domainLimits.length > 0) {
          // 오늘의 도메인별 사용 시간 가져오기
          const dailyDomains = statsResponse?.data?.daily?.domains || {};
          const currentActive = statsResponse?.data?.currentActive || {};
          
          domainLimits.forEach(([domain, limitData]) => {
            const limitMinutes = limitData.limit || limitData || 0;
            let usedMinutes = dailyDomains[domain] || 0;
            
            // 현재 활성 탭이면 실시간 시간 추가
            if (currentActive.isActive && currentActive.domain === domain && currentActive.startTime) {
              const now = Date.now();
              const elapsed = now - currentActive.startTime;
              usedMinutes += elapsed / 60000;
            }
            
            const percentage = limitMinutes > 0 ? Math.min(Math.round((usedMinutes / limitMinutes) * 100), 100) : 0;
            const remainingMinutes = Math.max(limitMinutes - usedMinutes, 0);
            const isOverLimit = usedMinutes >= limitMinutes;
            
          statusHTML += `
              <div class="limit-item-detailed">
                <div class="limit-header">
                  <span class="limit-domain">${domain}</span>
                  <span class="limit-status ${isOverLimit ? 'over-limit' : ''}">
                    ${isOverLimit ? t('overLimit') : `${formatTimeMinutes(remainingMinutes)} ${t('remaining')}`}
                  </span>
                  <button class="limit-delete-btn" data-action="delete-limit" data-domain="${domain}" style="background: transparent; border: none; color: var(--danger); cursor: pointer; padding: 4px 8px; font-size: 12px; border-radius: 4px;" title="시간 제한 삭제">
                    <span class="material-icons-round" style="font-size: 16px;">delete</span>
                  </button>
                </div>
                <div class="limit-progress">
                  <div class="limit-progress-bar" style="width: ${percentage}%"></div>
                </div>
                <div class="limit-info">
                  <span class="limit-used">${t('used')}: ${formatTimeMinutes(usedMinutes)}</span>
                  <span class="limit-total">/ ${formatTimeMinutes(limitMinutes)}</span>
                </div>
            </div>
          `;
          });
        }

        if (!statusHTML) {
          statusHTML = `<div class="limit-empty">${t('noTimeLimitSet')}</div>`;
        }

        elements.currentLimit.innerHTML = statusHTML;
        
        // 시간 제한 삭제 버튼 이벤트 리스너 추가
        elements.currentLimit.querySelectorAll('[data-action="delete-limit"]').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const domain = btn.getAttribute('data-domain');
            if (domain && confirm(`${domain}의 시간 제한을 삭제하시겠습니까?`)) {
              try {
                console.log('시간 제한 삭제 요청:', domain);
                
                // 타임아웃 추가 (5초)
                const timeoutPromise = new Promise((_, reject) => {
                  setTimeout(() => reject(new Error('요청 시간이 초과되었습니다.')), 5000);
                });
                
                const response = await Promise.race([
                  sendMessage('removeTimeLimit', { domain }),
                  timeoutPromise
                ]);
                
                console.log('시간 제한 삭제 응답:', response);
                if (response && response.success) {
                  showSuccess('시간 제한이 삭제되었습니다.');
                  await updateTimeLimitStatus();
                } else {
                  const errorMsg = response?.message || '알 수 없는 오류가 발생했습니다.';
                  console.error('시간 제한 삭제 실패:', errorMsg);
                  showError(`시간 제한 삭제에 실패했습니다: ${errorMsg}`);
                }
              } catch (error) {
                console.error('시간 제한 삭제 실패:', error);
                // 에러 메시지 안전하게 추출
                let errorMessage = '알 수 없는 오류';
                if (error) {
                  if (typeof error === 'string') {
                    errorMessage = error;
                  } else if (error.message) {
                    errorMessage = error.message;
                  } else if (error.toString && error.toString() !== '[object Object]') {
                    errorMessage = error.toString();
                  } else {
                    // 객체인 경우 JSON으로 변환 시도
                    try {
                      errorMessage = JSON.stringify(error);
                    } catch (e) {
                      errorMessage = '알 수 없는 오류가 발생했습니다.';
                    }
                  }
                }
                
                // "The message port closed" 에러는 더 친화적인 메시지로 변경
                if (errorMessage.includes('message port closed') || errorMessage.includes('port closed')) {
                  showError('시간 제한 삭제에 실패했습니다. 확장 프로그램을 다시 로드해주세요.');
                } else {
                  showError(`시간 제한 삭제에 실패했습니다: ${errorMessage}`);
                }
              }
            }
          });
        });
      }
    } catch (error) {
      console.error('시간 제한 상태 로드 실패:', error);
      if (elements.currentLimit) {
        elements.currentLimit.innerHTML = '<div class="limit-empty">시간 제한 정보를 불러올 수 없습니다</div>';
      }
    }
  }

  // ===== Message Handling =====
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

  // ===== Notifications =====
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

  function showError(message) {
    showNotification(message, 'error');
  }

  function showSuccess(message) {
    showNotification(message, 'success');
  }

  // ===== Event Listeners =====
  function setupEventListeners() {
    // 테마 토글
    if (elements.themeToggle) {
      elements.themeToggle.addEventListener('click', toggleTheme);
    }

    // 시간 제한 설정
    if (elements.setTimeLimit) {
      elements.setTimeLimit.addEventListener('click', setTimeLimit);
    }
    if (elements.timeLimitMinutes) {
      elements.timeLimitMinutes.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') setTimeLimit();
      });
    }

    // 업그레이드 버튼
    if (elements.upgradeBtn) {
      elements.upgradeBtn.addEventListener('click', upgradeToPremium);
    }

    // 통계 카드 클릭
    document.querySelectorAll('.stat-card').forEach(card => {
      card.addEventListener('click', () => {
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          card.style.transform = 'scale(1)';
        }, 150);
      });
    });
  }

  // ===== Time Limit Management =====
  async function setTimeLimit() {
    if (!elements.timeLimitMinutes) return;

    const minutes = elements.timeLimitMinutes.value;

    if (!minutes || minutes <= 0) {
      showError('올바른 시간을 입력해주세요.');
      return;
    }

    try {
      // Get current tab URL
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0] || !tabs[0].url) {
        showError('현재 탭의 URL을 가져올 수 없습니다.');
        return;
      }

      const website = tabs[0].url;
      elements.setTimeLimit.disabled = true;

      const response = await sendMessage('setTimeLimit', {
        website: website,
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
      if (elements.setTimeLimit) {
        elements.setTimeLimit.disabled = false;
      }
    }
  }

  // ===== Actions =====

  // ===== Dashboard View =====
  async function loadDashboard() {
    if (!elements.dashboardContent) return;

    try {
      const response = await sendMessage('getDetailedStats');
      if (!response || !response.success || !response.data) {
        elements.dashboardContent.innerHTML = `<div class="empty-state"><p>${t('cannotLoadData')}</p></div>`;
        return;
      }

      const data = response.data;
      const daily = data.daily || {};
      const monthly = data.monthly || {};
      const yearly = data.yearly || {};
      const sites = data.sites || {};
      const monthlyAggregated = data.monthlyAggregated || null;

      // 일간 사용량 (시간대별)
      const hourlyChart = daily.hourlyData || Array(24).fill(0);
      const maxHourly = Math.max(...hourlyChart, 1);
      const hourlyHTML = hourlyChart.map((value, hour) => {
        const percentage = (value / maxHourly) * 100;
        return `
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 10px; width: 30px; color: var(--text-secondary);">${hour}${t('hourSuffix')}</span>
            <div style="flex: 1; height: 16px; background: var(--border); border-radius: 4px; overflow: hidden;">
              <div class="chart-bar" style="width: ${percentage}%; height: 100%; background: var(--primary);"></div>
            </div>
            <span style="font-size: 10px; color: var(--text-secondary); min-width: 40px;">${formatTimeShort(value)}</span>
          </div>
        `;
      }).join('');

      // 주간 사용량 (요일별)
      const weeklyData = daily.weeklyData || Array(7).fill(0);
      const weeklyLabels = t('weekdays');
      const maxWeekly = Math.max(...weeklyData, 1);
      const weeklyHTML = weeklyData.map((value, index) => {
        const percentage = (value / maxWeekly) * 100;
        return `
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 10px; width: 20px; color: var(--text-secondary);">${weeklyLabels[index]}</span>
            <div style="flex: 1; height: 16px; background: var(--border); border-radius: 4px; overflow: hidden;">
              <div class="chart-bar" style="width: ${percentage}%; height: 100%; background: var(--primary);"></div>
            </div>
            <span style="font-size: 10px; color: var(--text-secondary); min-width: 40px;">${formatTimeShort(value)}</span>
          </div>
        `;
      }).join('');

      // 상위 사이트
      const topSites = sites.topSitesLabels || [];
      const topSitesData = sites.topSitesData || [];
      const maxSiteTime = Math.max(...topSitesData, 1);
      const topSitesHTML = topSites.map((domain, index) => {
        const time = topSitesData[index] || 0;
        const percentage = (time / maxSiteTime) * 100;
        return `
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; cursor: pointer;" data-action="site-detail" data-site="${domain}">
            <img src="${getFaviconUrl(domain)}" style="width: 16px; height: 16px; border-radius: 2px;" onerror="this.src='images/icon16.png'">
            <span style="font-size: 11px; flex: 1; color: var(--text-primary);">${domain}</span>
            <div style="width: 100px; height: 12px; background: var(--border); border-radius: 4px; overflow: hidden;">
              <div class="chart-bar" style="width: ${percentage}%; height: 100%; background: var(--primary);"></div>
            </div>
            <span style="font-size: 10px; color: var(--text-secondary); min-width: 40px; text-align: right;">${formatTimeShort(time)}</span>
          </div>
        `;
      }).join('');

      // 월간 사용량 (주별) - 1주차, 2주차, 3주차, 4주차...
      const monthlyTrend = monthly.trendData || [];
      const monthlyLabels = monthly.trendLabels || [];
      
      console.log('월간 사용량 데이터:', { monthlyTrend, monthlyLabels, monthly });
      
      // 주차별 데이터 사용 (background.js에서 이미 주차별로 집계됨)
      let weeklyTrendData = [];
      let weeklyTrendLabels = [];
      
      // monthlyLabels가 비어있거나 일별 형식("일" 포함)이면 주차별로 직접 생성
      if (monthlyLabels.length === 0 || monthlyLabels.some(label => label && label.includes('일'))) {
        // 일별 데이터가 전달된 경우, 주차별로 재집계하지 않고 주차별 레이블만 생성
        // background.js에서 이미 주차별로 집계되어야 하므로, 이 경우는 데이터가 잘못 전달된 것
        // 최소한 현재 주차까지는 표시
        const todayDate = new Date();
        const todayMonth = todayDate.getMonth();
        const todayYear = todayDate.getFullYear();
        const daysInMonth = new Date(todayYear, todayMonth + 1, 0).getDate();
        
        // 주차 계산 (일요일 시작)
        const getWeekNumberInMonthLocal = (day) => {
          const date = new Date(todayYear, todayMonth, day);
          const firstDay = new Date(todayYear, todayMonth, 1);
          const firstDayOfWeek = firstDay.getDay();
          const firstSunday = firstDayOfWeek === 0 ? 1 : 1 - firstDayOfWeek;
          const currentDayOfWeek = date.getDay();
          const currentSunday = day - currentDayOfWeek;
          const weekNumber = Math.floor((currentSunday - firstSunday) / 7) + 1;
          return Math.max(1, weekNumber);
        };
        
        const currentWeekNum = getWeekNumberInMonthLocal(todayDate.getDate());
        // 현재 주차를 기준으로 동적으로 계산 (background.js와 동일한 로직)
        const maxWeek = Math.max(currentWeekNum, 1);
        
        for (let week = 1; week <= maxWeek; week++) {
          weeklyTrendLabels.push(`${week}주차`);
          weeklyTrendData.push(0); // 데이터가 없으면 0으로 표시
        }
      } else if (monthlyLabels.length > 0) {
        // 레이블이 "주차"를 포함하는지 확인
        const hasWeekLabel = monthlyLabels.some(label => label && (label.includes('주차') || label.includes('주')));
        
        if (hasWeekLabel) {
          // 주차별 레이블 필터링
          monthlyLabels.forEach((label, index) => {
            if (label && (label.includes('주차') || label.includes('주'))) {
              weeklyTrendLabels.push(label);
              weeklyTrendData.push(monthlyTrend[index] || 0);
            }
          });
        } else {
          // 레이블이 주차 형식이 아니면 모든 레이블 사용 (이미 주차별로 집계된 경우)
          monthlyLabels.forEach((label, index) => {
            weeklyTrendLabels.push(label);
            weeklyTrendData.push(monthlyTrend[index] || 0);
          });
        }
      }
      
      // 데이터가 없어도 최소한 레이블과 데이터가 있으면 표시
      const hasData = weeklyTrendData.length > 0 || (monthlyLabels.length > 0 && monthlyTrend.length > 0);
      const maxMonthly = weeklyTrendData.length > 0 ? Math.max(...weeklyTrendData, 1) : 1;
      
      const monthlyHTML = hasData ? weeklyTrendData.map((value, index) => {
        const percentage = maxMonthly > 0 ? (value / maxMonthly) * 100 : 0;
        const weekLabel = weeklyTrendLabels[index] || `${index + 1}주차`;
        return `
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 10px; width: 50px; color: var(--text-secondary);">${weekLabel}</span>
            <div style="flex: 1; height: 16px; background: var(--border); border-radius: 4px; overflow: hidden;">
              <div class="chart-bar" style="width: ${percentage}%; height: 100%; background: var(--primary);"></div>
            </div>
            <span style="font-size: 10px; color: var(--text-secondary); min-width: 40px;">${formatTimeShort(value)}</span>
          </div>
        `;
      }).join('') : '<div class="text-secondary" style="text-align: center; padding: 20px;">데이터가 없습니다</div>';

      // 년간 사용량 (월별)
      const yearlyMonthlyTotals = yearly.monthlyTotals || [];
      const yearlyMonthLabels = yearly.monthlyLabels || [];
      const maxYearly = Math.max(...yearlyMonthlyTotals, 1);
      const yearlyHTML = yearlyMonthlyTotals.length > 0 ? yearlyMonthlyTotals.map((value, index) => {
        const percentage = maxYearly > 0 ? (value / maxYearly) * 100 : 0;
        return `
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 10px; width: 40px; color: var(--text-secondary);">${yearlyMonthLabels[index] || ''}</span>
            <div style="flex: 1; height: 16px; background: var(--border); border-radius: 4px; overflow: hidden;">
              <div class="chart-bar" style="width: ${percentage}%; height: 100%; background: var(--primary);"></div>
            </div>
            <span style="font-size: 10px; color: var(--text-secondary); min-width: 40px;">${formatTimeShort(value)}</span>
          </div>
        `;
      }).join('') : '<div class="text-secondary" style="text-align: center; padding: 20px;">데이터가 없습니다</div>';

      // 날짜 정보 계산
      const now = new Date();
      const todayMonth = now.getMonth() + 1; // 0-based이므로 +1
      const todayDate = now.getDate();
      const todayYear = now.getFullYear();
      
      // 주차 계산 (월 기준 주차 - 일요일 시작)
      const getWeekNumberInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        
        // 해당 월의 1일
        const firstDay = new Date(year, month, 1);
        const firstDayOfWeek = firstDay.getDay(); // 0(일요일) ~ 6(토요일)
        
        // 1일이 속한 주의 일요일 날짜 계산 (음수일 수 있음)
        const firstSunday = 1 - firstDayOfWeek;
        
        // 현재 날짜가 속한 주의 일요일 날짜 계산
        const currentDayOfWeek = date.getDay();
        const currentSunday = day - currentDayOfWeek;
        
        // 주차 계산: (현재 주의 일요일 - 첫 주의 일요일) / 7 + 1
        const weekNumber = Math.floor((currentSunday - firstSunday) / 7) + 1;
        
        return Math.max(1, weekNumber);
      };
      const currentWeek = getWeekNumberInMonth(now);
      const currentMonth = now.getMonth() + 1;
      
      // 제목 포맷팅
      const todayTitle = state.currentLanguage === 'ko' 
        ? `${t('dailyUsage')} (${todayYear}${t('year')} ${todayMonth}${t('month')} ${todayDate}${t('day')})`
        : `${t('dailyUsage')} (${todayMonth}/${todayDate}/${todayYear})`;
      const weeklyTitle = state.currentLanguage === 'ko'
        ? `${t('weeklyUsage')} (${todayYear}${t('year')} ${todayMonth}${t('month')} ${currentWeek}${t('week')})`
        : `${t('weeklyUsage')} (${todayMonth}/${todayYear}, ${t('week')} ${currentWeek})`;
      const monthlyTitle = state.currentLanguage === 'ko'
        ? `${t('monthlyUsage')} (${todayYear}${t('year')} ${todayMonth}${t('month')})`
        : `${t('monthlyUsage')} (${todayMonth}/${todayYear})`;
      const yearlyTitle = state.currentLanguage === 'ko'
        ? `${t('yearlyUsage')} (${todayYear}${t('year')})`
        : `${t('yearlyUsage')} (${todayYear})`;

      // 전체 통계
      const allDailyStats = data.dailyStats || {};
      
      // 총 기록 일수: 실제 데이터가 있는 날짜만 카운트
      const totalDays = Object.keys(allDailyStats).filter(dateKey => {
        const dayData = allDailyStats[dateKey];
        // totalTime이 있거나 domains에 데이터가 있는 날짜만 카운트
        return dayData && (dayData.totalTime > 0 || Object.keys(dayData.domains || {}).length > 0);
      }).length;
      
      // 추적된 사이트 수: 모든 날짜의 고유 도메인 수집 (시간이 0보다 큰 도메인만)
      const allDomains = new Set();
      Object.values(allDailyStats).forEach(day => {
        if (day && day.domains) {
          Object.keys(day.domains).forEach(domain => {
            if (day.domains[domain] > 0) {
              allDomains.add(domain);
            }
          });
        }
      });
      
      // 월간 평균 계산 (이번 달의 실제 기록된 일수 기준)
      const currentMonthKey = `${todayYear}-${String(todayMonth).padStart(2, '0')}`;
      const monthDays = Object.keys(allDailyStats).filter(dateKey => {
        if (!dateKey.startsWith(currentMonthKey)) return false;
        const dayData = allDailyStats[dateKey];
        return dayData && (dayData.totalTime > 0 || Object.keys(dayData.domains || {}).length > 0);
      }).length;
      
      // 월간 평균: 이번 달 총 시간 / 실제 기록된 일수
      const monthlyTotal = monthlyAggregated ? monthlyAggregated.totalMinutes : 0;
      const monthlyAverage = monthDays > 0 ? Math.round(monthlyTotal / monthDays) : (monthly.averageTime || 0);
      

      elements.dashboardContent.innerHTML = `
        <div class="chart-container">
          <div class="chart-title accordion-header" data-accordion="hourly">
            <span>${todayTitle}</span>
            <span class="material-icons-round accordion-icon">expand_more</span>
          </div>
          <div class="chart-content accordion-content" data-accordion-content="hourly">
            ${hourlyHTML}
          </div>
        </div>
        <div class="chart-container">
          <div class="chart-title accordion-header" data-accordion="weekly">
            <span>${weeklyTitle}</span>
            <span class="material-icons-round accordion-icon">expand_more</span>
          </div>
          <div class="chart-content accordion-content" data-accordion-content="weekly">
            ${weeklyHTML}
          </div>
        </div>
        <div class="chart-container">
          <div class="chart-title accordion-header" data-accordion="monthly">
            <span>${monthlyTitle}</span>
            <span class="material-icons-round accordion-icon">expand_more</span>
          </div>
          <div class="chart-content accordion-content" data-accordion-content="monthly">
            ${monthlyHTML}
          </div>
        </div>
        <div class="chart-container">
          <div class="chart-title accordion-header" data-accordion="yearly">
            <span>${yearlyTitle}</span>
            <span class="material-icons-round accordion-icon">expand_more</span>
          </div>
          <div class="chart-content accordion-content" data-accordion-content="yearly">
            ${yearlyHTML}
          </div>
        </div>
        <div class="chart-container">
          <div class="chart-title accordion-header" data-accordion="topsites">
            <span>${t('topSites')}</span>
            <span class="material-icons-round accordion-icon">expand_more</span>
          </div>
          <div class="chart-content accordion-content" data-accordion-content="topsites">
            ${topSitesHTML || `<div class="text-secondary" style="text-align: center; padding: 20px;">${t('noData')}</div>`}
          </div>
        </div>
        <div class="chart-container">
          <div class="chart-title accordion-header" data-accordion="stats">
            <span>${t('overallStats')}</span>
            <span class="material-icons-round accordion-icon">expand_more</span>
          </div>
          <div class="chart-content accordion-content" data-accordion-content="stats">
            <div style="padding: 12px;">
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border);">
                <span style="font-size: 12px; color: var(--text-secondary);">${t('totalRecordedDays')}</span>
                <span style="font-size: 12px; font-weight: 600; color: var(--text-primary);">${totalDays}${state.currentLanguage === 'ko' ? t('day') : ' days'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border);">
                <span style="font-size: 12px; color: var(--text-secondary);">${t('trackedSites')}</span>
                <span style="font-size: 12px; font-weight: 600; color: var(--text-primary);">${allDomains.size}${state.currentLanguage === 'ko' ? t('sitesCount') : ''}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border);">
                <span style="font-size: 12px; color: var(--text-secondary);">${t('monthlyAverage')}</span>
                <span style="font-size: 12px; font-weight: 600; color: var(--text-primary);">${formatTimeShort(monthlyAverage)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                <span style="font-size: 12px; color: var(--text-secondary);">${t('todayTotalTime')}</span>
                <span style="font-size: 12px; font-weight: 600; color: var(--text-primary);">${formatTimeShort(daily.totalTime || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // 아코디언 기능 추가 및 상태 복원
      elements.dashboardContent.querySelectorAll('.accordion-header').forEach(header => {
        const accordionId = header.getAttribute('data-accordion');
        const content = elements.dashboardContent.querySelector(`[data-accordion-content="${accordionId}"]`);
        const icon = header.querySelector('.accordion-icon');
        
        // 저장된 상태 복원
        if (state.dashboardAccordionState[accordionId] === false) {
          // 접힌 상태로 복원
          if (content) {
            content.style.display = 'none';
            icon.textContent = 'expand_more';
            header.classList.add('collapsed');
          }
        }
        
        // 클릭 이벤트 리스너
        header.addEventListener('click', () => {
          if (content) {
            const isExpanded = content.style.display !== 'none';
            content.style.display = isExpanded ? 'none' : 'block';
            icon.textContent = isExpanded ? 'expand_more' : 'expand_less';
            header.classList.toggle('collapsed', isExpanded);
            
            // 상태 저장
            state.dashboardAccordionState[accordionId] = !isExpanded;
            saveDashboardAccordionState();
          }
        });
      });

      // 대시보드 이벤트 리스너 추가 (CSP 준수)
      elements.dashboardContent.querySelectorAll('[data-action="site-detail"]').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation(); // 아코디언 토글 방지
          const domain = item.getAttribute('data-site');
          if (domain) showSiteDetail(domain);
        });
      });
    } catch (error) {
      console.error('대시보드 로드 실패:', error);
      elements.dashboardContent.innerHTML = '<div class="empty-state"><p>대시보드를 불러올 수 없습니다</p></div>';
    }
  }

  // ===== Sites View =====
  async function loadSitesList() {
    if (!elements.sitesList) return;

    try {
      const response = await sendMessage('getDetailedStats');
      if (!response || !response.success || !response.data) {
        elements.sitesList.innerHTML = `<div class="empty-state"><p>${t('cannotLoadData')}</p></div>`;
      return;
    }

      const data = response.data;
      const currentActive = data.currentActive || {};
      const allSites = {};

      // 오늘의 사이트 데이터 (이미 모든 세션이 합산된 상태)
      if (data.daily?.domains) {
        Object.entries(data.daily.domains).forEach(([domain, time]) => {
          allSites[domain] = (allSites[domain] || 0) + time;
        });
      }

      // 실시간 활성 탭 시간 추가
      if (currentActive.isActive && currentActive.domain && currentActive.startTime) {
        const now = Date.now();
        const elapsed = now - currentActive.startTime;
        const elapsedMinutes = elapsed / 60000;
        const savedTime = allSites[currentActive.domain] || 0;
        allSites[currentActive.domain] = savedTime + elapsedMinutes;
      }

      const sortedSites = Object.entries(allSites)
        .sort(([, a], [, b]) => b - a);

      if (sortedSites.length === 0) {
        elements.sitesList.innerHTML = `<div class="empty-state"><p>${t('noSitesRecorded')}</p></div>`;
        return;
      }

      const sitesHTML = sortedSites.map(([domain, minutes]) => {
        const isActive = currentActive.domain === domain && currentActive.isActive;
        const activeClass = isActive ? 'active-domain' : '';
        return `
          <div class="domain-item ${activeClass}" data-action="site-detail" data-site="${domain}" data-domain="${domain}">
            <img src="${getFaviconUrl(domain)}" alt="${domain}" class="domain-favicon" onerror="this.src='images/icon16.png'">
            <div class="domain-info">
              <div class="domain-name">${domain}${isActive ? ' <span style="color: var(--primary); font-size: 10px;">●</span>' : ''}</div>
              <div class="domain-stats">
                <span>${formatTimeMinutes(minutes)}</span>
              </div>
            </div>
            <div class="domain-time">
              <div class="time-value">${formatTimeMinutes(minutes)}</div>
            </div>
          </div>
        `;
      }).join('');

      elements.sitesList.innerHTML = sitesHTML;
      
      // 이벤트 리스너 추가 (CSP 준수)
      elements.sitesList.querySelectorAll('[data-action="site-detail"]').forEach(item => {
        item.addEventListener('click', () => {
          const domain = item.getAttribute('data-site');
          if (domain) showSiteDetail(domain);
        });
      });
    } catch (error) {
      console.error('사이트 목록 로드 실패:', error);
      elements.sitesList.innerHTML = '<div class="empty-state"><p>사이트 목록을 불러올 수 없습니다</p></div>';
    }
  }


  // ===== Site Detail View =====
  async function showSiteDetail(domain) {
    state.selectedDomain = domain;
    
    if (elements.siteDetailTitle) {
      elements.siteDetailTitle.textContent = domain;
    }

    try {
      const response = await sendMessage('getDetailedStats');
      if (!response || !response.success || !response.data) {
        return;
      }

      const data = response.data;
      const daily = data.daily || {};
      const domainTime = daily.domains?.[domain] || 0;
      const totalTime = daily.totalTime || 1;
      const percentage = Math.round((domainTime / totalTime) * 100);

      // 일간 사용량 (해당 도메인, 시간대별)
      const hourlyData = daily.hourlyData || Array(24).fill(0);
      // 실제로는 도메인별 시간별 데이터가 필요하지만, 현재는 전체 데이터만 있음
      
      const detailHTML = `
        <div class="stat-card primary" style="margin-bottom: 12px;">
          <div class="stat-icon material-icons-round">schedule</div>
          <div class="stat-value">${formatTimeMinutes(domainTime)}</div>
          <div class="stat-label">${t('totalUsageTime')}</div>
        </div>
        <div class="chart-container">
          <div class="chart-title">${t('percentageOfTotal')}</div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="flex: 1; height: 20px; background: var(--border); border-radius: 4px; overflow: hidden;">
              <div class="chart-bar" style="width: ${percentage}%; height: 100%;"></div>
            </div>
            <span style="font-size: 12px; font-weight: 600; color: var(--primary);">${percentage}%</span>
          </div>
        </div>
        <div class="chart-container">
          <div class="chart-title">${t('dailyAverage')}</div>
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 24px; font-weight: 700; color: var(--primary);">${formatTimeMinutes(domainTime)}</div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">${t('todayUsage')}</div>
          </div>
        </div>
      `;

      if (elements.siteDetailContent) {
        elements.siteDetailContent.innerHTML = detailHTML;
      }

      switchView('siteDetail');
    } catch (error) {
      console.error('사이트 상세 로드 실패:', error);
    }
  }

  // 전역 함수로 등록 (HTML에서 호출 가능하도록)
  window.showSiteDetail = showSiteDetail;

  async function showInsights() {
    // 프리미엄 프롬프트 제거 - 광고 모델로 전환

    if (!state.data || !elements.tabsList) return;

    const insights = generateInsights(state.data);

    elements.tabsList.innerHTML = `
      <div class="insights-container" style="animation: fadeIn 0.3s ease">
        <h3 style="margin-bottom: 20px;">
          <span class="material-icons-round" style="vertical-align: middle;">insights</span>
          오늘의 인사이트
        </h3>
        ${insights}
        <button class="btn-primary" id="insightsBackBtn" style="margin-top: 20px; width: 100%;">
          <span class="material-icons-round">arrow_back</span>
          돌아가기
        </button>
      </div>
    `;
    
    // 인사이트 뒤로가기 버튼 이벤트 리스너
    const insightsBackBtn = document.getElementById('insightsBackBtn');
    if (insightsBackBtn) {
      insightsBackBtn.addEventListener('click', () => {
        location.reload();
      });
    }
  }

  function generateInsights(data) {
    const daily = data.daily || {};
    const totalTime = daily.totalTime || 0;
    const wellness = data.wellness || {};

    const insights = [];

    // 시간 사용 패턴
    if (totalTime > 480) { // 8 hours
      insights.push({
        type: 'warning',
        icon: 'trending_up',
        text: '오늘은 8시간 이상 사용하고 있습니다. 휴식을 권장합니다.'
      });
    } else if (totalTime < 120) {
      insights.push({
        type: 'success',
        icon: 'trending_down',
        text: '오늘은 적절한 시간을 사용하고 있습니다. 훌륭해요!'
      });
    }

    // 생산성 점수
    const productiveTime = wellness.productiveTime || 0;
    const productivityRatio = totalTime > 0 ? (productiveTime / totalTime) * 100 : 0;
    insights.push({
      type: productivityRatio >= 60 ? 'success' : 'warning',
      icon: 'psychology',
      text: `생산성 비율: ${Math.round(productivityRatio)}% - ${getProductivityMessage(productivityRatio)}`
    });

    // 연속 사용 시간
    const consecutiveHours = wellness.consecutiveHours || 0;
    if (consecutiveHours > 2) {
      insights.push({
        type: 'warning',
        icon: 'schedule',
        text: `연속으로 ${consecutiveHours}시간 이상 사용 중입니다. 잠시 휴식을 취하세요.`
      });
    }

    return insights.map(insight => `
      <div class="insight-card ${insight.type}">
        <span class="material-icons-round">${insight.icon}</span>
        <p>${insight.text}</p>
      </div>
    `).join('');
  }

  function getProductivityMessage(ratio) {
    if (ratio >= 80) return '매우 생산적입니다!';
    if (ratio >= 60) return '균형이 잘 잡혀있습니다.';
    if (ratio >= 40) return '개선의 여지가 있습니다.';
    return '집중력 향상이 필요합니다.';
  }

  async function exportData() {
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
      } else {
        showError('데이터를 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('데이터 내보내기 실패:', error);
      showError('데이터 내보내기에 실패했습니다.');
    }
  }

  function showPremiumPrompt() {
    showNotification('이 기능은 프리미엄 버전에서 사용할 수 있습니다.', 'info');
    if (elements.premiumBanner) {
      elements.premiumBanner.style.animation = 'pulse 0.5s ease 2';
      setTimeout(() => {
        elements.premiumBanner.style.animation = '';
      }, 1000);
    }
  }

  function upgradeToPremium() {
    chrome.tabs.create({
      url: 'https://chrome.google.com/webstore/detail/tab-timer'
    });
  }

  // ===== Settings =====
  function showSettings() {
    const settingsContent = document.getElementById('settingsContent');
    if (!settingsContent) {
      // 모달로 표시
      showModal('설정', getSettingsHTML());
      return;
    }

    settingsContent.innerHTML = getSettingsHTML();
    switchView('settings');

    // 설정 이벤트 리스너
    setTimeout(() => {
      setupSettingsListeners();
    }, 100);
  }

  function getSettingsHTML() {
    return `
      <div class="settings-container" style="padding: 16px;">
        <div class="setting-item" style="margin-bottom: 16px; padding: 12px; background: var(--surface); border-radius: var(--radius);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; margin-bottom: 4px;">${t('autoTrack')}</div>
              <div style="font-size: 11px; color: var(--text-secondary);">${t('autoTrackDesc')}</div>
            </div>
            <label class="switch">
              <input type="checkbox" id="autoTrack" checked>
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="setting-item" style="margin-bottom: 16px; padding: 12px; background: var(--surface); border-radius: var(--radius);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; margin-bottom: 4px;">${t('notifications')}</div>
              <div style="font-size: 11px; color: var(--text-secondary);">${t('notificationsDesc')}</div>
            </div>
            <label class="switch">
              <input type="checkbox" id="notifications" checked>
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="setting-item" style="margin-bottom: 16px; padding: 12px; background: var(--surface); border-radius: var(--radius);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; margin-bottom: 4px;">${t('language')}</div>
              <div style="font-size: 11px; color: var(--text-secondary);">${t('languageDesc')}</div>
            </div>
            <select id="languageSelect" style="padding: 6px 12px; border: 1px solid var(--border); border-radius: 6px; background: var(--background); color: var(--text-primary); font-size: 12px; cursor: pointer;">
              <option value="ko" ${state.currentLanguage === 'ko' ? 'selected' : ''}>한국어</option>
              <option value="en" ${state.currentLanguage === 'en' ? 'selected' : ''}>English</option>
            </select>
          </div>
        </div>

        <div class="setting-item" style="margin-bottom: 16px; padding: 12px; background: var(--surface); border-radius: var(--radius);">
          <div>
            <div style="font-weight: 600; margin-bottom: 8px;">
              <span class="material-icons-round" style="font-size: 16px; vertical-align: middle;">download</span>
              ${t('exportData')}
            </div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px;">${t('exportDataDesc')}</div>
            <button class="btn-primary" id="exportDataBtn" style="width: 100%;">
              <span class="material-icons-round">download</span>
              ${t('exportData')}
            </button>
          </div>
        </div>

        <div class="setting-item" style="margin-bottom: 16px; padding: 12px; background: var(--surface); border-radius: var(--radius);">
          <div>
            <div style="font-weight: 600; margin-bottom: 8px;">
              <span class="material-icons-round" style="font-size: 16px; vertical-align: middle;">delete_forever</span>
              ${t('clearData')}
            </div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px;">${t('clearDataDesc')}</div>
            <button class="btn-primary btn-danger" id="clearData" style="width: 100%;">
              <span class="material-icons-round">delete_forever</span>
              ${t('deleteAllData')}
            </button>
          </div>
        </div>

        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border);">
          <div style="font-size: 11px; color: var(--text-secondary); text-align: center;">
            Tab Timer v2.0.0
          </div>
        </div>
      </div>
    `;
  }

  function setupSettingsListeners() {
    const autoTrack = document.getElementById('autoTrack');
    const notifications = document.getElementById('notifications');
    const languageSelect = document.getElementById('languageSelect');
    const clearData = document.getElementById('clearData');
    const exportDataBtn = document.getElementById('exportDataBtn');

    if (autoTrack) {
      chrome.storage.local.get(['autoTrack'], (result) => {
        autoTrack.checked = result.autoTrack !== false;
      });
      autoTrack.addEventListener('change', (e) => {
        chrome.storage.local.set({ autoTrack: e.target.checked });
        showSuccess(t('settingsSaved'));
      });
    }

    if (notifications) {
      chrome.storage.local.get(['notifications'], (result) => {
        notifications.checked = result.notifications !== false;
      });
      notifications.addEventListener('change', (e) => {
        chrome.storage.local.set({ notifications: e.target.checked });
        showSuccess(t('settingsSaved'));
      });
    }

    if (languageSelect) {
      languageSelect.value = state.currentLanguage;
      languageSelect.addEventListener('change', (e) => {
        const newLanguage = e.target.value;
        state.currentLanguage = newLanguage;
        chrome.storage.local.set({ language: newLanguage });
        updateLanguage();
        showSuccess(t('settingsSaved'));
      });
    }

    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', async () => {
        exportDataBtn.disabled = true;
        exportDataBtn.innerHTML = `<span class="material-icons-round">hourglass_empty</span> ${t('exporting')}`;
        try {
          await exportData();
        } finally {
          exportDataBtn.disabled = false;
          exportDataBtn.innerHTML = `<span class="material-icons-round">download</span> ${t('exportData')}`;
        }
      });
    }

    if (clearData) {
      clearData.addEventListener('click', async () => {
        if (confirm('정말로 모든 데이터를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 다음 데이터가 삭제됩니다:\n- 모든 시간 추적 기록\n- 세션 기록\n- 시간 제한 설정\n- 일일 통계')) {
          clearData.disabled = true;
          clearData.innerHTML = '<span class="material-icons-round">hourglass_empty</span> 삭제 중...';
          try {
            await chrome.storage.local.clear();
            showSuccess('모든 데이터가 삭제되었습니다.');
            setTimeout(() => {
              updateUI();
              // 설정 뷰 새로고침
              if (state.currentView === 'settings') {
                showSettings();
              }
            }, 1000);
          } catch (error) {
            console.error('데이터 삭제 실패:', error);
            showError('데이터 삭제에 실패했습니다.');
          } finally {
            clearData.disabled = false;
            clearData.innerHTML = '<span class="material-icons-round">delete_forever</span> 모든 데이터 삭제';
          }
        }
      });
    }
  }

  // 간단한 모달 표시 함수
  function showModal(title, content) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;
    modal.innerHTML = `
      <div style="background: var(--background); border-radius: 12px; padding: 20px; max-width: 400px; max-height: 80vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0;">${title}</h3>
          <button class="close-modal" style="background: none; border: none; cursor: pointer; padding: 4px;">
            <span class="material-icons-round">close</span>
          </button>
        </div>
        ${content}
      </div>
    `;
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
    
    // 모달 내부의 설정 리스너도 설정
    setTimeout(() => {
      setupSettingsListeners();
    }, 100);
  }

  // ===== Auto Refresh =====
  function startAutoRefresh() {
    // 실시간 업데이트를 위해 requestAnimationFrame 사용 (60fps)
    function realtimeUpdate() {
      updateRealtimeDisplay();
      state.realtimeUpdateFrame = requestAnimationFrame(realtimeUpdate);
    }
    realtimeUpdate();

    // 전체 데이터 업데이트는 3초마다
    state.refreshInterval = setInterval(() => {
      updateUI();
      state.lastFullUpdate = Date.now();
    }, 3000);

    // 활성 탭 정보는 1초마다 갱신 (더 빠른 반응성)
    setInterval(async () => {
      try {
        const response = await sendMessage('getCurrentActive');
        if (response && response.success && response.currentActive) {
          // 이전 정보와 비교하여 변경사항이 있을 때만 업데이트
          const newInfo = response.currentActive;
          if (!state.lastActiveInfo || 
              state.lastActiveInfo.domain !== newInfo.domain ||
              state.lastActiveInfo.startTime !== newInfo.startTime) {
            state.lastActiveInfo = newInfo;
            state.lastUpdateTime = Date.now();
          } else {
            // 도메인과 startTime이 같으면 elapsedMinutes만 업데이트
            state.lastActiveInfo.elapsedMinutes = newInfo.elapsedMinutes;
          }
        } else if (response && response.success && !response.currentActive.isActive) {
          // 활성 탭이 없으면 정보 초기화
          state.lastActiveInfo = null;
        }
      } catch (error) {
        console.warn('getCurrentActive 실패:', error);
        // 실패해도 이전 정보는 유지 (타임아웃 처리)
        if (state.lastUpdateTime && Date.now() - state.lastUpdateTime > 10000) {
          // 10초 이상 업데이트가 없으면 초기화
          state.lastActiveInfo = null;
        }
      }
    }, 1000);
  }

  // 실시간 디스플레이 업데이트 (requestAnimationFrame으로 부드럽게)
  function updateRealtimeDisplay() {
    // state.data가 없어도 lastActiveInfo만으로 업데이트 가능하도록
    const daily = state.data?.daily || {};
    
    // 활성 탭 정보가 없고 데이터도 없으면 업데이트 불필요
    if (!state.lastActiveInfo && !state.data) return;
    
    // 활성 탭 정보가 있으면 실시간 계산
    if (state.lastActiveInfo && state.lastActiveInfo.isActive && state.lastActiveInfo.startTime) {
      const now = Date.now();
      const elapsed = now - state.lastActiveInfo.startTime;
      const elapsedMinutes = elapsed / 60000;

      // 오늘 총 시간 업데이트 (실시간)
      if (elements.totalTime) {
        const savedTotalTime = daily.totalTime || 0;
        const realtimeTotal = savedTotalTime + elapsedMinutes;
        const newText = formatTimeShort(realtimeTotal);
        if (elements.totalTime.textContent !== newText) {
          elements.totalTime.textContent = newText;
        }
      }

      // 현재 활성 도메인의 시간도 업데이트 (사이트 뷰와 대시보드만)
      if (state.lastActiveInfo.domain) {
        const domainTime = daily.domains?.[state.lastActiveInfo.domain] || 0;
        const realtimeDomainTime = domainTime + elapsedMinutes;

        // 사이트 뷰에서 업데이트
        if (state.currentView === 'sites') {
          const sitesDomainItem = document.querySelector(`#sitesList .domain-item[data-domain="${state.lastActiveInfo.domain}"]`);
          if (sitesDomainItem) {
            const sitesTimeValue = sitesDomainItem.querySelector('.time-value');
            if (sitesTimeValue) {
              const newTimeText = formatTimeMinutes(realtimeDomainTime);
              if (sitesTimeValue.textContent !== newTimeText) {
                sitesTimeValue.textContent = newTimeText;
              }
            }
          }
        }

        // 대시보드의 상위 사이트도 업데이트
        if (state.currentView === 'dashboard' && elements.dashboardContent) {
          const dashboardSiteItem = elements.dashboardContent.querySelector(`[data-site="${state.lastActiveInfo.domain}"]`);
          if (dashboardSiteItem) {
            const dashboardTimeSpan = dashboardSiteItem.querySelector('span:last-child');
            if (dashboardTimeSpan) {
              const newTimeText = formatTimeShort(realtimeDomainTime);
              if (dashboardTimeSpan.textContent !== newTimeText) {
                dashboardTimeSpan.textContent = newTimeText;
              }
            }
          }
        }
      }
    } else if (state.lastActiveInfo && !state.lastActiveInfo.isActive) {
      // 활성 탭이 없으면 저장된 시간만 표시
      if (elements.totalTime && daily.totalTime !== undefined) {
        const newText = formatTimeShort(daily.totalTime);
        if (elements.totalTime.textContent !== newText) {
          elements.totalTime.textContent = newText;
        }
      }
    }
  }

  // ===== Cleanup =====
  window.addEventListener('unload', () => {
    if (state.refreshInterval) {
      clearInterval(state.refreshInterval);
    }
    if (state.realtimeUpdateFrame) {
      cancelAnimationFrame(state.realtimeUpdateFrame);
    }
    if (state.dashboardUpdateInterval) {
      clearInterval(state.dashboardUpdateInterval);
    }
    if (state.sitesUpdateInterval) {
      clearInterval(state.sitesUpdateInterval);
    }
  });
});
