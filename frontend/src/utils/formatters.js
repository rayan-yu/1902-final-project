/**
 * Utility functions for formatting data in the application
 */

/**
 * Format a number as USD currency
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  /**
   * Format a date string to a readable format
   * @param {string} dateString - The date string to format
   * @returns {string} Formatted date string
   */
  export const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  /**
   * Generate a unique gradient based on a string (e.g., account name)
   * @param {string} name - The string to base the gradient on
   * @returns {Object} An object containing background, border, and icon color values
   */
  export const getGradientByName = (name) => {
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const hue = hash % 360;
    
    return {
      background: `linear-gradient(135deg, 
        hsla(${hue}, 30%, 95%, 0.8), 
        hsla(${(hue + 30) % 360}, 25%, 90%, 0.8)
      )`,
      border: `linear-gradient(135deg, 
        hsla(${hue}, 60%, 75%, 1), 
        hsla(${(hue + 40) % 360}, 70%, 65%, 1)
      )`,
      icon: `hsla(${hue}, 60%, 55%, 1)`
    };
  };