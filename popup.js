document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 참조
  const elements = {
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
    });
  }

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
      });
    });
  }

  // 시간 제한 설정
  async function setTimeLimit() {
    const minutes = elements.timeLimitMinutes.value;

    if (!minutes || minutes <= 0) {
      showError('올바른 시간을 입력해주세요.');
      return;
    }

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
}); 