import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  useTheme,
  Tooltip,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import { 
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Photo as PhotoIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Flag as FlagIcon,
  BarChart as BarChartIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';

interface AdminHeaderProps {
  title?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  title = 'Admin Dashboard' 
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon fontSize="small" />, path: '/admin/dashboard' },
    { text: 'Attendance Records', icon: <PeopleIcon fontSize="small" />, path: '/admin/attendance' },
    { text: 'Student Selfies', icon: <PhotoIcon fontSize="small" />, path: '/admin/selfies' },
    { text: 'Institutions', icon: <SchoolIcon fontSize="small" />, path: '/admin/institutions' },
    { text: 'Venues', icon: <LocationIcon fontSize="small" />, path: '/admin/venues' },
    { text: 'Flagged Logs', icon: <FlagIcon fontSize="small" />, path: '/admin/flagged-logs' },
    { text: 'Statistics', icon: <BarChartIcon fontSize="small" />, path: '/admin/statistics' },
  ];

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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              bgcolor: 'white', 
              color: theme.palette.primary.main,
              mr: 1.5, 
              width: 32,
              height: 32
            }}
          >
            A
          </Avatar>
          <Typography variant="h6" noWrap component="div" sx={{ mr: 4 }}>
            QR Attendance
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexGrow: 1 }}>
          {menuItems.map((item) => (
            <Button 
              key={item.text}
              color="inherit"
              startIcon={item.icon}
              onClick={() => handleNavigation(item.path)}
              sx={{ 
                mx: 0.5,
                opacity: 0.9,
                '&:hover': { opacity: 1, backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              {item.text}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: { xs: 'flex', md: 'none' }, flexGrow: 1 }}>
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={handleMenuOpen}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {menuItems.map((item) => (
              <MenuItem 
                key={item.text} 
                onClick={() => handleNavigation(item.path)}
                sx={{ minWidth: 200 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {item.icon}
                  <Typography sx={{ ml: 1 }}>{item.text}</Typography>
                </Box>
              </MenuItem>
            ))}
            <MenuItem onClick={handleLogout} sx={{ color: theme.palette.error.main }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LogoutIcon fontSize="small" />
                <Typography sx={{ ml: 1 }}>Logout</Typography>
              </Box>
            </MenuItem>
          </Menu>
        </Box>

        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: { xs: 1, md: 0 }, 
            textAlign: { xs: 'center', md: 'left' },
            display: { xs: 'block', md: 'none' }
          }}
        >
          {title}
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



