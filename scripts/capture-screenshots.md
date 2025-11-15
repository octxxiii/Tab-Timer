# 스크린샷 캡처 가이드

## 필요한 스크린샷 (5개)

### 1. 메인 팝업 화면 (라이트 모드)
**크기**: 1280x800  
**캡처 방법**:
1. 확장 프로그램을 개발자 모드로 로드
2. 팝업 열기 (라이트 모드)
3. 홈 탭 선택
4. 브라우저 개발자 도구에서 팝업 크기 조정:
   ```javascript
   // Console에서 실행
   document.body.style.width = '1280px';
   document.body.style.height = '800px';
   ```
5. 스크린샷 캡처
6. `images/store/screenshot-1-main-light.png`로 저장

### 2. 다크 모드 화면
**크기**: 1280x800  
**캡처 방법**:
1. 팝업에서 테마 토글 버튼 클릭 (다크 모드로 전환)
2. 홈 또는 대시보드 탭 선택
3. 동일한 크기로 조정 후 스크린샷
4. `images/store/screenshot-2-dark-mode.png`로 저장

### 3. 대시보드 화면
**크기**: 1280x800  
**캡처 방법**:
1. 대시보드 탭 클릭
2. 모든 아코디언 섹션 열기
3. 스크린샷 캡처
4. `images/store/screenshot-3-dashboard.png`로 저장

### 4. 사이트 리스트 화면
**크기**: 1280x800  
**캡처 방법**:
1. 사이트 탭 클릭
2. 여러 사이트가 표시되도록 확인
3. 스크린샷 캡처
4. `images/store/screenshot-4-sites.png`로 저장

### 5. 설정 화면
**크기**: 1280x800  
**캡처 방법**:
1. 설정 탭 클릭
2. 모든 설정 옵션이 보이도록 확인
3. 스크린샷 캡처
4. `images/store/screenshot-5-settings.png`로 저장

## 이미지 편집 팁

### 크기 조정 (ImageMagick 사용 시)
```bash
# 1280x800으로 리사이즈
convert screenshot.png -resize 1280x800 screenshot-resized.png

# JPEG로 변환 (알파 채널 제거)
convert screenshot.png -background white -alpha remove -quality 90 screenshot.jpg
```

### 온라인 도구
- [TinyPNG](https://tinypng.com/) - PNG 압축
- [Squoosh](https://squoosh.app/) - 이미지 최적화
- [Remove.bg](https://www.remove.bg/) - 배경 제거 (필요시)

## 프로모션 타일

### 작은 프로모션 타일 (440x280)
✅ 이미 생성됨: `images/store/promo-small.png`

### 마키 프로모션 타일 (1400x560)
✅ 이미 생성됨: `images/store/promo-marquee.png`

## 파일 형식 확인

모든 이미지는 다음 요구사항을 만족해야 합니다:
- ✅ JPEG 또는 24비트 PNG
- ✅ 알파 채널 없음
- ✅ 정확한 크기 (1280x800 또는 640x400)

