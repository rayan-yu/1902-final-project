import React, { useState, useEffect } from 'react';
import { getAccounts } from '../utils/api';
import { useNavigate } from 'react-router-dom';

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
  TextField,
  Switch,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Tooltip,
  Drawer,
  Fade
} from '@mui/material';

// Icons
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import LocalAtmRoundedIcon from '@mui/icons-material/LocalAtmRounded';
import SyncAltRoundedIcon from '@mui/icons-material/SyncAltRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

// Mock credit card data
const mockCards = [
  {
    id: '1',
    name: 'Chase Sapphire Preferred',
    number: '•••• •••• •••• 4567',
    expiry: '12/26',
    cvv: '•••',
    type: 'Visa',
    color: '#1e4d8c',
    balance: 2456.78,
    limit: 8000,
    status: 'active',
    rewards: {
      points: 3456,
      cashback: 0
    }
  },
  {
    id: '2',
    name: 'American Express Gold',
    number: '•••• •••••• •5678',
    expiry: '09/25',
    cvv: '••••',
    type: 'Amex',
    color: '#e5c590',
    balance: 1845.33,
    limit: 10000,
    status: 'active',
    rewards: {
      points: 12450,
      cashback: 0
    }
  },
  {
    id: '3',
    name: 'Citi Double Cash',
    number: '•••• •••• •••• 3456',
    expiry: '03/27',
    cvv: '•••',
    type: 'Mastercard',
    color: '#4c7fbe',
    balance: 567.99,
    limit: 5000,
    status: 'locked',
    rewards: {
      points: 0,
      cashback: 234.50
    }
  }
];

// Get card brand icon
const getCardIcon = (type) => {
  switch (type.toLowerCase()) {
    case 'visa':
      return '💳';
    case 'mastercard':
      return '💳';
    case 'amex':
      return '💳';
    default:
      return '💳';
  }
};

