const path = require('path');
const puppeteer = require('puppeteer');

describe('시간 제한 기능 테스트', () => {
  let browser;
  let page;
  let extensionId;

  beforeAll(async () => {
    // 확장 프로그램 경로
    const extensionPath = path.join(__dirname, '../');
    
    // Puppeteer 설정
    browser = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    });

    // 확장 프로그램 ID 가져오기
    const targets = await browser.targets();
    const extensionTarget = targets.find(target => 
      target.type() === 'service_worker' && 
      target.url().includes('chrome-extension://')
    );
    
    if (!extensionTarget) {
      throw new Error('확장 프로그램을 찾을 수 없습니다.');
    }
    
    extensionId = extensionTarget.url().split('/')[2];
    
    // 새 페이지 열기
    page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
  });

  afterAll(async () => {
    await browser.close();
  });

  test('시간 제한 설정 테스트', async () => {
    // 30분으로 시간 제한 설정
    await page.type('#timeLimitMinutes', '30');
    await page.click('#setTimeLimit');
    
    // 설정된 시간 확인
    const currentLimit = await page.$eval('#currentLimit', el => el.textContent);
    expect(currentLimit).toContain('30');
  });

  test('남은 시간 표시 테스트', async () => {
    // 10분 경과 시뮬레이션
    await page.evaluate(() => {
      const originalDateNow = Date.now;
      Date.now = () => originalDateNow() + 10 * 60000;
    });
    
    // 남은 시간이 20분인지 확인
    const remaining = await page.$eval('#remainingTime', el => el.textContent);
    expect(parseInt(remaining)).toBe(20);
  });
}); 