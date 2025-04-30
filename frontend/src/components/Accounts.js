import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAccounts } from '../utils/api';

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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Fade,
  Drawer,
  List,
  ListItem
} from '@mui/material';

// Icons
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

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

const Accounts = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  
  // State
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hideBalances, setHideBalances] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Toggle drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Load accounts data
  useEffect(() => {
    const loadAccountsData = async () => {
      try {
        const accountsData = await getAccounts();
        setAccounts(accountsData);
        setLoading(false);
      } catch (err) {
        console.error('Error loading accounts data:', err);
        setError('Failed to load accounts. Please try again later.');
        setLoading(false);
      }
    };

    loadAccountsData();
  }, []);

  // Handle showing account details
  const handleShowAccountDetails = (account) => {
    setSelectedAccount(account);
    setDetailsDialogOpen(true);
  };

  // Close details dialog
  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
  };

  // Toggle balance visibility
  const toggleBalancesVisibility = () => {
    setHideBalances(!hideBalances);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
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
                ...(item.text === 'Accounts' && {
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
                  color: item.text === 'Accounts' ? 'primary.main' : 'text.secondary'
                }}>
                  {item.icon}
                </Box>
                {drawerOpen && (
                  <Fade in={drawerOpen}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        ml: 1.5, 
                        fontWeight: item.text === 'Accounts' ? 600 : 500,
                        color: item.text === 'Accounts' ? 'primary.main' : 'text.secondary'
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
      className="accounts-container"
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
              Your Accounts
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary', 
                mb: isSmall ? 2 : 0 
              }}
            >
              Manage and monitor all your linked financial accounts
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={toggleBalancesVisibility}
              startIcon={hideBalances ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                borderColor: 'rgba(105, 147, 255, 0.5)',
                color: 'primary.main',
                px: 2
              }}
            >
              {hideBalances ? 'Show Balances' : 'Hide Balances'}
            </Button>
            
            <Button
              variant="contained"
              startIcon={<AddCircleRoundedIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(105, 147, 255, 0.2)',
                background: 'linear-gradient(135deg, #6993FF, #6667AB)',
                px: 2,
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(105, 147, 255, 0.3)',
                }
              }}
            >
              Link New Account
            </Button>
          </Box>
        </Box>

        {/* Account Cards */}
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
        ) : accounts.length === 0 ? (
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
            <AccountBalanceRoundedIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, color: '#334155' }}>
              No Accounts Linked Yet
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#64748B', maxWidth: 450, mx: 'auto' }}>
              Link your bank accounts to get started with tracking your finances and managing your money
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddCircleRoundedIcon />}
              sx={{
                borderRadius: 10,
                px: 3,
                py: 1,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #6993FF, #6667AB)',
                boxShadow: '0 4px 12px rgba(105, 147, 255, 0.2)',
              }}
            >
              Link Your First Account
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {accounts.map((account) => {
              const gradient = getGradientByName(account.name || account.official_name || 'Account');
              return (
                <Grid item xs={12} sm={6} md={4} key={account.id}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'visible',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                      background: 'white',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                      }
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: '12px 12px 0 0',
                        height: 12,
                        background: gradient.border,
                      }}
                    />
                    <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar
                            sx={{
                              bgcolor: gradient.icon,
                              width: 42,
                              height: 42,
                              mr: 2,
                              color: 'white'
                            }}
                          >
                            <AccountBalanceWalletRoundedIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {account.name || account.official_name || 'Account'}
                            </Typography>
                            <Chip 
                              label={account.type?.toUpperCase() || 'BANK'} 
                              size="small" 
                              sx={{ 
                                borderRadius: 1, 
                                backgroundColor: 'rgba(105, 147, 255, 0.1)',
                                color: 'primary.main',
                                fontWeight: 600,
                                fontSize: '0.7rem'
                              }} 
                            />
                          </Box>
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={() => handleShowAccountDetails(account)}
                          sx={{ 
                            color: 'text.secondary',
                            bgcolor: 'rgba(0, 0, 0, 0.03)',
                            '&:hover': {
                              bgcolor: 'rgba(0, 0, 0, 0.05)'
                            }
                          }}
                        >
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ mt: 'auto' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Current Balance
                        </Typography>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 600, 
                            color: account.current_balance < 0 ? 'error.main' : 'text.primary'
                          }}
                        >
                          {hideBalances ? '••••••' : formatCurrency(account.current_balance || 0)}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              borderColor: 'rgba(105, 147, 255, 0.3)',
                              color: 'primary.main',
                              '&:hover': {
                                borderColor: 'primary.main',
                                backgroundColor: 'rgba(105, 147, 255, 0.04)'
                              }
                            }}
                            onClick={() => navigate(`/transactions?account=${account.id}`)}
                          >
                            View Transactions
                          </Button>
                          
                          <Button
                            variant="text"
                            size="small"
                            startIcon={<LinkOffRoundedIcon fontSize="small" />}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              color: 'text.secondary',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 72, 66, 0.04)',
                                color: 'error.main'
                              }
                            }}
                          >
                            Unlink
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {/* Account Details Dialog */}
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
          {selectedAccount && (
            <>
              <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Account Details
                </Typography>
              </DialogTitle>
              <DialogContent sx={{ pb: 3 }}>
                <Box sx={{ mb: 2, mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Account Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedAccount.name || selectedAccount.official_name || 'Account'}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                      {selectedAccount.type || 'Unknown'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Subtype
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, textTransform: 'capitalize' }}>
                      {selectedAccount.subtype || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Institution
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedAccount.institution || 'Unknown Bank'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Account Number
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      •••• {selectedAccount.mask || '1234'}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Current Balance
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600, 
                      color: selectedAccount.current_balance < 0 ? 'error.main' : 'success.main' 
                    }}
                  >
                    {hideBalances ? '••••••' : formatCurrency(selectedAccount.current_balance || 0)}
                  </Typography>
                </Box>
                
                {selectedAccount.available_balance !== undefined && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Available Balance
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {hideBalances ? '••••••' : formatCurrency(selectedAccount.available_balance || 0)}
                    </Typography>
                  </Box>
                )}
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
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
                  onClick={() => {
                    handleCloseDetailsDialog();
                    navigate(`/transactions?account=${selectedAccount.id}`);
                  }}
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
                  View Transactions
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Box>
  );
};

export default Accounts; 