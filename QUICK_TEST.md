# 빠른 기능 테스트 가이드

## ⚠️ 중요: YouTube 경고는 무시하세요

콘솔에 나타나는 `i.ytimg.com/generate_204` 경고는 **YouTube 웹사이트 자체의 문제**이며, 우리 확장 프로그램과는 무관합니다. 무시하셔도 됩니다.

## 실제 기능 테스트

### 1. 확장 프로그램이 작동하는지 확인

#### Background Script 확인:
1. `chrome://extensions/` 접속
2. Tab Timer 확장 프로그램 찾기
3. **"service worker"** 링크 클릭
4. 콘솔에서 다음이 보여야 함:
   ```
   Tab Timer Background Script: Initializing...
   Tab Timer Background Script: Initialized
   Storage initialized: {...}
   ```

#### Popup 확인:
1. 확장 프로그램 아이콘 클릭 (팝업 열기)
2. 팝업에서 **우클릭 → "검사"**
3. 콘솔에서 다음이 보여야 함:
   ```
   Popup: Requesting detailed stats...
   Popup: Received response: {...}
   ```

### 2. 시간 추적 테스트

1. **여러 웹사이트 방문:**
   - google.com
   - github.com
   - youtube.com
   - naver.com

2. **각 사이트에서 10-20초 대기**

3. **팝업 열기:**
   - 확장 프로그램 아이콘 클릭
   - 통계가 표시되는지 확인

### 3. 예상되는 결과

팝업에서 다음이 표시되어야 합니다:
- ✅ **오늘 총 사용 시간**: 0분 이상
- ✅ **세션**: 1 이상
- ✅ **사이트**: 방문한 사이트 수
- ✅ **사이트별 사용 시간**: 방문한 사이트 목록

### 4. 문제 해결

#### 아무것도 표시되지 않을 때:

**Background Script 콘솔에서:**
```javascript
// 1. Storage 확인
chrome.storage.local.get(null, console.log);

// 2. 현재 탭 정보 확인
chrome.tabs.query({active: true, currentWindow: true}, tabs => {
  console.log('Active tab:', tabs[0]);
});

// 3. 통계 직접 계산
getDetailedStats().then(console.log).catch(console.error);
```

**Popup 콘솔에서:**
```javascript
// 1. 메시지 테스트
sendMessage('getDetailedStats').then(console.log).catch(console.error);

// 2. Storage 직접 확인
chrome.storage.local.get(null, console.log);
```

### 5. 일반적인 문제

#### 문제: "데이터를 불러올 수 없습니다" 메시지
- **원인**: Background script와 통신 실패
- **해결**: Background script가 실행 중인지 확인

#### 문제: 시간이 0분으로 표시됨
- **원인**: 아직 데이터가 없음 (정상)
- **해결**: 여러 사이트를 방문하고 시간이 지난 후 다시 확인

#### 문제: 팝업이 비어있음
- **원인**: JavaScript 오류
- **해결**: Popup 콘솔에서 오류 확인

### 6. 정상 작동 확인 체크리스트

- [ ] Background script가 초기화됨 (콘솔 로그 확인)
- [ ] Popup이 열림
- [ ] 통계 카드가 표시됨 (0분이라도 표시되어야 함)
- [ ] 사이트 목록이 표시됨 (비어있어도 "로딩 중" 또는 빈 상태 표시)
- [ ] 테마 토글이 작동함
- [ ] 시간 제한 설정이 작동함

### 7. 실제 오류 vs 경고 구분

#### 무시해도 되는 경고:
- `i.ytimg.com/generate_204` - YouTube 사이트 경고
- `preload` 관련 경고 - 웹사이트 자체 경고

#### 확인해야 하는 오류:
- `Uncaught TypeError` - JavaScript 오류
- `Failed to load resource` - 리소스 로드 실패
- `Extension context invalidated` - 확장 프로그램 오류

### 8. 빠른 진단

**Background Script 콘솔에서 실행:**
```javascript
// 모든 것이 정상인지 확인
console.log('Current tab info:', currentTabInfo);
console.log('Sessions:', sessions.length);
chrome.storage.local.get(['dailyStats', 'tabTimes'], result => {
  console.log('Storage data:', result);
});
```

**결과 해석:**
- `currentTabInfo.domain`이 null이 아니면 → 탭 추적 작동 중
- `sessions.length`가 0보다 크면 → 세션 추적 작동 중
- `dailyStats`에 오늘 날짜 키가 있으면 → 데이터 저장 작동 중

