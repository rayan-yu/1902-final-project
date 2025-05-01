import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAccounts, getTransactions, getMockTransactions } from '../utils/api';

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
  TextField,
  MenuItem,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  useMediaQuery,
  Avatar,
  Badge,
  Tooltip,
  Drawer,
  List,
  ListItem,
  Fade,
  Switch,
  FormControlLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// Icons
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import DateRangeRoundedIcon from '@mui/icons-material/DateRangeRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import LocalGasStationRoundedIcon from '@mui/icons-material/LocalGasStationRounded';
import LocalAtmRoundedIcon from '@mui/icons-material/LocalAtmRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import FlightRoundedIcon from '@mui/icons-material/FlightRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

// Color constants
const COLORS = {
  primary: '#6993FF',
  secondary: '#6667AB',
  success: '#66BB6A',
  error: '#FF4842',
  info: '#37C7FF',
  warning: '#FFC107',
};

// Get category icon
const getCategoryIcon = (category) => {
  const categoryMap = {
    'Food & Drink': <RestaurantRoundedIcon />,
    'Shopping': <ShoppingCartRoundedIcon />,
    'Housing': <HomeRoundedIcon />,
    'Transportation': <LocalGasStationRoundedIcon />,
    'Income': <LocalAtmRoundedIcon />,
    'Healthcare': <LocalHospitalRoundedIcon />,
    'Travel': <FlightRoundedIcon />,
    'Groceries': <ShoppingCartRoundedIcon />,
    'Entertainment': <CategoryRoundedIcon />,
  };
  
  return categoryMap[category] || <CategoryRoundedIcon />;
};

// Get category color
const getCategoryColor = (category) => {
  const categoryMap = {
    'Food & Drink': '#FF7F50',
    'Shopping': '#6993FF',
    'Housing': '#9C27B0',
    'Transportation': '#4CAF50',
    'Income': '#66BB6A',
    'Healthcare': '#F44336',
    'Travel': '#FF9800',
    'Groceries': '#795548',
    'Entertainment': '#FF5722',
  };
  
  return categoryMap[category] || '#6993FF';
};

