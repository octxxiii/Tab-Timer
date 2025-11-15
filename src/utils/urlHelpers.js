/**
 * URL utility functions for Tab Timer
 */

/**
 * Extract root domain from URL
 * @param {string} url - Full URL string
 * @returns {string|null} Root domain or null if invalid
 */
export function getRootDomain(url) {
  try {
    if (!url || !url.startsWith('http')) {
      return null;
    }
    const urlObj = new URL(url);
    
    // Chrome internal pages
    if (urlObj.protocol === 'chrome:' ||
        urlObj.protocol === 'chrome-extension:' ||
        urlObj.protocol === 'edge:' ||
        urlObj.protocol === 'about:' ||
        urlObj.hostname === 'newtab') {
      return null;
    }

    let domain = urlObj.hostname;
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    return domain;
  } catch (e) {
    console.error('Error parsing URL:', url, e);
    return null;
  }
}

/**
 * Check if domain should be tracked
 * @param {string} domain - Domain string
 * @returns {boolean} True if trackable
 */
export function isTrackableDomain(domain) {
  return domain && !domain.startsWith('chrome.');
}

