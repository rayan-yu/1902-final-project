import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider
} from '@mui/material';

// Icons
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

const TopNavigation = ({ handleMenu, anchorEl, handleClose, handleLogout }) => {
  return (
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
  );
};

export default TopNavigation;