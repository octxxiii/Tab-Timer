// Add TextEncoder and TextDecoder polyfills
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Jest setup file that runs after the test environment is set up

const { JSDOM } = require('jsdom');

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable'
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.location = dom.window.location;

// Mock functions that might not be available in jsdom
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Setup chrome API mocks
require('./testSetup').setupChrome();
require('./testSetup').setupChromeBehavior();

// Helper functions
global.flushPromises = () => new Promise(resolve => setImmediate(resolve));

// Extend expect with custom matcher
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Global test timeout
jest.setTimeout(30000);

// Console error handling
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Error: Could not find required') &&
    args[0].includes('extension context')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

// Mock functions that might not be available in jsdom
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  }

  if (!window.IntersectionObserver) {
    window.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  }
}

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  
  // Setup default chrome.storage.local.get behavior
  chrome.storage.local.get.mockImplementation((keys, callback) => {
    const result = {};
    if (typeof keys === 'string') {
      result[keys] = null;
    } else if (Array.isArray(keys)) {
      keys.forEach(key => result[key] = null);
    } else if (typeof keys === 'object') {
      Object.keys(keys).forEach(key => result[key] = keys[key]);
    }
    callback(result);
  });

  // Setup default chrome.storage.local.set behavior
  chrome.storage.local.set.mockImplementation((items, callback) => {
    if (callback) callback();
  });

  // Setup default chrome.tabs.query behavior
  chrome.tabs.query.mockImplementation((options, callback) => {
    callback([{
      id: 1,
      url: 'https://example.com',
      title: 'Example Domain'
    }]);
  });

  // Mock DOM elements that should be available
  document.body.innerHTML = `
    <div id="tabList"></div>
    <div id="totalTime"></div>
    <div id="mostUsed"></div>
    <button id="upgradeBtn">Upgrade</button>
    <button id="showMore">Show More</button>
    <select id="limitType">
      <option value="current">Current Site</option>
      <option value="custom">Custom Site</option>
    </select>
    <input id="siteUrl" type="text" class="hidden">
    <input id="timeLimitMinutes" type="number">
    <button id="setTimeLimit">Set Limit</button>
    <div id="currentLimit"></div>
    <div id="limitsList"></div>
    <div class="premium-features"></div>
  `;
});

// Puppeteer error handling
beforeAll(() => {
  // Suppress specific puppeteer errors
  const ignoredConsoleMessages = [
    'Failed to load resource: net::ERR_FAILED',
    'Failed to load resource: net::ERR_UNKNOWN_URL_SCHEME',
  ];

  if (typeof page !== 'undefined') {
    page.on('console', msg => {
      if (ignoredConsoleMessages.some(m => msg.text().includes(m))) {
        return;
      }
      console.log(msg.text());
    });

    page.on('pageerror', error => {
      console.error(error);
    });
  }
});

// Clean up after each test
afterEach(() => {
  // Clear mocks
  jest.clearAllMocks();
  
  // Clear localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
  
  // Clear chrome storage
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.clear();
  }
  
  // Reset any modified globals
  if (typeof window !== 'undefined') {
    window.location.href = 'http://localhost/';
  }
}); 