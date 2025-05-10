
import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  useTheme,
  useMediaQuery,
  Avatar
} from '@mui/material';
import { Menu as MenuIcon, QrCode2 as QrIcon } from '@mui/icons-material';
import { Sidebar } from './Sidebar';
import { Outlet, useLocation } from 'react-router-dom';

export const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'QR Attendance System';
    if (path === '/qr-generator') return 'Generate QR Code';
    if (path === '/admin/login') return 'Admin Login';
    if (path === '/admin/dashboard') return 'Admin Dashboard';
    if (path === '/admin/attendance') return 'Attendance Records';
    if (path === '/admin/selfies') return 'Student Selfies';
    if (path === '/admin/institutions') return 'Institutions';
    if (path === '/admin/venues') return 'Venues';
    if (path === '/admin/flagged-logs') return 'Flagged Logs';
    if (path === '/admin/statistics') return 'Statistics';
    return 'QR Attendance System';
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppBar 
        position="fixed" 
        elevation={1}
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'white', mr: 1, display: { xs: 'none', sm: 'flex' } }}>
              <QrIcon sx={{ color: theme.palette.primary.main }} />
            </Avatar>
            <Typography variant="h6" noWrap component="div">
              {getPageTitle()}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${sidebarOpen ? 240 : 0}px)` },
          mt: '64px', // AppBar height
          ml: { sm: sidebarOpen ? '240px' : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowY: 'auto',
          height: 'calc(100vh - 64px)',
          bgcolor: '#f8fafc', // Light background for content area
        }}
      >
        <Box 
          sx={{ 
            maxWidth: '1400px', 
            mx: 'auto',
            width: '100%',
            pb: 4
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};


