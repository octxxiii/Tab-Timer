let tabData = {
  domains: {},      // 도메인별 상세 데이터
  daily: {},        // 일별 통계
  sessions: []      // 세션 정보
};
let currentSession = null;
let timeLimits = {};
let notifications = {};

// Initialize storage
chrome.storage.local.get(['tabData', 'timeLimits'], (result) => {
  if (result.tabData) {
    tabData = result.tabData;
  }
  if (result.timeLimits) {
    timeLimits = result.timeLimits;
  }
});

// Get root domain from URL
function getRootDomain(url) {
  try {
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
    }
  });
});

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
  }
});

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

// 시간 제한 설정 저장
let timeLimit = null;
let timeLimitStart = null;

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
  }
}); 