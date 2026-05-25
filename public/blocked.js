const params = new URLSearchParams(location.search);
const domain = params.get('domain') || '';
const lang = params.get('lang') || 'ko';
const ko = lang !== 'en';

document.getElementById('title').textContent   = ko ? '포모도로 진행 중' : 'FOCUS IN PROGRESS';
document.getElementById('domain').textContent  = domain;
document.getElementById('sub').textContent     = ko ? '지금은 집중할 시간이에요.' : "This isn't the time for distractions.";
document.getElementById('context').textContent = ko ? '목표에 집중하세요. 할 수 있어요.' : 'Stay focused. You got this.';
document.getElementById('backBtn').textContent = ko ? '새 탭으로 이동' : 'OPEN NEW TAB';
document.getElementById('footer').textContent  = ko ? '* 포모도로가 끝나면 자동으로 해제됩니다 *' : '* UNLOCKS WHEN POMODORO ENDS *';

document.getElementById('backBtn').addEventListener('click', () => {
  chrome.tabs.getCurrent((tab) => {
    chrome.tabs.update(tab.id, { url: 'chrome://newtab' });
  });
});
