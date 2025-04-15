const puppeteer = require('puppeteer');
const path = require('path');

// Browser and extension setup helpers
/**
 * Sets up a Puppeteer browser instance with the extension loaded
 * @param {string} extensionPath - Path to the extension directory
 * @returns {Promise<{browser: Browser, extensionId: string}>} Browser instance and extension ID
 * @throws {Error} If extension fails to load
 */
async function setupBrowser(extensionPath) {
  try {
    const browser = await puppeteer.launch({
      headless: 'new', // Use new headless mode
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage' // Add this to prevent memory issues
      ]
    });

    // Wait for extension to load
    await wait(2000);

    const extensionId = await getExtensionId(browser);
    if (!extensionId) {
      throw new Error('Failed to get extension ID');
    }

    return { browser, extensionId };
  } catch (error) {
    console.error('Failed to setup browser:', error);
    throw error;
  }
}

/**
 * Retrieves the extension ID from the browser instance
 * @param {Browser} browser - Puppeteer browser instance
 * @returns {Promise<string>} Extension ID
 * @throws {Error} If extension is not found
 */
async function getExtensionId(browser) {
  try {
    const targets = await browser.targets();
    const extensionTarget = targets.find(target => 
      target.type() === 'service_worker' &&
      target.url().includes('chrome-extension://')
    );
    
    if (!extensionTarget) {
      console.error('Available targets:', targets.map(t => ({ type: t.type(), url: t.url() })));
      throw new Error('Extension not found');
    }
    
    return extensionTarget.url().split('/')[2];
  } catch (error) {
    console.error('Failed to get extension ID:', error);
    throw error;
  }
}

// Page interaction helpers
/**
 * Waits for an element to appear on the page
 * @param {Page} page - Puppeteer page instance
 * @param {string} selector - CSS selector for the element
 * @param {number} [timeout=5000] - Maximum time to wait in milliseconds
 * @returns {Promise<boolean>} Whether the element was found
 */
async function waitForElement(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (e) {
    console.error(`Element ${selector} not found within ${timeout}ms`);
    return false;
  }
}

async function waitForTimeTracking(page, domain, maxAttempts = 10) {
  for (let attempts = 0; attempts < maxAttempts; attempts++) {
    const content = await page.content();
    if (content.includes(domain)) {
      return true;
    }
    await wait(1000);
    await page.reload();
  }
  console.error(`Time tracking data for ${domain} not found after ${maxAttempts} attempts`);
  return false;
}

// Data manipulation helpers
async function injectTestData(page, data) {
  await page.evaluate((testData) => {
    return new Promise(resolve => {
      chrome.storage.local.set(testData, resolve);
    });
  }, data);
}

async function getStorageData(page, keys = null) {
  return await page.evaluate((storageKeys) => {
    return new Promise(resolve => {
      chrome.storage.local.get(storageKeys, resolve);
    });
  }, keys);
}

// UI interaction helpers
async function setTimeLimit(page, { type = 'current', site = '', minutes = '30' }) {
  await waitForElement(page, '#limitType');
  await page.select('#limitType', type);
  
  if (type === 'custom') {
    await page.type('#siteUrl', site);
  }
  
  await page.type('#timeLimitMinutes', minutes.toString());
  await page.click('#setTimeLimit');
}

// Mock helpers
async function mockNotifications(page) {
  await page.evaluate(() => {
    window.Notification = class {
      static permission = 'granted';
      constructor(title, options) {
        this.title = title;
        this.options = options;
      }
    };
  });
}

// Utility functions
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function measurePerformance(callback) {
  const start = performance.now();
  await callback();
  const end = performance.now();
  return end - start;
}

// Test data generators
function generateLargeDataset(size = 100) {
  const dataset = {};
  for (let i = 0; i < size; i++) {
    dataset[`site${i}.com`] = { 
      totalTime: i * 1000,
      visits: Math.floor(Math.random() * 100),
      lastVisit: Date.now() - Math.random() * 86400000
    };
  }
  return dataset;
}

module.exports = {
  setupBrowser,
  getExtensionId,
  waitForElement,
  waitForTimeTracking,
  injectTestData,
  getStorageData,
  setTimeLimit,
  mockNotifications,
  wait,
  measurePerformance,
  generateLargeDataset
}; 