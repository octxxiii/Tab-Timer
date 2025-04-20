// 차트 라이브러리 로드
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
script.onload = initializeDashboard;
document.head.appendChild(script);

// 대시보드 초기화
function initializeDashboard() {
    // 차트 초기화
    initializeCharts();
    
    // 데이터 로드
    loadDashboardData();
    
    // 이벤트 리스너 설정
    setupEventListeners();
}

// 차트 초기화
function initializeCharts() {
    const ctx = document.getElementById('weekly-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['월', '화', '수', '목', '금', '토', '일'],
            datasets: [{
                label: '일일 사용 시간',
                data: [0, 0, 0, 0, 0, 0, 0],
                borderColor: '#4a90e2',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '시간 (분)'
                    }
                }
            }
        }
    });
}

// 대시보드 데이터 로드
async function loadDashboardData() {
    try {
        // Chrome Storage에서 데이터 가져오기
        const result = await chrome.storage.local.get(['tabTimes', 'dailyStats', 'timeLimits', 'limitStartTimes']);
        
        // 오늘 날짜의 데이터 준비
        const today = new Date().toISOString().split('T')[0];
        const dailyStats = result.dailyStats || {};
        const todayData = dailyStats[today] || { domains: {}, hourly: Array(24).fill(0), visits: {} };
        
        // 총 사용 시간 계산
        const totalTime = Object.values(result.tabTimes || {}).reduce((sum, time) => sum + time, 0);
        
        // 상위 5개 사이트 계산
        const topSites = Object.entries(todayData.domains)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([domain, time]) => ({ domain, time }));
        
        // 이번 주 데이터 계산
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        
        const weeklyData = {
          totalTime: 0,
          dailyTotals: Array(7).fill(0),
          topSites: {}
        };
        
        // 최근 7일간의 데이터 집계
        for (let i = 0; i < 7; i++) {
          const date = new Date(weekStart);
          date.setDate(date.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          
          if (dailyStats[dateStr] && dailyStats[dateStr].domains) {
            const dailyTotal = Object.values(dailyStats[dateStr].domains).reduce((sum, time) => sum + time, 0);
            weeklyData.dailyTotals[i] = dailyTotal;
            weeklyData.totalTime += dailyTotal;
            
            Object.entries(dailyStats[dateStr].domains).forEach(([domain, time]) => {
              weeklyData.topSites[domain] = (weeklyData.topSites[domain] || 0) + time;
            });
          }
        }
        
        // 시간 제한 데이터 준비
        const limits = Object.entries(result.timeLimits || {}).map(([domain, limit]) => {
          const startTime = result.limitStartTimes?.[domain];
          const remaining = startTime ? Math.max(0, limit - (Date.now() - startTime)) : limit;
          return { domain, limit, remaining };
        });
        
        const data = {
          dailyStats: {
            totalTime,
            topSites,
            hourlyUsage: todayData.hourly
          },
          weeklyStats: {
            totalTime: weeklyData.totalTime,
            avgDailyTime: weeklyData.totalTime / 7,
            dailyTotals: weeklyData.dailyTotals,
            topSites: Object.entries(weeklyData.topSites)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([domain, time]) => ({ domain, time }))
          },
          limits
        };

        updateDashboard(data);

        // 1초마다 데이터 업데이트
        setInterval(async () => {
          const newResult = await chrome.storage.local.get(['tabTimes', 'dailyStats', 'timeLimits', 'limitStartTimes']);
          const newData = {
            ...data,
            limits: Object.entries(newResult.timeLimits || {}).map(([domain, limit]) => {
              const startTime = newResult.limitStartTimes?.[domain];
              const remaining = startTime ? Math.max(0, limit - (Date.now() - startTime)) : limit;
              return { domain, limit, remaining };
            })
          };
          updateDashboard(newData);
        }, 1000);

    } catch (error) {
        console.error('데이터 로드 오류:', error);
        showError('데이터를 불러오는 중 오류가 발생했습니다.');
    }
}

// 대시보드 업데이트
function updateDashboard(data) {
    // 일일 통계 업데이트
    updateDailyStats(data.dailyStats);
    
    // 주간 통계 업데이트
    updateWeeklyStats(data.weeklyStats);
    
    // 웰빙 팁 업데이트
    updateWellbeingTips(data.wellbeingTips);
    
    // 사이트 제한 업데이트
    updateSiteLimits(data.siteLimits);

    // 웰빙 섹션 숨기기
    const insightsSection = document.getElementById('insights');
    if (insightsSection) {
        insightsSection.style.display = 'none';
    }
}

