# 🧾 Receipt — Your Daily Browser Receipt

> See exactly where your time goes. Block distractions. Share the truth.

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Receipt-6c63ff?style=flat-square&logo=google-chrome)](https://chromewebstore.google.com/detail/receipt/bkpigoodgcpamgbeci...)
[![Version](https://img.shields.io/badge/version-2.1.1-brightgreen?style=flat-square)]()
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)]()

---

## 소개

Receipt는 브라우저 사용 내역을 **영수증**으로 보여주는 Chrome 확장 프로그램입니다.  
방문한 모든 사이트와 체류 시간을 자동으로 기록하고, 집중 모드로 방해 사이트를 차단하며, 결과를 이미지로 공유할 수 있습니다.

---

## ✨ 기능

### 📊 일간 사용 시간 추적
- 사이트별 체류 시간 자동 기록
- SNS / 엔터테인먼트 / 업무 / 커뮤니티 카테고리 자동 분류
- 툴바 배지에 오늘의 총 사용 시간 실시간 표시
- 유휴 상태 감지 — 자리 비운 시간은 측정하지 않음

### 🎯 집중 모드
- 클릭 한 번으로 60개+ 방해 사이트 즉시 차단
- 활성화 시 이미 열려 있는 탭도 즉시 차단
- 종료 시 모든 탭 자동 해제
- 차단 목록 커스텀 가능 (카테고리별 토글 + 직접 추가)

### 🔥 스트릭 & 인사이트
- 목표 달성 시 연속 기록(스트릭) 추적
- 오늘 가장 먼저 연 사이트 기록
- 빠른 탭 전환 횟수로 딴짓 횟수 측정
- 어제 대비 사용 시간 증감 표시
- 주간 자동 리포트 (매주 월요일 알림)

### 🔗 영수증 공유
- 오늘의 사용 내역을 영수증 이미지로 생성
- 소셜 미디어에 바로 공유 가능

### ⏰ 시간 제한
- 사이트별 일일 제한 시간 설정
- 초과 시 차단 화면 표시 + 15분 연장 옵션

---

## 📦 설치

### Chrome 웹 스토어
[Chrome 웹 스토어에서 설치](https://chromewebstore.google.com/detail/receipt/bkpigoodgcpamgbeci...)

### 개발자 모드
```bash
git clone https://github.com/octxxiii/Tab-Timer.git
cd Tab-Timer
npm install
npm run build
```
`chrome://extensions/` → 개발자 모드 → `dist/` 폴더 로드

---

## 🛠️ 개발

```bash
npm install        # 의존성 설치
npm run build      # dist/ 빌드
```

### 스토어 에셋 생성
```bash
# 브라우저에서 열기
scripts/generate-store-assets.html   # 스크린샷 · 프로모 이미지
scripts/generate-icon.html           # 아이콘 (128/48/16px)
```

### 프로젝트 구조
```
src/
  background/background.js   # 서비스 워커 — 추적, 집중 모드, 알림
  popup/popup.html            # 팝업 UI
  popup/popup.js              # 팝업 로직 + 번역
  content/blocker.js          # 차단 화면 content script
public/
  manifest.json
  images/
scripts/
  build.js                    # 빌드 스크립트
  generate-store-assets.html  # 스토어 이미지 생성기
  generate-icon.html          # 아이콘 생성기
```

---

## 🔒 권한

| 권한 | 이유 |
|------|------|
| `tabs` | 현재 탭 URL 및 전환 추적 |
| `storage` | 사용 통계 로컬 저장 |
| `notifications` | 시간 제한 · 집중 모드 종료 알림 |
| `idle` | 유휴 상태 감지 — 자리 비운 시간 제외 |
| `alarms` | 집중 모드 자동 종료 · 주간 리포트 예약 |
| `activeTab` | 현재 탭 정보 접근 |

모든 데이터는 기기 내에만 저장됩니다. 서버 전송 없음.

---

## 📋 업데이트 내역

### v2.1.1 (2025.05)
- 집중 모드: 열린 탭 즉시 차단/해제, 차단 목록 커스텀
- 스트릭, 딴짓 감지, 첫 방문 사이트, 어제 대비 델타, 주간 리포트
- 툴바 배지 실시간 사용 시간 표시
- 한/영 완전 i18n 지원
- 포모도로 기능 제거 (실용성 낮음)
- Chrome Web Store 권한 최소화 (`host_permissions` 제거)
- 스토어 에셋 생성기 추가

### v2.0.0 (2024.01)
- Receipt로 리브랜딩
- 영수증 스타일 UI 전면 개편
- 영수증 이미지 공유 기능

### v1.0.0 (2024.01)
- 초기 출시 — 기본 시간 추적

---

## 📝 라이센스

MIT — 자세한 내용은 [LICENSE](LICENSE) 파일 참조

---

<p align="center">
  <a href="https://github.com/octxxiii/Tab-Timer">github.com/octxxiii/Tab-Timer</a>
</p>
