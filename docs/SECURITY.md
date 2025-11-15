# 보안 가이드라인

## 광고 설정 보안

### AdSense ID 보안성

**중요**: Google AdSense Client ID (`ca-pub-XXXXXXXXXX`)와 Slot ID는 **기술적으로 공개 정보**입니다.

#### 왜 공개 정보인가?
- AdSense는 클라이언트 측(브라우저)에서 작동
- 웹사이트의 HTML 소스 코드에서 볼 수 있음
- 브라우저 개발자 도구에서 확인 가능
- **하지만** 코드에 직접 하드코딩하는 것은 권장되지 않음

### 권장 사항

#### ✅ 좋은 방법

1. **설정 파일 분리** (권장)
   ```
   src/config/
   ├── adConfig.example.js  (예제, 공개 가능)
   └── adConfig.js          (실제 ID, .gitignore에 포함)
   ```

2. **환경 변수 사용**
   ```bash
   # .env 파일 (gitignore에 포함)
   ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX
   ADSENSE_SLOT_ID=1234567890
   ```

3. **Chrome Storage 사용**
   - 런타임에 설정 주입
   - 사용자가 직접 설정 가능
   - 배포 시점에 주입

#### ❌ 피해야 할 방법

1. **소스 코드에 직접 하드코딩**
   ```javascript
   // ❌ 나쁜 예
   const clientId = 'ca-pub-1234567890'; // 공개 저장소에 올리면 안 됨
   ```

2. **Git에 실제 ID 커밋**
   - 공개 저장소에 실제 운영 ID를 올리지 마세요
   - 예제 ID만 사용하세요

### 실제 위험성

#### 낮은 위험
- AdSense ID 자체는 공개 정보
- ID만으로는 수익을 가로챌 수 없음
- Google의 승인된 도메인 시스템으로 보호됨

#### 주의해야 할 점
- **도메인 승인**: AdSense는 승인된 도메인에서만 광고 표시
- **클릭 사기**: 남용 방지를 위해 모니터링 필요
- **정책 위반**: 잘못된 사용 시 계정 정지 가능

### 구현 가이드

#### 1. 개발 환경
```javascript
// src/config/adConfig.js (로컬에만 존재)
export const adConfig = {
  enabled: false, // 개발 중에는 비활성화
  network: 'adsense',
  adsense: {
    clientId: 'ca-pub-TEST-ID',
    slotId: 'TEST-SLOT'
  }
};
```

#### 2. 프로덕션 환경
```javascript
// 빌드 시 주입 또는 Chrome Storage에 저장
// 실제 운영 ID는 배포 시점에만 설정
```

#### 3. .gitignore 설정
```
# Configuration files
src/config/adConfig.js
config/*.js
!config/*.example.js
```

### 체크리스트

배포 전 확인사항:
- [ ] 실제 AdSense ID가 공개 저장소에 올라가지 않았는지 확인
- [ ] .gitignore에 설정 파일이 포함되어 있는지 확인
- [ ] 예제 파일만 공개 저장소에 있는지 확인
- [ ] AdSense 도메인 승인이 완료되었는지 확인
- [ ] Chrome Web Store 정책을 준수하는지 확인

### 추가 보안 고려사항

1. **CSP (Content Security Policy)**
   - AdSense 도메인을 허용 목록에 추가
   - 이미 `manifest.json`에 설정됨

2. **사용자 동의**
   - 광고 표시에 대한 사용자 동의 고려
   - 개인정보 처리방침 업데이트

3. **모니터링**
   - 광고 통계 추적
   - 비정상적인 클릭 패턴 감지

### 결론

**AdSense ID는 공개 정보이지만**, 코드에 직접 하드코딩하지 않고 설정 파일이나 환경 변수로 관리하는 것이 **모범 사례**입니다. 특히 공개 저장소에는 실제 운영 ID를 올리지 마세요.

