// Receipt - Site Blocker Content Script

let blockerOverlay = null;

// 페이지 로드 즉시 background에 "나 차단 대상이냐" 확인
(async function checkOnLoad() {
  const domain = location.hostname.replace(/^www\./, '');
  try {
    const res = await chrome.runtime.sendMessage({ action: 'checkFocusBlock', domain });
    if (res?.blocked) {
      showBlocker({ domain, timeSpent: 0, limit: 0, isFocusMode: true, language: res.language || 'ko' });
    }
  } catch (e) {}
})();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showBlocker') {
    showBlocker(request);
    sendResponse({ success: true });
  } else if (request.action === 'hideBlocker') {
    hideBlocker();
    sendResponse({ success: true });
  }
});

function showBlocker({ domain, timeSpent, limit, language, isFocusMode }) {
  if (blockerOverlay) hideBlocker();

  const ko = isFocusMode ? {
    brand: '🧾 RECEIPT',
    title: '🎯 집중 모드',
    spent: `${domain}은 집중 모드 중에 차단됐어요`,
    limit: '지금은 딴짓할 시간이 아니에요',
    context: '목표에 집중하세요. 할 수 있어요.',
    extend: null,
    close: '← 뒤로 가기',
  } : {
    brand: '🧾 RECEIPT',
    title: '⏰ 시간 초과',
    spent: `${domain}에서 ${Math.floor(timeSpent)}분을 사용했어요`,
    limit: `설정한 제한: ${limit}분`,
    context: getContext(timeSpent, 'ko'),
    extend: '15분 더 보기',
    close: '← 뒤로 가기',
  };
  const en = isFocusMode ? {
    brand: '🧾 RECEIPT',
    title: '🎯 FOCUS MODE',
    spent: `${domain} is blocked during focus mode`,
    limit: "This isn't the time for distractions",
    context: 'Stay focused. You got this.',
    extend: null,
    close: '← Go back',
  } : {
    brand: '🧾 RECEIPT',
    title: "⏰ TIME'S UP",
    spent: `You've spent ${Math.floor(timeSpent)} min on ${domain}`,
    limit: `Your limit: ${limit} min`,
    context: getContext(timeSpent, 'en'),
    extend: '15 more minutes',
    close: '← Go back',
  };
  const tx = language === 'en' ? en : ko;

  blockerOverlay = document.createElement('div');
  blockerOverlay.id = 'receipt-blocker';
  blockerOverlay.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'right:0', 'bottom:0',
    'width:100%', 'height:100%',
    'background:rgba(0,0,0,0.96)',
    'z-index:2147483647',
    'display:flex', 'flex-direction:column',
    'align-items:center', 'justify-content:center',
  ].join('!important;') + '!important;';

  blockerOverlay.innerHTML = `
    <div style="
      background:#111;
      border:1px dashed #444;
      border-radius:4px;
      padding:36px 40px;
      max-width:400px;
      width:90%;
      text-align:center;
      font-family:'Space Mono',monospace,monospace;
      box-sizing:border-box;
    ">
      <div style="font-size:11px;letter-spacing:3px;color:#555;margin-bottom:14px;">${tx.brand}</div>
      <div style="font-size:22px;font-weight:bold;color:#fff;margin-bottom:6px;">${tx.title}</div>
      <div style="border-top:1px dashed #333;margin:18px 0;"></div>
      <div style="font-size:13px;color:#ccc;margin-bottom:6px;">${tx.spent}</div>
      <div style="font-size:11px;color:#555;margin-bottom:8px;">${tx.limit}</div>
      <div style="font-size:11px;color:#777;font-style:italic;line-height:1.5;">${tx.context}</div>
      <div style="border-top:1px dashed #333;margin:20px 0;"></div>
      ${tx.extend ? `<button id="receipt-extend" style="
        display:block;width:100%;
        background:#2196f3;color:#fff;
        border:none;padding:13px;
        border-radius:3px;
        font-family:'Space Mono',monospace;
        font-size:12px;font-weight:bold;
        letter-spacing:1px;cursor:pointer;
        margin-bottom:10px;
      ">${tx.extend}</button>` : ''}
      <button id="receipt-close" style="
        display:block;width:100%;
        background:transparent;color:#555;
        border:1px dashed #444;
        padding:11px;border-radius:3px;
        font-family:'Space Mono',monospace;
        font-size:11px;cursor:pointer;
      ">${tx.close}</button>
    </div>
  `;

  document.body.appendChild(blockerOverlay);
  document.body.style.overflow = 'hidden';

  document.getElementById('receipt-extend')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'extendTimeLimit', domain, minutes: 15 });
    hideBlocker();
  });

  document.getElementById('receipt-close').addEventListener('click', () => {
    if (history.length > 1) history.back();
    else location.href = 'chrome://newtab';
  });
}

function hideBlocker() {
  if (blockerOverlay) {
    blockerOverlay.remove();
    blockerOverlay = null;
  }
  document.body.style.overflow = '';
}

function getContext(minutes, lang) {
  const ko = [
    { min: 300, text: '5시간... 이 시간에 새 기술 하나 배울 수 있었어요.' },
    { min: 180, text: '3시간이면 영화 두 편을 봤을 텐데요.' },
    { min: 120, text: '2시간 = 책 한 챕터 + 커피 한 잔.' },
    { min: 60,  text: '1시간이면 운동 한 세트 할 수 있었어요.' },
    { min: 30,  text: '30분이면 산책 한 번 다녀올 수 있었어요.' },
    { min: 0,   text: '조금만 더 참아보아요.' },
  ];
  const en = [
    { min: 300, text: "5 hours. You could've learned a language." },
    { min: 180, text: "3 hrs = 2 movies you actually wanted to watch." },
    { min: 120, text: "2 hrs = a solid workout + shower." },
    { min: 60,  text: "1 hr = a podcast walk outside." },
    { min: 30,  text: "30 min = a decent stretch session." },
    { min: 0,   text: "Every minute counts." },
  ];
  const list = lang === 'en' ? en : ko;
  return (list.find(item => minutes >= item.min) || list[list.length - 1]).text;
}