const Transactions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Extract account ID from URL query params if present
  const queryParams = new URLSearchParams(location.search);
  const accountIdFromUrl = queryParams.get('account');
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  
  // State
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(accountIdFromUrl || 'all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [useMockData, setUseMockData] = useState(true);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Load accounts data
  useEffect(() => {
    const loadAccountsData = async () => {
      try {
        const accountsData = await getAccounts();
        setAccounts(accountsData);
      } catch (err) {
        console.error('Error loading accounts data:', err);
      }
    };

    loadAccountsData();
  }, []);
  
  // Load transactions data with initial account filter if provided
  useEffect(() => {
    loadTransactionsData();
  }, [selectedAccount, useMockData]);

  // Function to load transactions - either mock or real
  const loadTransactionsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (useMockData) {
        // Load mock transactions
        let transactionData;
        
        if (selectedAccount && selectedAccount !== 'all') {
          transactionData = await getMockTransactions(selectedAccount);
        } else {
          transactionData = await getMockTransactions();
        }
        
        setTransactions(transactionData || []);
      } else {
        // Load real transactions
        // Get transactions for the past 24 months
        const today = new Date();
        const startDate = new Date();
        startDate.setMonth(today.getMonth() - 24);
        
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = today.toISOString().split('T')[0];
        
        const filters = {
          start_date: formattedStartDate,
          end_date: formattedEndDate
        };
        
        if (selectedAccount && selectedAccount !== 'all') {
          filters.account_id = selectedAccount;
        }
        
        const transactionData = await getTransactions(filters);
        setTransactions(transactionData || []);
      }
    } catch (err) {
      console.error('Error loading transactions data:', err);
      setError('Failed to load transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle mock data
  const handleToggleMockData = () => {
    setUseMockData(!useMockData);
    // When toggling, reset pagination and clear any errors
    setPage(0);
    setError(null);
  };
  
  // Filter transactions based on search and filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Search text filter
      if (searchText && !transaction.name.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (categoryFilter && categoryFilter !== 'all' && transaction.category !== categoryFilter) {
        return false;
      }
      
      // Date range filter
      if (startDate && new Date(transaction.date) < startDate) {
        return false;
      }
      if (endDate && new Date(transaction.date) > endDate) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by selected field
      if (sortBy === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'amount') {
        return sortDirection === 'asc' 
          ? a.amount - b.amount 
          : b.amount - a.amount;
      } else {
        // Sort by name
        return sortDirection === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
    });
  }, [transactions, searchText, categoryFilter, startDate, endDate, sortBy, sortDirection]);
  
  // Handle search change
  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };
  
  // Handle account filter change
  const handleAccountChange = (event) => {
    setSelectedAccount(event.target.value);
    // Reset pagination when changing filters
    setPage(0);
  };
  
  // Handle category filter change
  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
    setPage(0);
  };
  
  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle transaction details
  const handleShowTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailsDialogOpen(true);
  };
  
  // Close details dialog
  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
  };
  
  // Get all unique categories from transactions
  const uniqueCategories = useMemo(() => {
    const categories = new Set(transactions.map(t => t.category));
    return Array.from(categories);
  }, [transactions]);

  // Toggle drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
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
                ...(item.text === 'Transactions' && {
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
                  color: item.text === 'Transactions' ? 'primary.main' : 'text.secondary'
                }}>
                  {item.icon}
                </Box>
                {drawerOpen && (
                  <Fade in={drawerOpen}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        ml: 1.5, 
                        fontWeight: item.text === 'Transactions' ? 600 : 500,
                        color: item.text === 'Transactions' ? 'primary.main' : 'text.secondary'
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
  
  return (
    <Box
      className="transactions-container"
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
                Transactions
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary', 
                  mb: isSmall ? 2 : 0 
                }}
              >
                Track and analyze your financial activity
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={useMockData}
                    onChange={handleToggleMockData}
                    color="primary"
                  />
                }
                label="Use Mock Data"
                sx={{ mr: 2 }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterListRoundedIcon />}
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
                Export
              </Button>
              
              <Button
                variant="contained"
                startIcon={<SortRoundedIcon />}
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
                Group By
              </Button>
            </Box>
          </Box>

          {/* Filters */}
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              mb: 3
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search transactions..."
                    value={searchText}
                    onChange={handleSearchChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      sx: {
                        borderRadius: 2,
                        backgroundColor: 'rgba(0, 0, 0, 0.02)'
                      }
                    }}
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
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
                      {accounts && accounts.map((account) => (
                        <MenuItem key={account.id} value={account.id}>
                          {account.name} ({formatCurrency(account.current_balance)})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="category-select-label">Category</InputLabel>
                    <Select
                      labelId="category-select-label"
                      value={categoryFilter}
                      onChange={handleCategoryChange}
                      label="Category"
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="all">All Categories</MenuItem>
                      {uniqueCategories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
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
                
                <Grid item xs={12} sm={6} md={2}>
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
              </Grid>
            </CardContent>
          </Card>

          {/* Transactions Table */}
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
          ) : filteredTransactions.length === 0 ? (
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 3,
                border: '1px dashed #CBD5E1',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                my: 4
              }}
            >
              <SwapHorizRoundedIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, color: '#334155' }}>
                No Transactions Found
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, color: '#64748B', maxWidth: 450, mx: 'auto' }}>
                Try adjusting your filters or search criteria to see more results
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchText('');
                  setCategoryFilter('all');
                  setStartDate(null);
                  setEndDate(null);
                }}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  borderColor: 'rgba(105, 147, 255, 0.5)',
                  color: 'primary.main',
                }}
              >
                Clear Filters
              </Button>
            </Paper>
          ) : (
            <Paper
              sx={{
                width: '100%',
                overflow: 'hidden',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              }}
            >
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell 
                        onClick={() => handleSortChange('date')} 
                        sx={{ 
                          cursor: 'pointer',
                          fontWeight: 600,
                          color: sortBy === 'date' ? 'primary.main' : 'text.secondary',
                          px: 3,
                          py: 2
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          Date
                          {sortBy === 'date' && (
                            <Box sx={{ ml: 0.5 }}>
                              {sortDirection === 'asc' ? 
                                <ArrowUpwardRoundedIcon fontSize="small" /> : 
                                <ArrowDownwardRoundedIcon fontSize="small" />
                              }
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell 
                        onClick={() => handleSortChange('name')} 
                        sx={{ 
                          cursor: 'pointer',
                          fontWeight: 600,
                          color: sortBy === 'name' ? 'primary.main' : 'text.secondary',
                          py: 2
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          Description
                          {sortBy === 'name' && (
                            <Box sx={{ ml: 0.5 }}>
                              {sortDirection === 'asc' ? 
                                <ArrowUpwardRoundedIcon fontSize="small" /> : 
                                <ArrowDownwardRoundedIcon fontSize="small" />
                              }
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.secondary', py: 2 }}>
                        Category
                      </TableCell>
                      <TableCell 
                        onClick={() => handleSortChange('amount')} 
                        align="right" 
                        sx={{ 
                          cursor: 'pointer',
                          fontWeight: 600,
                          color: sortBy === 'amount' ? 'primary.main' : 'text.secondary',
                          pr: 3,
                          py: 2
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          Amount
                          {sortBy === 'amount' && (
                            <Box sx={{ ml: 0.5 }}>
                              {sortDirection === 'asc' ? 
                                <ArrowUpwardRoundedIcon fontSize="small" /> : 
                                <ArrowDownwardRoundedIcon fontSize="small" />
                              }
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', py: 2, pr: 3 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTransactions
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        hover
                        sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'rgba(105, 147, 255, 0.04)',
                          }
                        }}
                        onClick={() => handleShowTransactionDetails(transaction)}
                      >
                        <TableCell sx={{ px: 3, py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Badge
                              variant="dot"
                              color={transaction.amount > 0 ? "success" : "error"}
                              sx={{ mr: 1.5 }}
                            >
                              <DateRangeRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            </Badge>
                            <Typography variant="body2">
                              {formatDate(transaction.date)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {transaction.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {transaction.account_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            icon={
                              <Avatar 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  bgcolor: `${getCategoryColor(transaction.category)}20`,
                                  color: getCategoryColor(transaction.category)
                                }}
                              >
                                {getCategoryIcon(transaction.category)}
                              </Avatar>
                            }
                            label={transaction.category}
                            variant="outlined"
                            sx={{
                              px: 0.5,
                              borderColor: `${getCategoryColor(transaction.category)}30`,
                              color: 'text.primary',
                              '& .MuiChip-icon': {
                                color: getCategoryColor(transaction.category),
                                ml: 0.5,
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell 
                          align="right" 
                          sx={{ 
                            fontWeight: 600,
                            color: transaction.amount > 0 ? 'success.main' : 'text.primary',
                            pr: 3,
                            py: 2
                          }}
                        >
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 3, py: 2 }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              sx={{ 
                                color: 'text.secondary',
                                bgcolor: 'rgba(0, 0, 0, 0.03)',
                                '&:hover': {
                                  bgcolor: 'rgba(0, 0, 0, 0.05)'
                                }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShowTransactionDetails(transaction);
                              }}
                            >
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredTransactions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                  '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                    color: 'text.secondary',
                  }
                }}
              />
            </Paper>
          )}
          
          {/* Transaction Detail Dialog */}
          <Dialog 
            open={detailsDialogOpen} 
            onClose={handleCloseDetailsDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            {selectedTransaction && (
              <>
                <DialogTitle sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Transaction Details
                    </Typography>
                    <IconButton 
                      edge="end" 
                      color="inherit" 
                      onClick={handleCloseDetailsDialog} 
                      aria-label="close"
                    >
                      <CloseRoundedIcon />
                    </IconButton>
                  </Box>
                </DialogTitle>
                <DialogContent dividers sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        sx={{ 
                          bgcolor: selectedTransaction.amount > 0 ? 'rgba(102, 187, 106, 0.1)' : 'rgba(255, 72, 66, 0.1)',
                          width: 48,
                          height: 48,
                          mr: 2
                        }}
                      >
                        {selectedTransaction.amount > 0 ? 
                          <ArrowUpwardRoundedIcon sx={{ color: 'success.main' }} /> : 
                          <ArrowDownwardRoundedIcon sx={{ color: 'error.main' }} />
                        }
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {selectedTransaction.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(selectedTransaction.date)}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        color: selectedTransaction.amount > 0 ? 'success.main' : 'error.main'
                      }}
                    >
                      {formatCurrency(selectedTransaction.amount)}
                    </Typography>
                  </Box>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Category
                      </Typography>
                      <Chip
                        icon={
                          <Avatar 
                            sx={{ 
                              width: 24, 
                              height: 24, 
                              bgcolor: `${getCategoryColor(selectedTransaction.category)}20`,
                              color: getCategoryColor(selectedTransaction.category)
                            }}
                          >
                            {getCategoryIcon(selectedTransaction.category)}
                          </Avatar>
                        }
                        label={selectedTransaction.category}
                        variant="outlined"
                        sx={{
                          mt: 0.5,
                          px: 0.5,
                          borderColor: `${getCategoryColor(selectedTransaction.category)}30`,
                          color: 'text.primary',
                          '& .MuiChip-icon': {
                            color: getCategoryColor(selectedTransaction.category),
                            ml: 0.5,
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Account
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                        <AccountBalanceRoundedIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                        {selectedTransaction.account_name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Payment Method
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500, textTransform: 'capitalize' }}>
                        {selectedTransaction.payment_channel}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                        <PlaceRoundedIcon sx={{ fontSize: 18, mr: 1, color: 'error.light' }} />
                        {selectedTransaction.location}
                      </Typography>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                  <Button 
                    onClick={handleCloseDetailsDialog}
                    sx={{ 
                      borderRadius: 2, 
                      textTransform: 'none',
                      color: 'text.primary'
                    }}
                  >
                    Close
                  </Button>
                  <Button 
                    variant="contained"
                    sx={{ 
                      borderRadius: 2, 
                      textTransform: 'none',
                      boxShadow: 'none',
                      background: 'linear-gradient(135deg, #6993FF, #6667AB)',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(105, 147, 255, 0.3)',
                      }
                    }}
                  >
                    Edit Category
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </LocalizationProvider>
      </Box>
    </Box>
  );
};

export default Transactions; 