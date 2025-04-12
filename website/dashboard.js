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