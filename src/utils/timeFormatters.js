/**
 * Time formatting utility functions
 */

/**
 * Format minutes to human-readable string
 * @param {number} minutes - Time in minutes
 * @returns {string} Formatted time string
 */
export function formatTimeMinutes(minutes) {
  if (!minutes || minutes < 0) return '0분';
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  if (hours > 0) {
    return `${hours}시간 ${mins}분`;
  }
  return `${mins}분`;
}

/**
 * Format minutes to short string (e.g., "2h 30m")
 * @param {number} minutes - Time in minutes
 * @returns {string} Short formatted time string
 */
export function formatTimeShort(minutes) {
  if (!minutes || minutes < 0) return '0분';
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}분`;
}

/**
 * Format milliseconds to human-readable string
 * @param {number} ms - Time in milliseconds
 * @returns {string} Formatted time string
 */
export function formatTimeMs(ms) {
  if (!ms || ms < 0) return '0초';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}시간 ${minutes % 60}분`;
  } else if (minutes > 0) {
    return `${minutes}분`;
  } else {
    return `${seconds}초`;
  }
}

