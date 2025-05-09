import React, { useState, useEffect } from 'react';
import { Box, useMediaQuery, useTheme, Container } from '@mui/material';
import AdminHeader from './AdminHeader';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Update sidebar state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AdminHeader onMenuClick={handleSidebarToggle} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: '100%',
          mt: '64px', // AppBar height
          ml: { sm: sidebarOpen ? '240px' : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Container 
          maxWidth="lg" 
          sx={{ 
            py: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', // Center content horizontally
            width: '100%'
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AdminLayout;

