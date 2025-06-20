// Store listeners
let storageListeners = [];
let messageListeners = [];

// Mock URL API
const setupURL = () => {
  global.URL = {
    createObjectURL: jest.fn().mockImplementation((blob) => `blob:${blob}`),
    revokeObjectURL: jest.fn()
  };
};

// Mock Chrome Storage API
const setupChrome = () => {
  global.chrome = {
    storage: {
      local: {
        get: jest.fn(),
        set: jest.fn(),
        clear: jest.fn(),
        remove: jest.fn()
      },
      sync: {
        get: jest.fn(),
        set: jest.fn(),
        clear: jest.fn(),
        remove: jest.fn()
      },
      onChanged: {
        addListener: jest.fn(listener => {
          storageListeners.push(listener);
          return true;
        }),
        removeListener: jest.fn(listener => {
          const index = storageListeners.indexOf(listener);
          if (index > -1) storageListeners.splice(index, 1);
        }),
        hasListeners: jest.fn(() => storageListeners.length > 0),
        getListeners: () => storageListeners,
        emit: (changes, area) => {
          storageListeners.forEach(listener => listener(changes, area));
        }
      }
    },
    tabs: {
      query: jest.fn(),
      get: jest.fn(),
      update: jest.fn()
    },
    runtime: {
      sendMessage: jest.fn(),
      onMessage: {
        addListener: jest.fn(listener => {
          messageListeners.push(listener);
          return true;
        }),
        removeListener: jest.fn(listener => {
          const index = messageListeners.indexOf(listener);
          if (index > -1) messageListeners.splice(index, 1);
        }),
        hasListeners: jest.fn(() => messageListeners.length > 0),
        getListeners: () => messageListeners
      },
      getURL: jest.fn()
    }
  };

  // Setup default chrome.storage.local.get behavior
  chrome.storage.local.get.mockImplementation((keys, callback) => {
    const result = {};
    if (typeof keys === 'string') {
      result[keys] = null;
    } else if (Array.isArray(keys)) {
      keys.forEach(key => result[key] = null);
    } else if (typeof keys === 'object' && keys !== null) {
      Object.keys(keys).forEach(key => result[key] = keys[key]);
    }
    if (callback && typeof callback === 'function') {
      callback(result);
    }
  });

  // Setup default chrome.storage.local.set behavior
  chrome.storage.local.set = jest.fn((items, callback) => {
    const changes = {};
    if (items && typeof items === 'object') {
      Object.keys(items).forEach(key => {
        changes[key] = { newValue: items[key] };
      });
      chrome.storage.onChanged.emit(changes, 'local');
    }
    if (callback && typeof callback === 'function') {
      callback();
    }
    return Promise.resolve();
  });

  // Setup default chrome.tabs.get behavior
  chrome.tabs.get.mockImplementation((tabId, callback) => {
    if (callback && typeof callback === 'function') {
      callback(undefined);
    }
  });

  // Setup default chrome.tabs.update behavior
  chrome.tabs.update.mockImplementation((tabId, updateProperties, callback) => {
    if (callback && typeof callback === 'function') {
      callback();
    }
  });

  // Setup default chrome.runtime.sendMessage behavior
  chrome.runtime.sendMessage = jest.fn((message, callback) => {
    messageListeners.forEach(listener => {
      const response = listener(message, { tab: { id: 1 } }, () => {});
      if (callback && typeof callback === 'function') {
        callback(response);
      }
    });
    return Promise.resolve();
  });

  // Setup default hasListeners behavior
  chrome.storage.onChanged.hasListeners.mockImplementation(() => storageListeners.length > 0);
  chrome.runtime.onMessage.hasListeners.mockImplementation(() => messageListeners.length > 0);
};

// Setup default chrome behavior
const setupChromeBehavior = () => {
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
    const changes = {};
    Object.keys(items).forEach(key => {
      changes[key] = { newValue: items[key] };
    });
    
    chrome.storage.onChanged.getListeners().forEach(listener => {
      listener(changes, 'local');
    });
    
    if (callback) callback();
  });

  // Setup default chrome.tabs.query behavior
  chrome.tabs.query = jest.fn((queryInfo, callback) => {
    const tabs = [{ id: 1, url: 'https://example.com' }];
    if (callback && typeof callback === 'function') {
      callback(tabs);
      return;
    }
    return Promise.resolve(tabs);
  });

  // Setup default chrome.runtime.sendMessage behavior
  chrome.runtime.sendMessage.mockImplementation((message, callback) => {
    chrome.runtime.onMessage.getListeners().forEach(listener => {
      listener(message, { tab: { id: 1 } }, callback || (() => {}));
    });
  });
};

// Reset test state
export function resetTestState() {
  // Reset all mocks
  jest.clearAllMocks();
  
  // Reset storage
  if (global.chrome && global.chrome.storage) {
    global.chrome.storage.local.clear();
    if (global.chrome.storage.sync) {
      global.chrome.storage.sync.clear();
    }
  }
  
  // Reset URL mocks
  setupURL();
  
  // Reset timers
  jest.clearAllTimers();
  
  // Reset DOM
  if (global.document) {
    global.document.body.innerHTML = '';
    // Remove all event listeners
    const oldElement = global.document.body.cloneNode(true);
    global.document.body.parentNode.replaceChild(oldElement, global.document.body);
  }
  
  // Reset state
  global.state = {};
  
  // Reset listeners
  storageListeners = [];
  messageListeners = [];
  if (global.chrome) {
    chrome.storage.onChanged.hasListeners.mockReturnValue(false);
    chrome.runtime.onMessage.hasListeners.mockReturnValue(false);
  }
}

// Setup initial state
setupURL();
setupChrome();

// Setup DOM elements
const setupDOM = () => {
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
};

// Helper functions
const setupHelpers = () => {
  global.flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));
};

// Export functions
module.exports = {
  setupChrome,
  setupURL,
  setupChromeBehavior: () => {},
  setupDOM,
  setupHelpers,
  resetTestState
}; 