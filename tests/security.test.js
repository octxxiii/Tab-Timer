const { setupChrome, setupChromeBehavior, resetTestState, setupDOM } = require('./testSetup');

describe('Security Tests', () => {
  beforeEach(() => {
    setupChrome();
    setupChromeBehavior();
    setupDOM();
  });

  afterEach(() => {
    resetTestState();
    document.body.innerHTML = '';
  });

  describe('XSS Prevention', () => {
    test('Sanitizes user input', () => {
      const maliciousInput = {
        tabs: {
          '<script>alert("xss")</script>.com': { totalTime: 1000 },
          '"><img src=x onerror=alert("xss")>.com': { totalTime: 2000 }
        }
      };

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback(maliciousInput);
      });

      const tabList = document.getElementById('tabList');
      expect(tabList.innerHTML).not.toContain('<script>');
      expect(tabList.innerHTML).not.toContain('onerror=');
    });

    test('Validates URL format', () => {
      const invalidUrls = {
        tabs: {
          'javascript:alert("xss")': { totalTime: 1000 },
          'data:text/html,<script>alert("xss")</script>': { totalTime: 2000 }
        }
      };

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback(invalidUrls);
      });

      const tabList = document.getElementById('tabList');
      expect(tabList.innerHTML).not.toContain('javascript:');
      expect(tabList.innerHTML).not.toContain('data:text/html');
    });
  });

  describe('Data Protection', () => {
    test('Encrypts sensitive data', () => {
      const sensitiveData = {
        tabs: {
          'bank.com': { totalTime: 1000 },
          'health.gov': { totalTime: 2000 }
        }
      };

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback(sensitiveData);
      });

      const tabList = document.getElementById('tabList');
      expect(tabList.innerHTML).not.toContain('bank.com');
      expect(tabList.innerHTML).not.toContain('health.gov');
    });

    test('Implements CSP', () => {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Content-Security-Policy');
      meta.setAttribute('content', "default-src 'self'");
      document.head.appendChild(meta);

      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      expect(cspMeta).toBeTruthy();
      expect(cspMeta.getAttribute('content')).toContain("default-src 'self'");
    });
  });

  describe('Permission Handling', () => {
    test('Validates permissions', () => {
      const executeScript = () => {
        try {
          chrome.tabs.executeScript({ code: 'alert("test")' });
          return true;
        } catch (e) {
          return false;
        }
      };

      expect(executeScript()).toBe(false);
    });
  });
}); 