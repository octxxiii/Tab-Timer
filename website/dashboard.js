// 대시보드 통신 및 차트 관리 시스템
class TabTimerDashboard {
    constructor() {
        this.charts = {};
        this.extensionId = null;
        this.data = null;
        this.init();
    }

    async init() {
        // 확장 프로그램 ID 확인
        this.detectExtension();

        // 차트 초기화
        this.initializeCharts();

        // 이벤트 리스너 설정
        this.setupEventListeners();

        // 데이터 로드
        await this.loadData();

        // 자동 새로고침 설정
        this.startAutoRefresh();
    }

    detectExtension() {
        // URL 파라미터에서 확장 프로그램 ID 가져오기
        const params = new URLSearchParams(window.location.search);
        this.extensionId = params.get('extensionId');

        if (!this.extensionId) {
            this.showError('확장 프로그램 ID가 제공되지 않았습니다. URL에 ?extensionId=YOUR_ID를 추가해주세요.');
        }
    }

    initializeCharts() {
        // 일간 차트
        this.charts.daily = new Chart(
            document.getElementById('dailyChart'),
            {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: '일일 사용 시간 (분)',
                        data: [],
                        backgroundColor: 'rgba(33, 150, 243, 0.5)',
                        borderColor: 'rgb(33, 150, 243)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: '최근 7일간 사용 시간'
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const minutes = context.parsed.y;
                                    const hours = Math.floor(minutes / 60);
                                    const mins = minutes % 60;
                                    return `${hours}시간 ${mins}분`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: '사용 시간 (분)'
                            }
                        }
                    }
                }
            }
        );

        // 주간 도메인별 차트
        this.charts.domains = new Chart(
            document.getElementById('weeklyChart'),
            {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        label: '도메인별 사용 시간',
                        data: [],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.5)',
                            'rgba(54, 162, 235, 0.5)',
                            'rgba(255, 205, 86, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(153, 102, 255, 0.5)',
                            'rgba(255, 159, 64, 0.5)',
                            'rgba(201, 203, 207, 0.5)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: '도메인별 시간 분포'
                        },
                        legend: {
                            position: 'right'
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    const hours = Math.floor(value / 60);
                                    const mins = value % 60;
                                    return `${label}: ${hours}시간 ${mins}분 (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            }
        );
    }

    setupEventListeners() {
        // 목표 설정 폼
        document.getElementById('goalForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.setGoal();
        });

        // 탭 네비게이션
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });
    }

    async loadData() {
        if (!this.extensionId) return;

        try {
            // Chrome 확장 프로그램과 통신
            const response = await this.sendMessageToExtension('getDetailedStats');

            if (response) {
                this.data = response;
                this.updateCharts();
                this.updateStats();
                this.hideError();
            } else {
                throw new Error('데이터를 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            this.showError('확장 프로그램과 연결할 수 없습니다. 확장 프로그램이 설치되어 있는지 확인해주세요.');
        }
    }

    async sendMessageToExtension(action, data = {}) {
        return new Promise((resolve, reject) => {
            if (!chrome.runtime) {
                reject(new Error('Chrome API를 사용할 수 없습니다.'));
                return;
            }

            chrome.runtime.sendMessage(
                this.extensionId,
                { action, ...data },
                (response) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(response);
                    }
                }
            );
        });
    }

    updateCharts() {
        if (!this.data) return;

        // 일간 차트 업데이트
        const last7Days = [];
        const dailyData = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('ko-KR', { weekday: 'short' });

            last7Days.push(dayName);
            const dayData = this.data.daily?.[dateKey];
            dailyData.push(dayData ? Math.floor(dayData.totalTime / 60000) : 0);
        }

        this.charts.daily.data.labels = last7Days;
        this.charts.daily.data.datasets[0].data = dailyData;
        this.charts.daily.update();

        // 도메인별 차트 업데이트
        const domains = Object.entries(this.data.domains || {})
            .sort(([, a], [, b]) => b.totalTime - a.totalTime)
            .slice(0, 7);

        const domainLabels = domains.map(([domain]) => domain);
        const domainData = domains.map(([, data]) => Math.floor(data.totalTime / 60000));

        this.charts.domains.data.labels = domainLabels;
        this.charts.domains.data.datasets[0].data = domainData;
        this.charts.domains.update();
    }

    updateStats() {
        if (!this.data) return;

        // 추가 통계 표시
        const statsContainer = document.createElement('div');
        statsContainer.className = 'stats-summary';
        statsContainer.innerHTML = `
      <div class="stat-card">
        <h4>오늘 총 사용 시간</h4>
        <p class="stat-value">${this.formatTime(this.data.today?.totalTime || 0)}</p>
      </div>
      <div class="stat-card">
        <h4>주간 평균</h4>
        <p class="stat-value">${this.formatTime(this.calculateWeeklyAverage())}</p>
      </div>
      <div class="stat-card">
        <h4>가장 많이 방문한 사이트</h4>
        <p class="stat-value">${this.getMostVisitedSite()}</p>
      </div>
    `;

        const existingStats = document.querySelector('.stats-summary');
        if (existingStats) {
            existingStats.replaceWith(statsContainer);
        } else {
            document.querySelector('#daily').insertBefore(statsContainer, document.querySelector('.chart-container'));
        }
    }

    calculateWeeklyAverage() {
        if (!this.data?.weekly) return 0;
        const total = this.data.weekly.reduce((sum, time) => sum + time, 0);
        return total / 7;
    }

    getMostVisitedSite() {
        if (!this.data?.domains) return '없음';

        const sorted = Object.entries(this.data.domains)
            .sort(([, a], [, b]) => b.totalTime - a.totalTime);

        return sorted.length > 0 ? sorted[0][0] : '없음';
    }

    formatTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}일 ${hours % 24}시간`;
        } else if (hours > 0) {
            return `${hours}시간 ${minutes % 60}분`;
        } else {
            return `${minutes}분`;
        }
    }

    async setGoal() {
        const website = document.getElementById('website').value;
        const timeLimit = document.getElementById('timeLimit').value;

        try {
            const response = await this.sendMessageToExtension('setTimeLimit', {
                domain: website,
                minutes: parseInt(timeLimit)
            });

            if (response?.success) {
                this.showSuccess('목표가 성공적으로 설정되었습니다!');
                document.getElementById('goalForm').reset();
                await this.loadExistingGoals();
            } else {
                throw new Error('목표 설정 실패');
            }
        } catch (error) {
            console.error('목표 설정 중 오류:', error);
            this.showError('목표 설정에 실패했습니다. 다시 시도해주세요.');
        }
    }

    async loadExistingGoals() {
        try {
            const response = await this.sendMessageToExtension('getTimeLimit');

            if (response?.limits) {
                const goalsContainer = document.createElement('div');
                goalsContainer.className = 'existing-goals';
                goalsContainer.innerHTML = `
          <h4>현재 설정된 목표</h4>
          <ul>
            ${Object.entries(response.limits)
                        .filter(([domain]) => domain !== '_global')
                        .map(([domain, minutes]) => `
                <li>${domain}: ${minutes}분</li>
              `).join('')}
          </ul>
        `;

                const existingGoalsElement = document.querySelector('.existing-goals');
                if (existingGoalsElement) {
                    existingGoalsElement.replaceWith(goalsContainer);
                } else {
                    document.querySelector('.goals-container').appendChild(goalsContainer);
                }
            }
        } catch (error) {
            console.error('목표 로드 실패:', error);
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    hideError() {
        const errorElement = document.querySelector('.notification.error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    startAutoRefresh() {
        // 5분마다 데이터 새로고침
        setInterval(() => {
            this.loadData();
        }, 5 * 60 * 1000);
    }
}

// CSS 스타일 추가
const style = document.createElement('style');
style.textContent = `
  .stats-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .stat-card {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  
  .stat-card h4 {
    margin: 0 0 10px 0;
    color: #666;
    font-size: 14px;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #2196f3;
    margin: 0;
  }
  
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 4px;
    color: white;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1000;
    max-width: 300px;
  }
  
  .notification.show {
    opacity: 1;
  }
  
  .notification.error {
    background: #f44336;
  }
  
  .notification.success {
    background: #4caf50;
  }
  
  .notification.info {
    background: #2196f3;
  }
  
  .existing-goals {
    margin-top: 20px;
    padding: 15px;
    background: #f5f5f5;
    border-radius: 4px;
  }
  
  .existing-goals h4 {
    margin: 0 0 10px 0;
  }
  
  .existing-goals ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .existing-goals li {
    padding: 5px 0;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .existing-goals li:last-child {
    border-bottom: none;
  }
`;
document.head.appendChild(style);

// 대시보드 초기화
document.addEventListener('DOMContentLoaded', () => {
    new TabTimerDashboard();
}); 