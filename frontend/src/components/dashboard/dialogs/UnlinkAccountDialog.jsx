import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Tooltip,
  Divider
} from '@mui/material';

// Icons
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';

// API
import { unlinkAccount } from '../../../utils/api';

// Generate unique gradient for each account (same as in AccountsSection)
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

const UnlinkAccountDialog = ({ 
  open, 
  onClose, 
  accounts, 
  unlinkingAccount, 
  setUnlinkingAccount, 
  handleConfirmAllUnlink, 
  loadAccountData,
  formatCurrency 
}) => {
  const handleUnlinkAccount = async (accountId) => {
    setUnlinkingAccount(true);
    try {
      await unlinkAccount(accountId);
      // Refresh accounts after unlinking
      await loadAccountData();
      setUnlinkingAccount(false);
    } catch (err) {
      console.error('Error unlinking account:', err);
      setUnlinkingAccount(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          onClick={onClose}
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
  );
};

export default UnlinkAccountDialog;