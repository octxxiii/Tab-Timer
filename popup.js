document.addEventListener('DOMContentLoaded', () => {
  const tabsList = document.getElementById('tabsList');
  const totalTimeElement = document.getElementById('totalTime');
  const mostUsedElement = document.getElementById('mostUsed');
  const upgradeBtn = document.getElementById('upgradeBtn');

  // Check premium status
  let isPremium = false;
  chrome.storage.local.get(['isPremium'], (result) => {
    isPremium = result.isPremium || false;
    updatePremiumUI();
  });

  // Format time
  function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }

  // Update Premium UI
  function updatePremiumUI() {
    const premiumFeatures = document.querySelector('.premium-features');
    if (isPremium) {
      premiumFeatures.innerHTML = `
        <h3>Premium Features (Active)</h3>
        <button id="exportBtn" class="premium-btn">Export Data</button>
        <button id="weeklyReportBtn" class="premium-btn">Weekly Report</button>
      `;
      
      // Add premium feature handlers
      document.getElementById('exportBtn').addEventListener('click', exportData);
      document.getElementById('weeklyReportBtn').addEventListener('click', generateWeeklyReport);
    }
  }

  // Export Data
  function exportData() {
    chrome.storage.local.get(['tabTimes'], (result) => {
      const data = result.tabTimes || {};
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `tab-timer-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    });
  }

  // Generate Weekly Report
  function generateWeeklyReport() {
    chrome.storage.local.get(['tabTimes'], (result) => {
      const data = result.tabTimes || {};
      const sortedDomains = Object.entries(data)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
      
      const report = `
        <h3>Weekly Report</h3>
        <div class="report-content">
          ${sortedDomains.map(([domain, time], index) => `
            <div class="report-item">
              <span>#${index + 1} ${domain}</span>
              <span>${formatTime(time)}</span>
            </div>
          `).join('')}
        </div>
      `;
      
      tabsList.innerHTML = report;
      setTimeout(() => updateUI(), 5000); // Return to normal view after 5 seconds
    });
  }

  // Update UI
  function updateUI() {
    chrome.storage.local.get(['tabTimes'], (result) => {
      const tabTimes = result.tabTimes || {};
      tabsList.innerHTML = '';
      
      let totalTime = 0;
      let mostUsed = { domain: '', time: 0 };
      
      Object.entries(tabTimes).forEach(([domain, time]) => {
        totalTime += time;
        
        if (time > mostUsed.time) {
          mostUsed = { domain, time };
        }
        
        const tabItem = document.createElement('div');
        tabItem.className = 'tab-item';
        tabItem.innerHTML = `
          <span>${domain}</span>
          <span>${formatTime(time)}</span>
        `;
        tabsList.appendChild(tabItem);
      });
      
      totalTimeElement.textContent = formatTime(totalTime);
      mostUsedElement.textContent = mostUsed.domain || '-';
    });
  }

  // Upgrade button click handler
  upgradeBtn.addEventListener('click', () => {
    window.open('https://your-payment-processor.com/premium-upgrade', '_blank');
  });

  // 시간 제한 설정
  document.getElementById('setTimeLimit').addEventListener('click', () => {
    const minutes = document.getElementById('timeLimitMinutes').value;
    if (minutes && minutes > 0) {
      chrome.runtime.sendMessage({ action: 'setTimeLimit', minutes: parseInt(minutes) }, (response) => {
        updateCurrentLimit();
      });
    }
  });

  // 현재 시간 제한 표시
  function updateCurrentLimit() {
    chrome.runtime.sendMessage({ action: 'getTimeLimit' }, (response) => {
      const currentLimit = document.getElementById('currentLimit');
      if (response && response.minutes) {
        currentLimit.textContent = `현재 설정: ${response.minutes}분`;
      } else {
        currentLimit.textContent = '시간 제한이 설정되지 않았습니다.';
      }
    });
  }

  // 페이지 로드 시 현재 시간 제한 표시
  updateCurrentLimit();

  // Update UI every second
  updateUI();
  setInterval(updateUI, 1000);
}); 