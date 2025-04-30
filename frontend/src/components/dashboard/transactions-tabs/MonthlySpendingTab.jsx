import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography
} from '@mui/material';

// Charts
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const MonthlySpendingTab = ({ transactions, formatCurrency }) => {
  // Process transaction data for monthly chart
  const monthlyData = useMemo(() => {
    if (!transactions.length) return [];

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
        monthlyData[monthYear].outflow -= -transaction.amount;
      }
    });
    
    // Convert to array format for charts
    return Object.values(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = a.name.split('/');
      const [bMonth, bYear] = b.name.split('/');
      return new Date(aYear, aMonth - 1) - new Date(bYear, bMonth - 1);
    });
  }, [transactions]);

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid rgba(0, 0, 0, 0.08)'
        }}
      >
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Monthly Spending Trend
        </Typography>
        <Box sx={{ height: 400, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 30,
              }}
            >
              <defs>
                <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6993FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6993FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#69E7FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#69E7FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                padding={{ left: 10, right: 10 }}
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
                iconType="circle"
                wrapperStyle={{ paddingTop: '10px' }}
              />
              <Area
                type="monotone"
                name="Income"
                dataKey="inflow"
                stroke="#6993FF"
                fillOpacity={1}
                fill="url(#colorInflow)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                name="Spending"
                dataKey="outflow"
                stroke="#69E7FF"
                fillOpacity={1}
                fill="url(#colorOutflow)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default MonthlySpendingTab;