# 상태 확인 가이드

## ✅ Background Script 상태: 정상

로그를 보면 모든 기능이 정상 작동 중입니다:

### 확인된 기능:
1. ✅ 초기화 완료
2. ✅ Storage 초기화 완료
3. ✅ 탭 추적 작동 중 (`octxxiii.github.io` 추적 중)
4. ✅ 메시지 핸들러 작동 중
5. ✅ 통계 계산 및 전송 정상

### 로그 해석:

#### 정상 동작:
- `Switching active domain to: octxxiii.github.io` → 도메인 추적 작동
- `Starting tracking for: octxxiii.github.io` → 시간 추적 시작
- `Received request for detailed stats` → 팝업에서 요청 수신
- `Sending detailed stats` → 통계 전송 성공

#### 예상된 메시지 (정상):
- `New tab is not trackable` → chrome:// 페이지 등 추적 불가 페이지 (정상)
- `Window lost focus` / `Window gained focus` → 창 포커스 변경 (정상)

## 팝업 확인 방법

### 1. 팝업 열기
- 확장 프로그램 아이콘 클릭
- 팝업이 열리는지 확인

### 2. 콘솔 확인
- 팝업에서 우클릭 → "검사"
- 콘솔에서 다음 로그 확인:
  ```
  Popup: Requesting detailed stats...
  Popup: Received response: {...}
  ```

### 3. 데이터 확인
팝업 콘솔에서 실행:
```javascript
// 응답 데이터 확인
sendMessage('getDetailedStats').then(data => {
  console.log('Full response:', data);
  console.log('Daily stats:', data.data?.daily);
  console.log('Total time:', data.data?.daily?.totalTime);
});
```

### 4. 예상 결과

팝업에 다음이 표시되어야 합니다:
- **오늘 총 사용 시간**: `octxxiii.github.io`에서 보낸 시간
- **세션**: 1 이상
- **사이트**: 1 이상 (octxxiii.github.io)
- **사이트별 사용 시간**: octxxiii.github.io와 사용 시간

## 문제 해결

### 팝업이 비어있을 때:
1. 팝업 콘솔에서 오류 확인
2. `sendMessage('getDetailedStats')` 직접 실행
3. 응답 데이터 구조 확인

### 데이터가 0으로 표시될 때:
- 정상일 수 있음 (방금 시작했거나 데이터가 아직 없음)
- 여러 사이트를 방문하고 시간이 지난 후 다시 확인

### 통계가 업데이트되지 않을 때:
- Background Script 로그에서 `Starting tracking` 확인
- Storage에 데이터가 저장되는지 확인:
  ```javascript
  chrome.storage.local.get(['dailyStats'], console.log);
  ```

## 다음 단계

1. **팝업 열기** - 확장 프로그램 아이콘 클릭
2. **콘솔 확인** - 팝업 개발자 도구에서 로그 확인
3. **데이터 확인** - 통계가 표시되는지 확인
4. **추가 테스트** - 다른 웹사이트 방문 후 통계 확인

## 정상 작동 확인 체크리스트

- [x] Background Script 초기화
- [x] Storage 초기화
- [x] 탭 추적 작동
- [x] 메시지 핸들러 작동
- [x] 통계 계산 작동
- [ ] 팝업이 열림
- [ ] 팝업에 데이터 표시
- [ ] 통계 카드 업데이트
- [ ] 사이트 목록 표시

