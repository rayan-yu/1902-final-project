import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Avatar,
  Tabs,
  Tab,
  CircularProgress,
  Button
} from '@mui/material';

// Icons
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

// Transaction Tabs
import OverviewTab from '../transactions-tabs/OverviewTab';
import MonthlySpendingTab from '../transactions-tabs/MonthlySpendingTab';
import CategoriesTab from '../transactions-tabs/CategoriesTab';
import AllTransactionsTab from '../transactions-tabs/AllTransactionsTab';

// API
import { getTransactions } from '../../../utils/api';

const TransactionsDialog = ({
  open,
  onClose,
  account,
  activeTab,
  handleTabChange,
  transactions,
  setTransactions,
  loadingTransactions,
  setLoadingTransactions,
  transactionError,
  setTransactionError,
  formatCurrency
}) => {
  // Fetch transactions when dialog opens
  useEffect(() => {
    if (open && account) {
      fetchTransactionsForAccount(account.id);
    }
  }, [open, account]);

  const fetchTransactionsForAccount = async (accountId) => {
    setLoadingTransactions(true);
    setTransactionError(null);
    try {
      // Get transactions for the past 24 months
      const today = new Date();
      const startDate = new Date();
      startDate.setMonth(today.getMonth() - 24);
      
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = today.toISOString().split('T')[0];
      
      const transactionData = await getTransactions({
        account_id: accountId,
        start_date: formattedStartDate,
        end_date: formattedEndDate
      });

      setTransactions(transactionData || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setTransactionError('Failed to load transaction data. Please try again later.');
    } finally {
      setLoadingTransactions(false);
    }
  };

  if (!account) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1)',
          height: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 3,
          pb: 2,
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              mr: 2,
              backgroundColor: 'rgba(105, 147, 255, 0.1)',
              color: 'primary.main'
            }}
          >
            <AttachMoneyRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {account.name} Transactions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {account.institution_name} • {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              Current Balance
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: account.current_balance >= 0 ? '#4E8CB8' : '#B84E6C',
                fontFamily: '"Roboto Mono", monospace'
              }}
            >
              {formatCurrency(account.current_balance)}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.08)'
              }
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{
          px: 3,
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          '& .MuiTabs-indicator': {
            backgroundColor: 'primary.main',
            height: 3,
            borderRadius: '3px 3px 0 0'
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            px: 3,
            py: 2
          }
        }}
      >
        <Tab label="Overview" />
        <Tab label="Monthly Spending" />
        <Tab label="Categories" />
        <Tab label="All Transactions" />
      </Tabs>

      <DialogContent sx={{ p: 0 }}>
        {loadingTransactions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        ) : transactionError ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="error" variant="h6" gutterBottom>
              {transactionError}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => fetchTransactionsForAccount(account.id)}
              sx={{
                mt: 2,
                borderRadius: 8,
                textTransform: 'none'
              }}
            >
              Try Again
            </Button>
          </Box>
        ) : transactions.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', py: 8 }}>
            <Typography variant="h6" gutterBottom>
              No transactions found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              There are no transactions available for this account in the selected time period.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            {/* Overview Tab */}
            {activeTab === 0 && (
              <OverviewTab 
                transactions={transactions} 
                formatCurrency={formatCurrency} 
              />
            )}

            {/* Monthly Spending Tab */}
            {activeTab === 1 && (
              <MonthlySpendingTab 
                transactions={transactions} 
                formatCurrency={formatCurrency} 
              />
            )}

            {/* Categories Tab */}
            {activeTab === 2 && (
              <CategoriesTab 
                transactions={transactions} 
                formatCurrency={formatCurrency} 
              />
            )}

            {/* All Transactions Tab */}
            {activeTab === 3 && (
              <AllTransactionsTab 
                transactions={transactions} 
                formatCurrency={formatCurrency} 
              />
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransactionsDialog;