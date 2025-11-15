/**
 * Date utility functions for Tab Timer
 */

/**
 * Get date string in YYYY-MM-DD format
 * @param {Date} date - Date object (defaults to now)
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function getYYYYMMDD(date = new Date()) {
  return date.toISOString().split('T')[0];
}

/**
 * Get date key (alias for getYYYYMMDD)
 * @param {Date} date - Date object (defaults to now)
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function getDateKey(date = new Date()) {
  return date.toISOString().split('T')[0];
}

/**
 * Get week key in YYYY-W## format
 * @param {Date} date - Date object (defaults to now)
 * @returns {string} Week key string
 */
export function getWeekKey(date = new Date()) {
  const year = date.getFullYear();
  const firstDay = new Date(year, 0, 1);
  const dayOfYear = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.floor(dayOfYear / 7) + 1;
  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Get week number from date
 * @param {Date} date - Date object
 * @returns {string} Week number string
 */
export function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-W${weekNo}`;
}

