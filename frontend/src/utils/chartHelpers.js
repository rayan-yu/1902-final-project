/**
 * Helper functions for chart data processing
 */

// Chart color palette
export const CHART_COLORS = [
    '#6993FF', '#69E7FF', '#86D9B9', '#B5A8FF', 
    '#FFC677', '#FF9C9C', '#A3A1FB', '#76EEF1'
  ];
  
  /**
   * Process transaction data for monthly chart visualization
   * @param {Array} transactions - Array of transaction objects
   * @returns {Array} Processed monthly data for charts
   */
  export const processMonthlyData = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return [];
    }
  
    // Group transactions by month
    const monthlyData = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { 
          name: monthYear, 
          inflow: 0, 
          outflow: 0 
        };
      }
      
      if (transaction.amount < 0) {
        monthlyData[monthYear].inflow -= transaction.amount; // Make inflow positive
      } else {
        monthlyData[monthYear].outflow += transaction.amount;
      }
    });
    
    // Convert to array format for charts and sort chronologically
    return Object.values(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = a.name.split('/');
      const [bMonth, bYear] = b.name.split('/');
      return new Date(aYear, aMonth - 1) - new Date(bYear, bMonth - 1);
    });
  };
  
  /**
   * Process transaction data for category chart visualization
   * @param {Array} transactions - Array of transaction objects
   * @returns {Array} Processed category data for charts
   */
  export const processCategoryData = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return [];
    }
  
    // Group transactions by category
    const categoryTotals = {};
    
    transactions.forEach(transaction => {
      const category = transaction.category?.[0] || 'Uncategorized';
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += Math.abs(transaction.amount);
    });
    
    // Convert to array format for charts
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };
  
  /**
   * Calculate transaction summary statistics
   * @param {Array} transactions - Array of transaction objects
   * @returns {Object} Summary statistics
   */
  export const calculateTransactionSummary = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return {
        totalTransactions: 0,
        totalInflow: 0,
        totalOutflow: 0,
        netCashFlow: 0,
        largestTransaction: null,
        averageTransaction: 0
      };
    }
  
    let totalInflow = 0;
    let totalOutflow = 0;
    let largestTransaction = { amount: 0 };
    
    transactions.forEach(transaction => {
      if (transaction.amount < 0) {
        totalInflow -= transaction.amount; // Make inflow positive
      } else {
        totalOutflow += transaction.amount;
      }
      
      // Track largest transaction
      if (Math.abs(transaction.amount) > Math.abs(largestTransaction.amount)) {
        largestTransaction = transaction;
      }
    });
    
    return {
      totalTransactions: transactions.length,
      totalInflow,
      totalOutflow,
      netCashFlow: totalInflow - totalOutflow,
      largestTransaction,
      averageTransaction: transactions.length > 0 ? (totalInflow + totalOutflow) / transactions.length : 0
    };
  };