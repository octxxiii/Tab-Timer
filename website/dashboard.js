// 차트 초기화
const dailyChart = new Chart(
    document.getElementById('dailyChart'),
    {
        type: 'bar',
        data: {
            labels: ['월', '화', '수', '목', '금', '토', '일'],
            datasets: [{
                label: '일일 사용 시간 (분)',
                data: [120, 190, 150, 200, 180, 90, 60],
                backgroundColor: 'rgba(33, 150, 243, 0.5)',
                borderColor: 'rgb(33, 150, 243)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    }
);

const weeklyChart = new Chart(
    document.getElementById('weeklyChart'),
    {
        type: 'line',
        data: {
            labels: ['1주', '2주', '3주', '4주'],
            datasets: [{
                label: '주간 평균 사용 시간 (분)',
                data: [150, 140, 130, 120],
                fill: false,
                borderColor: 'rgb(33, 150, 243)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    }
);

// 목표 설정 폼 처리
document.getElementById('goalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const website = document.getElementById('website').value;
    const timeLimit = document.getElementById('timeLimit').value;
    
    try {
        // 목표 설정을 Chrome 확장 프로그램으로 전송
        chrome.runtime.sendMessage({
            action: 'setTimeLimit',
            website: website,
            minutes: parseInt(timeLimit)
        }, (response) => {
            if (response.success) {
                alert('목표가 성공적으로 설정되었습니다!');
                document.getElementById('goalForm').reset();
            } else {
                alert('목표 설정에 실패했습니다. 다시 시도해주세요.');
            }
        });
    } catch (error) {
        console.error('목표 설정 중 오류 발생:', error);
        alert('목표 설정 중 오류가 발생했습니다.');
    }
});

// 데이터 새로고침 함수
async function refreshData() {
    try {
        // Chrome 확장 프로그램에서 데이터 가져오기
        chrome.runtime.sendMessage({ action: 'getStats' }, (response) => {
            if (response) {
                // 일간 차트 업데이트
                dailyChart.data.datasets[0].data = response.dailyStats;
                dailyChart.update();
                
                // 주간 차트 업데이트
                weeklyChart.data.datasets[0].data = response.weeklyStats;
                weeklyChart.update();
            }
        });
    } catch (error) {
        console.error('데이터 새로고침 중 오류 발생:', error);
    }
}

// 5분마다 데이터 새로고침
setInterval(refreshData, 5 * 60 * 1000);

// 초기 데이터 로드
refreshData();

// 데이터 로드 및 표시
document.addEventListener('DOMContentLoaded', () => {
    // URL에서 데이터 파라미터 읽기
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const data = JSON.parse(decodeURIComponent(urlParams.get('data') || '{}'));
    
    // 일간 통계 업데이트
    function updateDailyStats() {
        const dailySection = document.querySelector('#daily');
        if (!dailySection) return;

        const totalTime = data.totalTime || 0;
        const hours = Math.floor(totalTime / 3600000);
        const minutes = Math.floor((totalTime % 3600000) / 60000);

        let html = `
            <h2>오늘의 브라우징</h2>
            <div class="total-time">
                <h3>총 사용 시간</h3>
                <p>${hours}시간 ${minutes}분</p>
            </div>
        `;

        if (data.topSites && data.topSites.length > 0) {
            html += `
                <div class="top-sites">
                    <h3>자주 방문한 사이트</h3>
                    <ul>
                        ${data.topSites.map(([domain, time]) => {
                            const siteHours = Math.floor(time / 3600000);
                            const siteMinutes = Math.floor((time % 3600000) / 60000);
                            return `
                                <li>
                                    <span class="domain">${domain}</span>
                                    <span class="time">${siteHours}시간 ${siteMinutes}분</span>
                                </li>
                            `;
                        }).join('')}
                    </ul>
                </div>
            `;
        }

        dailySection.innerHTML = html;
    }

    // 목표 설정 업데이트
    function updateGoals() {
        const goalsSection = document.querySelector('#goals');
        if (!goalsSection || !data.timeLimits) return;

        let html = `
            <h2>사용 시간 목표</h2>
            <div class="current-limits">
                <h3>설정된 제한</h3>
                <ul>
                    ${Object.entries(data.timeLimits).map(([domain, limit]) => `
                        <li>
                            <span class="domain">${domain}</span>
                            <span class="limit">${Math.floor(limit / 60000)}분</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;

        goalsSection.innerHTML = html;
    }

    // 웰빙 인사이트 업데이트
    function updateInsights() {
        const insights = [];
        const totalTime = data.totalTime || 0;
        const HOUR = 3600000;

        // 과다 사용 감지
        if (totalTime > 8 * HOUR) {
            insights.push('오늘 화면 시간이 8시간을 초과했습니다. 잠시 휴식을 취하는 것은 어떨까요?');
        }

        // 생산성 분석
        if (data.topSites) {
            const productiveSites = ['github.com', 'docs.google.com', 'notion.so'];
            const distractingSites = ['youtube.com', 'facebook.com', 'twitter.com'];
            
            const productiveTime = data.topSites
                .filter(([domain]) => productiveSites.includes(domain))
                .reduce((sum, [, time]) => sum + time, 0);
                
            const distractingTime = data.topSites
                .filter(([domain]) => distractingSites.includes(domain))
                .reduce((sum, [, time]) => sum + time, 0);

            if (distractingTime > productiveTime) {
                insights.push('오늘은 비생산적인 활동이 많았네요. 집중 시간을 늘려보는 건 어떨까요?');
            }
        }

        const insightsSection = document.querySelector('#wellbeing-tips');
        if (insightsSection) {
            insightsSection.innerHTML = `
                <h3>웰빙 팁</h3>
                <ul>
                    ${insights.map(insight => `<li>${insight}</li>`).join('')}
                </ul>
            `;
        }
    }

    // 데이터 표시 함수 호출
    updateDailyStats();
    updateGoals();
    updateInsights();
}); 