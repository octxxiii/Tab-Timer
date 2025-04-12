const path = require('path');
const puppeteer = require('puppeteer');

describe('시간 제한 기능 테스트', () => {
  let browser;
  let extensionId;

  beforeAll(async () => {
    // 확장 프로그램이 있는 경로
    const extensionPath = path.join(__dirname, '../');
    
    // Puppeteer 브라우저 실행 시 확장 프로그램 로드
    browser = await puppeteer.launch({
      headless: false, // 확장 프로그램 테스트를 위해 headless: false 필요
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
    
    extensionId = extensionTarget.url().split('/')[2];
    
    // 새 페이지 열기
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
  });

  afterAll(async () => {
    await browser.close();
  });

  test('시간 제한 설정 테스트', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    
    // 30분으로 시간 제한 설정
    await page.type('#timeLimitMinutes', '30');
    await page.click('#setTimeLimit');
    
    // 설정된 시간 확인
    const currentLimit = await page.$eval('#currentLimit', el => el.textContent);
    expect(currentLimit).toContain('30');
  });

  test('남은 시간 표시 테스트', async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup.html`);
    
    // 10분 경과 시뮬레이션
    await page.evaluate(() => {
      Date.now = jest.fn(() => new Date(Date.now() + 10 * 60000).getTime());
    });
    
    // 남은 시간이 20분인지 확인
    const remaining = await page.$eval('#remainingTime', el => el.textContent);
    expect(parseInt(remaining)).toBe(20);
  });
}); 