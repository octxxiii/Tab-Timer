# Tab Timer 프로젝트 구조

## 디렉터리 구조

```
Tab-Timer/
├── src/                          # 소스 코드
│   ├── background/               # Background script
│   │   └── background.js         # 메인 백그라운드 스크립트
│   ├── popup/                    # Popup UI
│   │   ├── popup.html           # Popup HTML
│   │   └── popup.js             # Popup JavaScript
│   └── utils/                    # 공통 유틸리티
│       ├── dateHelpers.js       # 날짜 관련 헬퍼 함수
│       ├── urlHelpers.js        # URL 파싱 헬퍼 함수
│       └── timeFormatters.js    # 시간 포맷팅 함수
│
├── public/                       # 정적 파일
│   ├── images/                  # 아이콘 및 이미지
│   │   ├── icon16.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   └── manifest.json            # Chrome 확장 프로그램 매니페스트
│
├── dist/                         # 빌드 출력 (자동 생성)
│   ├── background.js
│   ├── manifest.json
│   ├── popup/
│   │   ├── popup.html
│   │   └── popup.js
│   └── images/
│
├── tests/                        # 테스트 파일
│   ├── background.test.js
│   ├── popup.test.js
│   └── ...
│
├── scripts/                      # 빌드 스크립트
│   └── build.js                 # 빌드 스크립트
│
├── website/                      # 웹 대시보드
│   ├── index.html
│   ├── dashboard.html
│   └── ...
│
├── coverage/                     # 테스트 커버리지 리포트
├── node_modules/                 # npm 의존성
├── package.json                 # 프로젝트 설정
├── jest.config.js               # Jest 설정
├── babel.config.js              # Babel 설정
└── README.md                    # 프로젝트 문서
```

## 주요 파일 설명

### 소스 코드 (src/)

- **background/background.js**: Chrome 확장 프로그램의 백그라운드 서비스 워커
  - 탭 추적 및 시간 기록
  - 세션 관리
  - 알림 처리
  - 통계 계산

- **popup/popup.html**: 팝업 UI의 HTML 구조
- **popup/popup.js**: 팝업 UI의 JavaScript 로직
  - 통계 표시
  - 시간 제한 설정
  - 테마 관리

- **utils/**: 재사용 가능한 유틸리티 함수들

### 정적 파일 (public/)

- **manifest.json**: Chrome 확장 프로그램 매니페스트
- **images/**: 확장 프로그램 아이콘

### 빌드 프로세스

1. `npm run build`: 소스 코드를 `dist/` 디렉터리로 복사
2. `dist/` 디렉터리를 Chrome에서 "압축해제된 확장 프로그램"으로 로드

## 개발 워크플로우

1. **소스 코드 수정**: `src/` 디렉터리에서 작업
2. **빌드**: `npm run build` 실행
3. **테스트**: Chrome에서 `dist/` 디렉터리 로드
4. **반복**: 변경사항 적용 후 다시 빌드

## 명령어

- `npm run build`: 프로덕션 빌드
- `npm test`: 테스트 실행
- `npm run test:coverage`: 커버리지 포함 테스트
- `npm run clean`: 빌드 출력 정리

