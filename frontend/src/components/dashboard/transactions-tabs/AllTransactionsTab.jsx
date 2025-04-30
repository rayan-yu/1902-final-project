import React from 'react';
import {
  Box,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';

// Icons
import DateRangeRoundedIcon from '@mui/icons-material/DateRangeRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

// Constants
const COLORS = ['#6993FF', '#69E7FF', '#86D9B9', '#B5A8FF', '#FFC677', '#FF9C9C', '#A3A1FB', '#76EEF1'];

const AllTransactionsTab = ({ transactions, formatCurrency }) => {
  // Format date helper
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: '60vh',
        borderRadius: 3,
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: 'none',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#c1c1c1',
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#a8a8a8',
        },
      }}
    >
      <Table stickyHeader aria-label="transactions table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ backgroundColor: 'white', py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                <DateRangeRoundedIcon sx={{ mr: 1, fontSize: 20 }} /> Date
              </Box>
            </TableCell>
            <TableCell sx={{ backgroundColor: 'white', py: 2, fontWeight: 600 }}>
              Description
            </TableCell>
            <TableCell sx={{ backgroundColor: 'white', py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                <CategoryRoundedIcon sx={{ mr: 1, fontSize: 20 }} /> Category
              </Box>
            </TableCell>
            <TableCell align="right" sx={{ backgroundColor: 'white', py: 2, fontWeight: 600 }}>
              Amount
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow
              key={transaction.id}
              hover
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(105, 147, 255, 0.04)'
                },
                transition: 'background-color 0.2s ease'
              }}
            >
              <TableCell sx={{ py: 2 }}>{formatDate(transaction.date)}</TableCell>
              <TableCell sx={{ py: 2 }}>
                {transaction.merchant_name || transaction.name}
              </TableCell>
              <TableCell sx={{ py: 2 }}>
                {transaction.category ? (
                  <Chip
                    label={transaction.category}
                    size="small"
                    sx={{
                      height: 24,
                      backgroundColor: COLORS[
                        transaction.category[0]
                          ? transaction.category[0].charCodeAt(0) % COLORS.length
                          : 0
                      ],
                      color: 'white',
                      fontWeight: 500,
                      textTransform: 'capitalize',
                      px: 1
                    }}
                  />
                ) : (
                  <Chip
                    label="Uncategorized"
                    size="small"
                    sx={{
                      height: 24,
                      backgroundColor: 'rgba(0, 0, 0, 0.08)',
                      color: 'text.secondary',
                      fontWeight: 500,
                      px: 1
                    }}
                  />
                )}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color: transaction.amount < 0 ? '#4E8CB8' : '#B84E6C',
                  fontWeight: 600,
                  fontFamily: '"Roboto Mono", monospace',
                  py: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                  {formatCurrency(Math.abs(transaction.amount))}
                  {transaction.amount < 0 ? (
                    <ArrowDownwardRoundedIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <ArrowUpwardRoundedIcon sx={{ fontSize: 16 }} />
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AllTransactionsTab;