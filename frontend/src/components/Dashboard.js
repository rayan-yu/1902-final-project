import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getLinkToken, getAccounts, unlinkAccount, unlinkAllAccounts, getTransactions } from '../utils/api';

// Material UI Components
import { 
  Box, 
  Typography, 
  Button, 
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Fade,
  Grow,
  Collapse
} from '@mui/material';

// Icons
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import DateRangeRoundedIcon from '@mui/icons-material/DateRangeRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';

// Charts
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  AreaChart,
  Area
} from 'recharts';

// Generate unique gradient for each account
const getGradientByName = (name) => {
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

// Chart colors
const COLORS = ['#6993FF', '#69E7FF', '#86D9B9', '#B5A8FF', '#FFC677', '#FF9C9C', '#A3A1FB', '#76EEF1'];

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  
  // Core states
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  
  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  
  // Dialog states
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [unlinkingAccount, setUnlinkingAccount] = useState(false);
  const [confirmAllUnlinkOpen, setConfirmAllUnlinkOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactionsDialogOpen, setTransactionsDialogOpen] = useState(false);
  
  // Transactions
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Handle menu
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

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Load account data
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

  // Handle Plaid link
  const handleOpenPlaidLink = () => {
    if (linkToken) {
      navigate('/link-account');
    }
  };

  // Unlink dialog functions
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Account and transaction handling
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

  // Process transaction data for charts
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

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate total balance
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, account) => sum + account.current_balance, 0);
  }, [accounts]);

  // Navigation items
  const navItems = [
    { text: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/dashboard' },
    { text: 'Accounts', icon: <AccountBalanceRoundedIcon />, path: '/accounts' },
    { text: 'Transactions', icon: <SwapHorizRoundedIcon />, path: '/transactions' },
    { text: 'Analytics', icon: <AnalyticsRoundedIcon />, path: '/analytics' },
    { text: 'Cards', icon: <CreditCardRoundedIcon />, path: '/cards' },
  ];

  // Permanent drawer contents
  const drawerContent = (
    <>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%',
          width: drawerOpen ? 240 : 72,
          transition: 'width 0.3s ease',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: drawerOpen ? 'space-between' : 'center',
            py: 2.5,
            px: drawerOpen ? 3 : 2
          }}
        >
          {drawerOpen && (
            <Typography 
              variant="h6" 
              sx={{
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6993FF, #6667AB)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Finflow
            </Typography>
          )}
          <IconButton 
            onClick={toggleDrawer}
            sx={{ 
              color: 'primary.main',
              backgroundColor: 'rgba(105, 147, 255, 0.08)',
              borderRadius: 2,
              p: 1,
              '&:hover': {
                backgroundColor: 'rgba(105, 147, 255, 0.16)'
              }
            }}
          >
            <MenuRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ opacity: 0.5 }} />
        
        <List sx={{ pt: 1, flex: 1 }}>
          {navItems.map((item, index) => (
            <ListItem 
              key={index}
              disablePadding
              button
              sx={{ 
                mb: 0.5,
                display: 'block',
                mx: 1.5,
                borderRadius: 2,
                overflow: 'hidden',
                px: drawerOpen ? 2 : 1,
                py: 1,
                '&:hover': {
                  backgroundColor: 'rgba(105, 147, 255, 0.08)',
                },
                ...(item.text === 'Dashboard' && {
                  backgroundImage: 'linear-gradient(90deg, rgba(105, 147, 255, 0.16), rgba(105, 147, 255, 0.08) 70%)',
                  '&:hover': {
                    backgroundImage: 'linear-gradient(90deg, rgba(105, 147, 255, 0.24), rgba(105, 147, 255, 0.12) 70%)',
                  }
                })
              }}
              component="a"
              href={item.path}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ 
                  minWidth: 40, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: item.text === 'Dashboard' ? 'primary.main' : 'text.secondary'
                }}>
                  {item.icon}
                </Box>
                {drawerOpen && (
                  <Fade in={drawerOpen}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        ml: 1.5, 
                        fontWeight: item.text === 'Dashboard' ? 600 : 500,
                        color: item.text === 'Dashboard' ? 'primary.main' : 'text.secondary'
                      }}
                    >
                      {item.text}
                    </Typography>
                  </Fade>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ opacity: 0.5 }} />
        
        <Box sx={{ p: 2 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={drawerOpen ? <LogoutRoundedIcon /> : null}
            onClick={handleLogout}
            sx={{
              justifyContent: drawerOpen ? 'flex-start' : 'center',
              py: 1,
              px: drawerOpen ? 2.5 : 0,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: 'none',
              background: 'linear-gradient(135deg, rgba(105, 147, 255, 0.12), rgba(105, 147, 255, 0.06))',
              color: 'text.secondary',
              '&:hover': {
                boxShadow: 'none',
                background: 'linear-gradient(135deg, rgba(105, 147, 255, 0.24), rgba(105, 147, 255, 0.12))',
              }
            }}
          >
            {drawerOpen ? 'Logout' : <LogoutRoundedIcon fontSize="small" />}
          </Button>
        </Box>
      </Box>
    </>
  );

  return (
    <Box
      className="dashboard-container"
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        backgroundImage: `
          radial-gradient(at 40% 20%, rgba(105, 147, 255, 0.04) 0px, transparent 50%),
          radial-gradient(at 80% 90%, rgba(105, 231, 255, 0.04) 0px, transparent 50%)
        `,
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Left Navigation Drawer */}
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          width: drawerOpen ? 240 : 72,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerOpen ? 240 : 72,
            boxSizing: "border-box",
            boxShadow: 'none',
            border: 'none',
            backgroundColor: 'white',
            transition: 'width 0.3s ease',
            overflowX: 'hidden'
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: 'margin 0.3s ease',
          ml: isMobile ? 0 : (drawerOpen ? 0 : 0),
          width: isMobile ? '100%' : `calc(100% - ${drawerOpen ? 240 : 72}px)`
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
            px: 1
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                mb: 0.5
              }}
            >
              Financial Dashboard
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Welcome back! Here's your financial overview
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}
          >
            <IconButton
              sx={{
                backgroundColor: 'rgba(105, 147, 255, 0.08)',
                borderRadius: 2,
                p: 1,
                '&:hover': {
                  backgroundColor: 'rgba(105, 147, 255, 0.16)'
                }
              }}
            >
              <NotificationsRoundedIcon
                sx={{ color: 'text.secondary' }}
                fontSize="small"
              />
            </IconButton>

            <Avatar
              onClick={handleMenu}
              sx={{
                width: 40,
                height: 40,
                cursor: 'pointer',
                backgroundColor: 'rgba(105, 147, 255, 0.12)',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(105, 147, 255, 0.2)'
                }
              }}
            >
              <PersonRoundedIcon fontSize="small" />
            </Avatar>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              sx={{
                mt: 1.5,
                '& .MuiPaper-root': {
                  borderRadius: 2,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                  minWidth: 180
                }
              }}
            >
              <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <PersonRoundedIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2">Profile</Typography>
              </MenuItem>
              <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <SettingsRoundedIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2">Settings</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <LogoutRoundedIcon fontSize="small" color="error" />
                </ListItemIcon>
                <Typography variant="body2" color="error">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Main Dashboard Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        ) : error ? (
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              borderRadius: 3,
              textAlign: 'center',
              backgroundColor: 'rgba(255, 82, 82, 0.05)',
              border: '1px solid rgba(255, 82, 82, 0.1)'
            }}
          >
            <Typography color="error" variant="h6">
              {error}
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ pb: 6 }}>
            {/* Balance Overview Card */}
            <Box sx={{ mb: 4 }}>
              <Grow in={true} timeout={800}>
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
                              data={processedTransactionData.monthlyData.length > 0 
                                ? processedTransactionData.monthlyData 
                                : [
                                    { name: '1/2024', inflow: 3500, outflow: 2800 },
                                    { name: '2/2024', inflow: 3800, outflow: 3000 },
                                    { name: '3/2024', inflow: 4200, outflow: 3200 },
                                    { name: '4/2024', inflow: 3900, outflow: 3100 },
                                    { name: '5/2024', inflow: 4500, outflow: 3300 },
                                  ]}
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
              </Grow>
            </Box>

            {accounts.length > 0 ? (
              <Box>
                {/* Accounts Section */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary'
                    }}
                  >
                    Your Accounts
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<LinkOffRoundedIcon />}
                    onClick={handleOpenUnlinkDialog}
                    sx={{
                      borderRadius: 6,
                      textTransform: 'none',
                      py: 0.7,
                      px: 2,
                      borderColor: 'rgba(105, 147, 255, 0.3)',
                      color: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.main',
                        backgroundColor: 'rgba(105, 147, 255, 0.04)'
                      }
                    }}
                  >
                    Manage
                  </Button>
                </Box>
                
                <Grid container spacing={2.5}>
                  {accounts.map((account, index) => {
                    const gradientColors = getGradientByName(account.institution_name);
                    return (
                      <Grid item xs={12} sm={6} md={4} key={account.id}>
                        <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={(index + 1) * 200}>
                          <Card
                            elevation={0}
                            onClick={() => handleAccountClick(account)}
                            sx={{
                              borderRadius: 4,
                              border: '1px solid rgba(105, 147, 255, 0.1)',
                              overflow: 'hidden',
                              cursor: account.subtype && account.subtype.toLowerCase() === 'checking' ? 'pointer' : 'default',
                              background: gradientColors.background,
                              transition: 'all 0.3s ease',
                              position: 'relative',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: gradientColors.border
                              },
                              '&:hover': account.subtype && account.subtype.toLowerCase() === 'checking' ? {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 20px rgba(105, 147, 255, 0.1)',
                                '&::before': {
                                  height: '6px'
                                }
                              } : {}
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                                <Avatar
                                  sx={{
                                    mr: 2,
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    color: gradientColors.icon,
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                                  }}
                                >
                                  {account.type.toLowerCase() === 'depository' ? (
                                    <AccountBalanceWalletRoundedIcon />
                                  ) : (
                                    <AccountBalanceRoundedIcon />
                                  )}
                                </Avatar>
                                <Box>
                                  <Typography 
                                    variant="subtitle1" 
                                    sx={{ 
                                      fontWeight: 600,
                                      color: 'text.primary',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 1,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden'
                                    }}
                                  >
                                    {account.name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      display: '-webkit-box',
                                      WebkitLineClamp: 1,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden'
                                    }}
                                  >
                                    {account.institution_name}
                                  </Typography>
                                </Box>
                              </Box>

                              <Divider sx={{ opacity: 0.6, my: 1.5 }} />

                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                <Chip
                                  label={`${account.type.charAt(0).toUpperCase() + account.type.slice(1)} ${account.subtype ? `• ${account.subtype.charAt(0).toUpperCase() + account.subtype.slice(1)}` : ''}`}
                                  size="small"
                                  sx={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                    borderRadius: 1.5,
                                    height: 24
                                  }}
                                />
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
                            </CardContent>
                          </Card>
                        </Grow>
                      </Grid>
                    );
                  })}
                </Grid>

                {/* Add Account Button */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={handleOpenPlaidLink}
                    disabled={!linkToken}
                    startIcon={<AddCircleRoundedIcon />}
                    sx={{
                      borderRadius: 8,
                      py: 1.5,
                      px: 4,
                      textTransform: 'none',
                      fontWeight: 500,
                      background: 'linear-gradient(120deg, #6993FF, #69E7FF)',
                      boxShadow: '0 8px 20px rgba(105, 147, 255, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 12px 28px rgba(105, 147, 255, 0.3)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Connect Another Account
                  </Button>
                </Box>
              </Box>
            ) : (
              <Grow in={true} timeout={800}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    p: { xs: 3, md: 5 },
                    textAlign: 'center',
                    background: 'linear-gradient(120deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8))',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(105, 147, 255, 0.1)',
                  }}
                >
                  <Box sx={{ maxWidth: 480, mx: 'auto', py: 2 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 3,
                        background: 'linear-gradient(120deg, rgba(105, 147, 255, 0.12), rgba(105, 231, 255, 0.12))',
                        color: '#6993FF',
                      }}
                    >
                      <AccountBalanceRoundedIcon fontSize="large" />
                    </Avatar>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: 600, mb: 2 }}
                    >
                      Get Started with Finance Tracking
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: 'text.secondary', mb: 4 }}
                    >
                      Connect your bank accounts to start tracking your finances and get insights into your spending habits.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleOpenPlaidLink}
                      disabled={!linkToken}
                      startIcon={<AddCircleRoundedIcon />}
                      sx={{
                        borderRadius: 8,
                        py: 1.5,
                        px: 4,
                        textTransform: 'none',
                        fontWeight: 500,
                        background: 'linear-gradient(120deg, #6993FF, #69E7FF)',
                        boxShadow: '0 8px 20px rgba(105, 147, 255, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 12px 28px rgba(105, 147, 255, 0.3)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Connect Bank Account
                    </Button>
                  </Box>
                </Paper>
              </Grow>
            )}
          </Box>
        )}
      </Box>

      {/* Manage Accounts Dialog */}
      <Dialog
        open={unlinkDialogOpen}
        onClose={handleCloseUnlinkDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            pb: 2
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Manage Linked Accounts
          </Typography>
          <IconButton
            onClick={handleCloseUnlinkDialog}
            sx={{
              color: 'text.secondary',
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.08)'
              }
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {unlinkingAccount ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 6, py: 4 }}>
              <CircularProgress sx={{ color: 'primary.main' }} />
            </Box>
          ) : (
            <>
              <List sx={{ py: 0 }}>
                {accounts.map((account) => {
                  const gradientColors = getGradientByName(account.institution_name);
                  return (
                    <ListItem
                      key={account.id}
                      divider
                      sx={{
                        py: 2,
                        px: 3,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(105, 147, 255, 0.04)'
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 56 }}>
                        <Avatar
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            color: gradientColors.icon,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                          }}
                        >
                          {account.type.toLowerCase() === 'depository' ? (
                            <AccountBalanceWalletRoundedIcon fontSize="small" />
                          ) : (
                            <AccountBalanceRoundedIcon fontSize="small" />
                          )}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight={500} sx={{ mb: 0.5 }}>
                            {account.name}
                          </Typography>
                        }
                        secondary={
                          <Box component="span" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              {account.institution_name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Chip
                                label={account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                  fontWeight: 500,
                                  bgcolor: 'rgba(105, 147, 255, 0.1)',
                                  color: 'primary.main'
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 500,
                                  color: account.current_balance >= 0 ? '#4E8CB8' : '#B84E6C',
                                  fontFamily: '"Roboto Mono", monospace'
                                }}
                              >
                                {formatCurrency(account.current_balance)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleUnlinkAccount(account.id)}
                        startIcon={<LinkOffRoundedIcon />}
                        sx={{
                          borderRadius: 6,
                          textTransform: 'none',
                          borderColor: 'rgba(211, 47, 47, 0.3)',
                          '&:hover': {
                            backgroundColor: 'rgba(211, 47, 47, 0.04)',
                            borderColor: 'error.main'
                          }
                        }}
                      >
                        Unlink
                      </Button>
                    </ListItem>
                  );
                })}
              </List>

              {accounts.length > 0 && (
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                  <Tooltip title="Remove all linked bank accounts">
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleConfirmAllUnlink}
                      startIcon={<DeleteSweepRoundedIcon />}
                      sx={{
                        borderRadius: 8,
                        py: 1,
                        px: 3,
                        textTransform: 'none',
                        fontWeight: 500,
                        borderColor: 'rgba(211, 47, 47, 0.3)',
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.04)',
                          borderColor: 'error.main'
                        }
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
      </Dialog>

      {/* Confirm Remove All Dialog */}
      <Dialog
        open={confirmAllUnlinkOpen}
        onClose={handleCloseConfirmAllUnlink}
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3,
            pb: 2
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Remove All Linked Accounts?
          </Typography>
          <IconButton
            onClick={handleCloseConfirmAllUnlink}
            sx={{
              color: 'text.secondary',
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.08)'
              }
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 2, pt: 1 }}>
          <Typography variant="body1" color="text.secondary" align="center">
            Are you sure you want to remove all linked bank accounts? This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'center', gap: 2 }}>
          <Button
            onClick={handleCloseConfirmAllUnlink}
            variant="outlined"
            sx={{
              minWidth: 100,
              borderRadius: 8,
              textTransform: 'none',
              fontWeight: 500,
              py: 1,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUnlinkAllAccounts}
            variant="contained"
            color="error"
            sx={{
              minWidth: 100,
              borderRadius: 8,
              textTransform: 'none',
              fontWeight: 500,
              py: 1,
              px: 3,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)'
              }
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
                {selectedAccount?.name} Transactions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedAccount?.institution_name} • {selectedAccount?.type.charAt(0).toUpperCase() + selectedAccount?.type.slice(1)}
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
                  color: selectedAccount?.current_balance >= 0 ? '#4E8CB8' : '#B84E6C',
                  fontFamily: '"Roboto Mono", monospace'
                }}
              >
                {selectedAccount && formatCurrency(selectedAccount.current_balance)}
              </Typography>
            </Box>
            <IconButton
              onClick={handleCloseTransactionsDialog}
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
                onClick={() => fetchTransactionsForAccount(selectedAccount.id)}
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
                        {processedTransactionData.categoryData.length > 0 ? (
                          <Box sx={{ height: 300, mt: 2 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={processedTransactionData.categoryData.slice(0, 5)}
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
                                  {processedTransactionData.categoryData.slice(0, 5).map((entry, index) => (
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
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      Monthly Spending Trend
                    </Typography>
                    <Box sx={{ height: 400, mt: 2 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={processedTransactionData.monthlyData}
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
              )}

              {/* Categories Tab */}
              {activeTab === 2 && (
                <Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={7}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          border: '1px solid rgba(0, 0, 0, 0.08)'
                        }}
                      >
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                          Spending by Category
                        </Typography>
                        <Box sx={{ height: 400, mt: 2 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              layout="vertical"
                              data={processedTransactionData.categoryData.slice(0, 8)}
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
                                {processedTransactionData.categoryData.slice(0, 8).map((entry, index) => (
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
                          border: '1px solid rgba(0, 0, 0, 0.08)',
                          height: '100%'
                        }}
                      >
                        <Typography variant="h6" gutterBottom fontWeight={600}>
                          Top Locations
                        </Typography>
                        {processedTransactionData.locationData.length > 0 ? (
                          <List sx={{ mt: 1 }}>
                            {processedTransactionData.locationData.map((location, index) => (
                              <ListItem
                                key={index}
                                sx={{
                                  px: 0,
                                  py: 2,
                                  borderBottom: index < processedTransactionData.locationData.length - 1 ? 
                                    '1px solid rgba(0, 0, 0, 0.08)' : 'none'
                                }}
                              >
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                  <Avatar
                                    sx={{
                                      width: 28,
                                      height: 28,
                                      backgroundColor: COLORS[index % COLORS.length],
                                      color: 'white',
                                      fontSize: '0.8rem'
                                    }}
                                  >
                                    <PlaceRoundedIcon fontSize="small" />
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                  primary={location.name}
                                  primaryTypographyProps={{
                                    fontWeight: 500
                                  }}
                                />
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: 500,
                                    fontFamily: '"Roboto Mono", monospace'
                                  }}
                                >
                                  {formatCurrency(location.value)}
                                </Typography>
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                            <Typography variant="body2" color="text.secondary">
                              No location data available
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* All Transactions Tab */}
              {activeTab === 3 && (
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
                        <TableCell sx={{ backgroundColor: 'white', py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                            <PlaceRoundedIcon sx={{ mr: 1, fontSize: 20 }} /> Location
                          </Box>
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
                            {transaction.personal_finance_category?.primary ? (
                              <Chip
                                label={transaction.personal_finance_category.primary}
                                size="small"
                                sx={{
                                  height: 24,
                                  backgroundColor: COLORS[
                                    transaction.personal_finance_category.primary.charCodeAt(0) % COLORS.length
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
                          <TableCell sx={{ py: 2 }}>
                            {transaction.location?.city
                              ? `${transaction.location.city}${transaction.location.region ? `, ${transaction.location.region}` : ''}`
                              : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard;