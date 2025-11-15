# 데이터 저장 위치 및 구조

## 저장 위치

Tab Timer 확장 프로그램의 모든 데이터는 **Chrome Storage Local API**를 사용하여 저장됩니다.

### 저장 경로
- **Windows**: `%LOCALAPPDATA%\Google\Chrome\User Data\Default\Local Extension Settings\[Extension ID]\`
- **macOS**: `~/Library/Application Support/Google/Chrome/Default/Local Extension Settings/[Extension ID]/`
- **Linux**: `~/.config/google-chrome/Default/Local Extension Settings/[Extension ID]/`

### 확인 방법
1. Chrome 확장 프로그램 페이지에서 "서비스 워커" 클릭
2. 콘솔에서 다음 명령어 실행:
```javascript
chrome.storage.local.get(null, (data) => console.log(data));
```

## 저장되는 데이터 구조

### 1. `dailyStats` (일일 통계)
```javascript
{
  "2025-01-15": {
    "domains": {
      "example.com": 45.5,  // 분 단위
      "github.com": 120.3
    },
    "hourly": [0, 0, 0, ..., 15.2, 20.1, ...],  // 24시간 배열
    "visits": {
      "example.com": 5,
      "github.com": 12
    },
    "totalTime": 165.8,  // 분 단위
    "sessionCount": 17
  }
}
```

### 2. `tabTimes` (전체 시간)
```javascript
{
  "example.com": 1234567890,  // 밀리초 단위
  "github.com": 2345678901
}
```

### 3. `sessions` (세션 기록)
```javascript
[
  {
    "id": "1705123456789-12345",
    "domain": "example.com",
    "startTime": 1705123456789,  // 밀리초 타임스탬프
    "endTime": 1705124056789,
    "duration": 600000,  // 밀리초
    "tabId": 12345
  }
]
```

### 4. `goals` (시간 제한 설정)
```javascript
{
  "example.com": {
    "limit": 60,  // 분 단위
    "category": "work",
    "priority": "high"
  }
}
```

### 5. `settings` (설정)
```javascript
{
  "notifications": true,
  "autoTrack": true
}
```

## 데이터 크기 제한

- **Chrome Storage Local**: 최대 10MB
- **세션 기록**: 최대 1000개 (초과 시 오래된 것부터 삭제)
- **일일 통계**: 최대 30일 (초과 시 자동 정리)

## 데이터 백업

### 내보내기 기능 사용
1. 팝업에서 "내보내기" 버튼 클릭
2. JSON 파일로 다운로드

### 수동 백업
```javascript
// 콘솔에서 실행
chrome.storage.local.get(null, (data) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tab-timer-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
});
```

## 데이터 복원

```javascript
// 백업 파일을 읽어서 복원
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'application/json';
fileInput.onchange = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    const data = JSON.parse(event.target.result);
    chrome.storage.local.set(data, () => {
      console.log('Data restored!');
      location.reload();
    });
  };
  reader.readAsText(file);
};
fileInput.click();
```

