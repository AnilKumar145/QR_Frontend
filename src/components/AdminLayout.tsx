import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import AdminHeader from './AdminHeader';
import { Sidebar } from './Sidebar';
import { Outlet, useLocation } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const location = useLocation();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Get page title based on current route for the header
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin/dashboard') return 'Admin Dashboard';
    if (path === '/admin/attendance') return 'Attendance Records';
    if (path === '/admin/selfies') return 'Student Selfies';
    if (path === '/admin/institutions') return 'Institutions';
    if (path === '/admin/venues') return 'Venues';
    if (path === '/admin/flagged-logs') return 'Flagged Logs';
    if (path === '/admin/statistics') return 'Statistics';
    return 'Admin Panel';
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AdminHeader onMenuClick={handleSidebarToggle} title={getPageTitle()} />
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
          display: 'flex',  // Add this to enable centering
          justifyContent: 'center', // Center horizontally
        }}
      >
        <Box 
          sx={{ 
            maxWidth: '1200px', // Reduced from 1400px
            width: '100%',
            pb: 4,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;


