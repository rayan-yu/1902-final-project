import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip
} from '@mui/material';

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';

import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

// Sample data for the chart when no transactions are available
const sampleData = [
  { name: '1/2024', inflow: 3500, outflow: 2800 },
  { name: '2/2024', inflow: 3800, outflow: 3000 },
  { name: '3/2024', inflow: 4200, outflow: 3200 },
  { name: '4/2024', inflow: 3900, outflow: 3100 },
  { name: '5/2024', inflow: 4500, outflow: 3300 },
];

const BalanceOverview = ({ totalBalance, accounts, formatCurrency, transactionData }) => {
  // Process transaction data if available
  const processMonthlyData = () => {
    if (!transactionData || transactionData.length === 0) {
      return sampleData;
    }

    // Group transactions by month
    const monthlyData = {};
    
    transactionData.forEach(transaction => {
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
      } else {
        monthlyData[monthYear].outflow += transaction.amount;
      }
    });

    // Convert to array format for charts
    return Object.values(monthlyData).sort((a, b) => {
      const [aMonth, aYear] = a.name.split('/');
      const [bMonth, bYear] = b.name.split('/');
      return new Date(aYear, aMonth - 1) - new Date(bYear, bMonth - 1);
    });
  };

  const chartData = processMonthlyData();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid rgba(105, 147, 255, 0.1)',
        background: 'linear-gradient(120deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #6993FF, #69E7FF)'
        }
      }}
    >
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Balance
              </Typography>
              <Typography 
                variant="h4"
                sx={{ 
                  fontWeight: 600,
                  mb: 1,
                  color: totalBalance >= 0 ? '#4E8CB8' : '#B84E6C',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                {formatCurrency(totalBalance)}
                <Chip
                  size="small"
                  icon={totalBalance >= 0 ? <ArrowUpwardRoundedIcon fontSize="small" /> : <ArrowDownwardRoundedIcon fontSize="small" />}
                  label={totalBalance >= 0 ? "+2.4%" : "-1.2%"}
                  sx={{
                    backgroundColor: totalBalance >= 0 ? 'rgba(78, 140, 184, 0.1)' : 'rgba(184, 78, 108, 0.1)',
                    color: totalBalance >= 0 ? '#4E8CB8' : '#B84E6C',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 24,
                    borderRadius: 1.5
                  }}
                />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                From {accounts.length} linked accounts
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6993FF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6993FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#69E7FF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#69E7FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis 
                    hide 
                    domain={['dataMin - 500', 'dataMax + 500']} 
                  />
                  <RechartsTooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => `Month: ${label}`}
                    contentStyle={{ 
                      borderRadius: 12,
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      border: 'none'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="inflow" 
                    name="Income"
                    stackId="1"
                    stroke="#6993FF" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorInflow)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="outflow" 
                    name="Spending"
                    stackId="2"
                    stroke="#69E7FF" 
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOutflow)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default BalanceOverview;