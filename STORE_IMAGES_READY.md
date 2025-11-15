# Chrome Web Store 이미지 준비 상태

## ✅ 준비 완료된 이미지

### 프로모션 타일
- ✅ **작은 프로모션 타일**: `images/store/promo-small.png` (440x280, 12KB)
- ✅ **마키 프로모션 타일**: `images/store/promo-marquee.png` (1400x560, 38KB)

## 📸 필요한 스크린샷 (5개)

다음 스크린샷을 캡처해야 합니다:

### 1. 메인 팝업 화면 (라이트 모드)
- **파일명**: `screenshot-1-main-light.png`
- **크기**: 1280x800
- **내용**: 홈 탭, 오늘 총 사용 시간, 시간 제한 설정

### 2. 다크 모드 화면
- **파일명**: `screenshot-2-dark-mode.png`
- **크기**: 1280x800
- **내용**: 다크 모드로 전환된 상태

### 3. 대시보드 화면
- **파일명**: `screenshot-3-dashboard.png`
- **크기**: 1280x800
- **내용**: 대시보드 탭, 모든 차트와 통계

### 4. 사이트 리스트 화면
- **파일명**: `screenshot-4-sites.png`
- **크기**: 1280x800
- **내용**: 사이트 탭, 사이트별 사용 시간 리스트

### 5. 설정 화면
- **파일명**: `screenshot-5-settings.png`
- **크기**: 1280x800
- **내용**: 설정 탭, 모든 설정 옵션

## 🛠️ 스크린샷 캡처 방법

### 방법 1: 확장 프로그램 팝업 직접 캡처
1. 확장 프로그램을 개발자 모드로 로드
2. 팝업 열기
3. 스크린샷 도구 사용 (예: Flameshot, Greenshot)
4. 크기 조정 필요 시 ImageMagick 사용:
   ```bash
   convert screenshot.png -resize 1280x800 -background white -alpha remove screenshot-1280x800.png
   ```

### 방법 2: 브라우저 개발자 도구 사용
1. 팝업 열기
2. F12로 개발자 도구 열기
3. Console에서 크기 조정:
   ```javascript
   document.body.style.width = '1280px';
   document.body.style.height = '800px';
   ```
4. 스크린샷 캡처

### 방법 3: 확장 프로그램 테스트 페이지 사용
1. `chrome://extensions/` 접속
2. 개발자 모드 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. `dist/` 폴더 선택
5. 팝업 열고 스크린샷 캡처

## 📋 이미지 요구사항

### 형식
- JPEG 또는 24비트 PNG
- 알파 채널 없음 (투명도 제거)

### 크기
- 스크린샷: 1280x800 또는 640x400
- 작은 타일: 440x280 (✅ 준비 완료)
- 마키 타일: 1400x560 (✅ 준비 완료)

### 품질
- 선명하고 깨끗한 이미지
- 텍스트가 읽기 쉬워야 함
- 중요한 기능이 명확히 보여야 함

## 🎨 프로모션 타일 사용

이미 생성된 프로모션 타일을 사용하세요:
- `images/store/promo-small.png` - 작은 타일
- `images/store/promo-marquee.png` - 마키 타일

## ✅ 최종 체크리스트

제출 전 확인:
- [ ] 스크린샷 5장 모두 준비
- [ ] 모든 이미지가 올바른 크기인지 확인
- [ ] JPEG 또는 24비트 PNG 형식인지 확인
- [ ] 알파 채널이 제거되었는지 확인
- [ ] 프로모션 타일 준비 완료

