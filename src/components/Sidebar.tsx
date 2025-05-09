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
  useMediaQuery
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
  Login,
  Logout
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContextDefinition';
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
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
          QR Attendance
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItemButton 
          onClick={() => handleNavigation('/')}
          selected={location.pathname === '/'}
        >
          <ListItemIcon>
            <QrCode color="primary" />
          </ListItemIcon>
          <ListItemText primary="Generate QR" />
        </ListItemButton>

        {isAuthenticated ? (
          <>
            <ListItemButton onClick={() => handleNavigation('/admin/dashboard')}>
              <ListItemIcon>
                <Dashboard color="primary" />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
            
            <ListItemButton onClick={() => handleNavigation('/admin/attendance')}>
              <ListItemIcon>
                <People color="primary" />
              </ListItemIcon>
              <ListItemText primary="Attendance Records" />
            </ListItemButton>
            
            <ListItemButton onClick={() => handleNavigation('/admin/selfies')}>
              <ListItemIcon>
                <Photo color="primary" />
              </ListItemIcon>
              <ListItemText primary="Student Selfies" />
            </ListItemButton>
            
            <ListItemButton onClick={() => handleNavigation('/admin/institutions')}>
              <ListItemIcon>
                <School color="primary" />
              </ListItemIcon>
              <ListItemText primary="Institutions" />
            </ListItemButton>
            
            <ListItemButton onClick={() => handleNavigation('/admin/venues')}>
              <ListItemIcon>
                <LocationOn color="primary" />
              </ListItemIcon>
              <ListItemText primary="Venues" />
            </ListItemButton>
            
            <ListItemButton onClick={() => handleNavigation('/admin/flagged-logs')}>
              <ListItemIcon>
                <Flag color="primary" />
              </ListItemIcon>
              <ListItemText primary="Flagged Logs" />
            </ListItemButton>
            
            <ListItemButton onClick={() => handleNavigation('/admin/statistics')}>
              <ListItemIcon>
                <BarChart color="primary" />
              </ListItemIcon>
              <ListItemText primary="Statistics" />
            </ListItemButton>
            
            <Divider sx={{ my: 1 }} />
            
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <Logout color="error" />
              </ListItemIcon>
              <ListItemText primary="Logout" sx={{ color: theme.palette.error.main }} />
            </ListItemButton>
          </>
        ) : (
          <ListItemButton onClick={() => handleNavigation('/admin/login')}>
            <ListItemIcon>
              <Login color="primary" />
            </ListItemIcon>
            <ListItemText primary="Admin Login" />
          </ListItemButton>
        )}
      </List>
    </Drawer>
  );
};






