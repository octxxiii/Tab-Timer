# 광고 설정 가이드

## 📋 개요

Tab Timer는 광고를 통해 수익을 창출합니다. 이 가이드는 광고를 활성화하고 Chrome Web Store에 업로드하는 방법을 안내합니다.

## 🎯 광고 표시에 필요한 것들

### 1. Google AdSense 계정 (권장)

#### 필요한 것들:
- ✅ Google AdSense 계정
- ✅ AdSense Client ID (Publisher ID) - 형식: `ca-pub-XXXXXXXXXX`
- ✅ AdSense Ad Slot ID
- ✅ 사이트 승인 완료 (Chrome Extension의 경우 특별 승인 필요할 수 있음)

#### 설정 단계:

1. **AdSense 계정 생성**
   - [Google AdSense](https://www.google.com/adsense/) 접속
   - Google 계정으로 로그인
   - 계정 생성 및 사이트 등록

2. **광고 단위 생성**
   - AdSense 대시보드 → 광고 → 광고 단위
   - 새 광고 단위 생성
   - 형식: 표시 광고 (Display ads)
   - 크기: 300x250 (권장) 또는 320x100

3. **ID 확인**
   - Client ID: `ca-pub-XXXXXXXXXX` 형식
   - Slot ID: 숫자로 된 광고 슬롯 ID

### 2. 대안: 커스텀 광고 네트워크

- 자체 광고 서버
- 다른 광고 네트워크 (예: Media.net, PropellerAds 등)

## ⚙️ 광고 활성화 방법

### 방법 1: 설정 파일 사용 (권장)

1. `src/config/adConfig.example.js`를 복사하여 `adConfig.js` 생성:
```bash
cp src/config/adConfig.example.js src/config/adConfig.js
```

2. `src/config/adConfig.js` 파일 수정:
```javascript
export const adConfig = {
  enabled: true, // ✅ true로 변경
  network: 'adsense', // 'adsense', 'custom', 'none'
  
  adsense: {
    clientId: 'ca-pub-XXXXXXXXXX', // ✅ 실제 Client ID 입력
    slotId: '1234567890', // ✅ 실제 Slot ID 입력
  },
  
  custom: {
    url: '',
    script: ''
  }
};
```

3. 빌드 및 테스트:
```bash
npm run build
```

### 방법 2: Chrome Storage에 저장 (런타임 설정)

개발자 도구 콘솔에서:
```javascript
chrome.storage.local.set({
  adConfig: {
    enabled: true,
    network: 'adsense',
    adsense: {
      clientId: 'ca-pub-XXXXXXXXXX',
      slotId: '1234567890'
    }
  }
});
```

## 🚀 Chrome Web Store 업로드 준비

### 1. 필수 파일 확인

- [x] `manifest.json` - 버전 확인 (v2.0.0)
- [x] `background.js` - 서비스 워커
- [x] `popup.html`, `popup.js` - 팝업 UI
- [x] 아이콘 파일 (16x16, 48x48, 128x128)
- [x] 개인정보 처리방침 페이지

### 2. 빌드 및 압축

```bash
# 빌드
npm run build

# dist 폴더를 zip으로 압축
cd dist
zip -r ../tab-timer.zip .
cd ..
```

### 3. Chrome Web Store 개발자 계정

1. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) 접속
2. Google 계정으로 로그인
3. 개발자 등록비 **$5** 결제 (일회성)
4. 개발자 계정 활성화

### 4. 제출 프로세스

1. **새 항목 추가**
   - 개발자 대시보드 → "새 항목" 클릭
   - `tab-timer.zip` 업로드

2. **스토어 목록 작성**
   - 제품 이름: Tab Timer
   - 간단한 설명: `STORE_LISTING.md` 참고
   - 상세 설명: `STORE_LISTING.md` 참고
   - 카테고리: 생산성 (Productivity)
   - 언어: 한국어

3. **그래픽 자료**
   - 스크린샷 5장 (1280x800 또는 640x400)
   - 프로모션 이미지 (선택사항)

4. **개인정보 및 규정 준수**
   - 개인정보 처리방침 URL: `https://octxxiii.github.io/tab-timer/privacy.html`
   - 권한 정당성 설명 작성

5. **검토 제출**
   - 모든 정보 확인 후 "검토를 위해 제출"
   - 검토 대기: 보통 1-3일

## 📝 광고 관련 주의사항

### Chrome Web Store 정책

1. **광고 표시 규칙**
   - 광고는 사용자 경험을 해치지 않아야 함
   - 광고 클릭을 강요하지 않아야 함
   - 광고 위치가 명확해야 함

2. **개인정보 보호**
   - AdSense는 자동으로 개인정보를 처리
   - 개인정보 처리방침에 AdSense 사용 명시 필요

3. **광고 콘텐츠**
   - 부적절한 광고가 표시되지 않도록 AdSense 필터 설정
   - 광고 차단 기능은 제공하지 않음 (Chrome 정책 위반)

### 광고 최적화 팁

1. **광고 위치**
   - 팝업 하단에 배치 (현재 구현됨)
   - 사용자 경험을 방해하지 않는 위치

2. **광고 크기**
   - 300x250 (권장) - 표준 배너
   - 320x100 - 작은 배너
   - 728x90 - 와이드 배너 (공간이 충분할 때)

3. **로딩 성능**
   - 광고 로딩이 느려도 확장 기능은 정상 작동해야 함
   - 광고 로딩 실패 시 플레이스홀더 표시

## 🔍 테스트 체크리스트

업로드 전 확인사항:

- [ ] 광고가 정상적으로 표시되는가?
- [ ] 광고 클릭이 정상 작동하는가?
- [ ] 광고 로딩 실패 시 플레이스홀더가 표시되는가?
- [ ] 프리미엄 배너가 숨겨져 있는가?
- [ ] 모든 기능이 정상 작동하는가?
- [ ] 다크 모드에서도 광고가 잘 보이는가?
- [ ] 개인정보 처리방침에 AdSense 사용 명시되어 있는가?

## 📚 참고 자료

- [Chrome Web Store 정책](https://developer.chrome.com/docs/webstore/program-policies/)
- [Google AdSense 정책](https://support.google.com/adsense/answer/48182)
- [Chrome Extension 광고 가이드](https://developer.chrome.com/docs/extensions/mv3/ads/)

## 🆘 문제 해결

### 광고가 표시되지 않는 경우

1. `adConfig.enabled`가 `true`인지 확인
2. AdSense Client ID와 Slot ID가 올바른지 확인
3. 브라우저 콘솔에서 에러 확인
4. AdSense 계정이 승인되었는지 확인

### Chrome Web Store 검토 거부 시

1. 거부 사유 확인
2. 정책 위반 사항 수정
3. 다시 제출

---

**준비가 완료되면 Chrome Web Store에 업로드하세요! 🚀**

