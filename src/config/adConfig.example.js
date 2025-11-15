/**
 * Advertisement Configuration Example
 * 
 * ⚠️ 보안 주의사항:
 * 1. 이 파일을 복사하여 adConfig.js로 이름을 변경하세요
 * 2. 실제 AdSense ID를 입력하세요
 * 3. adConfig.js는 .gitignore에 포함되어 있어야 합니다
 * 4. 공개 저장소에는 실제 ID를 올리지 마세요
 */

export const adConfig = {
  enabled: true,
  network: 'adsense', // 'adsense', 'custom', 'none'
  
  adsense: {
    // Google AdSense Client ID (Publisher ID)
    // 형식: ca-pub-XXXXXXXXXX
    // ⚠️ 이 ID는 공개되어도 되지만, 코드에 직접 하드코딩하지 않는 것이 좋습니다
    clientId: '', // 실제 Client ID를 여기에 입력
    
    // AdSense Ad Slot ID
    slotId: '', // 실제 Slot ID를 여기에 입력
  },
  
  custom: {
    // 커스텀 광고 네트워크 설정
    url: '',
    script: ''
  }
};

