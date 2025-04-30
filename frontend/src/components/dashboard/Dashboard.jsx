import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { getLinkToken, getAccounts } from '../../utils/api';
import { useTheme, useMediaQuery, Box, Typography, CircularProgress, Paper, Grow } from '@mui/material';

// Import components
import SideDrawer from './SideDrawer';
import TopNavigation from './TopNavigation';
import BalanceOverview from './BalanceOverview';
import AccountsSection from './AccountsSection';
import UnlinkAccountDialog from './dialogs/UnlinkAccountDialog';
import ConfirmUnlinkDialog from './dialogs/ConfirmUnlinkDialog';
import TransactionsDialog from './dialogs/TransactionsDialog';

// Import utilities
import { formatCurrency } from '../../utils/formatters';

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
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

  // Calculate total balance
  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, account) => {
      // Ensure current_balance is a valid number before adding
      const balance = account.current_balance ? parseFloat(account.current_balance) : 0;
      return sum + (isNaN(balance) ? 0 : balance);
    }, 0);
  }, [accounts]);

  const handleOpenUnlinkDialog = () => {
    setUnlinkDialogOpen(true);
  };

  const handleCloseUnlinkDialog = () => {
    setUnlinkDialogOpen(false);
  };

  const handleConfirmAllUnlink = () => {
    setConfirmAllUnlinkOpen(true);
  };

  const handleCloseConfirmAllUnlink = () => {
    setConfirmAllUnlinkOpen(false);
  };

  const handleAccountClick = (account) => {
    // Only open transaction details for checking accounts
    if (account.subtype && account.subtype.toLowerCase() === 'checking') {
      setSelectedAccount(account);
      setTransactionsDialogOpen(true);
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
      <SideDrawer 
        drawerOpen={drawerOpen} 
        toggleDrawer={toggleDrawer} 
        isMobile={isMobile}
        handleLogout={handleLogout}
      />

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
        <TopNavigation 
          handleMenu={handleMenu} 
          anchorEl={anchorEl} 
          handleClose={handleClose} 
          handleLogout={handleLogout} 
        />

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
                <Box>
                  <BalanceOverview 
                    totalBalance={totalBalance} 
                    accounts={accounts} 
                    formatCurrency={formatCurrency}
                    transactionData={transactions}
                  />
                </Box>
              </Grow>
            </Box>

            <AccountsSection 
              accounts={accounts}
              handleOpenPlaidLink={handleOpenPlaidLink}
              linkToken={linkToken}
              handleOpenUnlinkDialog={handleOpenUnlinkDialog}
              handleAccountClick={handleAccountClick}
              formatCurrency={formatCurrency}
            />
          </Box>
        )}
      </Box>

      {/* Dialogs */}
      <UnlinkAccountDialog 
        open={unlinkDialogOpen}
        onClose={handleCloseUnlinkDialog}
        accounts={accounts}
        unlinkingAccount={unlinkingAccount}
        setUnlinkingAccount={setUnlinkingAccount}
        handleConfirmAllUnlink={handleConfirmAllUnlink}
        loadAccountData={loadAccountData}
        formatCurrency={formatCurrency}
      />

      <ConfirmUnlinkDialog 
        open={confirmAllUnlinkOpen}
        onClose={handleCloseConfirmAllUnlink}
        setUnlinkingAccount={setUnlinkingAccount}
        handleCloseUnlinkDialog={handleCloseUnlinkDialog}
        loadAccountData={loadAccountData}
      />

      {selectedAccount && (
        <TransactionsDialog 
          open={transactionsDialogOpen}
          onClose={handleCloseTransactionsDialog}
          account={selectedAccount}
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          transactions={transactions}
          setTransactions={setTransactions}
          loadingTransactions={loadingTransactions}
          setLoadingTransactions={setLoadingTransactions}
          transactionError={transactionError}
          setTransactionError={setTransactionError}
          formatCurrency={formatCurrency}
        />
      )}
    </Box>
  );
};

export default Dashboard;