// 일일 통계 업데이트
function updateDailyStats(stats) {
    document.getElementById('total-time').textContent = formatTime(stats.totalTime);
    
    const topSitesList = document.getElementById('top-sites-list');
    topSitesList.innerHTML = stats.topSites
        .map(site => `
            <li>
                <span class="site-name">${site.name}</span>
                <span class="site-time">${formatTime(site.time)}</span>
            </li>
        `)
        .join('');
}

// 주간 통계 업데이트
function updateWeeklyStats(stats) {
    document.getElementById('productivity-score').textContent = `${stats.productivityScore}%`;
    document.getElementById('goal-achievement').textContent = `${stats.goalAchievement}%`;
    
    // 주간 차트 업데이트
    const chart = Chart.getChart('weekly-chart');
    if (chart) {
        chart.data.datasets[0].data = stats.dailyTimes;
        chart.update();
    }
}

// 웰빙 팁 업데이트
function updateWellbeingTips(tips) {
    const tipsList = document.getElementById('tips-list');
    tipsList.innerHTML = tips
        .map(tip => `<li>${tip}</li>`)
        .join('');
}

// 사이트 제한 업데이트
function updateSiteLimits(limits) {
    const limitsList = document.getElementById('limits-list');
    limitsList.innerHTML = limits
        .map(limit => `
            <li>
                <span class="site-name">${limit.site}</span>
                <span class="limit-time">${formatTime(limit.limit)}</span>
            </li>
        `)
        .join('');
}

// 시간 포맷팅
function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 새로고침 버튼 이벤트
    document.querySelector('.refresh-button')?.addEventListener('click', loadDashboardData);
    
    // 설정 링크 이벤트
    document.querySelector('footer a[href="#"]')?.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.runtime.sendMessage({ action: 'openSettings' });
    });
}

// 에러 표시
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.container').prepend(errorDiv);
    
    setTimeout(() => errorDiv.remove(), 5000);
}

// 초기화
document.addEventListener('DOMContentLoaded', initializeDashboard);

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Chrome Storage에서 데이터 가져오기
    const result = await chrome.storage.local.get(['tabTimes', 'dailyStats', 'timeLimits', 'limitStartTimes']);
    
    // 오늘 날짜의 데이터 준비
    const today = new Date().toISOString().split('T')[0];
    const dailyStats = result.dailyStats || {};
    const todayData = dailyStats[today] || { domains: {}, hourly: Array(24).fill(0), visits: {} };
    
    // 총 사용 시간 계산
    const totalTime = Object.values(result.tabTimes || {}).reduce((sum, time) => sum + time, 0);
    
    // 상위 5개 사이트 계산
    const topSites = Object.entries(todayData.domains)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([domain, time]) => ({ domain, time }));
    
    // 이번 주 데이터 계산
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const weeklyData = {
      totalTime: 0,
      dailyTotals: Array(7).fill(0),
      topSites: {}
    };
    
    // 최근 7일간의 데이터 집계
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (dailyStats[dateStr] && dailyStats[dateStr].domains) {
        const dailyTotal = Object.values(dailyStats[dateStr].domains).reduce((sum, time) => sum + time, 0);
        weeklyData.dailyTotals[i] = dailyTotal;
        weeklyData.totalTime += dailyTotal;
        
        Object.entries(dailyStats[dateStr].domains).forEach(([domain, time]) => {
          weeklyData.topSites[domain] = (weeklyData.topSites[domain] || 0) + time;
        });
      }
    }
    
    // 시간 제한 데이터 준비
    const limits = Object.entries(result.timeLimits || {}).map(([domain, limit]) => {
      const startTime = result.limitStartTimes?.[domain];
      const remaining = startTime ? Math.max(0, limit - (Date.now() - startTime)) : limit;
      return { domain, limit, remaining };
    });
    
    const data = {
      dailyStats: {
        totalTime,
        topSites,
        hourlyUsage: todayData.hourly
      },
      weeklyStats: {
        totalTime: weeklyData.totalTime,
        avgDailyTime: weeklyData.totalTime / 7,
        dailyTotals: weeklyData.dailyTotals,
        topSites: Object.entries(weeklyData.topSites)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([domain, time]) => ({ domain, time }))
      },
      limits
    };

    updateDashboard(data);

    // 1초마다 데이터 업데이트
    setInterval(async () => {
      const newResult = await chrome.storage.local.get(['tabTimes', 'dailyStats', 'timeLimits', 'limitStartTimes']);
      const newData = {
        ...data,
        limits: Object.entries(newResult.timeLimits || {}).map(([domain, limit]) => {
          const startTime = newResult.limitStartTimes?.[domain];
          const remaining = startTime ? Math.max(0, limit - (Date.now() - startTime)) : limit;
          return { domain, limit, remaining };
        })
      };
      updateDashboard(newData);
    }, 1000);

  } catch (error) {
    console.error('데이터 로드 오류:', error);
    showError('데이터를 불러오는 중 오류가 발생했습니다.');
  }
});

