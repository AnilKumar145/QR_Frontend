import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  Chip, 
  CircularProgress, 
  Alert, 
  Paper,
  Button,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import { 
  LocationOn as LocationIcon, 
  School as SchoolIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

interface Institution {
  id: number;
  name: string;
}

interface Venue {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  institution_id: number;
  institution_name: string;
}

interface VenueStatistics {
  venue: {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    radius_meters: number;
  };
  date_range: {
    start: string;
    end: string;
    days: number;
  };
  sessions: {
    total: number;
    session_ids: string[];
  };
  attendance: {
    total: number;
    by_date: {
      [date: string]: number;
    };
  };
  flagged_logs: {
    total: number;
    by_reason: {
      [reason: string]: number;
    };
  };
}

const VenueAttendancePage: React.FC = () => {
  const { token } = useContext(AuthContext);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<number | null>(null);
  const [venueStats, setVenueStats] = useState<VenueStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const theme = useTheme();

  const fetchInstitutionsAndVenues = async () => {
    try {
      setLoading(true);
      const venuesResponse = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/venues', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const institutionsResponse = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/institutions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setVenues(venuesResponse.data);
      setInstitutions(institutionsResponse.data);
      
      // Select the first venue by default if available
      if (venuesResponse.data.length > 0 && !selectedVenue) {
        setSelectedVenue(venuesResponse.data[0].id);
      }
      
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch venues and institutions';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchVenueStatistics = async (venueId: number) => {
    try {
      setLoading(true);
      // Use the correct endpoint with the venue ID parameter
      const response = await axios.get(`https://qr-backend-1-pq5i.onrender.com/api/v1/admin/statistics/by-venue/${venueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setVenueStats(response.data);
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch statistics for venue ID ${venueId}`;
      setError(errorMessage);
      setVenueStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchInstitutionsAndVenues();
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedVenue && token) {
      fetchVenueStatistics(selectedVenue);
    }
  }, [selectedVenue, token]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVenueSelect = (venueId: number) => {
    setSelectedVenue(venueId);
  };

  const handleRefresh = () => {
    if (selectedVenue) {
      fetchVenueStatistics(selectedVenue);
    } else {
      fetchInstitutionsAndVenues();
    }
  };

  if (loading && !venues.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !venues.length) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          Venue Attendance
        </Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          variant="outlined" 
          onClick={handleRefresh}
          disabled={loading}
          sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3,
        height: 'calc(100% - 60px)'
      }}>
        <Box sx={{ 
          width: { xs: '100%', md: '25%' }, 
          flexShrink: 0,
          height: { xs: 'auto', md: '100%' }
        }}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 2,
              boxShadow: theme.shadows[1]
            }}
          >
            <CardContent sx={{ p: 2, height: '100%', '&:last-child': { pb: 2 } }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Venues by Institution
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ 
                height: 'calc(100% - 60px)',
                overflowY: 'auto',
                pr: 1
              }}>
                {institutions.map(institution => (
                  <Box key={institution.id} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {institution.name}
                      </Typography>
                    </Box>
                    
                    {venues
                      .filter(venue => venue.institution_id === institution.id)
                      .map(venue => (
                        <Button
                          key={venue.id}
                          fullWidth
                          variant={selectedVenue === venue.id ? "contained" : "outlined"}
                          sx={{ 
                            justifyContent: 'flex-start', 
                            mb: 1,
                            textTransform: 'none'
                          }}
                          startIcon={<LocationIcon />}
                          onClick={() => handleVenueSelect(venue.id)}
                        >
                          {venue.name}
                        </Button>
                      ))
                    }
                    
                    {venues.filter(venue => venue.institution_id === institution.id).length === 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                        No venues for this institution
                      </Typography>
                    )}
                  </Box>
                ))}
                
                {institutions.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No institutions found
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ width: { xs: '100%', md: '72%' }, flexGrow: 1 }}>
          {selectedVenue ? (
            <>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : venueStats ? (
                <Box>
                  <Paper sx={{ p: 3, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {venueStats.venue.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Radius: {venueStats.venue.radius_meters} meters
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip 
                            icon={<PeopleIcon />} 
                            label={`${venueStats.attendance.total} Attendances`} 
                            color="primary" 
                            variant="outlined" 
                          />
                          <Chip 
                            icon={<WarningIcon />} 
                            label={`${venueStats.flagged_logs.total} Flagged`} 
                            color="warning" 
                            variant="outlined" 
                          />
                        </Box>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Date Range: {new Date(venueStats.date_range.start).toLocaleDateString()} - {new Date(venueStats.date_range.end).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Sessions: {venueStats.sessions.total}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                  
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Attendance by Date
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    {Object.keys(venueStats.attendance.by_date).length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {Object.entries(venueStats.attendance.by_date)
                          .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                          .map(([date, count]) => (
                            <Box 
                              key={date} 
                              sx={{ 
                                width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 8px)' } 
                              }}
                            >
                              <Paper 
                                elevation={0} 
                                sx={{ 
                                  p: 2, 
                                  border: '1px solid', 
                                  borderColor: 'divider',
                                  borderRadius: 1
                                }}
                              >
                                <Typography variant="subtitle2" color="text.secondary">
                                  {new Date(date).toLocaleDateString(undefined, { 
                                    weekday: 'short', 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
                                  {count}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  attendances
                                </Typography>
                              </Paper>
                            </Box>
                          ))
                        }
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                        No attendance data available for this venue.
                      </Typography>
                    )}
                  </Paper>
                </Box>
              ) : (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="body1">
                    No statistics available for the selected venue.
                  </Typography>
                </Paper>
              )}
            </>
          ) : (
            <Paper sx={{ p: 3 }}>
              <Typography variant="body1">
                Please select a venue from the list to view attendance statistics.
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default VenueAttendancePage;






