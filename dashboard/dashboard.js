// 데이터 포맷 함수 (분 -> 시간 분)
function formatTime(minutes) {
    // ... (existing formatTime code) ...
}

// 데이터 새로고침 함수 (모든 통계 업데이트)
async function refreshData() {
    console.log('데이터 새로고침 시도...');
    
    if (typeof chrome === 'undefined' || !chrome.runtime || typeof chrome.runtime.sendMessage !== 'function') { // 함수인지 더 명확하게 확인
        console.error('Chrome 확장 프로그램 API (chrome.runtime.sendMessage)를 사용할 수 없습니다.');
        alert('오류: 대시보드가 확장 프로그램 컨텍스트 외부에서 로드된 것 같습니다. 팝업의 \'View Full Dashboard\' 버튼을 사용하여 페이지를 여십시오.');
        document.body.innerHTML = '<h1 style="color: red; text-align: center; margin-top: 50px;">오류: 잘못된 접근</h1><p style="text-align: center;">이 페이지는 확장 프로그램 팝업을 통해 열어야 합니다.</p>';
        return;
    }

    // sendMessage 호출 직전 상태 로깅 추가
    console.log('API Check Passed. Logging objects before sending message:');
    console.log('chrome:', typeof chrome, chrome);
    console.log('chrome.runtime:', typeof chrome.runtime, chrome.runtime);
    console.log('chrome.runtime.sendMessage:', typeof chrome.runtime.sendMessage, chrome.runtime.sendMessage);

    // 약간의 지연 시간 후 메시지 전송 시도
    setTimeout(() => {
        try {
            console.log('Attempting to send getDetailedStats message...');
            chrome.runtime.sendMessage({ action: 'getDetailedStats' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('확장 프로그램 통신 오류:', chrome.runtime.lastError.message);
                    alert('데이터를 가져오는 중 오류가 발생했습니다: ' + chrome.runtime.lastError.message);
                    return;
                }
                 if (!response) {
                     console.error('확장 프로그램으로부터 응답이 없습니다 (getDetailedStats).');
                     alert('데이터를 가져오는 데 실패했습니다. 확장 프로그램이 실행 중인지 확인하세요.');
                     return;
                 }
                 if (!response.success) {
                    console.error('확장 프로그램에서 데이터 가져오기 실패:', response.message);
                    alert('데이터 가져오기 실패: ' + response.message);
                    return;
                 }
                
                 console.log('Received detailed stats response:', response);
                 const stats = response.data;
                 // ... (Update UI with stats - existing code) ...
                 // Example: Assuming updateUIWithStats is a function that handles UI updates
                 updateUIWithStats(stats); // Make sure this function exists and handles the data

            });
        } catch (error) {
            console.error('getDetailedStats 메시지 전송 중 치명적 오류 발생:', error);
            alert('데이터 요청 중 오류가 발생했습니다. 콘솔을 확인해주세요.');
        }
    }, 100); // 100ms 지연
}

// --- UI 업데이트 로직 예시 --- 
// 실제 구현은 기존 코드의 response 처리 부분을 함수로 분리해야 함
function updateUIWithStats(stats) {
    if (!stats) {
        console.error('업데이트할 통계 데이터가 없습니다.');
        return;
    }
    console.log('Updating UI with stats:', stats);
    // 여기에 기존 refreshData 함수의 response 처리 로직 (차트 초기화, 값 설정 등) 이동
    // 예시:
    if (stats.daily) {
        document.getElementById('todayTotalTime').textContent = formatTime(stats.daily.totalTime);
        // ... more daily updates ...
        initializeChart('todayHourlyChart', 'bar', { /* ... */ });
        initializeChart('weeklyComparisonChart', 'line', { /* ... */ });
    }
    if (stats.monthly) {
        // ... monthly updates ...
         initializeChart('monthlyTrendChart', 'line', { /* ... */ });
         initializeChart('monthlyGoalsChart', 'doughnut', { /* ... */ });
    }
    if (stats.yearly) {
        // ... yearly updates ...
        initializeChart('yearlyHeatmap', 'bar', { /* ... */ });
        initializeChart('yearlyComparisonChart', 'bar', { /* ... */ });
    }
    if (stats.sites) {
        // ... site updates ...
        initializeChart('topSitesChart', 'pie', { /* ... */ });
        initializeChart('categoriesChart', 'doughnut', { /* ... */ });
        // Populate site analysis table
        const tableBody = document.getElementById('siteAnalysisTable')?.querySelector('tbody');
        if(tableBody) { 
            tableBody.innerHTML = ''; // Clear existing rows
            (stats.sites.analysisData || []).forEach(site => {
                 const row = tableBody.insertRow();
                 row.insertCell().textContent = site.name || 'N/A';
                 row.insertCell().textContent = formatTime(site.totalTime);
                 row.insertCell().textContent = site.visits || 0;
                 row.insertCell().textContent = site.visits > 0 ? formatTime(Math.round(site.totalTime / site.visits)) : '0분';
                 row.insertCell().textContent = `${site.productivityScore || 0}%`;
            });
        }
    }
     if (stats.wellness) {
        updateWellnessMetrics(stats.wellness); // Ensure updateWellnessMetrics is defined
    }
}

// ... (Wellness metrics and other functions) ...

// DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', () => {
    if (typeof chrome === 'undefined' || !chrome.runtime || typeof chrome.runtime.getURL !== 'function') {
        console.error('초기 로드 시 Chrome 확장 프로그램 API에 접근할 수 없습니다.');
        document.body.innerHTML = '<h1 style="color: red; text-align: center; margin-top: 50px;">오류: 잘못된 접근</h1><p style="text-align: center;">이 페이지는 확장 프로그램 팝업을 통해 열어야 합니다.</p>';
        return; 
    }
    
    // Initial data load
    refreshData();

    // FAB listener
    const openExtensionButton = document.getElementById('openExtensionButton');
    if (openExtensionButton) {
        openExtensionButton.addEventListener('click', () => {
             if (typeof chrome === 'undefined' || !chrome.runtime || typeof chrome.runtime.sendMessage !== 'function') {
                console.error('버튼 클릭 시 Chrome 확장 프로그램 API에 접근할 수 없습니다.');
                alert('오류: 확장 프로그램 팝업을 열 수 없습니다. 페이지가 올바르게 로드되었는지 확인하세요.');
                return;
            }
            
            console.log('Attempting to send openPopup message...');
            chrome.runtime.sendMessage({ action: 'openPopup' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Error sending openPopup message:', chrome.runtime.lastError.message);
                    alert('팝업 열기 요청 실패: ' + chrome.runtime.lastError.message);
                } else if (response && response.success) {
                    console.log('Popup open request acknowledged.');
                } else {
                    console.warn('Popup open request failed or was not handled by background script.');
                    alert('팝업을 여는 데 실패했습니다.');
                }
            });
        });
    }
});

// ... (Rest of dashboard.js) ... 