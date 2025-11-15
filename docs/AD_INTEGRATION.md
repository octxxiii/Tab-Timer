# 광고 통합 가이드

## 개요

Tab Timer는 광고 시스템을 지원합니다. 프리미엄 사용자는 광고가 표시되지 않으며, 무료 사용자에게는 광고가 표시됩니다.

## 구현 상태

현재는 **플레이스홀더 광고**가 구현되어 있습니다. 실제 광고 네트워크를 통합하려면 아래 가이드를 따르세요.

## 지원하는 광고 네트워크

### 1. Google AdSense (권장)

#### 설정 방법

1. **AdSense 계정 생성**
   - [Google AdSense](https://www.google.com/adsense/)에서 계정 생성
   - 사이트 승인 완료

2. **광고 단위 생성**
   - AdSense 대시보드에서 새 광고 단위 생성
   - Client ID와 Slot ID 확인

3. **코드에 적용**

`src/popup/popup.js`의 `updateAdDisplay()` 함수에서:

```javascript
// 실제 AdSense 초기화 (플레이스홀더 대신)
if (adConfig.network === 'adsense' && adConfig.adsense?.clientId) {
  initGoogleAdSense(
    adConfig.adsense.clientId,
    adConfig.adsense.slotId,
    document.getElementById('adContent')
  );
}
```

4. **설정 저장**

⚠️ **보안 주의사항**: 
- AdSense Client ID와 Slot ID는 **공개 정보**이지만, 코드에 직접 하드코딩하지 않는 것이 좋습니다
- GitHub 등 공개 저장소에는 실제 운영 ID를 올리지 마세요
- 개발/프로덕션 환경을 분리하세요

**방법 1: 설정 파일 사용 (권장)**

`src/config/adConfig.example.js`를 복사하여 `adConfig.js`로 만들고 실제 ID를 입력:

```javascript
// src/config/adConfig.js (이 파일은 .gitignore에 포함됨)
export const adConfig = {
  enabled: true,
  network: 'adsense',
  adsense: {
    clientId: 'ca-pub-XXXXXXXXXX', // 실제 Client ID
    slotId: '1234567890' // 실제 Slot ID
  }
};
```

**방법 2: Chrome Storage에 저장 (런타임 설정)**

```javascript
// 사용자가 설정하거나, 배포 시점에 주입
chrome.storage.local.set({
  adConfig: {
    enabled: true,
    network: 'adsense',
    adsense: {
      clientId: 'ca-pub-XXXXXXXXXX', // 실제 Client ID
      slotId: '1234567890' // 실제 Slot ID
    }
  }
});
```

**방법 3: 빌드 시 환경 변수 주입**

```bash
# .env 파일 (gitignore에 포함)
ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX
ADSENSE_SLOT_ID=1234567890
```

### 2. 커스텀 광고 네트워크

자체 광고 서버나 다른 광고 네트워크를 사용할 수 있습니다:

```javascript
chrome.storage.local.set({
  adConfig: {
    enabled: true,
    network: 'custom',
    custom: {
      url: 'https://your-ad-server.com/ads',
      script: '<script>/* custom ad code */</script>'
    }
  }
});
```

## 광고 표시 위치

현재 구현된 위치:
- **팝업 하단**: 통계 카드 아래, 프리미엄 배너 위

추가 가능한 위치:
- 대시보드 페이지
- 인사이트 페이지
- 사이드바 (향후 구현)

## 프리미엄 사용자

프리미엄 사용자(`isPremium: true`)는 자동으로 광고가 표시되지 않습니다.

## 광고 통계 추적

광고 이벤트는 자동으로 추적됩니다:
- **impressions**: 광고 노출 횟수
- **clicks**: 광고 클릭 횟수
- **closes**: 광고 닫기 횟수

데이터는 `chrome.storage.local`의 `adStats`에 저장됩니다.

## Chrome Web Store 정책

광고를 추가할 때 다음 정책을 준수해야 합니다:

1. **사용자 경험**: 광고가 기능을 방해하지 않아야 함
2. **투명성**: 광고임을 명확히 표시
3. **개인정보**: 사용자 데이터를 광고 네트워크와 공유할 경우 명시
4. **프리미엄 옵션**: 광고 제거를 위한 프리미엄 옵션 제공

## 테스트

### 개발 환경에서 테스트

1. 프리미엄 상태 해제:
```javascript
chrome.storage.local.set({ isPremium: false });
```

2. 광고 설정 활성화:
```javascript
chrome.storage.local.set({ 
  adSettings: { enabled: true },
  adConfig: { network: 'adsense', ... }
});
```

3. 팝업 새로고침하여 광고 확인

## 수익화 전략

1. **프리미엄 구독**: 광고 제거 + 추가 기능
2. **광고 수익**: 무료 사용자에게 광고 표시
3. **하이브리드**: 광고 + 프리미엄 옵션

## 보안 주의사항

### AdSense ID 보안성

⚠️ **중요**: 
- AdSense Client ID와 Slot ID는 **기술적으로 공개 정보**입니다 (브라우저에서 볼 수 있음)
- 하지만 **코드에 직접 하드코딩하지 않는 것이 좋습니다**
- 공개 저장소(GitHub)에는 **실제 운영 ID를 올리지 마세요**

#### 권장 방법:
1. ✅ 설정 파일 분리 (`src/config/adConfig.js` - .gitignore에 포함)
2. ✅ 환경 변수 사용
3. ✅ Chrome Storage에 런타임 저장
4. ❌ 소스 코드에 직접 하드코딩 (피하세요)

자세한 내용은 [SECURITY.md](../docs/SECURITY.md)를 참조하세요.

## 주의사항

⚠️ **중요**: 실제 광고를 배포하기 전에:
- Chrome Web Store 정책 검토
- 개인정보 처리방침 업데이트
- 사용자에게 광고 표시 사실 명시
- 프리미엄 옵션 제공
- 실제 AdSense ID가 공개 저장소에 올라가지 않았는지 확인

## 다음 단계

1. Google AdSense 계정 생성 및 승인
2. 광고 단위 생성
3. `adConfig`에 실제 ID 입력
4. 플레이스홀더 코드를 실제 AdSense 코드로 교체
5. 테스트 및 배포

