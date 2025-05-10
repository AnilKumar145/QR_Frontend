import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  Container, 
  useTheme,
  useMediaQuery,
  CssBaseline,
  Avatar,
  Button
} from '@mui/material';
import { Menu as MenuIcon, QrCode2 as QrIcon } from '@mui/icons-material';
import { Sidebar } from './Sidebar';
import { Outlet, useNavigate } from 'react-router-dom';

export const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
              <Avatar sx={{ bgcolor: 'white', mr: 1 }}>
                <QrIcon sx={{ color: theme.palette.primary.main }} />
              </Avatar>
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>
                QR Attendance
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/admin/login')}
              sx={{ 
                borderRadius: '20px', 
                px: 3,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Admin Login
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: '100%',
          mt: '64px', // AppBar height
          ml: { sm: sidebarOpen ? '240px' : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Container 
          maxWidth="lg" 
          sx={{ 
            py: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};
