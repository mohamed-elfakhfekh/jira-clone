/**
 * Formats hours into workdays (8 hours per day), hours, and minutes
 * @param {number} hours - Time in hours (can be decimal)
 * @returns {string} Formatted time string
 */
export function formatTimeSpent(hours) {
  if (!hours) return '0 minutes';

  const HOURS_PER_DAY = 8;
  const totalMinutes = Math.round(hours * 60);
  
  const days = Math.floor(totalMinutes / (HOURS_PER_DAY * 60));
  const remainingMinutes = totalMinutes % (HOURS_PER_DAY * 60);
  const remainingHours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;

  const parts = [];
  if (days > 0) {
    parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  }
  if (remainingHours > 0) {
    parts.push(`${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  }

  return parts.join(', ') || '0 minutes';
}
