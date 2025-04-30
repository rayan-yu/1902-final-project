import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton
} from '@mui/material';

// Icons
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

// API
import { unlinkAllAccounts } from '../../../utils/api';

const ConfirmUnlinkDialog = ({ 
  open, 
  onClose, 
  setUnlinkingAccount, 
  handleCloseUnlinkDialog, 
  loadAccountData 
}) => {
  
  const handleUnlinkAllAccounts = async () => {
    setUnlinkingAccount(true);
    try {
      await unlinkAllAccounts();
      // Refresh accounts after unlinking
      await loadAccountData();
      setUnlinkingAccount(false);
      onClose();
      handleCloseUnlinkDialog();
    } catch (err) {
      console.error('Error unlinking all accounts:', err);
      setUnlinkingAccount(false);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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

      <DialogContent sx={{ px: 3, pb: 2, pt: 1 }}>
        <Typography variant="body1" color="text.secondary" align="center">
          Are you sure you want to remove all linked bank accounts? This action cannot be undone.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'center', gap: 2 }}>
        <Button
          onClick={onClose}
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
  );
};

export default ConfirmUnlinkDialog;