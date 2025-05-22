/**
 * A utility function that combines class names together
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Format a date to a string
 * @param {Date} date - The date to format
 * @param {string} formatString - The format string
 * @returns {string} - The formatted date
 */
export function formatDate(date, formatString = "PP") {
  if (!date) return "";
  
  try {
    // This is a simple implementation, you might want to use date-fns format in your actual code
    return date.toLocaleDateString();
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

/**
 * Truncate a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} length - The length to truncate to
 * @returns {string} - The truncated string
 */
export function truncate(str, length) {
  if (!str) return "";
  return str.length > length ? `${str.substring(0, length)}...` : str;
}
