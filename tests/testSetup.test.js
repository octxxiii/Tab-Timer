const {
  setupChrome,
  setupURL,
  setupChromeBehavior,
  setupDOM,
  setupHelpers,
  resetTestState
} = require('./testSetup');

describe('Test Setup', () => {
  beforeEach(() => {
    setupChrome();
    setupChromeBehavior();
    setupDOM();
    setupHelpers();
  });

  afterEach(() => {
    resetTestState();
    document.body.innerHTML = '';
  });

  describe('Chrome Storage API', () => {
    test('handles string keys in storage.get', () => {
      chrome.storage.local.get('testKey', (result) => {
        expect(result).toEqual({ testKey: null });
      });
    });

    test('handles array keys in storage.get', () => {
      chrome.storage.local.get(['key1', 'key2'], (result) => {
        expect(result).toEqual({ key1: null, key2: null });
      });
    });

    test('handles object keys in storage.get', () => {
      const defaultValues = { key1: 'value1', key2: 'value2' };
      chrome.storage.local.get(defaultValues, (result) => {
        expect(result).toEqual(defaultValues);
      });
    });

    test('handles storage.set with callbacks', (done) => {
      const items = { key: 'value' };
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        if (Array.isArray(keys) && keys.includes('key')) {
          callback({ key: 'value' });
        } else {
          callback({});
        }
      });

      chrome.storage.local.set(items, () => {
        chrome.storage.local.get(['key'], (result) => {
          expect(result.key).toBe('value');
          done();
        });
      });
    });

    test('handles storage change events', () => {
      const listener = jest.fn();
      chrome.storage.onChanged.addListener(listener);
      
      const items = { key: 'value' };
      chrome.storage.local.set(items);
      
      expect(listener).toHaveBeenCalledWith(
        { key: { newValue: 'value' } },
        'local'
      );
    });

    test('removes storage change listeners', () => {
      const listener = jest.fn();
      chrome.storage.onChanged.addListener(listener);
      chrome.storage.onChanged.removeListener(listener);
      
      chrome.storage.local.set({ key: 'value' });
      expect(listener).not.toHaveBeenCalled();
    });

    test('checks for active listeners', () => {
      const listener = jest.fn();
      expect(chrome.storage.onChanged.hasListeners()).toBeFalsy();
      
      chrome.storage.onChanged.addListener(listener);
      expect(chrome.storage.onChanged.hasListeners()).toBeTruthy();
    });

    test('handles storage.clear', () => {
      chrome.storage.local.clear();
      expect(chrome.storage.local.clear).toHaveBeenCalled();
    });

    test('handles storage.remove', () => {
      chrome.storage.local.remove('key');
      expect(chrome.storage.local.remove).toHaveBeenCalledWith('key');
    });

    test('handles storage.set without callback', (done) => {
      const items = { key: 'value' };
      chrome.storage.local.set(items, () => {
        expect(chrome.storage.local.set).toHaveBeenCalledWith(items, expect.any(Function));
        done();
      });
    });

    test('handles storage.get with null callback', () => {
      chrome.storage.local.get('key', null);
      expect(chrome.storage.local.get).toHaveBeenCalledWith('key', null);
    });

    test('handles storage.onChanged.emit with no listeners', () => {
      const changes = { key: { newValue: 'value' } };
      chrome.storage.onChanged.emit(changes, 'local');
      // Should not throw error when no listeners
    });
  });

  describe('Chrome Tabs API', () => {
    beforeAll(() => {
      jest.setTimeout(60000);  // Set timeout for all tests in this describe block
    });

    test('handles tabs.query', (done) => {
      const mockTabs = [{ id: 1, url: 'https://example.com' }];
      chrome.tabs.query.mockImplementation((query, callback) => {
        setTimeout(() => {
          callback(mockTabs);
        }, 100);
      });

      chrome.tabs.query({}, (tabs) => {
        expect(tabs).toEqual(mockTabs);
        done();
      });
    });

    test('handles tabs.get and update', () => {
      expect(chrome.tabs.get).toBeDefined();
      expect(chrome.tabs.update).toBeDefined();
    });

    test('handles tabs.get with callback', (done) => {
      chrome.tabs.get(1, (tab) => {
        expect(tab).toBeUndefined();
        done();
      });
    });

    test('handles tabs.update with callback', (done) => {
      chrome.tabs.update(1, { url: 'https://example.com' }, () => {
        done();
      });
    });
  });

  describe('Chrome Runtime API', () => {
    beforeAll(() => {
      jest.setTimeout(60000);  // Set timeout for all tests in this describe block
    });

    test('handles message sending and receiving', (done) => {
      const message = { type: 'TEST' };
      const listener = jest.fn((msg, sender, sendResponse) => {
        expect(msg).toEqual(message);
        expect(sender).toEqual({ tab: { id: 1 } });
        expect(typeof sendResponse).toBe('function');
        done();
      });
      
      chrome.runtime.onMessage.addListener(listener);
      chrome.runtime.sendMessage(message);
    }, 1000);

    test('removes message listeners', () => {
      const listener = jest.fn();
      chrome.runtime.onMessage.addListener(listener);
      chrome.runtime.onMessage.removeListener(listener);
      
      chrome.runtime.sendMessage({ type: 'TEST' });
      expect(listener).not.toHaveBeenCalled();
    });

    test('handles runtime.getURL', () => {
      chrome.runtime.getURL('path/to/resource');
      expect(chrome.runtime.getURL).toHaveBeenCalledWith('path/to/resource');
    });

    test('handles runtime.sendMessage without callback', (done) => {
      const message = { type: 'TEST' };
      const mockResponse = { success: true };

      chrome.runtime.sendMessage.mockImplementation((msg, callback) => {
        setTimeout(() => {
          if (callback) callback(mockResponse);
        }, 100);
      });

      chrome.runtime.sendMessage(message, (response) => {
        expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(message, expect.any(Function));
        expect(response).toEqual(mockResponse);
        done();
      });
    });

    test('handles runtime.onMessage.hasListeners', () => {
      expect(chrome.runtime.onMessage.hasListeners()).toBeFalsy();
      const listener = jest.fn();
      chrome.runtime.onMessage.addListener(listener);
      expect(chrome.runtime.onMessage.hasListeners()).toBeTruthy();
    });
  });

  describe('URL API', () => {
    test('mocks URL API methods', () => {
      setupURL();
      expect(URL.createObjectURL).toBeDefined();
      expect(URL.revokeObjectURL).toBeDefined();
    });
  });

  describe('DOM Setup', () => {
    test('creates all required DOM elements', () => {
      expect(document.getElementById('tabList')).toBeTruthy();
      expect(document.getElementById('totalTime')).toBeTruthy();
      expect(document.getElementById('mostUsed')).toBeTruthy();
      expect(document.getElementById('upgradeBtn')).toBeTruthy();
      expect(document.getElementById('showMore')).toBeTruthy();
      expect(document.getElementById('limitType')).toBeTruthy();
      expect(document.getElementById('siteUrl')).toBeTruthy();
      expect(document.getElementById('timeLimitMinutes')).toBeTruthy();
      expect(document.getElementById('setTimeLimit')).toBeTruthy();
      expect(document.getElementById('currentLimit')).toBeTruthy();
      expect(document.getElementById('limitsList')).toBeTruthy();
    });

    test('sets correct attributes on elements', () => {
      const siteUrl = document.getElementById('siteUrl');
      expect(siteUrl.type).toBe('text');
      expect(siteUrl.className).toBe('hidden');

      const timeLimitMinutes = document.getElementById('timeLimitMinutes');
      expect(timeLimitMinutes.type).toBe('number');
    });
  });

  describe('Helper Functions', () => {
    test('sets up flush promises helper', async () => {
      expect(global.flushPromises).toBeDefined();
      const result = await global.flushPromises();
      expect(result).toBeUndefined();
    });
  });

  describe('Error Cases', () => {
    test('handles storage.get with invalid keys', () => {
      chrome.storage.local.get(123, (result) => {
        expect(result).toEqual({});
      });
    });

    test('handles storage.set with invalid items', () => {
      expect(() => {
        chrome.storage.local.set(null);
      }).not.toThrow();
    });

    test('handles runtime.sendMessage with invalid message', () => {
      expect(() => {
        chrome.runtime.sendMessage(null);
      }).not.toThrow();
    });
  });

  describe('Reset Test State', () => {
    test('resets all mocks and state', () => {
      // Set up some state
      const listener = jest.fn();
      chrome.storage.onChanged.addListener(listener);
      chrome.runtime.onMessage.addListener(listener);
      
      // Perform some operations
      chrome.storage.local.set({ key: 'value' });
      chrome.runtime.sendMessage({ type: 'TEST' });
      
      // Reset state
      resetTestState();
      
      // Verify mocks are cleared
      expect(chrome.storage.local.set).not.toHaveBeenCalled();
      expect(chrome.runtime.sendMessage).not.toHaveBeenCalled();
      
      // Verify listeners are removed
      expect(chrome.storage.onChanged.hasListeners()).toBeFalsy();
      expect(chrome.runtime.onMessage.hasListeners()).toBeFalsy();
    });
  });
}); 