# Chrome Web Store 제출 완전 가이드

## 📋 준비된 문서들

1. **STORE_LISTING_FULL.md** - 완전한 설명 텍스트 (16,000자 이내)
2. **STORE_URLS.md** - 홈페이지 및 지원 URL 정보
3. **STORE_SCREENSHOTS.md** - 스크린샷 가이드
4. **STORE_PROMO_TILES.md** - 프로모션 타일 가이드
5. **STORE_CHECKLIST.md** - 최종 체크리스트

## 🚀 단계별 제출 가이드

### Step 1: 패키지 업로드
1. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) 접속
2. "새 항목" 클릭
3. `tab-timer-v2.0.0.zip` 파일 업로드
4. 업로드 완료 대기

### Step 2: 제품 세부정보 입력

#### 패키지 제목
```
Tab Timer
```

#### 패키지 요약
```
Track your browser time and boost productivity. See how much time you spend on each website and improve your focus.
```

#### 설명
`STORE_LISTING_FULL.md` 파일의 내용을 복사하여 붙여넣기

#### 카테고리
- **워크플로 및 계획** (Productivity)

#### 언어
- **영어(미국)** (기본)
- 필요시 한국어 추가 가능

### Step 3: 그래픽 저작물

#### 스토어 아이콘
- ✅ 이미 준비됨: `dist/images/icon128.png`

#### 스크린샷 (최대 5개)
`STORE_SCREENSHOTS.md` 참조하여 다음 스크린샷 준비:
1. 메인 팝업 화면 (라이트 모드) - 1280x800
2. 다크 모드 화면 - 1280x800
3. 대시보드 화면 - 1280x800
4. 사이트 리스트 화면 - 1280x800
5. 설정 화면 - 1280x800

**캡처 방법**:
1. 확장 프로그램을 개발자 모드로 로드
2. 각 화면을 캡처
3. 이미지 편집 도구로 크기 조정 (1280x800)
4. JPEG 또는 PNG로 저장

#### 프로모션 타일 (선택사항)
- **작은 타일**: 440x280
  - `store-assets/promo-small.html`을 브라우저에서 열고 스크린샷
- **마키 타일**: 1400x560
  - `store-assets/promo-marquee.html`을 브라우저에서 열고 스크린샷

### Step 4: 추가 입력란

#### 홈페이지 URL
```
https://octxxiii.github.io/tab-timer
```

#### 지원 URL
```
https://github.com/octxxiii/tab-timer/issues
```

### Step 5: 개인정보 보호

#### 개인정보 처리방침 URL
```
https://octxxiii.github.io/Tab-Timer-Pages/
```

#### 단일 용도 선언
- ✅ 예 (단일 목적: 시간 추적)

#### 권한 정당성 설명
각 권한에 대해 다음 설명 사용:

**storage**:
```
사용 시간 데이터를 사용자의 기기에 로컬로 저장합니다. 외부 서버로 전송하지 않습니다.
```

**tabs**:
```
현재 활성 탭의 URL을 확인하여 웹사이트별 사용 시간을 추적합니다. 전체 URL이 아닌 도메인 이름만 사용합니다.
```

**activeTab**:
```
현재 탭의 도메인 정보를 확인하여 정확한 시간 추적을 수행합니다.
```

**notifications**:
```
사용자가 설정한 시간 제한에 도달했을 때 알림을 표시합니다.
```

**<all_urls>**:
```
모든 웹사이트의 사용 시간을 추적하기 위해 필요합니다. 도메인 이름만 수집하며, 전체 URL이나 개인정보는 수집하지 않습니다.
```

### Step 6: 성인용 콘텐츠
- ✅ 미성년자 부적합 콘텐츠 없음

### Step 7: 배포 설정
- **가격**: 무료
- **지역**: 모든 지역
- **대상**: 모든 사용자

### Step 8: 최종 검토 및 제출
1. 모든 정보 재확인
2. 스크린샷이 모두 표시되는지 확인
3. URL이 모두 접근 가능한지 확인
4. "검토를 위해 제출" 클릭

## 📸 스크린샷 캡처 팁

### Chrome 확장 프로그램 팝업 크기 조정
1. 확장 프로그램 팝업 열기
2. 개발자 도구 열기 (F12)
3. Console에서 다음 명령 실행:
```javascript
// 팝업 크기 조정 (1280x800)
document.body.style.width = '1280px';
document.body.style.height = '800px';
```

### 고품질 스크린샷 캡처
1. 브라우저 확대/축소를 100%로 설정
2. 고해상도 모니터 사용
3. 스크린샷 도구 사용 (예: Flameshot, Greenshot)
4. 필요시 이미지 편집 도구로 크기 조정

## ✅ 최종 체크리스트

제출 전 다음 항목을 모두 확인하세요:

- [ ] 패키지 파일 업로드 완료
- [ ] 설명 텍스트 입력 완료
- [ ] 스크린샷 5장 모두 업로드
- [ ] 프로모션 타일 업로드 (선택사항)
- [ ] 홈페이지 URL 입력
- [ ] 지원 URL 입력
- [ ] 개인정보 처리방침 URL 입력
- [ ] 권한 정당성 설명 입력
- [ ] 모든 URL 접근 가능 확인
- [ ] 오타 및 문법 오류 확인

## 🎉 제출 완료 후

1. **검토 대기**: 보통 1-3일 소요
2. **피드백 확인**: 거부 사유가 있으면 수정 후 재제출
3. **승인 후**: 
   - README.md에 웹 스토어 링크 추가
   - 출시 발표 준비
   - 사용자 피드백 모니터링 시작

---

**행운을 빕니다! 🚀**

