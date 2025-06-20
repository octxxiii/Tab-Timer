# Tab Timer

![Tab Timer Logo](images/icon128.png)

> "당신의 시간을 자동으로 기록하고, 더 나은 습관을 만듭니다."

## 🚀 프로젝트 개요

Tab Timer는 사용자의 웹 사용 습관을 개선하기 위해 개발된 Chrome 확장 프로그램 기반 시간 추적 시스템입니다.

### ✨ 주요 기능

#### 기본 기능
- ⏱️ **자동 시간 추적**: 웹사이트 방문 시 자동으로 체류 시간 기록
- 📊 **실시간 통계**: 도메인별, 세션별 상세 사용 시간 확인
- ⏰ **시간 제한 알림**: 설정한 시간 초과 시 알림 표시
- 🌓 **다크 모드**: 눈의 피로를 줄이는 다크 테마 지원

#### 고급 기능
- 📈 **세션 기반 추적**: 각 방문을 개별 세션으로 기록
- 💡 **스마트 인사이트**: AI 기반 생산성 점수 및 사용 패턴 분석
- 📱 **반응형 대시보드**: 웹 기반 상세 통계 대시보드
- 💾 **데이터 내보내기**: JSON 형식으로 전체 데이터 백업

### 🛠️ 기술 스택

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **UI Framework**: Material Design Icons
- **차트**: Chart.js
- **스토리지**: Chrome Storage API
- **빌드**: npm scripts
- **테스트**: Jest + Puppeteer

## 📦 설치 방법

### Chrome 웹 스토어 (준비 중)
곧 Chrome 웹 스토어에서 설치할 수 있습니다.

### 개발자 모드 설치
1. 이 저장소를 클론합니다:
   ```bash
   git clone https://github.com/octxxiii/tab-timer.git
   cd tab-timer
   ```

2. Chrome 브라우저에서 `chrome://extensions/` 접속

3. 우측 상단의 "개발자 모드" 활성화

4. "압축해제된 확장 프로그램을 로드합니다" 클릭

5. 프로젝트 폴더 선택

## 🎯 사용 방법

### 기본 사용법
1. 브라우저 툴바의 Tab Timer 아이콘 클릭
2. 오늘의 사용 시간과 통계 확인
3. 필요시 시간 제한 설정

### 시간 제한 설정
1. 팝업에서 "시간 제한 설정" 섹션 찾기
2. 원하는 시간(분 단위) 입력
3. "설정" 버튼 클릭

### 대시보드 접속
1. 팝업에서 "대시보드" 버튼 클릭
2. 또는 `https://octxxiii.github.io/tab-timer?extensionId=YOUR_EXTENSION_ID` 직접 접속

## 📊 주요 화면

### 팝업 인터페이스
- **통계 카드**: 오늘의 총 사용 시간, 세션 수, 방문 사이트 수
- **도메인 리스트**: 사이트별 사용 시간과 비율
- **빠른 액션**: 대시보드, 인사이트, 데이터 내보내기

### 웹 대시보드
- **일간 차트**: 최근 7일간 사용 시간 추이
- **도메인 분포**: 사이트별 시간 분포 도넛 차트
- **목표 설정**: 도메인별 시간 제한 관리

## 🔄 업데이트 내역

### v2.0.0 (2024.01)
- 🎨 UI/UX 전면 개편
- 🌓 다크 모드 추가
- 📊 세션 기반 추적 시스템 도입
- 💡 스마트 인사이트 기능 추가
- 🚀 성능 최적화 (디바운싱, 자동 정리)

### v1.0.0 (2024.01)
- 🎉 초기 버전 출시
- ⏱️ 기본 시간 추적 기능
- 📊 간단한 통계 표시

## 🗺️ 로드맵

### 2025 Q1
- [ ] Chrome 웹 스토어 출시
- [ ] Firefox 확장 프로그램 지원
- [ ] 팀/그룹 기능 추가

### 2025 Q2
- [ ] React 기반 대시보드 마이그레이션
- [ ] Firebase 백엔드 연동
- [ ] 실시간 동기화 기능

### 2025 Q3
- [ ] Flutter 모바일 앱 개발
- [ ] AI 기반 습관 개선 추천
- [ ] 프리미엄 구독 시스템

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👥 팀

- **개발**: [@octxxiii](https://github.com/octxxiii)
- **디자인**: Tab Timer Design Team
- **기여자**: [Contributors](https://github.com/octxxiii/tab-timer/contributors)

## 📞 문의

- **이슈**: [GitHub Issues](https://github.com/octxxiii/tab-timer/issues)
- **이메일**: contact@tabtimer.app (준비 중)
- **웹사이트**: [https://octxxiii.github.io/tab-timer](https://octxxiii.github.io/tab-timer)

---

<p align="center">
  Made with ❤️ by Tab Timer Team
</p> 