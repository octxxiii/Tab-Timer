/**
 * Advertisement Integration Module
 * Handles integration with Google AdSense and other ad networks
 * 
 * NOTE: Replace placeholder ad code with actual ad network implementation
 */

/**
 * Initialize Google AdSense
 * @param {string} clientId - AdSense client ID
 * @param {string} slotId - Ad slot ID
 * @param {HTMLElement} container - Container element for ad
 */
export function initGoogleAdSense(clientId, slotId, container) {
  if (!container || !clientId || !slotId) {
    console.warn('AdSense initialization failed: missing parameters');
    return;
  }

  // Load AdSense script if not already loaded
  if (!window.adsbygoogle) {
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + clientId;
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }

  // Create ad element
  const adElement = document.createElement('ins');
  adElement.className = 'adsbygoogle';
  adElement.style.display = 'block';
  adElement.setAttribute('data-ad-client', clientId);
  adElement.setAttribute('data-ad-slot', slotId);
  adElement.setAttribute('data-ad-format', 'auto');
  adElement.setAttribute('data-full-width-responsive', 'true');

  container.appendChild(adElement);

  // Push ad to AdSense
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (e) {
    console.error('Error initializing AdSense:', e);
  }
}

/**
 * Create placeholder ad (for development/testing)
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Ad options
 */
export function createPlaceholderAd(container, options = {}) {
  const {
    message = '광고 영역',
    subMessage = '프리미엄으로 업그레이드하여 광고를 제거하세요',
    showUpgrade = true
  } = options;

  container.innerHTML = `
    <div class="ad-placeholder">
      <div style="text-align: center;">
        <p style="margin-bottom: 8px; font-weight: 500;">${message}</p>
        <small style="opacity: 0.7;">${subMessage}</small>
        ${showUpgrade ? `
          <button class="btn-primary" style="margin-top: 12px; padding: 8px 16px; font-size: 12px;" onclick="document.getElementById('upgradeBtn')?.click()">
            프리미엄으로 업그레이드
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Get ad configuration from settings
 * Priority: Chrome Storage > Config File > Default
 * @returns {Promise<Object>} Ad configuration
 */
export async function getAdConfiguration() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['adConfig', 'isPremium'], async (result) => {
      // Try to load from config file first (if available)
      let fileConfig = {};
      try {
        // Dynamic import to avoid errors if file doesn't exist
        const configModule = await import('../config/adConfig.js');
        fileConfig = configModule.adConfig || {};
      } catch (e) {
        // Config file doesn't exist or not available - use defaults
        console.log('Ad config file not found, using storage/default config');
      }

      const defaultConfig = {
        enabled: !result.isPremium,
        network: 'adsense', // 'adsense', 'custom', 'none'
        adsense: {
          clientId: '', // Set your AdSense client ID
          slotId: '', // Set your ad slot ID
        },
        custom: {
          url: '',
          script: ''
        }
      };

      // Merge: fileConfig (lowest priority) < defaultConfig < storage (highest priority)
      const mergedConfig = {
        ...defaultConfig,
        ...fileConfig,
        ...(result.adConfig || {}),
        // Merge nested objects
        adsense: {
          ...defaultConfig.adsense,
          ...(fileConfig.adsense || {}),
          ...(result.adConfig?.adsense || {})
        },
        custom: {
          ...defaultConfig.custom,
          ...(fileConfig.custom || {}),
          ...(result.adConfig?.custom || {})
        }
      };

      resolve(mergedConfig);
    });
  });
}

/**
 * Track ad events for analytics
 * @param {string} event - Event type ('impression', 'click', 'close')
 * @param {string} adType - Ad type identifier
 */
export function trackAdEvent(event, adType = 'banner') {
  chrome.storage.local.get(['adStats'], (result) => {
    const adStats = result.adStats || {
      impressions: {},
      clicks: {},
      closes: {},
      lastUpdated: Date.now()
    };

    if (!adStats[event + 's']) {
      adStats[event + 's'] = {};
    }

    adStats[event + 's'][adType] = (adStats[event + 's'][adType] || 0) + 1;
    adStats.lastUpdated = Date.now();

    chrome.storage.local.set({ adStats });
  });
}

