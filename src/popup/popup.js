// Receipt - popup.js

document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    receiptItems: document.getElementById('receiptItems'),
    receiptTotal: document.getElementById('receiptTotal'),
    receiptDate: document.getElementById('receiptDate'),
    receiptTime: document.getElementById('receiptTime'),
    receiptTagline: document.getElementById('receiptTagline'),
    shareReceiptBtn: document.getElementById('shareReceiptBtn'),
    themeToggle: document.getElementById('themeToggle'),
    sitesList: document.getElementById('sitesList'),
    dashboardContent: document.getElementById('dashboardContent'),
    siteDetailContent: document.getElementById('siteDetailContent'),
    siteDetailTitle: document.getElementById('siteDetailTitle'),
    dashboardTitle: document.getElementById('dashboardTitle'),
    sitesTitle: document.getElementById('sitesTitle'),
  };

  let state = {
    currentTheme: 'light',
    currentLanguage: 'ko',
    data: null,
    refreshInterval: null,
    realtimeUpdateFrame: null,
    currentView: 'home',
    selectedDomain: null,
    lastFullUpdate: null,
    lastActiveInfo: null,
    lastUpdateTime: null,
    dashboardUpdateInterval: null,
    sitesUpdateInterval: null,
    dashboardAccordionState: {}
  };

  const translations = {
    ko: {
      tagline: '오늘의 브라우저 사용 영수증',
      shareBtn: '이 영수증 공유하기',
      shareSuccess: '클립보드에 복사됐어요! 어디든 붙여넣기 하세요.',
      dashboardTitle: '통계',
      sitesTitle: '모든 사이트',
      minutesPlaceholder: '분 단위로 입력',
      setBtnText: '설정',
      noSites: '아직 방문한 사이트가 없어요',
      noSitesSmall: '웹사이트를 방문하면 자동으로 기록됩니다',
      overLimit: '제한 초과',
      remaining: '남음',
      used: '사용',
      cannotLoadData: '데이터를 불러올 수 없습니다',
      noSitesRecorded: '아직 기록된 사이트가 없습니다',
      settingsSaved: '저장되었습니다.',
      exporting: '내보내는 중...',
      exportData: '데이터 내보내기',
      deleteAllData: '모든 데이터 삭제',
      autoTrack: '자동 추적',
      autoTrackDesc: '탭 전환 시 자동으로 시간 추적',
      notifications: '알림',
      notificationsDesc: '시간 제한 도달 시 알림 표시',
      language: '언어',
      languageDesc: '인터페이스 언어 선택',
      exportDataDesc: '모든 데이터를 JSON 파일로 내보냅니다',
      clearData: '데이터 초기화',
      clearDataDesc: '모든 추적 데이터를 삭제합니다. 되돌릴 수 없습니다.',
      dailyUsage: '일간 사용량',
      weeklyUsage: '주간 사용량',
      monthlyUsage: '월간 사용량',
      yearlyUsage: '년간 사용량',
      topSites: '상위 사이트',
      overallStats: '전체 통계',
      totalRecordedDays: '총 기록 일수',
      trackedSites: '추적된 사이트 수',
      monthlyAverage: '월간 평균',
      noData: '데이터가 없습니다',
      totalUsageTime: '총 사용 시간',
      percentageOfTotal: '전체 대비 비율',
      dailyAverage: '일일 평균',
      todayUsage: '오늘 사용 시간',
      todayTotalTime: '오늘 총 사용 시간',
      hour: '시간', hours: '시간', minute: '분', minutes: '분', second: '초', seconds: '초',
      hourSuffix: '시', day: '일', week: '주차', month: '월', year: '년', sitesCount: '개',
      weekdays: ['월', '화', '수', '목', '금', '토', '일'],
      // Receipt home
      streakText: '일 연속 목표 달성',
      firstSiteText: '오늘 첫 방문',
      distractText: '딴짓',
      distractUnit: '회',
      // Pomodoro
      focusBtn: '포모도로 시작',
      focusBtnActive: '포모도로 종료',
      focusStartOk: '개 사이트 차단. 집중 시작!',
      focusStartFail: '포모도로 시작 실패',
      focusStopOk: '포모도로 종료',
      focusStopFail: '포모도로 종료 실패',
      // Share
      shareImageOk: '이미지 저장됐어요! 어디든 공유하세요.',
      shareFail: '공유 실패. 다시 시도해주세요.',
      // Time limit
      // Wrapped
      wrappedBtn: '이번 달 결산',
      wrappedGenerating: '생성 중...',
      wrappedOk: 'Wrapped 이미지 저장됐어요!',
      wrappedNoData: '데이터를 불러올 수 없습니다.',
      wrappedFail: '생성 실패. 다시 시도해주세요.',
      // Dashboard / sites
      dashboardError: '대시보드를 불러올 수 없습니다',
      sitesError: '사이트 목록을 불러올 수 없습니다',
      // Site detail
      recentHistory: '최근 7일 히스토리',
      weekAvg: '7일 평균',
      bestDay: '최다 사용일',
      addictionTitle: '중독도',
      addictionLow: '낮음', addictionMid: '보통', addictionHigh: '높음',
      revisitCount: '30분 내 재방문',
      revisitTotal: '총 방문',
      revisitUnit: '회',
      // Settings
      focusBlockTitle: '포모도로 차단 목록',
      focusBlockDesc: '포모도로 중 차단할 사이트를 설정하세요',
      focusBlockAdd: '추가',
      focusBlockCustomLabel: '직접 추가',
      exportOk: '내보내기 완료!',
      clearConfirm: '정말 모든 데이터를 삭제할까요? 되돌릴 수 없습니다.',
      clearOk: '삭제 완료',
      catSns: 'SNS', catEntertainment: '엔터테인먼트', catCommunity: '커뮤니티/뉴스',
    },
    en: {
      tagline: 'YOUR DAILY BROWSER RECEIPT',
      shareBtn: 'SHARE THIS RECEIPT',
      shareSuccess: 'Copied to clipboard! Paste it anywhere.',
      dashboardTitle: 'Stats',
      sitesTitle: 'All Sites',
      minutesPlaceholder: 'minutes',
      setBtnText: 'Set',
      noSites: 'No sites visited yet',
      noSitesSmall: 'Visit websites and they\'ll appear here',
      overLimit: 'Over Limit',
      remaining: 'remaining',
      used: 'Used',
      cannotLoadData: 'Cannot load data',
      noSitesRecorded: 'No sites recorded yet',
      settingsSaved: 'Saved.',
      exporting: 'Exporting...',
      exportData: 'Export Data',
      deleteAllData: 'Delete All Data',
      autoTrack: 'Auto Tracking',
      autoTrackDesc: 'Automatically track time when switching tabs',
      notifications: 'Notifications',
      notificationsDesc: 'Show notifications when time limit is reached',
      language: 'Language',
      languageDesc: 'Select interface language',
      exportDataDesc: 'Export all tracking data as a JSON file',
      clearData: 'Clear Data',
      clearDataDesc: 'Delete all tracking data. This cannot be undone.',
      dailyUsage: 'Daily Usage',
      weeklyUsage: 'Weekly Usage',
      monthlyUsage: 'Monthly Usage',
      yearlyUsage: 'Yearly Usage',
      topSites: 'Top Sites',
      overallStats: 'Overall Statistics',
      totalRecordedDays: 'Total Recorded Days',
      trackedSites: 'Tracked Sites',
      monthlyAverage: 'Monthly Average',
      noData: 'No data available',
      totalUsageTime: 'Total Usage Time',
      percentageOfTotal: '% of Total',
      dailyAverage: 'Daily Average',
      todayUsage: "Today's Usage",
      todayTotalTime: "Today's Total",
      hour: 'h', hours: 'h', minute: 'm', minutes: 'm', second: 's', seconds: 's',
      hourSuffix: 'h', day: '', week: 'wk', month: '', year: '', sitesCount: '',
      weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      // Receipt home
      streakText: 'day streak',
      firstSiteText: 'First site today',
      distractText: 'distractions',
      distractUnit: '',
      // Pomodoro
      focusBtn: 'Start Pomodoro',
      focusBtnActive: 'Stop Pomodoro',
      focusStartOk: 'sites blocked. Focus!',
      focusStartFail: 'Failed to start pomodoro',
      focusStopOk: 'Pomodoro ended',
      focusStopFail: 'Failed to stop pomodoro',
      // Share
      shareImageOk: 'Image saved! Share it anywhere.',
      shareFail: 'Share failed. Please try again.',
      // Time limit
      // Wrapped
      wrappedBtn: 'Monthly Recap',
      wrappedGenerating: 'Generating...',
      wrappedOk: 'Wrapped image saved!',
      wrappedNoData: 'No data available.',
      wrappedFail: 'Failed. Please try again.',
      // Dashboard / sites
      dashboardError: 'Could not load dashboard',
      sitesError: 'Could not load sites',
      // Site detail
      recentHistory: 'Last 7 Days',
      weekAvg: '7-day avg',
      bestDay: 'Best day',
      addictionTitle: 'Addiction Score',
      addictionLow: 'Low', addictionMid: 'Moderate', addictionHigh: 'High',
      revisitCount: 'Revisits within 30min',
      revisitTotal: 'Total visits',
      revisitUnit: '',
      // Settings
      focusBlockTitle: 'Pomodoro Block List',
      focusBlockDesc: 'Sites blocked during pomodoro',
      focusBlockAdd: 'Add',
      focusBlockCustomLabel: 'Custom',
      exportOk: 'Export complete!',
      clearConfirm: 'Delete all data? This cannot be undone.',
      clearOk: 'Deleted',
      catSns: 'Social', catEntertainment: 'Entertainment', catCommunity: 'Community/News',
    }
  };

  function t(key) {
    return translations[state.currentLanguage]?.[key] ?? translations.ko[key] ?? key;
  }

  init();

  async function init() {
    loadTheme();
    await loadLanguage();
    setupEventListeners();
    setupViewSystem();
    await updateUI();
    startAutoRefresh();
  }

  // ===== View System =====
  function setupViewSystem() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const viewName = newBtn.getAttribute('data-view');
        if (viewName) switchView(viewName);
      });
    });

    document.getElementById('backFromSiteDetail')?.addEventListener('click', () => switchView('sites'));
    document.getElementById('backFromSettings')?.addEventListener('click', () => switchView('home'));
  }

  function switchView(viewName) {
    if (!viewName || state.currentView === viewName) return;

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const targetView = document.getElementById(`${viewName}View`);
    if (!targetView) return;
    targetView.classList.add('active');

    const navBtn = document.querySelector(`.nav-btn[data-view="${viewName}"]`);
    if (navBtn) navBtn.classList.add('active');

    state.currentView = viewName;

    if (viewName === 'dashboard') {
      loadDashboard();
      if (state.dashboardUpdateInterval) clearInterval(state.dashboardUpdateInterval);
      state.dashboardUpdateInterval = setInterval(() => {
        if (state.currentView === 'dashboard') loadDashboard();
      }, 3000);
    } else if (viewName === 'sites') {
      loadSitesList();
      if (state.sitesUpdateInterval) clearInterval(state.sitesUpdateInterval);
      state.sitesUpdateInterval = setInterval(() => {
        if (state.currentView === 'sites') loadSitesList();
      }, 3000);
    } else if (viewName === 'settings') {
      showSettings();
    } else {
      if (state.dashboardUpdateInterval) { clearInterval(state.dashboardUpdateInterval); state.dashboardUpdateInterval = null; }
      if (state.sitesUpdateInterval) { clearInterval(state.sitesUpdateInterval); state.sitesUpdateInterval = null; }
    }
  }

  // ===== Theme =====
  function loadTheme() {
    chrome.storage.local.get(['theme'], (result) => {
      state.currentTheme = result.theme || 'light';
      applyTheme(state.currentTheme);
    });
  }

  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    const icon = elements.themeToggle?.querySelector('.material-icons-round');
    if (icon) icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
  }

  function toggleTheme() {
    state.currentTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(state.currentTheme);
    chrome.storage.local.set({ theme: state.currentTheme });
  }

  // ===== Language =====
  function loadLanguage() {
    return new Promise(resolve => {
      chrome.storage.local.get(['language', 'dashboardAccordionState'], (result) => {
        state.currentLanguage = result.language || 'ko';
        state.dashboardAccordionState = result.dashboardAccordionState || {};
        updateStaticText();
        resolve();
      });
    });
  }

  function updateStaticText() {
    if (elements.receiptTagline) elements.receiptTagline.textContent = t('tagline');
    if (elements.shareReceiptBtn) {
      elements.shareReceiptBtn.innerHTML = `<span class="material-icons-round">content_copy</span> ${t('shareBtn')}`;
    }
    if (elements.dashboardTitle) elements.dashboardTitle.textContent = t('dashboardTitle');
    if (elements.sitesTitle) elements.sitesTitle.textContent = t('sitesTitle');

    const focusModeBtn = document.getElementById('focusModeBtn');
    if (focusModeBtn) focusModeBtn.textContent = t('focusBtn');
    const pomoStopBtn = document.getElementById('pomoStopBtn');
    if (pomoStopBtn) pomoStopBtn.textContent = t('focusBtnActive');
  }

  function saveDashboardAccordionState() {
    chrome.storage.local.set({ dashboardAccordionState: state.dashboardAccordionState });
  }

  // ===== Context Comparison =====
  function getContextComparison(totalMinutes) {
    const ko = [
      { min: 480, text: '💀 하루 종일 온라인이에요. 몸 좀 움직여요.' },
      { min: 300, text: '😮 5시간이면 새 기술 하나 배울 수 있었는데요.' },
      { min: 180, text: '🎬 영화 두 편 볼 수 있었어요.' },
      { min: 120, text: '📚 책 한 챕터 + 낮잠도 잘 수 있었어요.' },
      { min: 90,  text: '☕ 카페에서 집중 한 세션 할 수 있었어요.' },
      { min: 60,  text: '🎵 앨범 한 장 통째로 들을 수 있었어요.' },
      { min: 30,  text: '🚶 동네 한 바퀴 산책할 수 있었어요.' },
      { min: 0,   text: '✅ 오늘 브라우저 사용 깔끔해요. 잘 했어요.' },
    ];
    const en = [
      { min: 480, text: '💀 You were online all day. Touch grass.' },
      { min: 300, text: '😮 5hrs = could\'ve learned a new skill.' },
      { min: 180, text: '🎬 That\'s 2 full movies.' },
      { min: 120, text: '📚 A book chapter + a proper nap.' },
      { min: 90,  text: '☕ A solid deep work session.' },
      { min: 60,  text: '🎵 One full album listen.' },
      { min: 30,  text: '🚶 A decent walk outside.' },
      { min: 0,   text: '✅ Clean browsing day. Keep it up.' },
    ];
    const list = state.currentLanguage === 'en' ? en : ko;
    return (list.find(item => totalMinutes >= item.min) || list[list.length - 1]).text;
  }

  // ===== Time Formatting =====
  function formatTimeShort(minutes) {
    if (!minutes || minutes < 0) return state.currentLanguage === 'ko' ? `0${t('minute')}` : '0m';
    const h = Math.floor(minutes / 60);
    const m = Math.floor(minutes % 60);
    if (h > 0 && m > 0) return state.currentLanguage === 'ko' ? `${h}${t('hour')} ${m}${t('minute')}` : `${h}h ${m}m`;
    if (h > 0) return state.currentLanguage === 'ko' ? `${h}${t('hour')}` : `${h}h`;
    return state.currentLanguage === 'ko' ? `${m}${t('minute')}` : `${m}m`;
  }

  function formatTimeMinutes(minutes) {
    return formatTimeShort(minutes);
  }

  function getFaviconUrl(domain) {
    return `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
  }

  // ===== Receipt Rendering =====
  function renderReceipt(data) {
    const now = new Date();
    const dateStr = now.toLocaleDateString(state.currentLanguage === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
    const timeStr = now.toLocaleTimeString(state.currentLanguage === 'ko' ? 'ko-KR' : 'en-US', {
      hour: '2-digit', minute: '2-digit'
    });

    if (elements.receiptDate) elements.receiptDate.textContent = dateStr;
    if (elements.receiptTime) elements.receiptTime.textContent = timeStr;

    // Streak display
    const streakEl = document.getElementById('receiptStreak');
    const streak = data.streak || {};
    if (streakEl) {
      if (streak.current > 0) {
        streakEl.textContent = `${streak.current} ${t('streakText')}`;
        streakEl.style.display = '';
      } else {
        streakEl.style.display = 'none';
      }
    }

    // First site of day display
    const firstSiteEl = document.getElementById('receiptFirstSite');
    if (firstSiteEl) {
      if (data.firstSite) {
        firstSiteEl.textContent = `${t('firstSiteText')}: ${data.firstSite.domain}`;
        firstSiteEl.style.display = '';
      } else {
        firstSiteEl.style.display = 'none';
      }
    }

    // Distracted switches display
    const distractEl = document.getElementById('receiptDistract');
    if (distractEl) {
      const distracted = data.daily?.distractedSwitches || 0;
      distractEl.textContent = distracted > 0 ? `${distracted}${t('distractUnit')} ${t('distractText')}` : '';
    }

    const daily = data.daily || {};
    const currentActive = data.currentActive || {};
    const domains = { ...daily.domains };

    // 실시간 활성 탭 시간 추가
    if (currentActive.isActive && currentActive.domain && currentActive.startTime) {
      const elapsed = (Date.now() - currentActive.startTime) / 60000;
      domains[currentActive.domain] = (domains[currentActive.domain] || 0) + elapsed;
    }

    const sorted = Object.entries(domains)
      .filter(([, m]) => m > 0.1)
      .sort(([, a], [, b]) => b - a);

    let totalMinutes = Object.values(domains).reduce((s, m) => s + m, 0);
    if (currentActive.isActive && currentActive.startTime) {
      totalMinutes = Math.max(totalMinutes, daily.totalTime || 0);
    }

    if (elements.receiptTotal) {
      elements.receiptTotal.textContent = formatTimeShort(totalMinutes);
    }

    if (!elements.receiptItems) return;

    // 맥락 비교 줄 항상 표시
    const contextEl = document.getElementById('receiptContext');
    if (contextEl) contextEl.textContent = getContextComparison(totalMinutes);

    if (sorted.length === 0) {
      elements.receiptItems.innerHTML = `
        <div class="receipt-empty" style="padding:24px 0;">
          <div style="font-size:20px;margin-bottom:8px;">🌿</div>
          <div style="font-size:10px;letter-spacing:1px;opacity:0.7;">${state.currentLanguage === 'ko' ? '아직 방문한 사이트가 없어요' : 'NO SITES VISITED YET'}</div>
          <div style="font-size:9px;opacity:0.45;margin-top:4px;">${state.currentLanguage === 'ko' ? '웹사이트를 방문하면 자동으로 기록됩니다' : 'VISIT WEBSITES TO START TRACKING'}</div>
        </div>`;
      return;
    }

    elements.receiptItems.innerHTML = sorted.slice(0, 8).map(([domain, minutes]) => {
      const isActive = currentActive.domain === domain && currentActive.isActive;
      const yesterdayTime = data?.daily?.yesterdayDomains?.[domain] || 0;
      const delta = minutes - yesterdayTime;
      const deltaStr = Math.abs(delta) > 1 ? (delta > 0 ? `▲${formatTimeShort(delta)}` : `▼${formatTimeShort(-delta)}`) : '';
      const deltaColor = delta > 0 ? '#ef4444' : '#22c55e';
      return `
        <div class="receipt-item ${isActive ? 'active-site' : ''}" data-action="site-detail" data-site="${domain}">
          <img src="${getFaviconUrl(domain)}" class="receipt-item-favicon" onerror="this.src='images/icon16.png'">
          <span class="receipt-item-name">${domain}</span>
          <span class="receipt-item-dots"></span>
          <span class="receipt-item-time">${formatTimeShort(minutes)}${deltaStr ? `<span style="font-size:9px;color:${deltaColor};margin-left:3px;">${deltaStr}</span>` : ''}</span>
          ${isActive ? '<span class="receipt-active-dot"></span>' : ''}
        </div>`;
    }).join('');

    elements.receiptItems.querySelectorAll('[data-action="site-detail"]').forEach(item => {
      item.addEventListener('click', () => {
        const domain = item.getAttribute('data-site');
        if (domain) showSiteDetail(domain);
      });
    });
  }

  // ===== Category Bar =====
  function renderCategoryBar(data) {
    const categoryBar = document.getElementById('categoryBar');
    if (!categoryBar) return;
    const cats = data?.daily?.categories || {};
    const total = Object.values(cats).reduce((s, v) => s + v, 0);
    if (total === 0) { categoryBar.style.display = 'none'; return; }
    categoryBar.style.display = 'flex';
    const colors = { work: '#6c63ff', social: '#f59e0b', entertainment: '#ef4444', news: '#3b82f6', shopping: '#10b981', other: '#9ca3af' };
    categoryBar.innerHTML = Object.entries(cats)
      .filter(([, v]) => v > 0)
      .map(([cat, v]) => {
        const pct = (v / total) * 100;
        return `<div style="flex:${pct};background:${colors[cat] || '#9ca3af'};height:100%;min-width:1px;" title="${cat}: ${Math.round(pct)}%"></div>`;
      }).join('');
  }

  // ===== Pomodoro Widget =====
  let _pomoCountdownInterval = null;
  let _pomoSelectedMin = 25; // default selection

  function _pomoFormatTime(msRemaining) {
    const totalSec = Math.max(0, Math.ceil(msRemaining / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function _pomoClearCountdown() {
    if (_pomoCountdownInterval) {
      clearInterval(_pomoCountdownInterval);
      _pomoCountdownInterval = null;
    }
  }

  function _pomoStartCountdown(endTime) {
    _pomoClearCountdown();
    const el = document.getElementById('pomoCountdown');
    if (!el) return;
    const tick = () => {
      const remaining = endTime - Date.now();
      el.textContent = _pomoFormatTime(remaining);
      if (remaining <= 0) { _pomoClearCountdown(); updateFocusModeBtn(); }
    };
    tick();
    _pomoCountdownInterval = setInterval(tick, 500);
  }

  function _pomoShowActive(fm) {
    document.getElementById('pomodoroSetup').style.display = 'none';
    document.getElementById('pomodoroActive').style.display = 'block';
    const desc = document.getElementById('focusModeDesc');
    const ko = state.currentLanguage === 'ko';
    if (desc) desc.textContent = ko
      ? `${fm.blockedDomains?.length || 0}개 사이트 차단 중`
      : `${fm.blockedDomains?.length || 0} sites blocked`;
    const stopBtn = document.getElementById('pomoStopBtn');
    if (stopBtn) stopBtn.textContent = t('focusBtnActive');
    _pomoStartCountdown(fm.endTime);
  }

  function _pomoShowSetup() {
    _pomoClearCountdown();
    document.getElementById('pomodoroSetup').style.display = 'block';
    document.getElementById('pomodoroActive').style.display = 'none';
    const btn = document.getElementById('focusModeBtn');
    if (btn) btn.textContent = t('focusBtn');
    _pomoUpdatePresetHighlight();
  }

  function _pomoUpdatePresetHighlight() {
    document.querySelectorAll('.pomo-preset').forEach(b => {
      const isSelected = parseInt(b.dataset.min) === _pomoSelectedMin;
      b.style.background = isSelected ? 'var(--accent)' : '';
      b.style.color = isSelected ? '#fff' : '';
      b.style.borderColor = isSelected ? 'var(--accent)' : '';
    });
    const custom = document.getElementById('pomoCustomMin');
    const presets = [25, 45, 60];
    if (custom) custom.value = presets.includes(_pomoSelectedMin) ? '' : _pomoSelectedMin;
  }

  async function updateFocusModeBtn() {
    try {
      const res = await sendMessage('getFocusMode');
      const fm = res?.focusMode;
      if (fm?.active && fm.endTime > Date.now()) {
        _pomoShowActive(fm);
      } else {
        _pomoShowSetup();
      }
    } catch (e) { _pomoShowSetup(); }
  }

  // 집중 모드 기본 차단 목록 (카테고리별)
  const FOCUS_BLOCK_DEFAULTS = {
    sns: [
      'twitter.com','x.com','instagram.com','facebook.com','tiktok.com',
      'reddit.com','threads.net','discord.com','linkedin.com','tumblr.com',
      'pinterest.com','snapchat.com','kakaotalk.com','band.us',
      'weibo.com','vk.com','bsky.app','bereal.com','mastodon.social',
      'whatsapp.com','telegram.org','line.me','kakao.com',
    ],
    entertainment: [
      'youtube.com','netflix.com','twitch.tv','disneyplus.com',
      'wavve.com','watcha.com','spotify.com','vimeo.com',
      'bilibili.com','afreecatv.com','chzzk.naver.com','nicovideo.jp',
      'hulu.com','max.com','primevideo.com','peacocktv.com',
      'paramountplus.com','crunchyroll.com','deezer.com','soundcloud.com',
      'tidal.com','kick.com','rumble.com','dailymotion.com',
      '9gag.com','imgur.com','webtoons.com','lezhin.com',
    ],
    community: [
      'naver.com','daum.net','dcinside.com','fmkorea.com','mlbpark.com',
      'theqoo.net','instiz.net','clien.net','ppomppu.co.kr',
      'quora.com','medium.com','producthunt.com','news.ycombinator.com',
      'buzzfeed.com','4chan.org','lemmy.ml','digg.com',
      'humorindians.com','ifunny.co','9gag.com',
    ],
  };

  async function getFocusBlockList() {
    const { focusBlockConfig = {} } = await chrome.storage.local.get(['focusBlockConfig']);
    const disabled = new Set(focusBlockConfig.disabled || []);
    const custom = focusBlockConfig.custom || [];
    const defaults = [
      ...FOCUS_BLOCK_DEFAULTS.sns,
      ...FOCUS_BLOCK_DEFAULTS.entertainment,
      ...FOCUS_BLOCK_DEFAULTS.community,
    ];
    return [...defaults.filter(d => !disabled.has(d)), ...custom];
  }

  async function startFocusMode() {
    const min = _pomoSelectedMin;
    if (!min || min < 1) { showError(t('invalidTime')); return; }
    try {
      const domains = await getFocusBlockList();
      const res = await sendMessage('startFocusMode', { minutes: min, domains });
      if (res?.success) {
        updateFocusModeBtn();
        showSuccess(`${domains.length} ${t('focusStartOk')}`);
      }
    } catch (e) { showError(t('focusStartFail')); }
  }

  async function stopFocusMode() {
    try {
      await sendMessage('stopFocusMode');
      _pomoShowSetup();
      showSuccess(t('focusStopOk'));
    } catch (e) { showError(t('focusStopFail')); }
  }

  // ===== Canvas Image Generation =====
  function drawDashedLine(ctx, x1, y, x2, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.setLineDash([3, 5]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
    ctx.restore();
  }

  function generateReceiptCanvas() {
    const data = state.data;
    const daily = data?.daily || {};
    const currentActive = data?.currentActive || {};
    const domains = { ...daily.domains };

    if (currentActive.isActive && currentActive.domain && currentActive.startTime) {
      const elapsed = (Date.now() - currentActive.startTime) / 60000;
      domains[currentActive.domain] = (domains[currentActive.domain] || 0) + elapsed;
    }

    const sorted = Object.entries(domains)
      .filter(([, m]) => m > 0.1)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    const totalMinutes = Object.values(domains).reduce((s, m) => s + m, 0);
    const context = getContextComparison(totalMinutes);
    const noData = sorted.length === 0;

    const scale = 2;
    const W = 420;
    const PAD = 36;
    const mono = '"Courier New", "Courier", monospace';

    // Calculate height dynamically based on content
    const lineH = 26;
    const itemsH = noData ? 60 : sorted.length * lineH;
    const H = 100 + 70 + itemsH + 80 + 90 + 80;

    const canvas = document.createElement('canvas');
    canvas.width = W * scale;
    canvas.height = H * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // Always white paper background — real receipts are always white
    const bg = '#ffffff';
    const fg = '#111111';
    const mid = '#444444';
    const light = '#888888';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const now = new Date();
    const locale = state.currentLanguage === 'ko' ? 'ko-KR' : 'en-US';

    function solidLine(y) {
      ctx.save();
      ctx.strokeStyle = fg;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(PAD, y);
      ctx.lineTo(W - PAD, y);
      ctx.stroke();
      ctx.restore();
    }

    let y = 52;

    // Title — large bold
    ctx.font = `bold 32px ${mono}`;
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.fillText('RECEIPT', W / 2, y);
    y += 10;

    // Subtitle — date
    const dateStr = now.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.font = `13px ${mono}`;
    ctx.fillStyle = mid;
    ctx.fillText(dateStr.toUpperCase(), W / 2, y + 18);
    y += 36;

    solidLine(y); y += 24;

    // Site rows
    if (noData) {
      ctx.font = `bold 13px ${mono}`;
      ctx.fillStyle = light;
      ctx.textAlign = 'center';
      ctx.fillText('NO SITES VISITED YET', W / 2, y + 24);
      y += 60;
    } else {
      ctx.font = `13px ${mono}`;
      for (const [domain, minutes] of sorted) {
        const maxLen = 28;
        const label = domain.length > maxLen ? domain.slice(0, maxLen - 1) + '…' : domain;
        const timeLabel = formatTimeShort(minutes).toUpperCase();

        ctx.fillStyle = fg;
        ctx.textAlign = 'left';
        ctx.fillText(label.toUpperCase(), PAD, y);
        ctx.textAlign = 'right';
        ctx.fillText(timeLabel, W - PAD, y);
        y += lineH;
      }
    }

    y += 10;
    solidLine(y); y += 22;

    // Total
    ctx.font = `bold 15px ${mono}`;
    ctx.fillStyle = fg;
    ctx.textAlign = 'left';  ctx.fillText('TOTAL TIME', PAD, y);
    ctx.textAlign = 'right'; ctx.fillText(formatTimeShort(totalMinutes).toUpperCase(), W - PAD, y);
    y += 32;

    solidLine(y); y += 22;

    // Context line
    const ctxLines = context.replace(/^[^\s]+\s/, '').split('. ');
    ctx.font = `11px ${mono}`;
    ctx.fillStyle = mid;
    ctx.textAlign = 'center';
    for (const line of ctxLines) {
      if (line.trim()) { ctx.fillText(line.toUpperCase(), W / 2, y); y += 17; }
    }
    y += 8;

    solidLine(y); y += 22;

    // Transaction footer
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const fakeRef = Math.floor(Math.random() * 9000000 + 1000000);
    ctx.font = `11px ${mono}`;
    ctx.fillStyle = mid;
    ctx.textAlign = 'left';  ctx.fillText(now.toLocaleDateString('en-US', { day:'2-digit', month:'2-digit', year:'2-digit' }), PAD, y);
    ctx.textAlign = 'center'; ctx.fillText(timeStr, W / 2, y);
    ctx.textAlign = 'right';  ctx.fillText(`REF ${fakeRef}`, W - PAD, y);
    y += 22;

    ctx.font = `bold 11px ${mono}`;
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.fillText('* THANK YOU FOR YOUR TIME *', W / 2, y);
    y += 18;

    ctx.font = `10px ${mono}`;
    ctx.fillStyle = light;
    ctx.fillText('ISSUED BY RECEIPT BROWSER EXTENSION', W / 2, y);

    return canvas;
  }

  // ===== Monthly Recap Canvas (thermal receipt style) =====
  function generateWrappedCanvas(monthData) {
    const mono = '"Courier New", "Courier", monospace';
    const PW = 400; // paper width
    const PAD = 32;
    const scale = 2;

    // ── measure dynamic height ──────────────────────────────
    const top5 = monthData.top5Sites || [];
    const hasAddictive = !!monthData.mostAddictive;
    const hasPeakHour = monthData.peakHour !== null && monthData.peakHour !== undefined;
    const hasPeakDay = !!monthData.peakDay;
    const itemH = 26;
    const H = 80 + 60 + 24 + 60 + 24 + (top5.length * itemH) + 24
            + (hasPeakHour ? 36 : 0) + (hasAddictive ? 36 : 0) + (hasPeakDay ? 36 : 0)
            + 60;

    const canvas = document.createElement('canvas');
    canvas.width = PW * scale;
    canvas.height = H * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // ── background ──────────────────────────────────────────
    ctx.fillStyle = '#f8f8f6';
    ctx.fillRect(0, 0, PW, H);

    const dash = (y2) => {
      ctx.save();
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(PAD, y2);
      ctx.lineTo(PW - PAD, y2);
      ctx.stroke();
      ctx.restore();
    };

    let y = 0;

    // ── header ──────────────────────────────────────────────
    y += 32;
    ctx.font = `bold 10px ${mono}`;
    ctx.fillStyle = '#999999';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '3px';
    ctx.fillText('RECEIPT', PW / 2, y);
    y += 18;

    ctx.font = `bold 10px ${mono}`;
    ctx.fillStyle = '#bbbbbb';
    ctx.letterSpacing = '1px';
    ctx.fillText('MONTHLY RECAP', PW / 2, y);
    y += 20;

    dash(y); y += 20;

    // ── month ───────────────────────────────────────────────
    const [year, mon] = (monthData.month || '').split('-');
    const monthName = mon
      ? new Date(parseInt(year), parseInt(mon) - 1, 1)
          .toLocaleString(state.currentLanguage === 'ko' ? 'ko-KR' : 'en-US', { month: 'long', year: 'numeric' })
          .toUpperCase()
      : (monthData.month || '').toUpperCase();

    ctx.font = `bold 20px ${mono}`;
    ctx.fillStyle = '#111111';
    ctx.letterSpacing = '0px';
    ctx.textAlign = 'center';
    ctx.fillText(monthName, PW / 2, y + 4);
    y += 26;

    // ── total ───────────────────────────────────────────────
    const totalH = Math.floor((monthData.totalMinutes || 0) / 60);
    const totalM = Math.round((monthData.totalMinutes || 0) % 60);
    const totalStr = totalH > 0 ? `${totalH}h ${totalM}m` : `${totalM}m`;

    ctx.font = `bold 9px ${mono}`;
    ctx.fillStyle = '#aaaaaa';
    ctx.letterSpacing = '2px';
    ctx.fillText('TOTAL THIS MONTH', PW / 2, y + 14);
    y += 20;

    ctx.font = `bold 44px ${mono}`;
    ctx.fillStyle = '#111111';
    ctx.letterSpacing = '-1px';
    ctx.fillText(totalStr, PW / 2, y + 32);
    y += 42;

    dash(y); y += 24;

    // ── top sites ───────────────────────────────────────────
    ctx.font = `bold 9px ${mono}`;
    ctx.fillStyle = '#aaaaaa';
    ctx.letterSpacing = '2px';
    ctx.textAlign = 'left';
    ctx.fillText('TOP SITES', PAD, y);
    y += 18;

    const maxM = top5.length > 0 ? Math.max(...top5.map(s => s.minutes), 1) : 1;
    const barW = PW - PAD * 2 - 64;

    top5.forEach((site, i) => {
      const label = site.domain.length > 20 ? site.domain.slice(0, 19) + '.' : site.domain;
      const filled = Math.max((site.minutes / maxM) * barW, 4);

      ctx.font = `9px ${mono}`;
      ctx.fillStyle = '#333333';
      ctx.letterSpacing = '0px';
      ctx.textAlign = 'left';
      ctx.fillText(label, PAD, y + 10);

      ctx.fillStyle = '#dddddd';
      ctx.fillRect(PAD, y + 14, barW, 3);
      ctx.fillStyle = i === 0 ? '#333333' : '#888888';
      ctx.fillRect(PAD, y + 14, filled, 3);

      ctx.font = `9px ${mono}`;
      ctx.fillStyle = '#555555';
      ctx.textAlign = 'right';
      ctx.fillText(formatTimeShort(site.minutes), PW - PAD, y + 10);

      y += itemH;
    });

    y += 8;
    dash(y); y += 20;

    // ── stats rows ──────────────────────────────────────────
    const row = (label, val) => {
      ctx.font = `9px ${mono}`;
      ctx.fillStyle = '#aaaaaa';
      ctx.letterSpacing = '1px';
      ctx.textAlign = 'left';
      ctx.fillText(label, PAD, y);
      ctx.font = `bold 11px ${mono}`;
      ctx.fillStyle = '#222222';
      ctx.letterSpacing = '0px';
      ctx.textAlign = 'right';
      ctx.fillText(val, PW - PAD, y);
      y += 28;
    };

    if (hasPeakHour) row('PEAK HOUR', `${String(monthData.peakHour).padStart(2,'0')}:00`);
    if (hasPeakDay)  row('BUSIEST DAY', monthData.peakDay);
    if (hasAddictive) row('MOST VISITED', `${monthData.mostAddictive.domain}`);

    dash(y); y += 20;

    // ── footer ──────────────────────────────────────────────
    ctx.font = `9px ${mono}`;
    ctx.fillStyle = '#cccccc';
    ctx.letterSpacing = '1px';
    ctx.textAlign = 'center';
    ctx.fillText('* THANK YOU FOR YOUR TIME *', PW / 2, y + 14);

    return canvas;
  }

  // ===== Share Receipt =====
  function buildShareText(data) {
    const now = new Date();
    const locale = state.currentLanguage === 'ko' ? 'ko-KR' : 'en-US';
    const dateStr = now.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
    const daily = data?.daily || {};
    const currentActive = data?.currentActive || {};
    const domains = { ...daily.domains };

    if (currentActive.isActive && currentActive.domain && currentActive.startTime) {
      const elapsed = (Date.now() - currentActive.startTime) / 60000;
      domains[currentActive.domain] = (domains[currentActive.domain] || 0) + elapsed;
    }

    const sorted = Object.entries(domains)
      .filter(([, m]) => m > 0.1)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);

    const totalMinutes = Object.values(domains).reduce((s, m) => s + m, 0);

    const pad = (str, len) => {
      const s = String(str);
      return s + '.'.repeat(Math.max(1, len - s.length));
    };

    const lines = [
      '🧾 RECEIPT',
      '─'.repeat(28),
      `Date: ${dateStr}`,
      '─'.repeat(28),
      ...sorted.map(([domain, minutes]) => {
        const d = domain.length > 16 ? domain.slice(0, 15) + '…' : domain;
        return `${pad(d, 20)} ${formatTimeShort(minutes)}`;
      }),
      '─'.repeat(28),
      `${'TOTAL'.padEnd(20)} ${formatTimeShort(totalMinutes)}`,
      '─'.repeat(28),
      '* THANK YOU FOR YOUR TIME *',
      '',
      'via Receipt extension'
    ];

    return lines.join('\n');
  }

  async function shareReceipt() {
    const btn = elements.shareReceiptBtn;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="material-icons-round">hourglass_empty</span> GENERATING...';
    }

    try {
      const canvas = generateReceiptCanvas();
      const dateStr = new Date().toISOString().split('T')[0];

      // 이미지 다운로드
      await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `receipt-${dateStr}.png`;
          a.click();
          URL.revokeObjectURL(url);
          resolve();
        }, 'image/png');
      });

      // 텍스트도 클립보드에
      try {
        await navigator.clipboard.writeText(buildShareText(state.data));
      } catch (_) {}

      const msg = state.currentLanguage === 'ko'
        ? t('shareImageOk')
        : 'Image saved! Share it anywhere 🧾';
      showSuccess(msg);

      if (btn) {
        btn.innerHTML = `<span class="material-icons-round">check</span> SAVED!`;
        setTimeout(() => {
          btn.innerHTML = `<span class="material-icons-round">content_copy</span> ${t('shareBtn')}`;
          btn.disabled = false;
        }, 2000);
      }
    } catch (e) {
      console.error('Share failed:', e);
      // 폴백: 텍스트만 복사
      try {
        await navigator.clipboard.writeText(buildShareText(state.data));
        showSuccess(t('shareSuccess'));
      } catch (_) {
        showError(t('shareFail'));
      }
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span class="material-icons-round">content_copy</span> ${t('shareBtn')}`;
      }
    }
  }

  // ===== Main UI Update =====
  async function updateUI() {
    try {
      const response = await sendMessage('getDetailedStats');
      if (!response || !response.success || !response.data) return;

      state.data = response.data;
      if (response.data.currentActive) {
        state.lastActiveInfo = response.data.currentActive;
        state.lastUpdateTime = Date.now();
      }

      renderReceipt(response.data);
      renderCategoryBar(response.data);

      if (state.currentView === 'sites') loadSitesList();
      else if (state.currentView === 'dashboard') loadDashboard();

    } catch (error) {
      console.error('UI 업데이트 실패:', error);
    }
  }

  // ===== Time Limit =====
  // ===== Event Listeners =====
  function setupEventListeners() {
    elements.themeToggle?.addEventListener('click', toggleTheme);
    elements.shareReceiptBtn?.addEventListener('click', shareReceipt);

    // Pomodoro setup
    document.querySelectorAll('.pomo-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        _pomoSelectedMin = parseInt(btn.dataset.min);
        const custom = document.getElementById('pomoCustomMin');
        if (custom) custom.value = '';
        _pomoUpdatePresetHighlight();
      });
    });
    const pomoCustom = document.getElementById('pomoCustomMin');
    if (pomoCustom) {
      pomoCustom.addEventListener('input', () => {
        const v = parseInt(pomoCustom.value);
        if (v > 0) {
          _pomoSelectedMin = v;
          document.querySelectorAll('.pomo-preset').forEach(b => {
            b.style.background = '';
            b.style.color = '';
            b.style.borderColor = '';
          });
        }
      });
    }
    const focusModeBtn = document.getElementById('focusModeBtn');
    if (focusModeBtn) focusModeBtn.onclick = startFocusMode;
    const pomoStopBtn = document.getElementById('pomoStopBtn');
    if (pomoStopBtn) pomoStopBtn.onclick = stopFocusMode;
    updateFocusModeBtn();
    _pomoUpdatePresetHighlight();
  }

  // ===== Message =====
  function sendMessage(action, data = {}) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action, ...data }, (response) => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve(response);
      });
    });
  }

  // ===== Notifications =====
  function showNotification(message, type = 'info') {
    const n = document.createElement('div');
    n.className = `notification ${type}`;
    const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';
    n.innerHTML = `<span class="material-icons-round">${icon}</span><span>${message}</span>`;
    document.body.appendChild(n);
    requestAnimationFrame(() => n.classList.add('show'));
    setTimeout(() => { n.classList.remove('show'); setTimeout(() => n.remove(), 300); }, 3000);
  }

  function showError(msg) { showNotification(msg, 'error'); }
  function showSuccess(msg) { showNotification(msg, 'success'); }

  // ===== Dashboard =====
  async function loadDashboard() {
    if (!elements.dashboardContent) return;
    try {
      const response = await sendMessage('getDetailedStats');
      if (!response?.success || !response.data) {
        elements.dashboardContent.innerHTML = `<div class="empty-state"><p>${t('cannotLoadData')}</p></div>`;
        return;
      }

      const data = response.data;
      const daily = data.daily || {};
      const monthly = data.monthly || {};
      const yearly = data.yearly || {};
      const sites = data.sites || {};
      const monthlyAggregated = data.monthlyAggregated || null;

      const hourlyChart = daily.hourlyData || Array(24).fill(0);
      const maxHourly = Math.max(...hourlyChart, 1);
      const hourlyHTML = hourlyChart.map((value, hour) => {
        const pct = (value / maxHourly) * 100;
        return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span style="font-size:10px;width:28px;color:var(--text-secondary);">${hour}${t('hourSuffix')}</span>
          <div style="flex:1;height:12px;background:var(--border);border-radius:3px;overflow:hidden;">
            <div class="chart-bar" style="width:${pct}%;height:100%;"></div>
          </div>
          <span style="font-size:10px;color:var(--text-secondary);min-width:40px;">${formatTimeShort(value)}</span>
        </div>`;
      }).join('');

      const weeklyData = daily.weeklyData || Array(7).fill(0);
      const maxWeekly = Math.max(...weeklyData, 1);
      const weeklyHTML = weeklyData.map((value, i) => {
        const pct = (value / maxWeekly) * 100;
        return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span style="font-size:10px;width:20px;color:var(--text-secondary);">${t('weekdays')[i]}</span>
          <div style="flex:1;height:12px;background:var(--border);border-radius:3px;overflow:hidden;">
            <div class="chart-bar" style="width:${pct}%;height:100%;"></div>
          </div>
          <span style="font-size:10px;color:var(--text-secondary);min-width:40px;">${formatTimeShort(value)}</span>
        </div>`;
      }).join('');

      const topSites = sites.topSitesLabels || [];
      const topSitesData = sites.topSitesData || [];
      const maxSite = Math.max(...topSitesData, 1);
      const topSitesHTML = topSites.map((domain, i) => {
        const time = topSitesData[i] || 0;
        const pct = (time / maxSite) * 100;
        return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;cursor:pointer;" data-action="site-detail" data-site="${domain}">
          <img src="${getFaviconUrl(domain)}" style="width:14px;height:14px;border-radius:2px;" onerror="this.src='images/icon16.png'">
          <span style="font-size:11px;flex:1;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${domain}</span>
          <div style="width:80px;height:10px;background:var(--border);border-radius:3px;overflow:hidden;">
            <div class="chart-bar" style="width:${pct}%;height:100%;"></div>
          </div>
          <span style="font-size:10px;color:var(--text-secondary);min-width:36px;text-align:right;">${formatTimeShort(time)}</span>
        </div>`;
      }).join('');

      // 월간 주별
      const trendLabels = monthly.trendLabels || [];
      const trendData = monthly.trendData || [];
      const maxMonthly = Math.max(...trendData, 1);
      const monthlyHTML = trendData.length > 0
        ? trendData.map((value, i) => {
            const pct = (value / maxMonthly) * 100;
            return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span style="font-size:10px;width:44px;color:var(--text-secondary);">${trendLabels[i] || `${i+1}주차`}</span>
              <div style="flex:1;height:12px;background:var(--border);border-radius:3px;overflow:hidden;">
                <div class="chart-bar" style="width:${pct}%;height:100%;"></div>
              </div>
              <span style="font-size:10px;color:var(--text-secondary);min-width:40px;">${formatTimeShort(value)}</span>
            </div>`;
          }).join('')
        : `<div class="text-secondary" style="text-align:center;padding:16px;">${t('noData')}</div>`;

      // 년간 월별
      const yearlyTotals = yearly.monthlyTotals || [];
      const yearlyLabels = yearly.monthlyLabels || [];
      const maxYearly = Math.max(...yearlyTotals, 1);
      const yearlyHTML = yearlyTotals.length > 0
        ? yearlyTotals.map((value, i) => {
            const pct = (value / maxYearly) * 100;
            return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span style="font-size:10px;width:32px;color:var(--text-secondary);">${yearlyLabels[i] || ''}</span>
              <div style="flex:1;height:12px;background:var(--border);border-radius:3px;overflow:hidden;">
                <div class="chart-bar" style="width:${pct}%;height:100%;"></div>
              </div>
              <span style="font-size:10px;color:var(--text-secondary);min-width:40px;">${formatTimeShort(value)}</span>
            </div>`;
          }).join('')
        : `<div class="text-secondary" style="text-align:center;padding:16px;">${t('noData')}</div>`;

      const now = new Date();
      const allDailyStats = data.dailyStats || {};
      const todayMonth = now.getMonth() + 1;
      const todayDate = now.getDate();
      const todayYear = now.getFullYear();

      const getWeekNumberInMonth = (date) => {
        const y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
        const firstDay = new Date(y, m, 1).getDay();
        const firstSunday = 1 - firstDay;
        const currentSunday = d - date.getDay();
        return Math.max(1, Math.floor((currentSunday - firstSunday) / 7) + 1);
      };
      const currentWeek = getWeekNumberInMonth(now);

      const totalDays = Object.keys(allDailyStats).filter(k => {
        const d = allDailyStats[k];
        return d && (d.totalTime > 0 || Object.keys(d.domains || {}).length > 0);
      }).length;

      const allDomains = new Set();
      Object.values(allDailyStats).forEach(day => {
        if (day?.domains) Object.keys(day.domains).forEach(d => { if (day.domains[d] > 0) allDomains.add(d); });
      });

      const currentMonthKey = `${todayYear}-${String(todayMonth).padStart(2, '0')}`;
      const monthDays = Object.keys(allDailyStats).filter(k => {
        if (!k.startsWith(currentMonthKey)) return false;
        const d = allDailyStats[k];
        return d && (d.totalTime > 0 || Object.keys(d.domains || {}).length > 0);
      }).length;
      const monthlyTotal = monthlyAggregated ? monthlyAggregated.totalMinutes : 0;
      const monthlyAverage = monthDays > 0 ? Math.round(monthlyTotal / monthDays) : (monthly.averageTime || 0);

      const todayTitle = state.currentLanguage === 'ko'
        ? `${t('dailyUsage')} (${todayMonth}/${todayDate})`
        : `${t('dailyUsage')} (${todayMonth}/${todayDate})`;
      const weeklyTitle = state.currentLanguage === 'ko'
        ? `${t('weeklyUsage')} (${todayMonth}월 ${currentWeek}주차)`
        : `${t('weeklyUsage')} (Week ${currentWeek})`;
      const monthlyTitle = `${t('monthlyUsage')} (${todayMonth}/${todayYear})`;
      const yearlyTitle = `${t('yearlyUsage')} (${todayYear})`;

      elements.dashboardContent.innerHTML = `
        <button id="wrappedBtn" style="width:100%;margin-bottom:12px;padding:10px 16px;background:linear-gradient(135deg,#2196f3,#1976d2);color:white;border:none;border-radius:var(--radius);font-size:12px;font-weight:700;cursor:pointer;letter-spacing:0.5px;display:flex;align-items:center;justify-content:center;gap:6px;">
          ${t('wrappedBtn')}
        </button>
        ${renderAccordion('hourly', todayTitle, hourlyHTML)}
        ${renderAccordion('weekly', weeklyTitle, weeklyHTML)}
        ${renderAccordion('monthly', monthlyTitle, monthlyHTML)}
        ${renderAccordion('yearly', yearlyTitle, yearlyHTML)}
        ${renderAccordion('topsites', t('topSites'), topSitesHTML || `<div class="text-secondary" style="text-align:center;padding:16px;">${t('noData')}</div>`)}
        ${renderAccordion('stats', t('overallStats'), `
          <div style="padding:4px 0;">
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);">
              <span style="font-size:12px;color:var(--text-secondary);">${t('totalRecordedDays')}</span>
              <span style="font-size:12px;font-weight:600;">${totalDays} days</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);">
              <span style="font-size:12px;color:var(--text-secondary);">${t('trackedSites')}</span>
              <span style="font-size:12px;font-weight:600;">${allDomains.size}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:6px 0;">
              <span style="font-size:12px;color:var(--text-secondary);">${t('monthlyAverage')}</span>
              <span style="font-size:12px;font-weight:600;">${formatTimeShort(monthlyAverage)}</span>
            </div>
          </div>`)}`;

      // Wrapped button handler
      const wrappedBtn = elements.dashboardContent.querySelector('#wrappedBtn');
      if (wrappedBtn) {
        wrappedBtn.addEventListener('click', async () => {
          wrappedBtn.disabled = true;
          wrappedBtn.textContent = t('wrappedGenerating');
          try {
            const now = new Date();
            const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const res = await sendMessage('getWrappedData', { month: currentMonth });
            if (res?.success && res.data) {
              const canvas = generateWrappedCanvas(res.data);
              canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `receipt-wrapped-${currentMonth}.png`;
                a.click();
                URL.revokeObjectURL(url);
              }, 'image/png');
              showSuccess(t('wrappedOk'));
            } else {
              showError(t('wrappedNoData'));
            }
          } catch (e) {
            console.error('Wrapped generation failed:', e);
            showError(t('wrappedFail'));
          } finally {
            wrappedBtn.disabled = false;
            wrappedBtn.innerHTML = t('wrappedBtn');
          }
        });
      }

      // 아코디언 상태 복원 + 이벤트
      elements.dashboardContent.querySelectorAll('.accordion-header').forEach(header => {
        const id = header.getAttribute('data-accordion');
        const content = elements.dashboardContent.querySelector(`[data-accordion-content="${id}"]`);
        const icon = header.querySelector('.accordion-icon');

        if (state.dashboardAccordionState[id] === false) {
          if (content) { content.style.display = 'none'; icon.textContent = 'expand_more'; header.classList.add('collapsed'); }
        }

        header.addEventListener('click', () => {
          if (!content) return;
          const expanded = content.style.display !== 'none';
          content.style.display = expanded ? 'none' : 'block';
          icon.textContent = expanded ? 'expand_more' : 'expand_less';
          header.classList.toggle('collapsed', expanded);
          state.dashboardAccordionState[id] = !expanded;
          saveDashboardAccordionState();
        });
      });

      elements.dashboardContent.querySelectorAll('[data-action="site-detail"]').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const domain = item.getAttribute('data-site');
          if (domain) showSiteDetail(domain);
        });
      });

    } catch (err) {
      console.error('대시보드 로드 실패:', err);
      elements.dashboardContent.innerHTML = `<div class="empty-state"><p>${t('dashboardError')}</p></div>`;
    }
  }

  function renderAccordion(id, title, content) {
    return `
      <div class="chart-container">
        <div class="chart-title accordion-header" data-accordion="${id}">
          <span>${title}</span>
          <span class="material-icons-round accordion-icon">expand_less</span>
        </div>
        <div class="chart-content accordion-content" data-accordion-content="${id}">${content}</div>
      </div>`;
  }

  // ===== Sites List =====
  async function loadSitesList() {
    if (!elements.sitesList) return;
    try {
      const response = await sendMessage('getDetailedStats');
      if (!response?.success || !response.data) {
        elements.sitesList.innerHTML = `<div class="empty-state"><p>${t('cannotLoadData')}</p></div>`;
        return;
      }

      const data = response.data;
      const currentActive = data.currentActive || {};
      const allSites = { ...data.daily?.domains };

      if (currentActive.isActive && currentActive.domain && currentActive.startTime) {
        const elapsed = (Date.now() - currentActive.startTime) / 60000;
        allSites[currentActive.domain] = (allSites[currentActive.domain] || 0) + elapsed;
      }

      const sorted = Object.entries(allSites).sort(([, a], [, b]) => b - a);

      if (sorted.length === 0) {
        elements.sitesList.innerHTML = `<div class="empty-state">
          <span class="material-icons-round">hourglass_empty</span>
          <p>${t('noSitesRecorded')}</p>
        </div>`;
        return;
      }

      elements.sitesList.innerHTML = sorted.map(([domain, minutes]) => {
        const isActive = currentActive.domain === domain && currentActive.isActive;
        return `<div class="domain-item ${isActive ? 'active-domain' : ''}" data-action="site-detail" data-site="${domain}">
          <img src="${getFaviconUrl(domain)}" alt="${domain}" class="domain-favicon" onerror="this.src='images/icon16.png'">
          <div class="domain-info">
            <div class="domain-name">${domain}${isActive ? ' <span style="color:var(--primary);font-size:10px;">●</span>' : ''}</div>
          </div>
          <div class="domain-time">
            <div class="time-value">${formatTimeMinutes(minutes)}</div>
          </div>
        </div>`;
      }).join('');

      elements.sitesList.querySelectorAll('[data-action="site-detail"]').forEach(item => {
        item.addEventListener('click', () => {
          const domain = item.getAttribute('data-site');
          if (domain) showSiteDetail(domain);
        });
      });
    } catch (err) {
      elements.sitesList.innerHTML = `<div class="empty-state"><p>${t('sitesError')}</p></div>`;
    }
  }

  // ===== Site Detail =====
  async function showSiteDetail(domain) {
    state.selectedDomain = domain;
    if (elements.siteDetailTitle) elements.siteDetailTitle.textContent = domain;

    try {
      const response = await sendMessage('getDetailedStats');
      if (!response?.success || !response.data) return;

      const data = response.data;
      const daily = data.daily || {};
      const dailyStats = data.dailyStats || {};
      const domainTime = daily.domains?.[domain] || 0;
      const totalTime = daily.totalTime || 1;
      const percentage = Math.round((domainTime / totalTime) * 100);

      // Build 7-day history
      const now = new Date();
      const weekDays = [];
      const weekData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        const dayLabel = d.toLocaleDateString(state.currentLanguage === 'ko' ? 'ko-KR' : 'en-US', { weekday: 'short' });
        weekDays.push(dayLabel);
        const dayStats = dailyStats[key];
        weekData.push(dayStats?.domains?.[domain] || 0);
      }
      const maxVal = Math.max(...weekData, 1);
      const totalWeek = weekData.reduce((s, v) => s + v, 0);
      const avgVal = weekData.filter(v => v > 0).length > 0
        ? totalWeek / weekData.filter(v => v > 0).length : 0;
      const bestDayIdx = weekData.indexOf(Math.max(...weekData));
      const bestDayLabel = weekDays[bestDayIdx];

      const barChartHTML = weekData.map((val, i) => {
        const pct = (val / maxVal) * 100;
        const isToday = i === 6;
        return `<div style="display:flex;flex-direction:column;align-items:center;flex:1;gap:4px;">
          <span style="font-size:9px;color:var(--text-secondary);min-width:32px;text-align:center;">${val > 0 ? formatTimeShort(val) : ''}</span>
          <div style="width:100%;background:var(--border);border-radius:3px;height:60px;display:flex;align-items:flex-end;overflow:hidden;">
            <div style="width:100%;height:${pct}%;background:${isToday ? 'var(--primary)' : 'var(--primary-dark)'};opacity:${isToday ? 1 : 0.55};border-radius:3px 3px 0 0;transition:height 0.3s;"></div>
          </div>
          <span style="font-size:9px;color:${isToday ? 'var(--primary)' : 'var(--text-secondary)'};font-weight:${isToday ? 700 : 400};">${weekDays[i]}</span>
        </div>`;
      }).join('');

      // Addiction score calculation
      const revisits = data.daily?.revisits?.[domain] || 0;
      const visits = data.daily?.visits?.[domain] || 1;
      const addictionScore = Math.round((revisits / Math.max(visits, 1)) * 100);
      let addictionEmoji, addictionLabel, addictionColor;
      if (addictionScore < 30) {
        addictionEmoji = '🟢'; addictionLabel = t('addictionLow'); addictionColor = '#4caf50';
      } else if (addictionScore < 60) {
        addictionEmoji = '🟡'; addictionLabel = t('addictionMid'); addictionColor = '#ff9800';
      } else {
        addictionEmoji = '🔴'; addictionLabel = t('addictionHigh'); addictionColor = '#f44336';
      }

      if (elements.siteDetailContent) {
        elements.siteDetailContent.innerHTML = `
          <div class="stat-card primary" style="margin-bottom:12px;">
            <div class="stat-icon material-icons-round">schedule</div>
            <div class="stat-value">${formatTimeMinutes(domainTime)}</div>
            <div class="stat-label">${t('todayUsage')}</div>
          </div>

          <div class="chart-container" style="margin-bottom:12px;">
            <div class="chart-title" style="cursor:default;">${t('recentHistory')}</div>
            <div class="chart-content">
              <div style="display:flex;gap:4px;align-items:flex-end;height:90px;margin-bottom:8px;">
                ${barChartHTML}
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
            <div class="stat-card" style="padding:10px;">
              <div style="font-size:10px;color:var(--text-secondary);margin-bottom:4px;">${t('weekAvg')}</div>
              <div style="font-size:14px;font-weight:700;">${formatTimeShort(avgVal)}</div>
            </div>
            <div class="stat-card" style="padding:10px;">
              <div style="font-size:10px;color:var(--text-secondary);margin-bottom:4px;">${t('bestDay')}</div>
              <div style="font-size:14px;font-weight:700;">${weekData.some(v => v > 0) ? bestDayLabel : '-'}</div>
            </div>
          </div>

          <div class="chart-container" style="margin-bottom:12px;">
            <div class="chart-title" style="cursor:default;">${t('addictionTitle')}</div>
            <div class="chart-content" style="display:flex;align-items:center;gap:12px;">
              <span style="font-size:22px;">${addictionEmoji}</span>
              <div style="flex:1;">
                <div style="font-size:14px;font-weight:700;color:${addictionColor};">${addictionLabel} (${addictionScore}%)</div>
                <div style="font-size:10px;color:var(--text-secondary);margin-top:2px;">${t('revisitCount')} ${revisits}${t('revisitUnit')} / ${t('revisitTotal')} ${visits}${t('revisitUnit')}</div>
              </div>
            </div>
          </div>

          <div class="chart-container">
            <div class="chart-title" style="cursor:default;">${t('percentageOfTotal')}</div>
            <div class="chart-content" style="display:flex;align-items:center;gap:8px;">
              <div style="flex:1;height:16px;background:var(--border);border-radius:4px;overflow:hidden;">
                <div class="chart-bar" style="width:${percentage}%;height:100%;"></div>
              </div>
              <span style="font-size:13px;font-weight:700;color:var(--primary);">${percentage}%</span>
            </div>
          </div>`;
      }

      switchView('siteDetail');
    } catch (err) {
      console.error('사이트 상세 로드 실패:', err);
    }
  }

  window.showSiteDetail = showSiteDetail;

  // ===== Settings =====
  function showSettings() {
    const settingsContent = document.getElementById('settingsContent');
    if (!settingsContent) return;

    settingsContent.innerHTML = `
      <div style="padding:4px 0;">
        <div style="margin-bottom:12px;padding:12px;background:var(--surface);border-radius:var(--radius);">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-weight:600;margin-bottom:2px;font-size:13px;">${t('autoTrack')}</div>
              <div style="font-size:11px;color:var(--text-secondary);">${t('autoTrackDesc')}</div>
            </div>
            <label class="switch"><input type="checkbox" id="autoTrack" checked><span class="slider"></span></label>
          </div>
        </div>

        <div style="margin-bottom:12px;padding:12px;background:var(--surface);border-radius:var(--radius);">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-weight:600;margin-bottom:2px;font-size:13px;">${t('notifications')}</div>
              <div style="font-size:11px;color:var(--text-secondary);">${t('notificationsDesc')}</div>
            </div>
            <label class="switch"><input type="checkbox" id="notifications" checked><span class="slider"></span></label>
          </div>
        </div>

        <div style="margin-bottom:12px;padding:12px;background:var(--surface);border-radius:var(--radius);">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-weight:600;margin-bottom:2px;font-size:13px;">${t('language')}</div>
              <div style="font-size:11px;color:var(--text-secondary);">${t('languageDesc')}</div>
            </div>
            <select id="languageSelect" style="padding:6px 10px;border:1px solid var(--border);border-radius:6px;background:var(--background);color:var(--text-primary);font-size:12px;cursor:pointer;">
              <option value="ko" ${state.currentLanguage === 'ko' ? 'selected' : ''}>한국어</option>
              <option value="en" ${state.currentLanguage === 'en' ? 'selected' : ''}>English</option>
            </select>
          </div>
        </div>

        <div style="margin-bottom:12px;padding:12px;background:var(--surface);border-radius:var(--radius);">
          <div style="font-weight:600;margin-bottom:4px;font-size:13px;">${t('exportData')}</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px;">${t('exportDataDesc')}</div>
          <button class="btn-primary" id="exportDataBtn" style="width:100%;">
            <span class="material-icons-round">download</span> ${t('exportData')}
          </button>
        </div>

        <div style="margin-bottom:12px;padding:12px;background:var(--surface);border-radius:var(--radius);">
          <div style="font-weight:600;margin-bottom:4px;font-size:13px;">${t('clearData')}</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-bottom:8px;">${t('clearDataDesc')}</div>
          <button class="btn-primary btn-danger" id="clearData" style="width:100%;">
            <span class="material-icons-round">delete_forever</span> ${t('deleteAllData')}
          </button>
        </div>

        <div id="focusBlockSettings" style="margin-bottom:12px;padding:12px;background:var(--surface);border-radius:var(--radius);">
          <div style="font-weight:600;margin-bottom:4px;font-size:13px;">${t('focusBlockTitle')}</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-bottom:10px;">${t('focusBlockDesc')}</div>
          <div id="focusBlockListUI"></div>
          <div style="display:flex;gap:6px;margin-top:8px;">
            <input id="focusBlockCustomInput" type="text" placeholder="example.com" style="flex:1;padding:7px 10px;border:1px solid var(--border);border-radius:6px;background:var(--background);color:var(--text-primary);font-size:12px;">
            <button id="focusBlockAddBtn" class="btn-primary" style="padding:7px 12px;font-size:12px;">${t('focusBlockAdd')}</button>
          </div>
        </div>

        <div style="text-align:center;padding-top:12px;border-top:1px solid var(--border);">
          <div style="font-size:11px;color:var(--text-secondary);">Receipt v2.1.0</div>
        </div>
      </div>`;

    setTimeout(() => setupSettingsListeners(), 50);
  }

  function setupSettingsListeners() {
    const autoTrack = document.getElementById('autoTrack');
    const notifications = document.getElementById('notifications');
    const languageSelect = document.getElementById('languageSelect');
    const clearData = document.getElementById('clearData');
    const exportDataBtn = document.getElementById('exportDataBtn');

    if (autoTrack) {
      chrome.storage.local.get(['autoTrack'], r => { autoTrack.checked = r.autoTrack !== false; });
      autoTrack.addEventListener('change', e => { chrome.storage.local.set({ autoTrack: e.target.checked }); showSuccess(t('settingsSaved')); });
    }

    if (notifications) {
      chrome.storage.local.get(['notifications'], r => { notifications.checked = r.notifications !== false; });
      notifications.addEventListener('change', e => { chrome.storage.local.set({ notifications: e.target.checked }); showSuccess(t('settingsSaved')); });
    }

    if (languageSelect) {
      languageSelect.addEventListener('change', e => {
        state.currentLanguage = e.target.value;
        chrome.storage.local.set({ language: e.target.value });
        updateStaticText();
        updateFocusModeBtn();
        showSuccess(t('settingsSaved'));
        if (state.currentView === 'settings') showSettings();
      });
    }

    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', async () => {
        exportDataBtn.disabled = true;
        exportDataBtn.innerHTML = `<span class="material-icons-round">hourglass_empty</span> ${t('exporting')}`;
        try {
          const response = await sendMessage('exportData');
          if (response) {
            const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showSuccess(t('exportOk'));
          }
        } finally {
          exportDataBtn.disabled = false;
          exportDataBtn.innerHTML = `<span class="material-icons-round">download</span> ${t('exportData')}`;
        }
      });
    }

    if (clearData) {
      clearData.addEventListener('click', async () => {
        if (confirm(t('clearConfirm'))) {
          clearData.disabled = true;
          try {
            await chrome.storage.local.clear();
            showSuccess(t('clearOk'));
            setTimeout(() => updateUI(), 500);
          } finally {
            clearData.disabled = false;
          }
        }
      });
    }

    // 집중 모드 차단 목록 UI
    renderFocusBlockListUI();

    document.getElementById('focusBlockAddBtn')?.addEventListener('click', async () => {
      const input = document.getElementById('focusBlockCustomInput');
      const val = input?.value.trim().toLowerCase().replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
      if (!val || !val.includes('.')) { showError('올바른 도메인을 입력하세요 (예: example.com)'); return; }
      const { focusBlockConfig = {} } = await chrome.storage.local.get(['focusBlockConfig']);
      const custom = focusBlockConfig.custom || [];
      if (!custom.includes(val)) {
        custom.push(val);
        await chrome.storage.local.set({ focusBlockConfig: { ...focusBlockConfig, custom } });
        if (input) input.value = '';
        renderFocusBlockListUI();
        showSuccess(`${val} ${state.currentLanguage === 'ko' ? '추가됨' : 'added'}`);
      }
    });
  }

  async function renderFocusBlockListUI() {
    const container = document.getElementById('focusBlockListUI');
    if (!container) return;
    const { focusBlockConfig = {} } = await chrome.storage.local.get(['focusBlockConfig']);
    const disabled = new Set(focusBlockConfig.disabled || []);
    const custom = focusBlockConfig.custom || [];

    const categories = [
      { key: 'sns', label: t('catSns'), emoji: '📱' },
      { key: 'entertainment', label: t('catEntertainment'), emoji: '🎬' },
      { key: 'community', label: t('catCommunity'), emoji: '📰' },
    ];

    let html = '';
    for (const cat of categories) {
      const sites = FOCUS_BLOCK_DEFAULTS[cat.key];
      html += `<div style="margin-bottom:8px;">
        <div style="font-size:10px;font-weight:700;color:var(--text-secondary);letter-spacing:1px;margin-bottom:4px;">${cat.emoji} ${cat.label}</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">`;
      for (const site of sites) {
        const on = !disabled.has(site);
        html += `<button class="focus-block-tag ${on ? 'on' : 'off'}" data-site="${site}" data-type="default"
          style="font-size:10px;padding:3px 8px;border-radius:12px;border:1px solid ${on ? 'var(--primary)' : 'var(--border)'};
          background:${on ? 'var(--primary)' : 'transparent'};color:${on ? '#fff' : 'var(--text-secondary)'};
          cursor:pointer;transition:all 0.15s;">${site.replace('.com','').replace('.net','').replace('.org','')}</button>`;
      }
      html += `</div></div>`;
    }

    if (custom.length > 0) {
      html += `<div style="margin-bottom:8px;">
        <div style="font-size:10px;font-weight:700;color:var(--text-secondary);letter-spacing:1px;margin-bottom:4px;">${t('focusBlockCustomLabel')}</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">`;
      for (const site of custom) {
        html += `<button class="focus-block-tag on" data-site="${site}" data-type="custom"
          style="font-size:10px;padding:3px 8px;border-radius:12px;border:1px solid var(--primary);
          background:var(--primary);color:#fff;cursor:pointer;">
          ${site} <span style="margin-left:2px;opacity:0.7;">✕</span></button>`;
      }
      html += `</div></div>`;
    }

    container.innerHTML = html;

    container.querySelectorAll('.focus-block-tag').forEach(btn => {
      btn.addEventListener('click', async () => {
        const site = btn.dataset.site;
        const type = btn.dataset.type;
        const { focusBlockConfig: cfg = {} } = await chrome.storage.local.get(['focusBlockConfig']);

        if (type === 'custom') {
          cfg.custom = (cfg.custom || []).filter(s => s !== site);
        } else {
          const dis = new Set(cfg.disabled || []);
          if (dis.has(site)) dis.delete(site); else dis.add(site);
          cfg.disabled = [...dis];
        }
        await chrome.storage.local.set({ focusBlockConfig: cfg });
        renderFocusBlockListUI();
      });
    });
  }

  // ===== Auto Refresh =====
  function startAutoRefresh() {
    function realtimeLoop() {
      updateRealtimeReceipt();
      state.realtimeUpdateFrame = requestAnimationFrame(realtimeLoop);
    }
    realtimeLoop();

    state.refreshInterval = setInterval(() => { updateUI(); updateFocusModeBtn(); }, 3000);

    setInterval(async () => {
      try {
        const res = await sendMessage('getCurrentActive');
        if (res?.success && res.currentActive) {
          const info = res.currentActive;
          if (!state.lastActiveInfo || state.lastActiveInfo.domain !== info.domain || state.lastActiveInfo.startTime !== info.startTime) {
            state.lastActiveInfo = info;
            state.lastUpdateTime = Date.now();
          } else {
            state.lastActiveInfo.elapsedMinutes = info.elapsedMinutes;
          }
        }
      } catch (e) {
        if (state.lastUpdateTime && Date.now() - state.lastUpdateTime > 10000) state.lastActiveInfo = null;
      }
    }, 1000);
  }

  function updateRealtimeReceipt() {
    if (!state.lastActiveInfo?.isActive || !state.lastActiveInfo.startTime) return;

    const elapsed = (Date.now() - state.lastActiveInfo.startTime) / 60000;
    const savedTotal = state.data?.daily?.totalTime || 0;
    const realtimeTotal = savedTotal + elapsed;

    if (elements.receiptTotal) {
      const newText = formatTimeShort(realtimeTotal);
      if (elements.receiptTotal.textContent !== newText) elements.receiptTotal.textContent = newText;
    }

    // 현재 활성 사이트 시간 실시간 업데이트
    if (state.lastActiveInfo.domain && state.currentView === 'home') {
      const domainSaved = state.data?.daily?.domains?.[state.lastActiveInfo.domain] || 0;
      const domainTotal = domainSaved + elapsed;
      const activeItem = elements.receiptItems?.querySelector('.active-site .receipt-item-time');
      if (activeItem) {
        const newText = formatTimeShort(domainTotal);
        if (activeItem.textContent !== newText) activeItem.textContent = newText;
      }
    }
  }

  // ===== Cleanup =====
  window.addEventListener('unload', () => {
    if (state.refreshInterval) clearInterval(state.refreshInterval);
    if (state.realtimeUpdateFrame) cancelAnimationFrame(state.realtimeUpdateFrame);
    if (state.dashboardUpdateInterval) clearInterval(state.dashboardUpdateInterval);
    if (state.sitesUpdateInterval) clearInterval(state.sitesUpdateInterval);
  });
});
