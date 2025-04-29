import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getLinkToken, getAccounts, unlinkAccount, unlinkAllAccounts } from '../utils/api';
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
  Tooltip
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [unlinkingAccount, setUnlinkingAccount] = useState(false);
  const [confirmAllUnlinkOpen, setConfirmAllUnlinkOpen] = useState(false);
  
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

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Finance Tracker
          </Typography>
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
      
      <Container maxWidth="md" sx={{ mt: 4, pb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
          {accounts.length > 0 && (
            <Button 
              variant="outlined" 
              color="secondary"
              startIcon={<LinkOffIcon />}
              onClick={handleOpenUnlinkDialog}
            >
              Manage Accounts
            </Button>
          )}
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        ) : (
          <>
            {accounts.length > 0 ? (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Your Accounts
                </Typography>
                
                <Grid container spacing={3}>
                  {accounts.map((account) => (
                    <Grid item xs={12} md={6} key={account.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                              <AccountBalanceIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6">{account.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {account.institution_name}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ my: 1.5 }} />
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              {account.type} {account.subtype ? `• ${account.subtype}` : ''}
                            </Typography>
                            <Typography variant="h6" className="currency">
                              {formatCurrency(account.current_balance)}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleOpenPlaidLink}
                    disabled={!linkToken}
                  >
                    Connect Another Account
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body1" gutterBottom>
                  Connect your bank account to get started tracking your finances.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  sx={{ mt: 2 }}
                  onClick={handleOpenPlaidLink}
                  disabled={!linkToken}
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
        >
          <DialogTitle id="unlink-dialog-title">Manage Linked Accounts</DialogTitle>
          <DialogContent>
            {unlinkingAccount ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <List>
                  {accounts.map((account) => (
                    <ListItem key={account.id} divider>
                      <ListItemText 
                        primary={account.name} 
                        secondary={`${account.institution_name} • ${account.type} • ${formatCurrency(account.current_balance)}`}
                      />
                      <ListItemSecondaryAction>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small"
                          onClick={() => handleUnlinkAccount(account.id)}
                          startIcon={<LinkOffIcon />}
                        >
                          Unlink
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
                {accounts.length > 0 && (
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Tooltip title="Remove all linked bank accounts">
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteSweepIcon />}
                        onClick={handleConfirmAllUnlink}
                      >
                        Remove All Links
                      </Button>
                    </Tooltip>
                  </Box>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUnlinkDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Remove All Dialog */}
        <Dialog
          open={confirmAllUnlinkOpen}
          onClose={handleCloseConfirmAllUnlink}
          aria-labelledby="confirm-dialog-title"
        >
          <DialogTitle id="confirm-dialog-title">Remove All Linked Accounts?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to remove all linked bank accounts? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseConfirmAllUnlink} color="primary">
              Cancel
            </Button>
            <Button onClick={handleUnlinkAllAccounts} color="error" variant="contained">
              Remove All
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default Dashboard; 