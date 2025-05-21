import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box, 
  Typography, 
  Alert, 
  CircularProgress, 
  Card, 
  CardContent,
  useTheme,
} from '@mui/material';
import { 
  People as PeopleIcon,
  LocationOn as LocationOnIcon,
  Warning as WarningIcon,
  PhotoLibrary as PhotoLibraryIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import VenueAttendanceStats from './VenueAttendanceStats';



interface AttendanceRecord {
  id: number;
  name: string;
  email: string;
  roll_no: string;
  branch: string;
  section: string;
  timestamp: string;
  is_valid_location: boolean;
}

interface FlaggedLog {
  id: number;
  session_id: string;
  reason: string;
  details: string;
  timestamp: string;
}

interface DailyStats {
  [date: string]: number;
}

interface SummaryStats {
  total_attendance: number;
  valid_locations: number;
  invalid_locations: number;
  unique_students: number;
  today_attendance: number;
  flagged_logs: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [flaggedLogs, setFlaggedLogs] = useState<FlaggedLog[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const fetchStatistics = React.useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    try {
      setStatsLoading(true);
      
      // Fetch daily statistics
      const dailyRes = await axios.get<DailyStats>('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/statistics/daily', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDailyStats(dailyRes.data);
      
      // Fetch summary statistics
      const summaryRes = await axios.get<SummaryStats>('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/statistics/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummaryStats(summaryRes.data);
      
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      console.error("Error fetching statistics:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/admin/login');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const attendanceRes = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/attendance/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttendance(attendanceRes.data);

        const flaggedRes = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/flagged-logs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFlaggedLogs(flaggedRes.data.flagged_logs || flaggedRes.data);
        
        // Fetch statistics
        await fetchStatistics();
        
        setError('');
      } catch (err) {
        const error = err as { response?: { data?: { detail?: string } } };
        setError(error.response?.data?.detail || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate, fetchStatistics]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        p: 3 
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: 1,
          maxWidth: 400,
          width: '100%'
        }}>
          <CircularProgress 
            size={48} 
            thickness={4} 
            sx={{ mb: 3, color: theme.palette.primary.main }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 1,
              fontWeight: 600,
              textAlign: 'center'
            }}
          >
            Loading Dashboard
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ textAlign: 'center' }}
          >
            Please wait while we fetch your data...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Calculate total attendance
  const totalAttendance = attendance.length;
  const validLocations = summaryStats?.valid_locations || 0;
  const totalFlaggedLogs = flaggedLogs.length;
  const dailyStatsCount = dailyStats ? Object.keys(dailyStats).length : 0;

  // Dashboard card data
  const dashboardCards = [
    {
      title: "Total Attendance",
      value: totalAttendance,
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      color: "#4361ee",
      linkText: "View all attendance records",
      path: "/admin/attendance",
      bgColor: "#e6ecff"
    },
    {
      title: "Flagged Logs",
      value: totalFlaggedLogs,
      icon: <WarningIcon sx={{ fontSize: 28 }} />,
      color: "#ef476f",
      linkText: "View all flagged attendance logs",
      path: "/admin/flagged-logs",
      bgColor: "#ffebf0"
    },
    {
      title: "Student Selfies",
      value: totalAttendance,
      icon: <PhotoLibraryIcon sx={{ fontSize: 28 }} />,
      color: "#0096c7",
      linkText: "View all student selfies",
      path: "/admin/selfies",
      bgColor: "#e0f7ff"
    },
    {
      title: "Daily Statistics",
      value: dailyStatsCount,
      icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
      color: "#06d6a0",
      linkText: "Daily attendance trends",
      path: "/admin/statistics",
      bgColor: "#e0fff7"
    },
    {
      title: "Valid Locations",
      value: validLocations,
      icon: <LocationOnIcon sx={{ fontSize: 28 }} />,
      color: "#06d6a0",
      linkText: "Attendance from valid locations",
      path: "/admin/statistics",
      bgColor: "#e0fff7"
    },
    {
      title: "Summary Stats",
      value: summaryStats?.total_attendance || 0,
      icon: <PieChartIcon sx={{ fontSize: 28 }} />,
      color: "#8338ec",
      linkText: "Total attendance summary",
      path: "/admin/statistics",
      bgColor: "#f3e8ff"
    }
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: -1.5 }}>
        {dashboardCards.map((card, index) => (
          <Box 
            key={index} 
            sx={{ 
              width: { xs: '100%', sm: '50%', md: '33.333%' }, 
              padding: 1.5 
            }}
          >
            <Card 
              sx={{ 
                height: '100%',
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                overflow: 'hidden',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                }
              }}
              onClick={() => navigate(card.path)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2.5 
                }}>
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      bgcolor: card.bgColor,
                      color: card.color,
                      mr: 2
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary'
                    }}
                  >
                    {card.title}
                  </Typography>
                </Box>
                
                <Typography 
                  variant="h3" 
                  component="div" 
                  sx={{ 
                    mb: 2,
                    fontWeight: 700,
                    textAlign: 'center',
                    color: card.color
                  }}
                >
                  {statsLoading ? (
                    <CircularProgress size={40} sx={{ color: card.color }} />
                  ) : (
                    card.value
                  )}
                </Typography>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    textAlign: 'center',
                    color: 'text.secondary',
                    fontWeight: 500
                  }}
                >
                  {card.linkText}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}

        {/* Venue-wise attendance stats */}
        <Box sx={{ width: '100%', padding: 1.5 }}>
          <Card sx={{ 
            p: 3, 
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3, 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <LocationOnIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              Venue Attendance Statistics
            </Typography>
            
            {statsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <VenueAttendanceStats />
            )}
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
