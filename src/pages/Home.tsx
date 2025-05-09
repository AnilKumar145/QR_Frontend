import React, { useContext } from 'react';
import { 
  Container, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Button, 
  CardActions,
  useTheme,
  Avatar
} from '@mui/material';
import { 
  QrCode as QrCodeIcon,
  School as SchoolIcon,
  LocationOn as LocationOnIcon,
  People as PeopleIcon,
  Photo as PhotoIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export const Home: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold', 
            color: theme.palette.primary.main,
            mb: 2
          }}
        >
          QR Attendance System
        </Typography>
        <Typography variant="h6" color="textSecondary" paragraph>
          Easily manage attendance with QR codes
        </Typography>
      </Box>

      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          },
          gap: 4
        }}
      >
        {/* QR Code Generator Card */}
        <Card 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
            }
          }}
          onClick={() => handleCardClick('/qr-generator')}
        >
          <CardContent sx={{ flexGrow: 1 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                <QrCodeIcon />
              </Avatar>
              <Typography variant="h5" component="h2">
                Generate QR Code
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph>
              Create QR codes for attendance tracking at specific venues or institution-wide.
            </Typography>
          </CardContent>
          <CardActions>
            <Button 
              size="small" 
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick('/qr-generator');
              }}
            >
              Generate Now
            </Button>
          </CardActions>
        </Card>

        {/* Admin Login Card - Only show if not authenticated */}
        {!isAuthenticated && (
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
              }
            }}
            onClick={() => handleCardClick('/admin/login')}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}>
                  <LoginIcon />
                </Avatar>
                <Typography variant="h5" component="h2">
                  Admin Login
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" paragraph>
                Access the admin dashboard to manage attendance records, venues, and more.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick('/admin/login');
                }}
              >
                Login
              </Button>
            </CardActions>
          </Card>
        )}

        {/* Admin Dashboard Cards - Only show if authenticated */}
        {isAuthenticated && (
          <>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
                }
              }}
              onClick={() => handleCardClick('/admin/dashboard')}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: theme.palette.info.main, mr: 2 }}>
                    <PeopleIcon />
                  </Avatar>
                  <Typography variant="h5" component="h2">
                    Admin Dashboard
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" paragraph>
                  View attendance statistics and manage all aspects of the system.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick('/admin/dashboard');
                  }}
                >
                  Go to Dashboard
                </Button>
              </CardActions>
            </Card>

            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
                }
              }}
              onClick={() => handleCardClick('/admin/attendance')}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: theme.palette.success.main, mr: 2 }}>
                    <PeopleIcon />
                  </Avatar>
                  <Typography variant="h5" component="h2">
                    Attendance Records
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" paragraph>
                  View and manage all attendance records across venues and institutions.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick('/admin/attendance');
                  }}
                >
                  View Records
                </Button>
              </CardActions>
            </Card>

            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
                }
              }}
              onClick={() => handleCardClick('/admin/selfies')}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: theme.palette.warning.main, mr: 2 }}>
                    <PhotoIcon />
                  </Avatar>
                  <Typography variant="h5" component="h2">
                    Student Selfies
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" paragraph>
                  View all student selfies submitted with attendance records.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick('/admin/selfies');
                  }}
                >
                  View Selfies
                </Button>
              </CardActions>
            </Card>

            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
                }
              }}
              onClick={() => handleCardClick('/admin/institutions')}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.dark, mr: 2 }}>
                    <SchoolIcon />
                  </Avatar>
                  <Typography variant="h5" component="h2">
                    Institutions
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Manage educational institutions in the system.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick('/admin/institutions');
                  }}
                >
                  Manage Institutions
                </Button>
              </CardActions>
            </Card>

            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)'
                }
              }}
              onClick={() => handleCardClick('/admin/venues')}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar sx={{ bgcolor: theme.palette.secondary.dark, mr: 2 }}>
                    <LocationOnIcon />
                  </Avatar>
                  <Typography variant="h5" component="h2">
                    Venues
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Manage venues and locations for attendance tracking.
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick('/admin/venues');
                  }}
                >
                  Manage Venues
                </Button>
              </CardActions>
            </Card>
          </>
        )}
      </Box>
    </Container>
  );
};
