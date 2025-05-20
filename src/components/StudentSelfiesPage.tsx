import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  CircularProgress, 
  Alert, 
  Chip
  // Remove Paper since it's not being used
} from '@mui/material';
import { 
  Search as SearchIcon, 
  LocationOn as LocationOnIcon, 
  LocationOff as LocationOffIcon 
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface AttendanceRecord {
  id: number;
  name: string;
  email: string;
  roll_no: string;
  branch: string;
  section: string;
  timestamp: string;
  is_valid_location: boolean;
  selfie_path: string | null;
}

const StudentSelfiesPage: React.FC = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selfies, setSelfies] = useState<AttendanceRecord[]>([]);
  const [filteredSelfies, setFilteredSelfies] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  // Remove imageLoading state since it's not being used
  
  // Function to get initials from a name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Function to generate a placeholder image with initials
  const getInitialsPlaceholder = (name: string): string => {
    const initials = getInitials(name);
    
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
  };

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchSelfies = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/attendance/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setSelfies(response.data);
        setFilteredSelfies(response.data);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string } } };
        setError(error.response?.data?.detail || 'Failed to fetch selfies');
      } finally {
        setLoading(false);
      }
    };

    fetchSelfies();
  }, [token, navigate]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSelfies(selfies);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = selfies.filter(record => 
        record.name.toLowerCase().includes(lowercasedSearch) ||
        record.roll_no.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredSelfies(filtered);
    }
  }, [searchTerm, selfies]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search by Roll Number or Name"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: 'white',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 500 }}>
              {filteredSelfies.length} Students Found
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Chip 
                icon={<LocationOnIcon />} 
                label="Valid Location" 
                color="success" 
                variant="filled"
                size="small"
              />
              <Chip 
                icon={<LocationOffIcon />} 
                label="Invalid Location" 
                color="error"
                variant="filled" 
                size="small"
              />
            </Box>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Note: Actual selfie images are not available. Showing placeholder images based on student names.
          </Alert>

          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: 3
          }}>
            {filteredSelfies.map((selfie) => (
              <Box
                key={selfie.id}
                sx={{
                  position: 'relative',
                  borderRadius: 2,
                  overflow: 'hidden',
                  aspectRatio: '1/1',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  bgcolor: selfie.is_valid_location ? '#4caf50' : '#f44336',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
              >
                <img
                  id={`selfie-img-${selfie.id}`}
                  src={getImageSource(selfie)}
                  alt={`${selfie.name}'s attendance`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={() => handleImageError(selfie.id, selfie.name)}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    p: 1.5
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {selfie.name}
                  </Typography>
                  <Typography variant="body2">
                    {selfie.roll_no} • {selfie.branch}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

export default StudentSelfiesPage;


