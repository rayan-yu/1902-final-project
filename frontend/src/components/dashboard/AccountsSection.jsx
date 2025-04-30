import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  Card, 
  CardContent, 
  Avatar, 
  Divider, 
  Chip, 
  Grow 
} from '@mui/material';

// Icons
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';

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

const AccountsSection = ({
  accounts,
  handleOpenPlaidLink,
  linkToken,
  handleOpenUnlinkDialog,
  handleAccountClick,
  formatCurrency
}) => {
  // If there are no accounts, show get started section
  if (accounts.length === 0) {
    return (
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
    );
  }

  return (
    <Box>
      {/* Accounts Section Header */}
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
      
      {/* Accounts Grid */}
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
  );
};

export default AccountsSection;