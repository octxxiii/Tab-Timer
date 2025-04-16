// 웰빙 메트릭스 업데이트 함수
function updateWellbeingMetrics(metrics) {
  document.getElementById('detox-score').textContent = metrics.detoxScore;
  document.getElementById('productivity-score').textContent = metrics.productivityScore;
  document.getElementById('stress-level').textContent = metrics.stressLevel;
}

// 일간 통계 업데이트
function updateDailyStats(dailyStats) {
  const dailyStatsContainer = document.getElementById('daily-stats');
  if (!dailyStatsContainer) return;

  let html = '<h2>일간 통계</h2>';
  
  Object.entries(dailyStats)
    .sort(([, a], [, b]) => b - a)
    .forEach(([domain, time]) => {
      const hours = Math.floor(time / 3600000);
      const minutes = Math.floor((time % 3600000) / 60000);
      html += `
        <div class="stat-item">
          <span class="domain">${domain}</span>
          <span class="time">${hours}시간 ${minutes}분</span>
        </div>
      `;
    });

  dailyStatsContainer.innerHTML = html;
}

// 주간 통계 업데이트
function updateWeeklyStats(weeklyStats) {
  const weeklyStatsContainer = document.getElementById('weekly-stats');
  if (!weeklyStatsContainer) return;

  let html = '<h2>주간 통계</h2>';
  
  Object.entries(weeklyStats)
    .sort(([, a], [, b]) => b - a)
    .forEach(([domain, time]) => {
      const hours = Math.floor(time / 3600000);
      const minutes = Math.floor((time % 3600000) / 60000);
      html += `
        <div class="stat-item">
          <span class="domain">${domain}</span>
          <span class="time">${hours}시간 ${minutes}분</span>
        </div>
      `;
    });

  weeklyStatsContainer.innerHTML = html;
}

// 웰빙 팁 업데이트
function updateWellbeingTips(metrics) {
  const tipsContainer = document.getElementById('wellbeing-tips');
  if (!tipsContainer) return;

  let tips = [];

  if (metrics.stressLevel > 70) {
    tips.push('휴식이 필요해 보입니다. 잠시 스크린에서 벗어나 휴식을 취해보세요.');
  }
  if (metrics.productivityScore < 50) {
    tips.push('생산성 향상을 위해 집중 시간을 설정하고 방해 요소를 제한해보세요.');
  }
  if (metrics.detoxScore < 50) {
    tips.push('디지털 디톡스를 위해 정기적인 오프라인 활동을 계획해보세요.');
  }

  tipsContainer.innerHTML = `
    <h3>웰빙 팁</h3>
    <ul>
      ${tips.map(tip => `<li>${tip}</li>`).join('')}
    </ul>
  `;
}

// 데이터 로드 및 표시
function loadAndDisplayData() {
  try {
    const storedData = localStorage.getItem('tabTimerData');
    if (!storedData) return;

    const data = JSON.parse(storedData);
    if (data.type !== 'TAB_TIMER_DATA') return;

    updateWellbeingMetrics(data.data.wellbeingMetrics);
    updateDailyStats(data.data.dailyStats);
    updateWeeklyStats(data.data.weeklyStats);
    updateWellbeingTips(data.data.wellbeingMetrics);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

// 페이지 로드 시 데이터 표시
document.addEventListener('DOMContentLoaded', loadAndDisplayData);

// URL 해시 변경 감지
window.addEventListener('hashchange', () => {
  const hash = window.location.hash;
  const sections = document.querySelectorAll('section');
  
  sections.forEach(section => {
    if (section.id === hash.slice(1)) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });
}); 