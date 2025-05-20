import React from 'react';
import { Box } from '@mui/material';
import AdminHeader from './AdminHeader';
import { Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <AdminHeader title={getPageTitle()} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          mt: '64px', // AppBar height
          height: 'calc(100vh - 64px)',
          bgcolor: '#f8fafc', // Light background for content area
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          overflowY: 'auto',
        }}
      >
        <Box 
          sx={{ 
            maxWidth: '1200px', 
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

// Helper function to get page title based on current route
const getPageTitle = () => {
  const path = window.location.pathname;
  
  if (path.includes('/admin/dashboard')) return 'Dashboard';
  if (path.includes('/admin/attendance')) return 'Attendance Records';
  if (path.includes('/admin/selfies')) return 'Student Selfies';
  if (path.includes('/admin/institutions')) return 'Institutions';
  if (path.includes('/admin/venues')) return 'Venues';
  if (path.includes('/admin/flagged-logs')) return 'Flagged Logs';
  if (path.includes('/admin/statistics')) return 'Statistics';
  
  return 'Admin Dashboard';
};

export default AdminLayout;




