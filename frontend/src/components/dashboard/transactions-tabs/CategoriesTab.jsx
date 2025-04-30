import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography
} from '@mui/material';

// Charts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

// Constants
const COLORS = ['#6993FF', '#69E7FF', '#86D9B9', '#B5A8FF', '#FFC677', '#FF9C9C', '#A3A1FB', '#76EEF1'];

const CategoriesTab = ({ transactions, formatCurrency }) => {
  // Process transaction data for categories
  const categoryData = useMemo(() => {
    if (!transactions.length) return [];

    // Group transactions by category
    const categoryTotals = {};
    
    transactions.forEach(transaction => {
        const category = transaction.category || 'Uncategorized';
        if (!categoryTotals[category]) {
          categoryTotals[category] = 0;
        }
        categoryTotals[category] -= -transaction.amount;
        // console.log('Category totals:', categoryTotals);
    });
    
    // Convert to array format for charts
    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Take top 8 categories
  }, [transactions]);

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Spending by Category
        </Typography>
        <Box sx={{ height: 400, width: '100%', mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={categoryData}
              margin={{
                top: 5,
                right: 30,
                left: 80,
                bottom: 5,
              }}
              barSize={24}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
              <XAxis 
                type="number" 
                tickFormatter={(value) => `${value}`}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <RechartsTooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ 
                  borderRadius: 12,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  border: 'none'
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
};

export default CategoriesTab;