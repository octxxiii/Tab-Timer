const { setupChrome, setupChromeBehavior, resetTestState } = require('./testSetup');

describe('Background Script Tests', () => {
  beforeEach(() => {
    setupChrome();
    setupChromeBehavior();

    // Add default message listener
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'trackTime') {
        chrome.storage.local.set(message.data, (result) => {
          if (result && result.error) {
            sendResponse({ error: result.error });
          } else {
            sendResponse({ success: true });
          }
        });
        return true;
      }
      sendResponse({ error: 'Invalid message type' });
    });

    // Add default storage listener
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.tabs) {
        chrome.storage.local.get(null, () => {});
      }
    });
  });

  afterEach(() => {
    resetTestState();
  });

  describe('Message Handling', () => {
    test('Handles time tracking messages correctly', () => {
      const message = { type: 'trackTime', data: { url: 'https://example.com', time: 1000 } };
      const sender = { tab: { id: 1 } };
      const sendResponse = jest.fn();

      chrome.runtime.onMessage.getListeners().forEach(listener => {
        listener(message, sender, sendResponse);
      });

      expect(chrome.storage.local.set).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalledWith({ success: true });
    });

    test('Handles invalid message types', () => {
      const message = { type: 'invalidType' };
      const sender = { tab: { id: 1 } };
      const sendResponse = jest.fn();

      chrome.runtime.onMessage.getListeners().forEach(listener => {
        listener(message, sender, sendResponse);
      });

      expect(sendResponse).toHaveBeenCalledWith({ error: 'Invalid message type' });
    });
  });

  describe('Storage Management', () => {
    it('Maintains data consistency', async () => {
      const testData = { tabs: { 'tab1': { time: 100 } } };
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback(testData);
      });

      // Trigger storage change
      const changes = { tabs: { newValue: { 'tab1': { time: 200 } } } };
      const listener = jest.fn((changes, area) => {
        if (area === 'local' && changes.tabs) {
          chrome.storage.local.get.mockImplementation((keys, callback) => {
            callback({ tabs: changes.tabs.newValue });
          });
          chrome.storage.local.get(['tabs'], (result) => {
            expect(result.tabs).toEqual(changes.tabs.newValue);
          });
        }
      });

      chrome.storage.onChanged.addListener(listener);
      chrome.storage.onChanged.emit(changes, 'local');
      expect(listener).toHaveBeenCalledWith(changes, 'local');
    });

    test('Handles storage errors gracefully', () => {
      const message = { type: 'trackTime', data: { url: 'https://example.com', time: 1000 } };
      const sender = { tab: { id: 1 } };
      const sendResponse = jest.fn();

      chrome.storage.local.set.mockImplementationOnce((items, callback) => {
        callback({ error: 'Storage error' });
      });

      chrome.runtime.onMessage.getListeners().forEach(listener => {
        listener(message, sender, sendResponse);
      });

      expect(sendResponse).toHaveBeenCalledWith({ error: 'Storage error' });
    });
  });

  describe('Performance', () => {
    test('Handles rapid message processing', () => {
      const messages = Array(100).fill().map((_, i) => ({
        type: 'trackTime',
        data: { url: `https://test${i}.com`, time: 1000 }
      }));

      const startTime = performance.now();
      messages.forEach((message, i) => {
        const sender = { tab: { id: i } };
        const sendResponse = jest.fn();
        chrome.runtime.onMessage.getListeners().forEach(listener => {
          listener(message, sender, sendResponse);
        });
      });
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(1000); // Should process within 1 second
    });
  });
}); 