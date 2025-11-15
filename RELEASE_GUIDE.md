# 🚀 Tab Timer 출시 가이드

## ✅ 출시 준비 완료 상태

### 1. 코드 상태
- ✅ 광고 기능 비활성화됨 (무료 버전으로 출시)
- ✅ 모든 기능 정상 작동
- ✅ 다국어 지원 (한국어/영어)
- ✅ 다크 모드 지원
- ✅ 실시간 시간 추적
- ✅ 대시보드 통계
- ✅ 시간 제한 설정

### 2. 빌드 상태
- ✅ 빌드 완료: `dist/` 폴더 (204KB)
- ✅ manifest.json v2.0.0
- ✅ 모든 필수 파일 포함

### 3. 문서 준비
- ✅ README.md
- ✅ STORE_LISTING.md
- ✅ RELEASE_CHECKLIST.md
- ✅ 개인정보 처리방침 (website/privacy.html)

## 📦 Chrome 웹 스토어 제출 절차

### Step 1: 패키지 준비
```bash
# dist 폴더를 zip으로 압축
cd /home/jun/dev/Tab-Timer
zip -r tab-timer-v2.0.0.zip dist/ -x "*.DS_Store" "*.git*"
```

### Step 2: Chrome 웹 스토어 개발자 계정
1. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) 접속
2. Google 계정으로 로그인
3. 개발자 등록비 $5 결제 (한 번만 결제)

### Step 3: 새 항목 추가
1. "새 항목" 버튼 클릭
2. `tab-timer-v2.0.0.zip` 업로드
3. 업로드 완료 대기

### Step 4: 스토어 목록 작성

#### 기본 정보
- **이름**: Tab Timer
- **간단한 설명** (132자 이내):
  ```
  당신의 웹 사용 시간을 자동으로 추적하고 분석합니다. 생산성을 높이고 더 나은 디지털 습관을 만들어보세요.
  ```

#### 상세 설명
`STORE_LISTING.md`의 내용을 복사하여 입력

#### 카테고리
- **주 카테고리**: 생산성 (Productivity)
- **언어**: 한국어, 영어

#### 그래픽 자료
필요한 스크린샷:
1. 메인 팝업 화면 (라이트 모드)
2. 다크 모드 화면
3. 대시보드 화면
4. 사이트 리스트 화면
5. 설정 화면

**스크린샷 크기**: 1280x800 또는 640x400

#### 개인정보 및 규정 준수
- **개인정보 처리방침 URL**: 
  ```
  https://octxxiii.github.io/tab-timer/privacy.html
  ```
- **단일 용도 선언**: 예
- **권한 정당성 설명**:
  - `storage`: 사용 시간 데이터를 로컬에 저장
  - `tabs`: 현재 활성 탭의 URL을 확인하여 시간 추적
  - `activeTab`: 현재 탭의 도메인 정보 확인
  - `notifications`: 시간 제한 도달 시 알림 표시
  - `<all_urls>`: 모든 웹사이트의 사용 시간 추적

#### 가격 및 배포
- **가격**: 무료
- **지역**: 모든 지역
- **대상**: 모든 사용자

### Step 5: 검토 제출
1. 모든 정보 최종 확인
2. "검토를 위해 제출" 클릭
3. 검토 대기 (보통 1-3일)

## 📋 제출 전 최종 체크리스트

### 필수 확인사항
- [ ] `dist/` 폴더의 모든 파일이 정상인지 확인
- [ ] manifest.json 버전이 2.0.0인지 확인
- [ ] 광고 기능이 비활성화되어 있는지 확인
- [ ] 개인정보 처리방침 페이지가 접근 가능한지 확인
- [ ] 스크린샷이 모두 준비되었는지 확인
- [ ] 스토어 목록 텍스트가 오타 없는지 확인

### 테스트 확인사항
- [ ] 확장 프로그램 설치 후 정상 작동
- [ ] 시간 추적이 정상 작동
- [ ] 대시보드가 정상 표시
- [ ] 다크 모드 전환 정상 작동
- [ ] 언어 전환 정상 작동
- [ ] 시간 제한 설정 정상 작동

## 🎉 출시 후 할 일

### 즉시 할 일
1. GitHub에 출시 배지 추가
2. README.md에 웹 스토어 링크 추가
3. 출시 발표 게시물 준비

### 마케팅
- [ ] Product Hunt 등록
- [ ] Reddit (r/chrome_extensions) 게시
- [ ] 개발자 커뮤니티 공유
- [ ] 소셜 미디어 공유

### 모니터링
- [ ] 사용자 리뷰 모니터링
- [ ] 버그 리포트 확인
- [ ] 사용 통계 확인

## ⚠️ 중요 사항

### 광고 관련
- 현재 광고 기능은 **완전히 비활성화**되어 있음
- 나중에 광고를 추가하려면:
  1. `src/config/adConfig.js`에서 `enabled: true`로 변경
  2. AdSense ID 입력
  3. `src/popup/popup.js`의 `updateAdDisplay()` 함수 수정
  4. 새 버전으로 업데이트

### 버전 관리
- 출시 후 버전 업데이트 시:
  1. `public/manifest.json`의 `version` 업데이트
  2. `RELEASE_NOTES.md` 작성
  3. 새 zip 파일 생성
  4. Chrome 웹 스토어에서 업데이트 제출

## 📞 문의 및 지원

- **GitHub Issues**: 버그 리포트 및 기능 요청
- **이메일**: contact@tabtimer.app (준비 중)
- **웹사이트**: https://octxxiii.github.io/tab-timer

---

**행운을 빕니다! 🚀**

*마지막 업데이트: 2024년 11월*