function formatTime(ms) {
  if (typeof ms !== 'number' || isNaN(ms)) return '0시간 0분';
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}시간 ${minutes}분`;
}

function updateDashboard(data) {
  // 일간 통계 업데이트
  updateDailyStats(data.dailyStats);
  
  // 주간 통계 업데이트
  updateWeeklyStats(data.weeklyStats);
  
  // 시간 제한 업데이트
  updateLimits(data.limits);

  // 웰빙 섹션 숨기기
  const insightsSection = document.getElementById('insights');
  if (insightsSection) {
    insightsSection.style.display = 'none';
  }
}

function updateDailyStats(dailyStats) {
  if (!dailyStats) {
    showError('일간 통계 데이터가 없습니다.');
    return;
  }

  // 총 사용 시간 업데이트
  const totalTimeElement = document.querySelector('.total-time p');
  if (totalTimeElement) {
    totalTimeElement.textContent = formatTime(dailyStats.totalTime);
  }

  // 자주 방문한 사이트 업데이트
  const topSitesList = document.querySelector('.top-sites ul');
  if (!topSitesList) return;

  if (dailyStats.topSites && dailyStats.topSites.length > 0) {
    topSitesList.innerHTML = dailyStats.topSites
      .map(site => `<li class="site-item">
        <span class="site-name">${site.domain}</span>
        <span class="site-time">${formatTime(site.time)}</span>
      </li>`)
      .join('');
  } else {
    topSitesList.innerHTML = '<li>방문 기록이 없습니다.</li>';
  }
}

function updateWeeklyStats(weeklyStats) {
  const weeklyStatsElement = document.getElementById('weekly-stats');
  if (!weeklyStatsElement) return;
  
  if (!weeklyStats) {
    weeklyStatsElement.textContent = '주간 통계 데이터가 없습니다.';
    return;
  }

  const summary = `
    <div class="weekly-metric">
      <h4>총 사용 시간</h4>
      <p>${formatTime(weeklyStats.totalTime)}</p>
    </div>
    <div class="weekly-metric">
      <h4>일 평균 사용 시간</h4>
      <p>${formatTime(weeklyStats.avgDailyTime)}</p>
    </div>
    <div class="weekly-metric">
      <h4>가장 많이 방문한 사이트</h4>
      <ul class="top-sites-list">
        ${weeklyStats.topSites.map(site => `
          <li class="site-item">
            <span class="site-name">${site.domain}</span>
            <span class="site-time">${formatTime(site.time)}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `;

  weeklyStatsElement.innerHTML = summary;
}

function updateLimits(limits) {
  const limitsElement = document.querySelector('.current-limits ul');
  if (!limitsElement) return;
  
  if (!limits || limits.length === 0) {
    limitsElement.innerHTML = '<li>설정된 시간 제한이 없습니다.</li>';
    return;
  }

  limitsElement.innerHTML = limits
    .map(limit => `<li class="limit-item">
      <span class="site-name">${limit.domain}</span>
      <span class="limit-info">
        제한: ${formatTime(limit.limit)} / 
        남은 시간: ${formatTime(limit.remaining)}
      </span>
    </li>`)
    .join('');
}

function showError(message) {
  const elements = [
    '.total-time p',
    '.top-sites ul',
    '#weekly-stats',
    '.current-limits ul'
  ];

  elements.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = message;
    }
  });
} 