import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccounts, getTransactions } from '../utils/api';

// Material UI Components
import { 
  Box, 
  Typography, 
  Button, 
  Card,
  CardContent,
  Grid,
  Divider,
  IconButton,
  Paper,
  CircularProgress,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Avatar,
  Drawer,
  List,
  ListItem,
  Fade
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// Icons
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import CalendarViewMonthRoundedIcon from '@mui/icons-material/CalendarViewMonthRounded';
import CalendarViewWeekRoundedIcon from '@mui/icons-material/CalendarViewWeekRounded';
import DateRangeRoundedIcon from '@mui/icons-material/DateRangeRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import DonutLargeRoundedIcon from '@mui/icons-material/DonutLargeRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LocalGasStationRoundedIcon from '@mui/icons-material/LocalGasStationRounded';
import LocalAtmRoundedIcon from '@mui/icons-material/LocalAtmRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import FlightRoundedIcon from '@mui/icons-material/FlightRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

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
  Area,
  Sector
} from 'recharts';

// Sample data for the mock
const mockCategories = [
  { name: 'Food & Drink', value: 850, icon: <RestaurantRoundedIcon />, color: '#FF7F50' },
  { name: 'Housing', value: 2200, icon: <HomeRoundedIcon />, color: '#9C27B0' },
  { name: 'Transportation', value: 450, icon: <LocalGasStationRoundedIcon />, color: '#4CAF50' },
  { name: 'Shopping', value: 650, icon: <ShoppingCartRoundedIcon />, color: '#6993FF' },
  { name: 'Healthcare', value: 280, icon: <LocalHospitalRoundedIcon />, color: '#F44336' },
  { name: 'Entertainment', value: 320, icon: <CategoryRoundedIcon />, color: '#FF5722' },
  { name: 'Travel', value: 180, icon: <FlightRoundedIcon />, color: '#FF9800' },
  { name: 'Other', value: 270, icon: <CategoryRoundedIcon />, color: '#795548' },
];

const mockMonthlyData = [
  { name: 'Jan', income: 4200, expenses: 3800 },
  { name: 'Feb', income: 4300, expenses: 3600 },
  { name: 'Mar', income: 4250, expenses: 3900 },
  { name: 'Apr', income: 4500, expenses: 3950 },
  { name: 'May', income: 4320, expenses: 3850 },
  { name: 'Jun', income: 4650, expenses: 3700 },
  { name: 'Jul', income: 4800, expenses: 4100 },
  { name: 'Aug', income: 4700, expenses: 4000 },
  { name: 'Sep', income: 4550, expenses: 3800 },
  { name: 'Oct', income: 4400, expenses: 3600 },
  { name: 'Nov', income: 4600, expenses: 3750 },
  { name: 'Dec', income: 5000, expenses: 4200 },
];

const mockWeeklyData = [
  { name: 'Mon', income: 950, expenses: 820 },
  { name: 'Tue', income: 890, expenses: 750 },
  { name: 'Wed', income: 920, expenses: 880 },
  { name: 'Thu', income: 980, expenses: 840 },
  { name: 'Fri', income: 1100, expenses: 950 },
  { name: 'Sat', income: 650, expenses: 780 },
  { name: 'Sun', income: 500, expenses: 680 },
];

const mockTrends = [
  { name: 'Total Spending', value: 5250, change: -8.5, status: 'down' },
  { name: 'Average Transaction', value: 72.35, change: 4.2, status: 'up' },
  { name: 'Total Income', value: 4800, change: 2.1, status: 'up' },
  { name: 'Savings Rate', value: 15.2, change: 1.5, status: 'up' },
];

// Chart colors
const COLORS = ['#6993FF', '#69E7FF', '#86D9B9', '#B5A8FF', '#FFC677', '#FF9C9C', '#A3A1FB', '#76EEF1'];

