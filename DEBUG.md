# 디버깅 가이드

## 문제 진단 방법

### 1. Background Script 확인

1. Chrome에서 `chrome://extensions/` 접속
2. Tab Timer 확장 프로그램 찾기
3. "service worker" 또는 "백그라운드 페이지" 링크 클릭
4. 콘솔에서 오류 확인

**확인 사항:**
- Background script가 로드되었는지
- 초기화 오류가 있는지
- Storage 초기화가 성공했는지

### 2. Popup Script 확인

1. 확장 프로그램 팝업 열기
2. 우클릭 → "검사"
3. 개발자 도구 콘솔에서 오류 확인

**확인 사항:**
- `sendMessage` 함수가 정의되어 있는지
- Background script와 통신이 되는지
- DOM 요소가 제대로 로드되었는지

### 3. Storage 확인

1. `chrome://extensions/` 접속
2. Tab Timer 확장 프로그램 찾기
3. "Storage" 탭 클릭
4. `chrome.storage.local` 확인

**확인 사항:**
- `tabTimes` 데이터가 있는지
- `dailyStats` 데이터가 있는지
- `goals` 데이터가 있는지

### 4. 일반적인 문제

#### 문제: 팝업이 비어있음
- **원인**: Background script와 통신 실패
- **해결**: Background script 콘솔 확인

#### 문제: 시간이 추적되지 않음
- **원인**: Tab 이벤트 리스너가 등록되지 않음
- **해결**: Background script 초기화 확인

#### 문제: 통계가 표시되지 않음
- **원인**: `getDetailedStats` 메시지 핸들러 문제
- **해결**: Background script의 메시지 리스너 확인

### 5. 콘솔 명령어로 테스트

#### Background Script 콘솔에서:
```javascript
// Storage 확인
chrome.storage.local.get(null, console.log);

// 현재 탭 정보 확인
chrome.tabs.query({active: true, currentWindow: true}, console.log);

// 메시지 테스트
chrome.runtime.sendMessage({action: 'getDetailedStats'}, console.log);
```

#### Popup 콘솔에서:
```javascript
// sendMessage 테스트
sendMessage('getDetailedStats').then(console.log);

// Storage 직접 확인
chrome.storage.local.get(null, console.log);
```

### 6. 단계별 디버깅

1. **Background Script 로드 확인**
   - Service Worker가 실행 중인지 확인
   - 초기화 로그 확인

2. **Tab 이벤트 확인**
   - 탭 전환 시 이벤트가 발생하는지 확인
   - `handleTabActivation` 함수가 호출되는지 확인

3. **Storage 확인**
   - 데이터가 저장되는지 확인
   - 날짜 키가 올바른지 확인

4. **Popup 통신 확인**
   - `sendMessage`가 제대로 작동하는지 확인
   - Background script가 응답하는지 확인

### 7. 빠른 수정 방법

문제가 발생하면:
1. 확장 프로그램 제거
2. `npm run build` 실행
3. 확장 프로그램 다시 로드
4. 콘솔에서 오류 확인

