import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery, Card } from '@mui/material';
import AdminHeader from './AdminHeader';
import { Sidebar } from './Sidebar';
import { Outlet, useLocation } from 'react-router-dom';

const drawerWidth = 240;

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
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: '#f5f7fa' }}>
      <AdminHeader onMenuClick={handleSidebarToggle} title={getPageTitle()} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)` },
          ml: { sm: sidebarOpen ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          mt: '64px', // AppBar height
          height: 'calc(100vh - 64px)',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 2, sm: 3 }
        }}
      >
        <Box 
          sx={{ 
            maxWidth: '1400px', 
            width: '100%',
            mx: 'auto',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1
          }}
        >
          <Card 
            sx={{ 
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              boxShadow: theme.shadows[2],
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Outlet />
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;





