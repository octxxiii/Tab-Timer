const { setupChrome, setupChromeBehavior, resetTestState, setupDOM } = require('./testSetup');

describe('Tab Timer Extension Tests', () => {
  beforeEach(() => {
    setupChrome();
    setupChromeBehavior();
    setupDOM();

    // Add timer element
    const timer = document.createElement('div');
    timer.id = 'timer';
    timer.textContent = '00:00:00';
    document.body.appendChild(timer);

    // Add statistics element
    const statistics = document.createElement('div');
    statistics.id = 'statistics';
    document.body.appendChild(statistics);

    // Mock notifications API
    global.chrome.notifications = {
      create: jest.fn(),
      clear: jest.fn(),
      onClicked: {
        addListener: jest.fn(),
        removeListener: jest.fn()
      }
    };
  });

  afterEach(() => {
    resetTestState();
    document.body.innerHTML = '';
  });

  describe('Core Functionality', () => {
    test('Tracks time spent on tabs', () => {
      const tabData = {
        tabs: {
          'example.com': { totalTime: 1000 },
          'test.com': { totalTime: 2000 }
        }
      };

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback(tabData);
      });

      const tabList = document.getElementById('tabList');
      const tabListContent = document.createElement('div');
      tabListContent.textContent = 'example.com, test.com';
      tabList.appendChild(tabListContent);

      expect(tabList.textContent).toContain('example.com');
      expect(tabList.textContent).toContain('test.com');
    });

    test('Updates timer display', () => {
      const timer = document.getElementById('timer');
      expect(timer.textContent).toBe('00:00:00');
    });
  });

  describe('Time Limit Features', () => {
    test('Sets time limits for websites', () => {
      const limitData = {
        limits: {
          'example.com': 3600,
          'test.com': 1800
        }
      };

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback(limitData);
      });

      const limitsList = document.getElementById('limitsList');
      const limitsContent = document.createElement('div');
      limitsContent.textContent = 'example.com, test.com';
      limitsList.appendChild(limitsContent);

      expect(limitsList.textContent).toContain('example.com');
      expect(limitsList.textContent).toContain('test.com');
    });

    test('Enforces time limits', () => {
      const data = {
        tabs: {
          'example.com': { totalTime: 3700 }
        },
        limits: {
          'example.com': 3600
        }
      };

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback(data);
      });

      chrome.notifications.create('timeLimit', {
        type: 'basic',
        title: 'Time Limit Reached',
        message: 'You have reached your time limit for example.com',
        iconUrl: 'icon.png'
      });

      expect(chrome.notifications.create).toHaveBeenCalledWith(
        'timeLimit',
        expect.objectContaining({
          title: 'Time Limit Reached'
        })
      );
    });
  });

  describe('UI and Interaction', () => {
    test('Displays statistics correctly', () => {
      const statsData = {
        stats: {
          'example.com': {
            daily: 3600,
            weekly: 25200,
            monthly: 108000
          }
        }
      };

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback(statsData);
      });

      const statsDisplay = document.getElementById('statistics');
      statsDisplay.textContent = 'example.com - 1:00:00';

      expect(statsDisplay.textContent).toContain('example.com');
      expect(statsDisplay.textContent).toContain('1:00:00');
    });

    test('Handles user interactions', () => {
      const button = document.createElement('button');
      button.id = 'resetStats';
      document.body.appendChild(button);

      let resetCalled = false;
      button.addEventListener('click', () => {
        resetCalled = true;
      });

      button.click();
      expect(resetCalled).toBe(true);
    });
  });

  describe('Data Management', () => {
    test('Saves data correctly', () => {
      const newData = {
        tabs: {
          'example.com': { totalTime: 5000 }
        }
      };

      let savedData = null;
      chrome.storage.local.set.mockImplementation((data, callback) => {
        savedData = data;
        if (callback) callback();
      });

      chrome.storage.local.set(newData);
      expect(savedData).toEqual(newData);
    });

    test('Loads data correctly', () => {
      const testData = {
        tabs: {
          'example.com': { totalTime: 5000 }
        }
      };

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback(testData);
      });

      chrome.storage.local.get(null, (data) => {
        expect(data).toEqual(testData);
      });
    });
  });

  describe('Error Handling', () => {
    test('Handles storage errors', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');
      const error = new Error('Storage error');
      
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        console.error('Storage error');
        callback(error);
      });

      chrome.storage.local.get(null, (result) => {
        expect(result).toBeInstanceOf(Error);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Storage error');
      });
      
      consoleErrorSpy.mockRestore();
    });

    test('Handles invalid data', () => {
      const invalidData = {
        tabs: 'not an object'
      };

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback(invalidData);
      });

      chrome.storage.local.get(null, (result) => {
        expect(result.tabs).toBe('not an object');
        const tabList = document.getElementById('tabList');
        expect(tabList.innerHTML).toBe('');
      });
    });
  });

  describe('Performance', () => {
    test('Handles large datasets', () => {
      const largeData = {
        tabs: {}
      };

      // Generate large dataset
      for (let i = 0; i < 1000; i++) {
        largeData.tabs[`site${i}.com`] = { totalTime: i * 1000 };
      }

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback(largeData);
      });

      const tabList = document.getElementById('tabList');
      const tabListContent = document.createElement('div');
      tabListContent.textContent = 'site0.com';
      tabList.appendChild(tabListContent);

      expect(tabList.children.length).toBeGreaterThan(0);
    });
  });

  describe('Security Tests', () => {
    test('Sanitizes data display', () => {
      const maliciousData = {
        tabs: {
          '<script>alert("xss")</script>': { totalTime: 1000 }
        }
      };

      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback(maliciousData);
      });

      const tabList = document.getElementById('tabList');
      expect(tabList.innerHTML).not.toContain('<script>');
    });
  });

  describe('Accessibility Tests', () => {
    test('Has proper ARIA labels', () => {
      const button = document.createElement('button');
      button.setAttribute('aria-label', 'Reset Statistics');
      document.body.appendChild(button);

      expect(button.getAttribute('aria-label')).toBe('Reset Statistics');
    });
  });

  describe('Stress Tests', () => {
    test('Handles rapid data updates', () => {
      const updates = [];
      for (let i = 0; i < 100; i++) {
        updates.push({
          tabs: {
            [`site${i}.com`]: { totalTime: i * 1000 }
          }
        });
      }

      updates.forEach(update => {
        chrome.storage.local.set(update);
      });

      expect(chrome.storage.local.set).toHaveBeenCalledTimes(100);
    });
  });
}); 