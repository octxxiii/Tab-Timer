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
        // Chrome 확장 프로그램과 통신
        const response = await chrome.runtime.sendMessage({ action: 'getDashboardData' });
        
        if (response) {
            updateDashboard(response);
        }
    } catch (error) {
        console.error('데이터 로드 중 오류 발생:', error);
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