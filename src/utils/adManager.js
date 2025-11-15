/**
 * Advertisement Manager for Tab Timer
 * Handles ad display, tracking, and premium ad removal
 */

/**
 * Check if ads should be shown
 * @returns {Promise<boolean>} True if ads should be displayed
 */
export async function shouldShowAds() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['isPremium', 'adSettings'], (result) => {
      // Premium users don't see ads
      if (result.isPremium) {
        resolve(false);
        return;
      }
      
      // Check user ad settings (default: true)
      const adSettings = result.adSettings || { enabled: true };
      resolve(adSettings.enabled !== false);
    });
  });
}

/**
 * Get ad configuration
 * @returns {Object} Ad configuration object
 */
export function getAdConfig() {
  return {
    // Google AdSense (example - replace with actual ad unit IDs)
    adSense: {
      enabled: true,
      clientId: 'ca-pub-XXXXXXXXXX', // Replace with your AdSense client ID
      slotId: '1234567890', // Replace with your ad slot ID
    },
    // Alternative: Custom ad network
    custom: {
      enabled: false,
      url: 'https://example.com/ads',
    },
    // Ad display settings
    display: {
      position: 'bottom', // 'top', 'bottom', 'sidebar'
      frequency: 'always', // 'always', 'once-per-session', 'once-per-day'
      size: 'responsive', // 'responsive', 'fixed'
    }
  };
}

/**
 * Create ad HTML element
 * @param {string} type - Ad type ('banner', 'sidebar', 'inline')
 * @returns {string} HTML string for ad
 */
export function createAdHTML(type = 'banner') {
  const adConfig = getAdConfig();
  
  // For now, use a placeholder ad that can be replaced with actual ad code
  // In production, replace with actual Google AdSense or other ad network code
  
  if (type === 'banner') {
    return `
      <div class="ad-container ad-banner" data-ad-type="${type}">
        <div class="ad-label">광고</div>
        <div class="ad-content">
          <!-- Google AdSense Banner Ad -->
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-client="${adConfig.adSense.clientId}"
               data-ad-slot="${adConfig.adSense.slotId}"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          <script>
            (adsbygoogle = window.adsbygoogle || []).push({});
          </script>
        </div>
        <button class="ad-close" title="광고 닫기" aria-label="광고 닫기">
          <span class="material-icons-round">close</span>
        </button>
      </div>
    `;
  }
  
  if (type === 'inline') {
    return `
      <div class="ad-container ad-inline" data-ad-type="${type}">
        <div class="ad-label">광고</div>
        <div class="ad-content">
          <!-- Google AdSense Inline Ad -->
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-client="${adConfig.adSense.clientId}"
               data-ad-slot="${adConfig.adSense.slotId}"
               data-ad-format="rectangle"
               data-full-width-responsive="true"></ins>
          <script>
            (adsbygoogle = window.adsbygoogle || []).push({});
          </script>
        </div>
      </div>
    `;
  }
  
  return '';
}

/**
 * Track ad impression
 * @param {string} adType - Type of ad
 */
export function trackAdImpression(adType) {
  // Track ad impressions for analytics
  chrome.storage.local.get(['adStats'], (result) => {
    const adStats = result.adStats || { impressions: {}, clicks: {} };
    adStats.impressions[adType] = (adStats.impressions[adType] || 0) + 1;
    chrome.storage.local.set({ adStats });
  });
}

/**
 * Track ad click
 * @param {string} adType - Type of ad
 */
export function trackAdClick(adType) {
  chrome.storage.local.get(['adStats'], (result) => {
    const adStats = result.adStats || { impressions: {}, clicks: {} };
    adStats.clicks[adType] = (adStats.clicks[adType] || 0) + 1;
    chrome.storage.local.set({ adStats });
  });
}

/**
 * Initialize ads in a container
 * @param {HTMLElement} container - Container element
 * @param {string} adType - Type of ad to display
 */
export async function initializeAds(container, adType = 'banner') {
  const showAds = await shouldShowAds();
  
  if (!showAds || !container) {
    return;
  }
  
  const adHTML = createAdHTML(adType);
  container.innerHTML = adHTML;
  
  // Track impression
  trackAdImpression(adType);
  
  // Setup close button
  const closeBtn = container.querySelector('.ad-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      container.style.display = 'none';
      // Save user preference to hide ads for this session
      chrome.storage.local.set({ 
        adSettings: { 
          enabled: true, 
          hiddenForSession: true 
        } 
      });
    });
  }
  
  // Track clicks on ad content
  const adContent = container.querySelector('.ad-content');
  if (adContent) {
    adContent.addEventListener('click', () => {
      trackAdClick(adType);
    });
  }
}

