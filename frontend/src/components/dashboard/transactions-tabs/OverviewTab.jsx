import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

// Charts
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';

// Constants
const COLORS = ['#6993FF', '#69E7FF', '#86D9B9', '#B5A8FF', '#FFC677', '#FF9C9C', '#A3A1FB', '#76EEF1'];

const OverviewTab = ({ transactions, formatCurrency }) => {
  // Process transaction data for charts
  const processedTransactionData = useMemo(() => {
    if (!transactions.length) return { monthlyData: [], categoryData: [], positiveCategoryData: [], summary: {} };

    // Group transactions by month
    const monthlyData = {};
    const categoryTotals = {};
    const positiveCategoryTotals = {};
    let totalInflow = 0;
    let totalOutflow = 0;
    let largestTransaction = { amount: 0 };
    
    transactions.forEach(transaction => {
      // Process for monthly chart
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
        totalInflow -= transaction.amount;
      } else {
        monthlyData[monthYear].outflow -= -transaction.amount;
        totalOutflow -= -transaction.amount;
      }
      // Process for category chart
      const category = transaction.category || 'Uncategorized';
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      if (!positiveCategoryTotals[category]) {
        positiveCategoryTotals[category] = 0;
      }
      if (transaction.amount > 0) {
        positiveCategoryTotals[category] -= -transaction.amount;
      }
      categoryTotals[category] -= -transaction.amount;
      // console.log('Category totals:', categoryTotals);

      // Track largest transaction
      if (Math.abs(transaction.amount) > Math.abs(largestTransaction.amount)) {
        largestTransaction = transaction;
      }
    });
    
    // Convert to array format for charts
    const monthlyDataArray = Object.values(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = a.name.split('/');
      const [bMonth, bYear] = b.name.split('/');
      return new Date(aYear, aMonth - 1) - new Date(bYear, bMonth - 1);
    });
    
    const categoryDataArray = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const positiveCategoryDataArray = Object.entries(positiveCategoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    return {
      monthlyData: monthlyDataArray,
      categoryData: categoryDataArray,
      positiveCategoryData: positiveCategoryDataArray,
      summary: {
        totalTransactions: transactions.length,
        totalInflow,
        totalOutflow,
        netCashFlow: totalInflow - totalOutflow,
        largestTransaction,
        averageTransaction: (totalInflow + totalOutflow) / transactions.length
      }
    };
  }, [transactions]);

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 3,
              border: '1px solid rgba(0, 0, 0, 0.08)'
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Summary Statistics
            </Typography>
            <List disablePadding>
              <ListItem
                sx={{
                  px: 0,
                  py: 2,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
                }}
              >
                <ListItemText
                  primary="Total Transactions"
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: 'text.secondary'
                  }}
                />
                <Typography variant="body1" fontWeight={500}>
                  {processedTransactionData.summary.totalTransactions || 0}
                </Typography>
              </ListItem>
              <ListItem
                sx={{
                  px: 0,
                  py: 2,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
                }}
              >
                <ListItemText
                  primary="Total Income"
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: 'text.secondary'
                  }}
                />
                <Typography
                  variant="body1"
                  fontWeight={500}
                  sx={{
                    color: '#4E8CB8',
                    fontFamily: '"Roboto Mono", monospace'
                  }}
                >
                  {formatCurrency(processedTransactionData.summary.totalInflow || 0)}
                </Typography>
              </ListItem>
              <ListItem
                sx={{
                  px: 0,
                  py: 2,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
                }}
              >
                <ListItemText
                  primary="Total Spending"
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: 'text.secondary'
                  }}
                />
                <Typography
                  variant="body1"
                  fontWeight={500}
                  sx={{
                    color: '#B84E6C',
                    fontFamily: '"Roboto Mono", monospace'
                  }}
                >
                  {formatCurrency(processedTransactionData.summary.totalOutflow || 0)}
                </Typography>
              </ListItem>
              <ListItem
                sx={{
                  px: 0,
                  py: 2,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
                }}
              >
                <ListItemText
                  primary="Net Cash Flow"
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: 'text.secondary'
                  }}
                />
                <Typography
                  variant="body1"
                  fontWeight={500}
                  sx={{
                    color: (processedTransactionData.summary.netCashFlow || 0) >= 0 ? '#4E8CB8' : '#B84E6C',
                    fontFamily: '"Roboto Mono", monospace'
                  }}
                >
                  {formatCurrency(processedTransactionData.summary.netCashFlow || 0)}
                </Typography>
              </ListItem>
              <ListItem
                sx={{
                  px: 0,
                  py: 2
                }}
              >
                <ListItemText
                  primary="Average Transaction"
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: 'text.secondary'
                  }}
                />
                <Typography
                  variant="body1"
                  fontWeight={500}
                  sx={{
                    fontFamily: '"Roboto Mono", monospace'
                  }}
                >
                  {formatCurrency(processedTransactionData.summary.averageTransaction || 0)}
                </Typography>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: 3,
              border: '1px solid rgba(0, 0, 0, 0.08)'
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Top Spending Categories
            </Typography>
            {processedTransactionData.positiveCategoryData.length > 0 ? (
              <Box sx={{ height: 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={processedTransactionData.positiveCategoryData.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={90}
                      innerRadius={55}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                      label={({ name, percent }) => 
                        `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {processedTransactionData.positiveCategoryData.slice(0, 5).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          strokeWidth={1}
                          stroke="#ffffff" 
                        />
                      ))}
                    </Pie>
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center"
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                    <RechartsTooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ 
                        borderRadius: 12,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        border: 'none'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography variant="body2" color="text.secondary">
                  No category data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid rgba(0, 0, 0, 0.08)'
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Monthly Cash Flow
            </Typography>
            <Box sx={{ height: 350, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={processedTransactionData.monthlyData}
                  margin={{
                    top: 5,
                    right: 20,
                    left: 20,
                    bottom: 20,
                  }}
                  barSize={20}
                  barGap={8}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    scale="point" 
                    padding={{ left: 20, right: 20 }} 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value}`} 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <RechartsTooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ 
                      borderRadius: 12,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      border: 'none'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px' }}
                    iconType="circle"
                  />
                  <Bar 
                    name="Income" 
                    dataKey="inflow" 
                    fill="#6993FF" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    name="Spending" 
                    dataKey="outflow" 
                    fill="#69E7FF" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OverviewTab;