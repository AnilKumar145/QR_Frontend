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
  QrCode as QrCodeIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  LocationOn as LocationOnIcon,
  People as PeopleIcon,
  Flag as FlagIcon,
  BarChart as BarChartIcon,
  Photo as PhotoIcon,
  Login as LoginIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContextDefinition';
import { useContext } from 'react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant={isMobile ? "temporary" : "persistent"}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
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
        <ListItemButton onClick={() => handleNavigation('/')}>
          <ListItemIcon>
            <QrCodeIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary="Generate QR" />
        </ListItemButton>

        {isAuthenticated ? (
          <>
            <ListItemButton onClick={() => handleNavigation('/admin/dashboard')}>
              <ListItemIcon>
                <DashboardIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
            
            <ListItemButton onClick={() => handleNavigation('/admin/attendance')}>
              <ListItemIcon>
                <PeopleIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Attendance Records" />
            </ListItemButton>
            
            <ListItemButton onClick={() => handleNavigation('/admin/selfies')}>
              <ListItemIcon>
                <PhotoIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Student Selfies" />
            </ListItemButton>
            
            <ListItemButton onClick={() => handleNavigation('/admin/institutions')}>
              <ListItemIcon>
                <SchoolIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Institutions" />
            </ListItemButton>
            
            <ListItemButton onClick={() => handleNavigation('/admin/venues')}>
              <ListItemIcon>
                <LocationOnIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Venues" />
            </ListItemButton>
            
            <ListItemButton onClick={() => handleNavigation('/admin/flagged-logs')}>
              <ListItemIcon>
                <FlagIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Flagged Logs" />
            </ListItemButton>
            
            <ListItemButton onClick={() => handleNavigation('/admin/statistics')}>
              <ListItemIcon>
                <BarChartIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Statistics" />
            </ListItemButton>
            
            <Divider sx={{ my: 1 }} />
            
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Logout" sx={{ color: theme.palette.error.main }} />
            </ListItemButton>
          </>
        ) : (
          <ListItemButton onClick={() => handleNavigation('/admin/login')}>
            <ListItemIcon>
              <LoginIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Admin Login" />
          </ListItemButton>
        )}
      </List>
    </Drawer>
  );
};



