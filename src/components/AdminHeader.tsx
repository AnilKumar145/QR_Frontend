import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  useTheme,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

interface AdminHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  onMenuClick, 
  title = 'Admin Dashboard' 
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        background: theme.palette.primary.main,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={onMenuClick}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          {isMobile ? 'Admin' : title}
        </Typography>
        
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
              {user.email || 'Admin'}
            </Typography>
            <Tooltip title="Logout">
              <IconButton color="inherit" onClick={handleLogout}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;