const Cards = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  
  // State
  const [cards, setCards] = useState(mockCards);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hideCardDetails, setHideCardDetails] = useState(true);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [addCardDialogOpen, setAddCardDialogOpen] = useState(false);
  
  // Toggle drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Load cards data
  useEffect(() => {
    const loadCardsData = async () => {
      try {
        // In a real implementation, this would fetch from API
        // For the mock, we'll simulate API delay
        setTimeout(() => {
          setCards(mockCards);
          setLoading(false);
        }, 800);
      } catch (err) {
        console.error('Error loading cards data:', err);
        setError('Failed to load cards. Please try again later.');
        setLoading(false);
      }
    };

    loadCardsData();
  }, []);
  
  // Handle toggle card details visibility
  const toggleCardDetails = () => {
    setHideCardDetails(!hideCardDetails);
  };
  
  // Handle card click
  const handleCardClick = (card) => {
    setSelectedCard(card);
    setCardDialogOpen(true);
  };
  
  // Close card dialog
  const handleCloseCardDialog = () => {
    setCardDialogOpen(false);
  };
  
  // Open add card dialog
  const handleOpenAddCardDialog = () => {
    setAddCardDialogOpen(true);
  };
  
  // Close add card dialog
  const handleCloseAddCardDialog = () => {
    setAddCardDialogOpen(false);
  };
  
  // Toggle card lock status
  const handleToggleCardLock = (cardId) => {
    setCards(cards.map(card => 
      card.id === cardId 
        ? { ...card, status: card.status === 'active' ? 'locked' : 'active' } 
        : card
    ));
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
                ...(item.text === 'Cards' && {
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
                  color: item.text === 'Cards' ? 'primary.main' : 'text.secondary'
                }}>
                  {item.icon}
                </Box>
                {drawerOpen && (
                  <Fade in={drawerOpen}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        ml: 1.5, 
                        fontWeight: item.text === 'Cards' ? 600 : 500,
                        color: item.text === 'Cards' ? 'primary.main' : 'text.secondary'
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
      className="cards-container"
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
              Cards
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary', 
                mb: isSmall ? 2 : 0 
              }}
            >
              Manage your credit and debit cards
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={toggleCardDetails}
              startIcon={hideCardDetails ? <VisibilityOutlinedIcon /> : <VisibilityOffOutlinedIcon />}
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
              {hideCardDetails ? 'Show Details' : 'Hide Details'}
            </Button>
            
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={handleOpenAddCardDialog}
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
              Add New Card
            </Button>
          </Box>
        </Box>

        {/* Cards Grid */}
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
        ) : cards.length === 0 ? (
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
            <CreditCardRoundedIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, color: '#334155' }}>
              No Cards Added Yet
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: '#64748B', maxWidth: 450, mx: 'auto' }}>
              Add your credit and debit cards to track spending, monitor balances, and manage your accounts
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={handleOpenAddCardDialog}
              sx={{
                borderRadius: 10,
                px: 3,
                py: 1,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #6993FF, #6667AB)',
                boxShadow: '0 4px 12px rgba(105, 147, 255, 0.2)',
              }}
            >
              Add Your First Card
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {cards.map((card) => (
              <Grid item xs={12} sm={6} md={4} key={card.id}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    background: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
                    }
                  }}
                  onClick={() => handleCardClick(card)}
                >
                  {/* Card badge for locked status */}
                  {card.status === 'locked' && (
                    <Chip
                      icon={<LockRoundedIcon />}
                      label="Locked"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        zIndex: 2,
                        bgcolor: 'rgba(255, 72, 66, 0.1)',
                        color: 'error.main',
                        fontWeight: 600,
                        borderRadius: 1,
                        '& .MuiChip-icon': {
                          color: 'error.main',
                        }
                      }}
                    />
                  )}
                  
                  {/* Credit Card Design */}
                  <Box
                    sx={{
                      p: 3,
                      pt: 4,
                      pb: 4,
                      backgroundImage: `linear-gradient(135deg, ${card.color}, ${card.color}DD)`,
                      color: 'white',
                      borderRadius: '12px',
                      mx: 2,
                      mt: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: -150,
                        right: -50,
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -150,
                        left: -50,
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, position: 'relative', zIndex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {card.name}
                      </Typography>
                      <Box sx={{ fontSize: '24px' }}>
                        {getCardIcon(card.type)}
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" sx={{ mb: 1, opacity: 0.9, fontWeight: 500, position: 'relative', zIndex: 1 }}>
                      Card Number
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 3, letterSpacing: 1, fontWeight: 600, position: 'relative', zIndex: 1 }}>
                      {card.number}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          Expiry
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {hideCardDetails ? '••/••' : card.expiry}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          CVV
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {card.cvv}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          Type
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                          {card.type}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  {/* Card details */}
                  <CardContent sx={{ p: 3, pt: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Current Balance
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {formatCurrency(card.balance)}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(card.balance / card.limit) * 100} 
                        sx={{ 
                          mt: 1, 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: 'rgba(0, 0, 0, 0.05)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            backgroundImage: `linear-gradient(90deg, ${card.color}99, ${card.color})`,
                          }
                        }} 
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {formatCurrency(card.balance)} of {formatCurrency(card.limit)} limit used
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Rewards
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {card.rewards.points > 0 
                            ? `${card.rewards.points.toLocaleString()} pts` 
                            : `$${card.rewards.cashback.toFixed(2)}`
                          }
                        </Typography>
                      </Box>
                      
                      <Tooltip title={card.status === 'active' ? 'Lock Card' : 'Unlock Card'}>
                        <IconButton 
                          size="small" 
                          color={card.status === 'active' ? 'primary' : 'error'} 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCardLock(card.id);
                          }}
                          sx={{ 
                            bgcolor: card.status === 'active' 
                              ? 'rgba(105, 147, 255, 0.1)' 
                              : 'rgba(255, 72, 66, 0.1)',
                          }}
                        >
                          {card.status === 'active' 
                            ? <LockOpenRoundedIcon fontSize="small" /> 
                            : <LockRoundedIcon fontSize="small" />
                          }
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        
        {/* Card Details Dialog */}
        <Dialog 
          open={cardDialogOpen} 
          onClose={handleCloseCardDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          {selectedCard && (
            <>
              <DialogTitle sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Card Details
                  </Typography>
                  <IconButton 
                    edge="end" 
                    color="inherit" 
                    onClick={handleCloseCardDialog} 
                    aria-label="close"
                  >
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ p: 0 }}>
                {/* Credit Card Design - Large version */}
                <Box
                  sx={{
                    p: 4,
                    backgroundColor: selectedCard.color,
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -100,
                      right: -50,
                      width: 300,
                      height: 300,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -100,
                      left: -50,
                      width: 300,
                      height: 300,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, position: 'relative', zIndex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedCard.name}
                    </Typography>
                    <Box sx={{ fontSize: '28px' }}>
                      {getCardIcon(selectedCard.type)}
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 1, opacity: 0.9, position: 'relative', zIndex: 1 }}>
                    Card Number
                  </Typography>
                  <Typography variant="h5" sx={{ mb: 3, letterSpacing: 1, fontWeight: 600, position: 'relative', zIndex: 1 }}>
                    {selectedCard.number}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Expiry
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {hideCardDetails ? '••/••' : selectedCard.expiry}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        CVV
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedCard.cvv}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Type
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                        {selectedCard.type}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {selectedCard.status === 'locked' && (
                    <Alert 
                      severity="error" 
                      icon={<LockRoundedIcon />}
                      sx={{ 
                        mt: 3, 
                        backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                        color: 'white',
                        '& .MuiAlert-icon': {
                          color: 'white'
                        }
                      }}
                    >
                      This card is currently locked for security
                    </Alert>
                  )}
                </Box>
                
                <Box sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Current Balance
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                          {formatCurrency(selectedCard.balance)}
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={(selectedCard.balance / selectedCard.limit) * 100} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              backgroundImage: `linear-gradient(90deg, ${selectedCard.color}99, ${selectedCard.color})`,
                            }
                          }} 
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {((selectedCard.balance / selectedCard.limit) * 100).toFixed(0)}% used
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Limit: {formatCurrency(selectedCard.limit)}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Rewards Balance
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                          {selectedCard.rewards.points > 0 
                            ? `${selectedCard.rewards.points.toLocaleString()} pts` 
                            : `$${selectedCard.rewards.cashback.toFixed(2)}`
                          }
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ 
                            borderRadius: 2, 
                            textTransform: 'none',
                            borderColor: `${selectedCard.color}50`,
                            color: selectedCard.color,
                            '&:hover': {
                              borderColor: selectedCard.color,
                              backgroundColor: `${selectedCard.color}10`,
                            },
                            mr: 1
                          }}
                        >
                          Redeem Rewards
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  {/* Card actions */}
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Card Actions
                  </Typography>
                  <List disablePadding>
                    <ListItem 
                      sx={{ 
                        py: 1, 
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.03)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                        <ReceiptRoundedIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="View Statements" 
                        primaryTypographyProps={{ fontWeight: 500 }}
                        secondary="Access your monthly statements"
                      />
                      <ArrowForwardRoundedIcon sx={{ color: 'text.secondary' }} />
                    </ListItem>
                    
                    <ListItem 
                      sx={{ 
                        py: 1, 
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.03)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                        <LocalAtmRoundedIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Make a Payment" 
                        primaryTypographyProps={{ fontWeight: 500 }}
                        secondary="Pay your card balance"
                      />
                      <ArrowForwardRoundedIcon sx={{ color: 'text.secondary' }} />
                    </ListItem>
                    
                    <ListItem 
                      sx={{ 
                        py: 1, 
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.03)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                        <SecurityRoundedIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Security Settings" 
                        primaryTypographyProps={{ fontWeight: 500 }}
                        secondary="Manage card security options"
                      />
                      <ArrowForwardRoundedIcon sx={{ color: 'text.secondary' }} />
                    </ListItem>
                    
                    <ListItem 
                      sx={{ 
                        py: 1, 
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.03)',
                        }
                      }}
                    >
                      <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                        <SyncAltRoundedIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Transaction History" 
                        primaryTypographyProps={{ fontWeight: 500 }}
                        secondary="View recent transactions"
                      />
                      <ArrowForwardRoundedIcon sx={{ color: 'text.secondary' }} />
                    </ListItem>
                  </List>
                </Box>
              </DialogContent>
              <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button 
                  onClick={handleCloseCardDialog}
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
                  onClick={() => handleToggleCardLock(selectedCard.id)}
                  color={selectedCard.status === 'locked' ? 'success' : 'error'}
                  startIcon={selectedCard.status === 'locked' ? <LockOpenRoundedIcon /> : <LockRoundedIcon />}
                  sx={{ 
                    borderRadius: 2, 
                    textTransform: 'none',
                  }}
                >
                  {selectedCard.status === 'locked' ? 'Unlock Card' : 'Lock Card'}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
        
        {/* Add New Card Dialog - Simplified */}
        <Dialog 
          open={addCardDialogOpen} 
          onClose={handleCloseAddCardDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          <DialogTitle sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Add New Card
              </Typography>
              <IconButton 
                edge="end" 
                color="inherit" 
                onClick={handleCloseAddCardDialog} 
                aria-label="close"
              >
                <CloseRoundedIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Alert 
              severity="info" 
              sx={{ mb: 3 }}
            >
              This is a mock interface. In a real application, this would connect to a payment processor API.
            </Alert>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Cardholder Name"
                  fullWidth
                  variant="outlined"
                  placeholder="As it appears on the card"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Card Number"
                  fullWidth
                  variant="outlined"
                  placeholder="1234 5678 9012 3456"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Expiry Date"
                  fullWidth
                  variant="outlined"
                  placeholder="MM/YY"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="CVV"
                  fullWidth
                  variant="outlined"
                  placeholder="123"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Set as default payment method"
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={handleCloseAddCardDialog}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                color: 'text.primary'
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained"
              onClick={handleCloseAddCardDialog}
              sx={{ 
                borderRadius: 2, 
                textTransform: 'none',
                background: 'linear-gradient(135deg, #6993FF, #6667AB)',
              }}
            >
              Add Card
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Cards; 