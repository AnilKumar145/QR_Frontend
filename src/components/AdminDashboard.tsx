import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContextDefinition';
import { useNavigate } from 'react-router-dom';
import {
  Box, 
  Typography, 
  Alert, 
  Container, 
  CircularProgress, 
  Card, 
  CardContent, 
  AppBar, 
  Toolbar, 
  IconButton,
  Avatar
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  People as PeopleIcon,
  LocationOn as LocationOnIcon,
  LocationOff as LocationOffIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Refresh as RefreshIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
// import AttendanceReportGenerator from './AttendanceReportGenerator';

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
  const { user, logout } = useContext(AuthContext);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [flaggedLogs, setFlaggedLogs] = useState<FlaggedLog[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  
  // Add state for statistics with proper types
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Add function to fetch statistics
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

  const handleViewStatistics = () => {
    navigate('/admin/statistics');
  };

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

  const handleRefresh = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;
    
    try {
      setRefreshing(true);
      const attendanceRes = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/attendance/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance(attendanceRes.data);

      const flaggedRes = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/flagged-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFlaggedLogs(flaggedRes.data.flagged_logs || flaggedRes.data);
      
      // Refresh statistics
      await fetchStatistics();
      
      setError('');
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Calculate statistics
  const totalAttendance = attendance.length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <DashboardIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              QR Attendance System
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading dashboard data...
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }
            }}
          >
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>QR Attendance</Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>QR Attendance System - Admin Dashboard</Box>
          </Typography>
          <IconButton color="inherit" onClick={handleRefresh} edge="end" disabled={refreshing}>
            {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout} edge="end">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ 
        mt: { xs: 2, sm: 3, md: 4 }, 
        mb: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1, sm: 2, md: 3 }
      }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Total Attendance Card */}
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
                transition: 'all 0.3s'
              }
            }}
            onClick={() => navigate('/admin/attendance')}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Typography variant="h6">Total Attendance</Typography>
              </Box>
              <Typography variant="h3" component="div" align="center" sx={{ my: 2 }}>
                {totalAttendance}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                View all attendance records
              </Typography>
            </CardContent>
          </Card>

          {/* Flagged Logs Card */}
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
                transition: 'all 0.3s'
              }
            }}
            onClick={() => navigate('/admin/flagged-logs')}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <LocationOffIcon />
                </Avatar>
                <Typography variant="h6">Flagged Logs</Typography>
              </Box>
              <Typography variant="h3" component="div" align="center" sx={{ my: 2 }}>
                {flaggedLogs.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                View all flagged attendance logs
              </Typography>
            </CardContent>
          </Card>

          {/* Student Selfies Card */}
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
                transition: 'all 0.3s'
              }
            }}
            onClick={() => navigate('/admin/selfies')}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <PhotoLibraryIcon />
                </Avatar>
                <Typography variant="h6">Student Selfies</Typography>
              </Box>
              <Typography variant="h3" component="div" align="center" sx={{ my: 2 }}>
                {totalAttendance}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                View all student selfies
              </Typography>
            </CardContent>
          </Card>

          {/* Daily Statistics Card */}
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
                transition: 'all 0.3s'
              }
            }}
            onClick={handleViewStatistics}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="h6">Daily Statistics</Typography>
              </Box>
              <Typography variant="h3" component="div" align="center" sx={{ my: 2 }}>
                {statsLoading ? (
                  <CircularProgress size={40} />
                ) : (
                  dailyStats ? Object.keys(dailyStats).length : '0'
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {statsLoading ? 'Loading statistics...' : 'Daily attendance trends'}
              </Typography>
            </CardContent>
          </Card>

          {/* Valid Locations Card */}
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
                transition: 'all 0.3s'
              }
            }}
            onClick={handleViewStatistics}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <LocationOnIcon />
                </Avatar>
                <Typography variant="h6">Valid Locations</Typography>
              </Box>
              <Typography variant="h3" component="div" align="center" sx={{ my: 2 }}>
                {statsLoading ? (
                  <CircularProgress size={40} />
                ) : (
                  summaryStats?.valid_locations || '0'
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Attendance from valid locations
              </Typography>
            </CardContent>
          </Card>

          {/* Summary Statistics Card */}
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-4px)',
                transition: 'all 0.3s'
              }
            }}
            onClick={handleViewStatistics}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <PieChartIcon />
                </Avatar>
                <Typography variant="h6">Summary Stats</Typography>
              </Box>
              <Typography variant="h3" component="div" align="center" sx={{ my: 2 }}>
                {statsLoading ? (
                  <CircularProgress size={40} />
                ) : (
                  summaryStats?.total_attendance || '0'
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Total attendance summary
              </Typography>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
