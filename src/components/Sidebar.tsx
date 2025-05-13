import React from 'react';
import { 
  Drawer, 
  List, 
  ListItemButton,
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Box, 
  Typography,
  useTheme,
  useMediaQuery,
  alpha
} from '@mui/material';
import { 
  QrCode,
  Dashboard,
  School,
  LocationOn,
  People,
  Flag,
  BarChart,
  Photo,
  Logout
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useContext } from 'react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useContext(AuthContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose();
  };

  const drawerWidth = 240;

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant={isMobile ? "temporary" : "persistent"}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: theme.palette.background.paper,
        },
      }}
    >
      <Box 
        sx={{ 
          p: 2.5, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'flex-start', 
          justifyContent: 'center',
          background: theme.palette.primary.main,
          color: 'white'
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          QR Attendance
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ overflow: 'auto', py: 2, flexGrow: 1 }}>
        <List>
          <ListItemButton 
            onClick={() => handleNavigation('/')}
            selected={location.pathname === '/'}
            sx={{
              mx: 1,
              borderRadius: 2,
              mb: 0.5,
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
            <ListItemIcon>
              <QrCode color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Generate QR" 
              primaryTypographyProps={{ fontWeight: location.pathname === '/' ? 600 : 400 }}
            />
          </ListItemButton>
          
          {isAuthenticated && (
            <>
              {/* Group 1: Core Admin Pages */}
              <ListItemButton 
                onClick={() => handleNavigation('/admin/dashboard')}
                selected={location.pathname === '/admin/dashboard'}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
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
                <ListItemIcon>
                  <Dashboard color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Dashboard" 
                  primaryTypographyProps={{ fontWeight: location.pathname === '/admin/dashboard' ? 600 : 400 }}
                />
              </ListItemButton>
              
              <ListItemButton 
                onClick={() => handleNavigation('/admin/attendance')}
                selected={location.pathname === '/admin/attendance'}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
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
                <ListItemIcon>
                  <People color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Attendance Records" 
                  primaryTypographyProps={{ fontWeight: location.pathname === '/admin/attendance' ? 600 : 400 }}
                />
              </ListItemButton>
              
              <ListItemButton 
                onClick={() => handleNavigation('/admin/selfies')}
                selected={location.pathname === '/admin/selfies'}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
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
                <ListItemIcon>
                  <Photo color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Student Selfies" 
                  primaryTypographyProps={{ fontWeight: location.pathname === '/admin/selfies' ? 600 : 400 }}
                />
              </ListItemButton>

              <Divider sx={{ my: 1 }} />

              {/* Group 2: Management Pages */}
              <ListItemButton 
                onClick={() => handleNavigation('/admin/institutions')}
                selected={location.pathname === '/admin/institutions'}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
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
                <ListItemIcon>
                  <School color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Institutions" 
                  primaryTypographyProps={{ fontWeight: location.pathname === '/admin/institutions' ? 600 : 400 }}
                />
              </ListItemButton>
              
              <ListItemButton 
                onClick={() => handleNavigation('/admin/venues')}
                selected={location.pathname === '/admin/venues'}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
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
                <ListItemIcon>
                  <LocationOn color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Venues" 
                  primaryTypographyProps={{ fontWeight: location.pathname === '/admin/venues' ? 600 : 400 }}
                />
              </ListItemButton>

              <Divider sx={{ my: 1 }} />

              {/* Group 3: Logs and Statistics */}
              <ListItemButton 
                onClick={() => handleNavigation('/admin/flagged-logs')}
                selected={location.pathname === '/admin/flagged-logs'}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
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
                <ListItemIcon>
                  <Flag color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Flagged Logs" 
                  primaryTypographyProps={{ fontWeight: location.pathname === '/admin/flagged-logs' ? 600 : 400 }}
                />
              </ListItemButton>
              
              <ListItemButton 
                onClick={() => handleNavigation('/admin/statistics')}
                selected={location.pathname === '/admin/statistics'}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
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
                <ListItemIcon>
                  <BarChart color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Statistics" 
                  primaryTypographyProps={{ fontWeight: location.pathname === '/admin/statistics' ? 600 : 400 }}
                />
              </ListItemButton>
              
              <Divider sx={{ my: 1 }} />
              
              <ListItemButton 
                onClick={handleLogout}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
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
                <ListItemIcon>
                  <Logout color="error" />
                </ListItemIcon>
                <ListItemText 
                  primary="Logout" 
                  primaryTypographyProps={{ fontWeight: location.pathname === '/admin/logout' ? 600 : 400 }}
                  sx={{ color: theme.palette.error.main }}
                />
              </ListItemButton>
            </>
          )}
        </List>
      </Box>
    </Drawer>
  );
};









