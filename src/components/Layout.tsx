import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  Divider, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  useTheme, 
  useMediaQuery, 
  Avatar,
  Container,
  alpha
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Warning as WarningIcon,
  BarChart as BarChartIcon,
  QrCode as QrCodeIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 240;

export const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);
  const location = useLocation();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'QR Attendance System';
    if (path === '/qr-generator') return 'Generate QR Code';
    if (path === '/admin/login') return 'Admin Login';
    if (path === '/admin/dashboard') return 'Admin Dashboard';
    if (path === '/admin/attendance') return 'Student Attendance Records';
    if (path === '/admin/selfies') return 'Student Selfies';
    if (path === '/admin/flagged-logs') return 'Flagged Logs';
    if (path === '/admin/statistics') return 'Statistics';
    return 'QR Attendance System';
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Attendance Records', icon: <PeopleIcon />, path: '/admin/attendance' },
    { text: 'Student Selfies', icon: <PhotoLibraryIcon />, path: '/admin/selfies' },
    { text: 'Flagged Logs', icon: <WarningIcon />, path: '/admin/flagged-logs' },
    { text: 'Statistics', icon: <BarChartIcon />, path: '/admin/statistics' },
    { text: 'Generate QR', icon: <QrCodeIcon />, path: '/' }
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          width: { sm: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { sm: open ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          borderBottom: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.06)',
          bgcolor: 'background.paper',
          color: 'text.primary'
        }}
      >
        <Toolbar sx={{ height: 64, px: { xs: 2, sm: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.primary.main, 
                mr: 1.5, 
                width: 32,
                height: 32
              }}
            >
              <QrCodeIcon sx={{ fontSize: 18 }} />
            </Avatar>
            <Typography 
              variant="h6" 
              noWrap 
              component="div"
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem' }
              }}
            >
              {getPageTitle()}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={open}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: 'none'
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          py: 2,
          px: 2,
          height: 64
        }}>
          <Avatar 
            sx={{ 
              bgcolor: theme.palette.primary.main, 
              mr: 1.5, 
              width: 32,
              height: 32
            }}
          >
            <QrCodeIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            QR Attendance
          </Typography>
        </Box>
        <Divider />
        <List sx={{ pt: 2 }}>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 1.5,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  },
                },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  fontSize: '0.9rem'
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          ml: { sm: open ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          mt: '64px', // AppBar height
          height: 'calc(100vh - 64px)',
          bgcolor: '#f8fafc', // Light background for content area
          overflow: 'auto'
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{ 
            py: { xs: 3, sm: 4 },
            px: { xs: 2, sm: 3, md: 4 },
            height: '100%'
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};


