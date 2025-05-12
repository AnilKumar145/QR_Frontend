import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  Card,
  CardContent, 
  CircularProgress, 
  Alert, 
  Paper,
  Chip,
  Divider,
  Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { 
  Search as SearchIcon,
  LocationOn as LocationOnIcon,
  LocationOff as LocationOffIcon
} from '@mui/icons-material';
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

// Function to generate placeholder image based on initials
const getInitialsPlaceholder = (name: string): string => {
  const initials = name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  // Generate a deterministic color based on the name
  const hue = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
  const color = `hsl(${hue}, 70%, 60%)`;
  
  // Create a canvas to generate the image
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Fill background
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, canvas.width / 2, canvas.height / 2);
  }
  
  return canvas.toDataURL('image/png');
};

const StudentSelfiesPage: React.FC = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selfies, setSelfies] = useState<AttendanceRecord[]>([]);
  const [filteredSelfies, setFilteredSelfies] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState<{[key: number]: boolean}>({});

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
    
    // Try the direct selfie endpoint first
    return `https://qr-backend-1-pq5i.onrender.com/api/v1/attendance/selfie/${selfie.id}`;
  };

  // Add a function to handle image errors
  const handleImageError = (id: number, name: string) => {
    console.log(`Image failed to load for ID: ${id}, using placeholder`);
    
    // When image fails to load, set a placeholder based on name
    const img = document.getElementById(`selfie-img-${id}`) as HTMLImageElement;
    if (img) {
      img.src = getInitialsPlaceholder(name);
    }
    
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
      } catch (err) {
        const axiosError = err as AxiosError<ErrorResponse>;
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

  const handleImageLoad = (id: number) => {
    setImageLoading(prev => ({
      ...prev,
      [id]: false
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading student selfies...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600, mb: 2 }}>
          Student Attendance Records
        </Typography>

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
                      handleImageError(selfie.id, selfie.name);
                      // The error will cause it to fall back to the placeholder
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
      </Box>
    </Box>
  );
};

export default StudentSelfiesPage;





















