const Analytics = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('monthly');
  const [tabValue, setTabValue] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [accounts, setAccounts] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Toggle drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Load data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        // In a real implementation, this would fetch from API
        // For the mock, we'll simulate API delay
        setTimeout(() => {
          // Get accounts
          setAccounts([
            { id: '1', name: 'Chase Checking' },
            { id: '2', name: 'Bank of America Checking' },
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error loading analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, []);
  
  // Handle time range change
  const handleTimeRangeChange = (event, newRange) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle account change
  const handleAccountChange = (event) => {
    setSelectedAccount(event.target.value);
  };
  
  // Get chart data based on time range
  const chartData = useMemo(() => {
    return timeRange === 'monthly' ? mockMonthlyData : mockWeeklyData;
  }, [timeRange]);
  
  // Calculate total income and expenses
  const totals = useMemo(() => {
    const incomeTotal = chartData.reduce((sum, item) => sum + item.income, 0);
    const expensesTotal = chartData.reduce((sum, item) => sum + item.expenses, 0);
    return {
      income: incomeTotal,
      expenses: expensesTotal,
      netCash: incomeTotal - expensesTotal
    };
  }, [chartData]);

  // Navigation items
  const navItems = [
    { text: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/dashboard' },
    { text: 'Accounts', icon: <AccountBalanceRoundedIcon />, path: '/accounts' },
    { text: 'Transactions', icon: <SwapHorizRoundedIcon />, path: '/transactions' },
    { text: 'Analytics', icon: <AnalyticsRoundedIcon />, path: '/analytics' },
    { text: 'Cards', icon: <CreditCardRoundedIcon />, path: '/cards' },
  ];

  // Drawer content
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
                ...(item.text === 'Analytics' && {
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
                  color: item.text === 'Analytics' ? 'primary.main' : 'text.secondary'
                }}>
                  {item.icon}
                </Box>
                {drawerOpen && (
                  <Fade in={drawerOpen}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        ml: 1.5, 
                        fontWeight: item.text === 'Analytics' ? 600 : 500,
                        color: item.text === 'Analytics' ? 'primary.main' : 'text.secondary'
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
            onClick={() => navigate('/login')}
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
  
  // Custom tooltip for recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 2,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            borderRadius: 2,
            border: '1px solid rgba(0, 0, 0, 0.05)',
            maxWidth: 200
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            {label}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: '#6993FF' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Income:
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {formatCurrency(payload[0].value)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: '#FF4842' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Expenses:
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {formatCurrency(payload[1].value)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      );
    }
    return null;
  };
  
  // Handle pie chart hover
  const handlePieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <Box
      className="analytics-container"
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
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: isSmall ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isSmall ? 'flex-start' : 'center',
              mb: 4
            }}
          >
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#1a2027',
                  mb: 1
                }}
              >
                Analytics
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary', 
                  mb: isSmall ? 2 : 0 
                }}
              >
                Track and visualize your financial patterns
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadRoundedIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: 'rgba(105, 147, 255, 0.5)',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(105, 147, 255, 0.04)'
                  }
                }}
              >
                Export Report
              </Button>
              
              <Button
                variant="contained"
                startIcon={<RefreshRoundedIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(105, 147, 255, 0.2)',
                  background: 'linear-gradient(135deg, #6993FF, #6667AB)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(105, 147, 255, 0.3)',
                  }
                }}
              >
                Update Data
              </Button>
            </Box>
          </Box>

          {/* Filters and controls */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              mb: 3
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="account-select-label">Account</InputLabel>
                    <Select
                      labelId="account-select-label"
                      value={selectedAccount}
                      onChange={handleAccountChange}
                      label="Account"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="all">All Accounts</MenuItem>
                      {accounts.map((account) => (
                        <MenuItem key={account.id} value={account.id}>
                          {account.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="From Date"
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        sx: { borderRadius: 2 }
                      } 
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="To Date"
                    value={endDate}
                    onChange={setEndDate}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true,
                        sx: { borderRadius: 2 }
                      } 
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                    <ToggleButtonGroup
                      value={timeRange}
                      exclusive
                      onChange={handleTimeRangeChange}
                      aria-label="time range"
                      sx={{
                        '.MuiToggleButtonGroup-grouped': {
                          border: '1px solid rgba(0, 0, 0, 0.12)',
                          '&:not(:first-of-type)': {
                            borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
                          },
                        },
                      }}
                    >
                      <ToggleButton 
                        value="weekly" 
                        aria-label="weekly" 
                        sx={{ 
                          px: 2,
                          color: timeRange === 'weekly' ? 'primary.main' : 'text.secondary',
                          backgroundColor: timeRange === 'weekly' ? 'rgba(105, 147, 255, 0.08)' : 'transparent',
                        }}
                      >
                        <CalendarViewWeekRoundedIcon sx={{ mr: 0.5 }} />
                        Weekly
                      </ToggleButton>
                      <ToggleButton 
                        value="monthly" 
                        aria-label="monthly"
                        sx={{ 
                          px: 2,
                          color: timeRange === 'monthly' ? 'primary.main' : 'text.secondary',
                          backgroundColor: timeRange === 'monthly' ? 'rgba(105, 147, 255, 0.08)' : 'transparent',
                        }}
                      >
                        <CalendarViewMonthRoundedIcon sx={{ mr: 0.5 }} />
                        Monthly
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Main content */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={40} sx={{ color: '#6993FF' }} />
            </Box>
          ) : error ? (
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 3,
                backgroundColor: 'rgba(255, 72, 66, 0.08)',
                my: 2
              }}
            >
              <Typography color="error">{error}</Typography>
            </Paper>
          ) : (
            <Box>
              {/* Summary cards */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {mockTrends.map((trend, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                        height: '100%',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {trend.name}
                          </Typography>
                          <Chip
                            icon={trend.status === 'up' ? <ArrowUpwardRoundedIcon /> : <ArrowDownwardRoundedIcon />}
                            label={`${trend.change > 0 ? '+' : ''}${trend.change}%`}
                            size="small"
                            sx={{
                              bgcolor: trend.status === 'up' ? 'rgba(102, 187, 106, 0.1)' : 'rgba(255, 72, 66, 0.1)',
                              color: trend.status === 'up' ? 'success.main' : 'error.main',
                              fontWeight: 600,
                              borderRadius: 1,
                              '& .MuiChip-icon': {
                                fontSize: '1rem',
                              }
                            }}
                          />
                        </Box>
                        <Typography 
                          variant="h4" 
                          sx={{ 
                            fontWeight: 700, 
                            color: '#1a2027',
                            mt: 1
                          }}
                        >
                          {trend.name === 'Savings Rate' 
                            ? `${trend.value}%` 
                            : formatCurrency(trend.value)
                          }
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                          {timeRange === 'monthly' ? 'Last 30 days' : 'Last 7 days'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              
              {/* Tab system for different charts */}
              <Box sx={{ mb: 3 }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    mb: 3,
                    '& .MuiTab-root': {
                      minWidth: 120,
                      textTransform: 'none',
                      fontWeight: 500,
                    },
                    '& .Mui-selected': {
                      fontWeight: 600,
                    },
                    '& .MuiTabs-indicator': {
                      height: 3,
                      borderRadius: 1.5,
                      backgroundColor: 'primary.main',
                    },
                  }}
                >
                  <Tab 
                    icon={<ShowChartRoundedIcon />} 
                    iconPosition="start" 
                    label="Income & Expenses" 
                  />
                  <Tab 
                    icon={<DonutLargeRoundedIcon />} 
                    iconPosition="start" 
                    label="Spending Categories" 
                  />
                  <Tab 
                    icon={<BarChartRoundedIcon />} 
                    iconPosition="start" 
                    label="Expense Breakdown" 
                  />
                </Tabs>
                
                {/* Income & Expenses Tab */}
                {tabValue === 0 && (
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                      overflow: 'hidden'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: { xs: 2, md: 0 } }}>
                          Income vs Expenses
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: 6, bgcolor: '#6993FF', mr: 1 }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>
                              Income:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatCurrency(totals.income)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: 6, bgcolor: '#FF4842', mr: 1 }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>
                              Expenses:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatCurrency(totals.expenses)}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: 6, bgcolor: '#66BB6A', mr: 1 }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>
                              Net:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: totals.netCash >= 0 ? 'success.main' : 'error.main' }}>
                              {formatCurrency(totals.netCash)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box sx={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={chartData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                            barSize={36}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis 
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) => `$${value}`}
                            />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Bar dataKey="income" fill="#6993FF" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenses" fill="#FF4842" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                )}
                
                {/* Spending Categories Tab */}
                {tabValue === 1 && (
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                      overflow: 'hidden'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Spending by Category
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: 400 }}>
                        <Box sx={{ width: { xs: '100%', md: '50%' }, height: '100%' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                activeIndex={activeIndex}
                                activeShape={(props) => {
                                  const RADIAN = Math.PI / 180;
                                  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
                                  const sin = Math.sin(-RADIAN * midAngle);
                                  const cos = Math.cos(-RADIAN * midAngle);
                                  const sx = cx + (outerRadius + 10) * cos;
                                  const sy = cy + (outerRadius + 10) * sin;
                                  const mx = cx + (outerRadius + 30) * cos;
                                  const my = cy + (outerRadius + 30) * sin;
                                  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
                                  const ey = my;
                                  const textAnchor = cos >= 0 ? 'start' : 'end';
                                
                                  return (
                                    <g>
                                      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} fontSize={16} fontWeight={600}>
                                        {payload.name}
                                      </text>
                                      <Sector
                                        cx={cx}
                                        cy={cy}
                                        innerRadius={innerRadius}
                                        outerRadius={outerRadius}
                                        startAngle={startAngle}
                                        endAngle={endAngle}
                                        fill={fill}
                                      />
                                      <Sector
                                        cx={cx}
                                        cy={cy}
                                        startAngle={startAngle}
                                        endAngle={endAngle}
                                        innerRadius={outerRadius + 6}
                                        outerRadius={outerRadius + 10}
                                        fill={fill}
                                      />
                                      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
                                      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
                                      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12}>
                                        {`${formatCurrency(value)}`}
                                      </text>
                                      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" fontSize={12}>
                                        {`(${(percent * 100).toFixed(2)}%)`}
                                      </text>
                                    </g>
                                  );
                                }}
                                data={mockCategories}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                                onMouseEnter={handlePieEnter}
                              >
                                {mockCategories.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                        
                        <Box sx={{ width: { xs: '100%', md: '50%' }, pt: { xs: 3, md: 0 }, pl: { md: 3 } }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                            Top Categories
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {mockCategories.slice(0, 5).map((category, index) => (
                              <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      mr: 2,
                                      bgcolor: `${category.color}20`,
                                      color: category.color
                                    }}
                                  >
                                    {category.icon}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {category.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                      {Math.round(category.value / mockCategories.reduce((sum, cat) => sum + cat.value, 0) * 100)}% of total
                                    </Typography>
                                  </Box>
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {formatCurrency(category.value)}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                )}
                
                {/* Expense Breakdown Tab */}
                {tabValue === 2 && (
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                      overflow: 'hidden'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Expense Breakdown
                      </Typography>
                      
                      <Box sx={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={mockCategories}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 100,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                            <XAxis 
                              type="number"
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) => `$${value}`}
                            />
                            <YAxis 
                              type="category"
                              dataKey="name" 
                              axisLine={false}
                              tickLine={false}
                            />
                            <RechartsTooltip
                              formatter={(value) => [`${formatCurrency(value)}`, 'Amount']}
                            />
                            <Bar 
                              dataKey="value" 
                              barSize={36} 
                              radius={[0, 4, 4, 0]}
                            >
                              {mockCategories.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </Box>
            </Box>
          )}
        </LocalizationProvider>
      </Box>
    </Box>
  );
};

export default Analytics; 