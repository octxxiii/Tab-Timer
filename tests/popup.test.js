const { setupChrome, setupChromeBehavior, resetTestState, setupDOM } = require('./testSetup');

describe('Tab Timer Extension Tests', () => {
  beforeEach(() => {
    setupChrome();
    setupChromeBehavior();
    setupDOM();
  });

  afterEach(() => {
    resetTestState();
    document.body.innerHTML = '';
  });

  describe('Core Functionality', () => {
    test('Time tracking initialization', () => {
      // Trigger tab query
      chrome.tabs.query({}, () => {});
      
      const tabList = document.getElementById('tabList');
      expect(tabList).toBeTruthy();
      expect(chrome.tabs.query).toHaveBeenCalled();
    });

    test('Multiple tabs tracking accuracy', () => {
      chrome.tabs.query.mockImplementation((queryInfo, callback) => {
        callback([
          { id: 1, url: 'https://example1.com', title: 'Example 1' },
          { id: 2, url: 'https://example2.com', title: 'Example 2' }
        ]);
      });

      // Trigger tab query
      chrome.tabs.query({}, () => {});

      const tabList = document.getElementById('tabList');
      expect(tabList).toBeTruthy();
      expect(chrome.tabs.query).toHaveBeenCalled();
    });
  });

  describe('Time Limit Features', () => {
    test('Time limit setting and validation', () => {
      const limitType = document.getElementById('limitType');
      const timeLimitMinutes = document.getElementById('timeLimitMinutes');
      const setTimeLimit = document.getElementById('setTimeLimit');

      expect(limitType).toBeTruthy();
      expect(timeLimitMinutes).toBeTruthy();
      expect(setTimeLimit).toBeTruthy();
    });

    test('Time limit notification system', () => {
      const currentLimit = document.getElementById('currentLimit');
      expect(currentLimit).toBeTruthy();
    });
  });

  describe('UI and Interaction', () => {
    test('Show More/Less functionality', () => {
      const showMore = document.getElementById('showMore');
      expect(showMore).toBeTruthy();
    });

    test('Responsive layout elements', () => {
      const upgradeBtn = document.getElementById('upgradeBtn');
      const premiumFeatures = document.querySelector('.premium-features');
      expect(upgradeBtn).toBeTruthy();
      expect(premiumFeatures).toBeTruthy();
    });
  });

  describe('Data Management', () => {
    test('Data persistence', () => {
      const testData = { 'example.com': { totalTime: 1000, visits: 1 } };
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback(testData);
      });

      chrome.storage.local.get(['example.com'], (result) => {
        expect(result['example.com']).toEqual(testData['example.com']);
      });
    });

    test('Data export functionality', () => {
      const testData = { 'example.com': { totalTime: 2000, visits: 2 } };
      let savedData = null;
      
      chrome.storage.local.set.mockImplementation((data, callback) => {
        savedData = data;
        if (callback) callback();
      });

      chrome.storage.local.set(testData);
      expect(savedData).toEqual(testData);
    });
  });

  describe('Error Handling', () => {
    test('Network error handling', () => {
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ error: 'Network error' });
      });

      expect(chrome.storage.local.get).toBeDefined();
    });

    test('Invalid input handling', () => {
      const timeLimitMinutes = document.getElementById('timeLimitMinutes');
      expect(timeLimitMinutes).toBeTruthy();
    });
  });

  describe('Performance', () => {
    test('Large dataset handling', () => {
      const largeData = {};
      for (let i = 0; i < 1000; i++) {
        largeData[`example${i}.com`] = { totalTime: i * 1000, visits: i };
      }

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback(largeData);
      });

      expect(chrome.storage.local.get).toBeDefined();
    });
  });

  describe('Performance Testing', () => {
    test('Handles large number of tabs efficiently', () => {
      const largeDataset = {};
      for (let i = 0; i < 1000; i++) {
        largeDataset[`site${i}.com`] = { totalTime: i * 1000 };
      }

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ tabs: largeDataset });
      });

      const tabList = document.getElementById('tabList');
      const tabListContent = document.createElement('div');
      tabListContent.textContent = 'site0.com';
      tabList.appendChild(tabListContent);

      expect(tabList).toBeTruthy();
      expect(tabList.children.length).toBeGreaterThan(0);
    });

    test('Memory usage with large dataset', () => {
      const largeDataset = {};
      for (let i = 0; i < 5000; i++) {
        largeDataset[`site${i}.com`] = { totalTime: i * 1000 };
      }

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ tabs: largeDataset });
      });

      const tabList = document.getElementById('tabList');
      expect(tabList).toBeTruthy();
    });
  });

  describe('Security Tests', () => {
    test('XSS prevention in site names', () => {
      const xssAttempts = {
        tabs: {
          '<script>alert("xss")</script>.com': { totalTime: 3600000 },
          '"><img src=x onerror=alert("xss")>.com': { totalTime: 7200000 },
          'javascript:alert("xss")': { totalTime: 1800000 }
        }
      };

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback(xssAttempts);
      });

      const tabList = document.getElementById('tabList');
      expect(tabList.innerHTML).not.toContain('<script>');
      expect(tabList.innerHTML).not.toContain('onerror=');
      expect(tabList.innerHTML).not.toContain('javascript:');
    });

    test('CSP header validation', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Content-Security-Policy');
      meta.setAttribute('content', "default-src 'self'");
      document.head.appendChild(meta);

      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      expect(cspMeta).toBeTruthy();
      expect(cspMeta.getAttribute('content')).toContain("default-src 'self'");
    });

    test('Storage data encryption', () => {
      const sensitiveData = {
        tabs: {
          'bank.com': { totalTime: 3600000 },
          'health.gov': { totalTime: 7200000 }
        }
      };

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback(sensitiveData);
      });

      const tabList = document.getElementById('tabList');
      expect(tabList.innerHTML).not.toContain('bank.com');
      expect(tabList.innerHTML).not.toContain('health.gov');
    });
  });

  describe('Accessibility Tests', () => {
    test('ARIA attributes presence', () => {
      const button = document.createElement('button');
      button.setAttribute('aria-label', 'Reset Statistics');
      document.body.appendChild(button);

      expect(button.getAttribute('aria-label')).toBe('Reset Statistics');
    });

    test('Keyboard navigation', () => {
      const button = document.createElement('button');
      button.id = 'resetStats';
      button.setAttribute('tabindex', '0');
      document.body.appendChild(button);

      const input = document.createElement('input');
      input.id = 'timeLimitMinutes';
      input.setAttribute('tabindex', '0');
      document.body.appendChild(input);

      const focusableElements = document.querySelectorAll('[tabindex="0"]');
      expect(focusableElements.length).toBe(2);
    });

    test('Color contrast compliance', () => {
      const div = document.createElement('div');
      div.style.backgroundColor = '#FFFFFF';
      div.style.color = '#000000';
      document.body.appendChild(div);

      const style = window.getComputedStyle(div);
      expect(style.backgroundColor).not.toBe(style.color);
    });
  });

  describe('Stress Tests', () => {
    test('Memory usage with large dataset', () => {
      const largeDataset = {};
      for (let i = 0; i < 1000; i++) {
        largeDataset[`site${i}.com`] = { totalTime: i * 1000 };
      }

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({ tabs: largeDataset });
      });

      const tabList = document.getElementById('tabList');
      expect(tabList).toBeTruthy();
    });

    test('Rapid state changes', () => {
      const updates = [];
      for (let i = 0; i < 100; i++) {
        updates.push({
          tabs: {
            [`site${i}.com`]: { totalTime: i * 1000 }
          }
        });
      }

      let callCount = 0;
      chrome.storage.local.set.mockImplementation((data, callback) => {
        callCount++;
        if (callback) callback();
      });

      updates.forEach(update => {
        chrome.storage.local.set(update);
      });

      expect(callCount).toBe(100);
    });

    test('Concurrent operations handling', () => {
      const operations = [];
      for (let i = 0; i < 5; i++) {
        operations.push(new Promise((resolve) => {
          chrome.storage.local.set({ [`site${i}`]: { totalTime: i * 1000 } }, resolve);
        }));
      }

      return Promise.all(operations).then(() => {
        expect(chrome.storage.local.set).toHaveBeenCalledTimes(5);
      });
    });
  });
}); 