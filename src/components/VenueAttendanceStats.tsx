import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CircularProgress, 
  Divider
} from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import LocationOnIcon from '@mui/icons-material/LocationOn';

interface VenueStats {
  venue_id: number;
  venue_name: string;
  total_attendance: number;
  valid_locations: number;
  invalid_locations: number;
}

const VenueAttendanceStats: React.FC = () => {
  const { token } = useContext(AuthContext);
  const [venueStats, setVenueStats] = useState<VenueStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVenueStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/statistics/venue', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log("Venue statistics:", response.data);
        setVenueStats(response.data);
        setError('');
      } catch (err) {
        console.error("Error fetching venue statistics:", err);
        const error = err as { response?: { data?: { detail?: string } } };
        setError(error.response?.data?.detail || 'Failed to fetch venue statistics');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchVenueStats();
    }
  }, [token]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (venueStats.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No venue statistics available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Venue-wise Attendance
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {venueStats.map((venue) => (
          <Box 
            key={venue.venue_id}
            sx={{ 
              width: { 
                xs: '100%', 
                sm: 'calc(50% - 8px)', 
                md: 'calc(33.333% - 10.667px)' 
              } 
            }}
          >
            <Card sx={{ 
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3
              }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" noWrap>
                    {venue.venue_name}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleAltIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Total Attendance:
                  </Typography>
                  <Typography variant="body1" sx={{ ml: 'auto', fontWeight: 'bold' }}>
                    {venue.total_attendance}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color="success.main">
                    Valid: {venue.valid_locations}
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    Invalid: {venue.invalid_locations}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default VenueAttendanceStats;
