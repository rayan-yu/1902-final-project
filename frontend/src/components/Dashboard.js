import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getLinkToken, getAccounts, unlinkAccount, unlinkAllAccounts, getTransactions } from '../utils/api';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Menu, 
  MenuItem,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  useTheme,
  useMediaQuery,
  Fade,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PlaceIcon from '@mui/icons-material/Place';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CategoryIcon from '@mui/icons-material/Category';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

// Function to generate a unique gradient for each account based on institution name
const getGradientByName = (name) => {
  // Simple hash function to generate consistent colors
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  
  // Use hash to determine hue (0-360)
  const hue = hash % 360;
  
  // Create gradient with two similar hues
  return `linear-gradient(135deg, 
    hsl(${hue}, 70%, 85%), 
    hsl(${(hue + 30) % 360}, 60%, 75%)
  )`;
};

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [unlinkingAccount, setUnlinkingAccount] = useState(false);
  const [confirmAllUnlinkOpen, setConfirmAllUnlinkOpen] = useState(false);
  
  // New states for transactions
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactionsDialogOpen, setTransactionsDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#6A7FDB'];

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const loadAccountData = async () => {
    try {
      // Get link token for connecting new accounts
      const linkResponse = await getLinkToken();
      
      // Try to fetch existing accounts
      let accountsData = [];
      try {
        accountsData = await getAccounts();
      } catch (accountErr) {
        console.log('No accounts found or error fetching accounts', accountErr);
      }
      
      setLinkToken(linkResponse.link_token);
      setAccounts(accountsData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        await loadAccountData();
      } catch (err) {
        if (isMounted) {
          console.error('Error in loadData:', err);
        }
      }
    };

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenPlaidLink = () => {
    if (linkToken) {
      navigate('/link-account');
    }
  };

  const handleOpenUnlinkDialog = () => {
    setUnlinkDialogOpen(true);
  };

  const handleCloseUnlinkDialog = () => {
    setUnlinkDialogOpen(false);
  };

  const handleUnlinkAccount = async (accountId) => {
    setUnlinkingAccount(true);
    try {
      await unlinkAccount(accountId);
      // Refresh accounts after unlinking
      await loadAccountData();
      setUnlinkingAccount(false);
    } catch (err) {
      console.error('Error unlinking account:', err);
      setError('Failed to unlink account. Please try again later.');
      setUnlinkingAccount(false);
    }
  };

  const handleConfirmAllUnlink = () => {
    setConfirmAllUnlinkOpen(true);
  };

  const handleCloseConfirmAllUnlink = () => {
    setConfirmAllUnlinkOpen(false);
  };

  const handleUnlinkAllAccounts = async () => {
    setUnlinkingAccount(true);
    try {
      await unlinkAllAccounts();
      // Refresh accounts after unlinking
      await loadAccountData();
      setUnlinkingAccount(false);
      handleCloseConfirmAllUnlink();
      setUnlinkDialogOpen(false);
    } catch (err) {
      console.error('Error unlinking all accounts:', err);
      setError('Failed to unlink accounts. Please try again later.');
      setUnlinkingAccount(false);
      handleCloseConfirmAllUnlink();
    }
  };

  // Format currency with commas and 2 decimal places
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleAccountClick = async (account) => {
    // Only open transaction details for checking accounts
    if (account.subtype && account.subtype.toLowerCase() === 'checking') {
      setSelectedAccount(account);
      setTransactionsDialogOpen(true);
      await fetchTransactionsForAccount(account.id);
    }
  };

  const handleCloseTransactionsDialog = () => {
    setTransactionsDialogOpen(false);
    setSelectedAccount(null);
    setTransactions([]);
    setActiveTab(0);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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

  // Process transaction data for charts and summary statistics
  const processedTransactionData = useMemo(() => {
    if (!transactions.length) return { monthlyData: [], categoryData: [], locationData: [], summary: {} };

    // Group transactions by month
    const monthlyData = {};
    const categoryTotals = {};
    const locationTotals = {};
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
        monthlyData[monthYear].outflow += transaction.amount;
        totalOutflow += transaction.amount;
      }
      
      // Process for category chart
      const category = transaction.personal_finance_category?.primary || 'Uncategorized';
      if (transaction.amount > 0) { // Only track outflows for categories
        if (!categoryTotals[category]) {
          categoryTotals[category] = 0;
        }
        categoryTotals[category] += transaction.amount;
      }
      
      // Process for location data
      if (transaction.location?.city) {
        const location = transaction.location.city;
        if (!locationTotals[location]) {
          locationTotals[location] = 0;
        }
        locationTotals[location] += Math.abs(transaction.amount);
      }
      
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
    
    const locationDataArray = Object.entries(locationTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 locations
    
    return {
      monthlyData: monthlyDataArray,
      categoryData: categoryDataArray,
      locationData: locationDataArray,
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

  // Function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Box className="fade-in" sx={{ minHeight: '100vh' }}>
      <AppBar position="static" elevation={0} className="app-header">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DashboardIcon sx={{ mr: 1.5 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
              Finance Tracker
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircleIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, pb: 6 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 2 : 0
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 500,
              background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Dashboard
          </Typography>
          {accounts.length > 0 && (
            <Button 
              variant="outlined" 
              color="success"
              startIcon={<LinkOffIcon />}
              onClick={handleOpenUnlinkDialog}
              className="modern-button"
              sx={{
                borderRadius: 6,
                boxShadow: 'none',
                textTransform: 'none',
                fontWeight: 500,
                borderWidth: 1.5,
                '&:hover': {
                  borderWidth: 1.5,
                  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.15)'
                }
              }}
            >
              Manage Accounts
            </Button>
          )}
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress sx={{ color: '#4CAF50' }} />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        ) : (
          <>
            {accounts.length > 0 ? (
              <Box sx={{ mt: 4 }}>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    mb: 3, 
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}
                >
                  Your Accounts
                </Typography>
                
                <Grid container spacing={3}>
                  {accounts.map((account, index) => (
                    <Grid item xs={12} md={6} key={account.id}>
                      <Fade in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                        <Card 
                          className="modern-card account-card" 
                          sx={{ 
                            overflow: 'hidden',
                            height: '100%',
                            position: 'relative',
                            cursor: account.subtype && account.subtype.toLowerCase() === 'checking' ? 'pointer' : 'default',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '4px',
                              background: getGradientByName(account.institution_name)
                            },
                            '&:hover': account.subtype && account.subtype.toLowerCase() === 'checking' ? {
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
                            } : {}
                          }}
                          onClick={() => handleAccountClick(account)}
                        >
                          <CardContent sx={{ height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar 
                                sx={{ 
                                  mr: 2, 
                                  background: getGradientByName(account.institution_name) 
                                }}
                              >
                                <AccountBalanceIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                  {account.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {account.institution_name}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Divider sx={{ my: 1.5 }} />
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {account.type.charAt(0).toUpperCase() + account.type.slice(1)} 
                                {account.subtype ? ` • ${account.subtype.charAt(0).toUpperCase() + account.subtype.slice(1)}` : ''}
                              </Typography>
                              <Typography 
                                variant="h6" 
                                className="currency"
                                sx={{ 
                                  fontWeight: 500,
                                  color: account.current_balance >= 0 ? '#2e7d32' : '#d32f2f'
                                }}
                              >
                                {formatCurrency(account.current_balance)}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Fade>
                    </Grid>
                  ))}
                </Grid>
                
                <Box sx={{ mt: 5, textAlign: 'center' }}>
                  <Button 
                    variant="contained" 
                    color="success"
                    onClick={handleOpenPlaidLink}
                    disabled={!linkToken}
                    startIcon={<AddCircleIcon />}
                    className="modern-button"
                    sx={{ 
                      px: 4,
                      py: 1.5,
                      background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #43A047, #2E7D32)',
                        boxShadow: '0 8px 16px rgba(46, 125, 50, 0.25)'
                      }
                    }}
                  >
                    Connect Another Account
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box 
                sx={{ 
                  mt: 6, 
                  textAlign: 'center',
                  p: 5,
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: 4,
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
                }}
              >
                <Typography variant="h5" gutterBottom sx={{ mb: 2, fontWeight: 500 }}>
                  Get Started with Finance Tracking
                </Typography>
                <Typography variant="body1" gutterBottom sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
                  Connect your bank account to start tracking your finances and get insights into your spending habits.
                </Typography>
                <Button 
                  variant="contained" 
                  color="success"
                  onClick={handleOpenPlaidLink}
                  disabled={!linkToken}
                  startIcon={<AddCircleIcon />}
                  className="modern-button"
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #43A047, #2E7D32)',
                      boxShadow: '0 8px 16px rgba(46, 125, 50, 0.25)'
                    }
                  }}
                >
                  Connect Bank Account
                </Button>
              </Box>
            )}
          </>
        )}
        
        {/* Unlink Accounts Dialog */}
        <Dialog
          open={unlinkDialogOpen}
          onClose={handleCloseUnlinkDialog}
          aria-labelledby="unlink-dialog-title"
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <DialogTitle 
            id="unlink-dialog-title"
            sx={{ 
              pb: 1,
              pt: 3,
              fontWeight: 500,
              textAlign: 'center'
            }}
          >
            Manage Linked Accounts
          </DialogTitle>
          <DialogContent>
            {unlinkingAccount ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress sx={{ color: '#4CAF50' }} />
              </Box>
            ) : (
              <>
                <List sx={{ py: 2 }}>
                  {accounts.map((account) => (
                    <ListItem 
                      key={account.id} 
                      divider 
                      sx={{ 
                        py: 2,
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.02)'
                        }
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {account.name}
                          </Typography>
                        }
                        secondary={
                          <Box component="span" sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              {account.institution_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {account.type.charAt(0).toUpperCase() + account.type.slice(1)} • {formatCurrency(account.current_balance)}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          onClick={() => handleUnlinkAccount(account.id)}
                          startIcon={<LinkOffIcon />}
                          sx={{
                            borderRadius: 6,
                            textTransform: 'none',
                            '&:hover': {
                              backgroundColor: 'rgba(211, 47, 47, 0.04)'
                            }
                          }}
                        >
                          Unlink
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
                {accounts.length > 0 && (
                  <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <Tooltip title="Remove all linked bank accounts">
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteSweepIcon />}
                        onClick={handleConfirmAllUnlink}
                        className="modern-button"
                        sx={{ 
                          textTransform: 'none',
                          fontWeight: 500,
                          py: 1
                        }}
                      >
                        Remove All Links
                      </Button>
                    </Tooltip>
                  </Box>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ pb: 3, px: 3 }}>
            <Button 
              onClick={handleCloseUnlinkDialog} 
              color="inherit"
              sx={{ 
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Remove All Dialog */}
        <Dialog
          open={confirmAllUnlinkOpen}
          onClose={handleCloseConfirmAllUnlink}
          aria-labelledby="confirm-dialog-title"
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <DialogTitle 
            id="confirm-dialog-title"
            sx={{ 
              pt: 3,
              fontWeight: 500,
              textAlign: 'center'
            }}
          >
            Remove All Linked Accounts?
          </DialogTitle>
          <DialogContent sx={{ pb: 2 }}>
            <Typography sx={{ textAlign: 'center' }}>
              Are you sure you want to remove all linked bank accounts? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 2 }}>
            <Button 
              onClick={handleCloseConfirmAllUnlink} 
              variant="outlined"
              sx={{ 
                minWidth: '120px',
                textTransform: 'none',
                borderRadius: 6,
                fontWeight: 500
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUnlinkAllAccounts} 
              color="error" 
              variant="contained"
              sx={{ 
                minWidth: '120px',
                textTransform: 'none',
                borderRadius: 6,
                fontWeight: 500
              }}
            >
              Remove All
            </Button>
          </DialogActions>
        </Dialog>

        {/* Transaction Details Dialog */}
        <Dialog
          open={transactionsDialogOpen}
          onClose={handleCloseTransactionsDialog}
          aria-labelledby="transactions-dialog-title"
          fullWidth
          maxWidth="lg"
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
              height: '90vh'
            }
          }}
        >
          <DialogTitle 
            id="transactions-dialog-title"
            sx={{ 
              pb: 1,
              pt: 3,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoneyIcon sx={{ mr: 1.5, color: '#4CAF50' }} />
              <Typography 
                variant="h6" 
                component="span"
              >
                {selectedAccount?.name} Transactions
              </Typography>
            </Box>
            <Typography 
              variant="h6" 
              component="span"
              sx={{ 
                fontWeight: 600,
                color: selectedAccount?.current_balance >= 0 ? '#2e7d32' : '#d32f2f'
              }}
            >
              {selectedAccount && formatCurrency(selectedAccount.current_balance)}
            </Typography>
          </DialogTitle>
          
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
          >
            <Tab label="Overview" />
            <Tab label="Monthly Spending" />
            <Tab label="Categories" />
            <Tab label="All Transactions" />
          </Tabs>
          
          <DialogContent sx={{ px: 4, py: 3 }}>
            {loadingTransactions ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
                <CircularProgress sx={{ color: '#4CAF50' }} />
              </Box>
            ) : transactionError ? (
              <Typography color="error" sx={{ mt: 2 }}>
                {transactionError}
              </Typography>
            ) : transactions.length === 0 ? (
              <Box sx={{ textAlign: 'center', my: 8 }}>
                <Typography variant="h6" gutterBottom>
                  No transactions found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  There are no transactions available for this account in the selected time period.
                </Typography>
              </Box>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 0 && (
                  <Box>
                    <Grid container spacing={4}>
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
                          <Typography variant="h6" gutterBottom>
                            Summary Statistics
                          </Typography>
                          <List>
                            <ListItem divider>
                              <ListItemText 
                                primary="Total Transactions" 
                                secondary={processedTransactionData.summary.totalTransactions || 0} 
                              />
                            </ListItem>
                            <ListItem divider>
                              <ListItemText 
                                primary="Total Inflow" 
                                secondary={formatCurrency(processedTransactionData.summary.totalInflow || 0)} 
                              />
                            </ListItem>
                            <ListItem divider>
                              <ListItemText 
                                primary="Total Outflow" 
                                secondary={formatCurrency(processedTransactionData.summary.totalOutflow || 0)} 
                              />
                            </ListItem>
                            <ListItem divider>
                              <ListItemText 
                                primary="Net Cash Flow" 
                                secondary={formatCurrency(processedTransactionData.summary.netCashFlow || 0)}
                                secondaryTypographyProps={{
                                  sx: { 
                                    color: (processedTransactionData.summary.netCashFlow || 0) >= 0 
                                      ? '#2e7d32' 
                                      : '#d32f2f' 
                                  }
                                }}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText 
                                primary="Average Transaction Size" 
                                secondary={formatCurrency(processedTransactionData.summary.averageTransaction || 0)} 
                              />
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
                          <Typography variant="h6" gutterBottom>
                            Top Spending Categories
                          </Typography>
                          {processedTransactionData.categoryData.length > 0 ? (
                            <Box sx={{ height: 300, mt: 3 }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={processedTransactionData.categoryData.slice(0, 5)}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  >
                                    {processedTransactionData.categoryData.slice(0, 5).map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Legend />
                                  <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                                </PieChart>
                              </ResponsiveContainer>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
                              No category data available
                            </Typography>
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
                          <Typography variant="h6" gutterBottom>
                            Cash Flow by Month
                          </Typography>
                          <Box sx={{ height: 350, mt: 3 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={processedTransactionData.monthlyData}
                                margin={{
                                  top: 5,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `$${value}`} />
                                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar name="Money In" dataKey="inflow" fill="#4CAF50" />
                                <Bar name="Money Out" dataKey="outflow" fill="#FF5252" />
                              </BarChart>
                            </ResponsiveContainer>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                
                {/* Monthly Spending Tab */}
                {activeTab === 1 && (
                  <Box>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 3, 
                        borderRadius: 3,
                        border: '1px solid rgba(0, 0, 0, 0.08)'
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        Monthly Spending Trend
                      </Typography>
                      <Box sx={{ height: 400, mt: 3 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={processedTransactionData.monthlyData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `$${value}`} />
                            <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Line 
                              type="monotone" 
                              name="Money In" 
                              dataKey="inflow" 
                              stroke="#4CAF50" 
                              activeDot={{ r: 8 }} 
                              strokeWidth={2}
                            />
                            <Line 
                              type="monotone" 
                              name="Money Out" 
                              dataKey="outflow" 
                              stroke="#FF5252" 
                              activeDot={{ r: 8 }} 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Box>
                )}
                
                {/* Categories Tab */}
                {activeTab === 2 && (
                  <Box>
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={7}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 3, 
                            borderRadius: 3,
                            border: '1px solid rgba(0, 0, 0, 0.08)'
                          }}
                        >
                          <Typography variant="h6" gutterBottom>
                            Spending by Category
                          </Typography>
                          <Box sx={{ height: 400, mt: 3 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                layout="vertical"
                                data={processedTransactionData.categoryData.slice(0, 10)}
                                margin={{
                                  top: 5,
                                  right: 30,
                                  left: 100,
                                  bottom: 5,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                                <YAxis type="category" dataKey="name" />
                                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                                <Bar dataKey="value" fill="#8884d8">
                                  {processedTransactionData.categoryData.slice(0, 10).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </Box>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 3, 
                            borderRadius: 3,
                            border: '1px solid rgba(0, 0, 0, 0.08)'
                          }}
                        >
                          <Typography variant="h6" gutterBottom>
                            Top Locations
                          </Typography>
                          {processedTransactionData.locationData.length > 0 ? (
                            <List sx={{ mt: 2 }}>
                              {processedTransactionData.locationData.map((location, index) => (
                                <ListItem key={index} divider={index < processedTransactionData.locationData.length - 1}>
                                  <ListItemText
                                    primary={
                                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <PlaceIcon sx={{ mr: 1, color: COLORS[index % COLORS.length] }} />
                                        {location.name}
                                      </Box>
                                    }
                                    secondary={formatCurrency(location.value)}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
                              No location data available
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                
                {/* All Transactions Tab */}
                {activeTab === 3 && (
                  <TableContainer component={Paper} sx={{ maxHeight: '60vh', borderRadius: 2 }}>
                    <Table stickyHeader aria-label="transactions table">
                      <TableHead>
                        <TableRow>
                          <TableCell><Box sx={{ display: 'flex', alignItems: 'center' }}><DateRangeIcon sx={{ mr: 1 }} /> Date</Box></TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell><Box sx={{ display: 'flex', alignItems: 'center' }}><CategoryIcon sx={{ mr: 1 }} /> Category</Box></TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell><Box sx={{ display: 'flex', alignItems: 'center' }}><PlaceIcon sx={{ mr: 1 }} /> Location</Box></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction.id} hover>
                            <TableCell>{formatDate(transaction.date)}</TableCell>
                            <TableCell>
                              {transaction.merchant_name || transaction.name}
                            </TableCell>
                            <TableCell>
                              {transaction.personal_finance_category?.primary ? (
                                <Chip 
                                  label={transaction.personal_finance_category.primary} 
                                  size="small" 
                                  sx={{ 
                                    backgroundColor: COLORS[
                                      transaction.personal_finance_category.primary.charCodeAt(0) % COLORS.length
                                    ],
                                    color: 'white'
                                  }} 
                                />
                              ) : 'Uncategorized'}
                            </TableCell>
                            <TableCell align="right" sx={{ 
                              color: transaction.amount < 0 ? '#2e7d32' : '#d32f2f',
                              fontWeight: 500
                            }}>
                              {formatCurrency(Math.abs(transaction.amount))}
                              {transaction.amount < 0 ? ' ↓' : ' ↑'}
                            </TableCell>
                            <TableCell>
                              {transaction.location?.city 
                                ? `${transaction.location.city}${transaction.location.region ? `, ${transaction.location.region}` : ''}`
                                : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </DialogContent>
          
          <DialogActions sx={{ pb: 3, px: 3 }}>
            <Button 
              onClick={handleCloseTransactionsDialog} 
              variant="outlined"
              sx={{ 
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 2
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard; 