import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  TextField, 
  InputAdornment, 
  Card,
  CardContent, 
  CircularProgress, 
  Alert, 
  AppBar, 
  Toolbar, 
  IconButton,
  Paper,
  Chip,
  Divider,
  Button,
  Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import axios, { AxiosError } from 'axios';

// Define the API response type
interface AttendanceRecord {
  id: number;
  name: string;
  roll_no: string;
  branch: string;
  section: string;
  timestamp: string;
  is_valid_location: boolean;
  session_id: string;
  selfie_path: string;
  email?: string;
  phone?: string;
}

// Define error response type
interface ErrorResponse {
  detail?: string;
}

const StudentSelfiesPage: React.FC = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selfies, setSelfies] = useState<AttendanceRecord[]>([]);
  const [filteredSelfies, setFilteredSelfies] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageLoading, setImageLoading] = useState<{[key: number]: boolean}>({});

  // Add a function to generate a placeholder image based on student name
  const getInitialsPlaceholder = (name: string) => {
    // Get initials from name (handle empty names)
    const initials = name
      ? name
          .split(' ')
          .map(part => part[0] || '')
          .join('')
          .toUpperCase()
          .substring(0, 2)
      : '??';
    
    // Generate a random but consistent color based on the name
    const getColorFromName = (name: string) => {
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      const hue = Math.abs(hash % 360);
      return `hsl(${hue}, 70%, 60%)`;
    };
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const context = canvas.getContext('2d');
    
    if (context) {
      // Fill background
      context.fillStyle = getColorFromName(name || 'Unknown');
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add text
      context.font = 'bold 80px Arial';
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(initials, canvas.width / 2, canvas.height / 2);
    }
    
    return canvas.toDataURL('image/png');
  };

  // Function to determine the correct image source
  const getImageSource = (selfie: AttendanceRecord) => {
    // If selfie_path is null, undefined, or empty, return a placeholder
    if (!selfie.selfie_path) {
      return getInitialsPlaceholder(selfie.name);
    }
    
    // Handle different path formats
    if (selfie.selfie_path.startsWith('http')) {
      return selfie.selfie_path;
    }
    
    // Handle paths that start with static/
    if (selfie.selfie_path.startsWith('static/') || selfie.selfie_path.startsWith('/static/')) {
      return `https://qr-backend-1-pq5i.onrender.com/${selfie.selfie_path.replace(/^\//, '')}`;
    }
    
    // If path exists but doesn't match known patterns, try direct URL
    return `https://qr-backend-1-pq5i.onrender.com${selfie.selfie_path.startsWith('/') ? '' : '/'}${selfie.selfie_path}`;
  };

  // Add a function to handle image errors
  const handleImageError = (id: number) => {
    console.log(`Image failed to load for ID: ${id}`);
    setImageLoading(prev => ({
      ...prev,
      [id]: false
    }));
  };

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchSelfies = async () => {
      try {
        setLoading(true);
        const response = await axios.get<AttendanceRecord[]>('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/attendance/all', {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Log the full response for debugging
        console.log("Attendance response:", response.data);
        
        // Use all records instead of filtering
        const selfiesData = response.data;
        console.log("Selfies data:", selfiesData);
        
        // Initialize image loading state for all selfies
        const initialLoadingState = selfiesData.reduce((acc, selfie) => {
          acc[selfie.id] = true;
          return acc;
        }, {} as {[key: number]: boolean});
        
        setImageLoading(initialLoadingState);
        setSelfies(selfiesData);
        setFilteredSelfies(selfiesData);
        
        setError('');
      } catch (err) {
        const axiosError = err as AxiosError<ErrorResponse>;
        setError(axiosError.response?.data?.detail || 'Failed to fetch selfies');
        console.error("Error fetching selfies:", axiosError);
      } finally {
        setLoading(false);
      }
    };

    fetchSelfies();
  }, [token, navigate]);

  useEffect(() => {
    // Filter selfies based on search query
    if (searchQuery.trim() === '') {
      setFilteredSelfies(selfies);
    } else {
      const filtered = selfies.filter(selfie => 
        selfie.roll_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        selfie.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSelfies(filtered);
    }
  }, [searchQuery, selfies]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleImageLoad = (id: number) => {
    setImageLoading(prev => ({
      ...prev,
      [id]: false
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <DashboardIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Student Selfies
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading student selfies...
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBackToDashboard}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Student Attendance Records
          </Typography>
          <Button color="inherit" onClick={handleLogout} sx={{ display: { xs: 'none', sm: 'block' } }}>
            Logout
          </Button>
          <IconButton 
            color="inherit" 
            onClick={handleLogout}
            sx={{ display: { xs: 'block', sm: 'none' } }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: { xs: 2, sm: 4 }, 
          mb: { xs: 2, sm: 4 },
          px: { xs: 2, sm: 3 },
          flexGrow: 1
        }}
      >
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {error}
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => window.location.reload()}
              sx={{ ml: 2 }}
            >
              Retry
            </Button>
          </Alert>
        )}

        <Paper 
          sx={{ 
            p: { xs: 2, sm: 3 }, 
            mb: 3,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by Roll Number or Name"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              mb: 2,
              gap: { xs: 1, sm: 0 }
            }}
          >
            <Typography variant="h6">
              {filteredSelfies.length} {filteredSelfies.length === 1 ? 'Student' : 'Students'} Found
            </Typography>
            <Box>
              <Chip 
                icon={<LocationOnIcon />} 
                label="Valid Location" 
                color="success" 
                size="small" 
                sx={{ mr: 1 }} 
              />
              <Chip 
                icon={<LocationOffIcon />} 
                label="Invalid Location" 
                color="error" 
                size="small" 
              />
            </Box>
          </Box>
          
          {/* Add a note about selfies */}
          <Alert severity="info" sx={{ mb: 2 }}>
            Note: Actual selfie images are not available. Showing placeholder images based on student names.
          </Alert>
        </Paper>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '16px' 
        }}>
          {filteredSelfies.length > 0 ? (
            filteredSelfies.map((selfie) => (
              <Card 
                key={selfie.id} 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  },
                  borderRadius: 2
                }}
              >
                <Box sx={{ position: 'relative', paddingTop: '100%' }}>
                  {imageLoading[selfie.id] && (
                    <Skeleton 
                      variant="rectangular" 
                      height="100%" 
                      animation="wave" 
                      sx={{ 
                        bgcolor: 'rgba(0,0,0,0.1)',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                      }} 
                    />
                  )}
                  <img
                    src={getImageSource(selfie)}
                    alt={`${selfie.name}'s attendance`}
                    style={{ 
                      objectFit: 'cover',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: imageLoading[selfie.id] ? 'none' : 'block'
                    }}
                    onLoad={() => handleImageLoad(selfie.id)}
                    onError={() => {
                      handleImageError(selfie.id);
                      // The error will cause it to fall back to the placeholder
                    }}
                  />
                  <Chip
                    icon={selfie.is_valid_location ? <LocationOnIcon /> : <LocationOffIcon />}
                    label={selfie.is_valid_location ? "Valid Location" : "Invalid Location"}
                    color={selfie.is_valid_location ? "success" : "error"}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: selfie.is_valid_location ? 'rgba(46, 125, 50, 0.85)' : 'rgba(211, 47, 47, 0.85)',
                      color: 'white',
                      zIndex: 1
                    }}
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography variant="h6" component="div" noWrap>
                    {selfie.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Roll No: {selfie.roll_no}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Branch: {selfie.branch} | Section: {selfie.section}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(selfie.timestamp).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1' }}>
              <Paper 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
              >
                <Typography variant="h6">No records found</Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery ? 'Try a different search term' : 'No attendance records available'}
                </Typography>
              </Paper>
            </div>
          )}
        </div>
      </Container>
    </Box>
  );
};

export default StudentSelfiesPage;
















































