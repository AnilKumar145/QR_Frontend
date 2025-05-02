import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Alert,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Chip,
  useTheme
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import SchoolIcon from '@mui/icons-material/School';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import RefreshIcon from '@mui/icons-material/Refresh';

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

const AdminDashboard: React.FC = () => {
  const { token, logout } = useContext(AuthContext);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [flaggedLogs, setFlaggedLogs] = useState<FlaggedLog[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Remove the unused variables and just use the theme.breakpoints directly in the JSX

  useEffect(() => {
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
        setFlaggedLogs(flaggedRes.data);
        setError('');
      } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string } } };
        setError(error.response?.data?.detail || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const handleRefresh = async () => {
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
      setFlaggedLogs(flaggedRes.data);
      setError('');
    } catch (err: unknown) {
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
  const validLocations = attendance.filter(record => record.is_valid_location).length;
  const invalidLocations = totalAttendance - validLocations;
  const validPercentage = totalAttendance > 0 ? (validLocations / totalAttendance * 100).toFixed(1) : '0';

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <AppBar position="static" sx={{ backgroundColor: theme.palette.primary.main }}>
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
      <AppBar position="static" sx={{ backgroundColor: theme.palette.primary.main }}>
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Total Attendance Card */}
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Typography variant="h6">Total Attendance</Typography>
              </Box>
              <Typography variant="h3" component="div" align="center" sx={{ my: 2 }}>
                {totalAttendance}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Total students who marked attendance
              </Typography>
            </CardContent>
          </Card>
          
          {/* Valid Locations Card */}
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <LocationOnIcon />
                </Avatar>
                <Typography variant="h6">Valid Locations</Typography>
              </Box>
              <Typography variant="h3" component="div" align="center" sx={{ my: 2 }}>
                {validLocations}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {validPercentage}% of total attendance
              </Typography>
            </CardContent>
          </Card>
          
          {/* Invalid Locations Card */}
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                  <LocationOffIcon />
                </Avatar>
                <Typography variant="h6">Invalid Locations</Typography>
              </Box>
              <Typography variant="h3" component="div" align="center" sx={{ my: 2 }}>
                {invalidLocations}
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Students outside campus boundary
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
        </div>

        {/* Attendance Records */}
        <Paper sx={{ p: { xs: 1, sm: 2, md: 3 }, borderRadius: 2, mb: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <SchoolIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6">Attendance Records</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <TableContainer sx={{ maxHeight: 400, overflowX: 'auto' }}>
            <Table stickyHeader size="small" aria-label="attendance table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Email</TableCell>
                  <TableCell>Roll No</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Branch</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Section</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendance.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>{record.name}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{record.email}</TableCell>
                    <TableCell>{record.roll_no}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{record.branch}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{record.section}</TableCell>
                    <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip 
                        icon={record.is_valid_location ? <LocationOnIcon /> : <LocationOffIcon />}
                        label={record.is_valid_location ? "Valid" : "Invalid"}
                        color={record.is_valid_location ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Flagged Logs */}
        <Paper sx={{ p: { xs: 1, sm: 2, md: 3 }, borderRadius: 2 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <WarningIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
            <Typography variant="h6">Flagged Logs</Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <TableContainer sx={{ maxHeight: 300, overflowX: 'auto' }}>
            <Table stickyHeader size="small" aria-label="flagged logs table">
              <TableHead>
                <TableRow>
                  <TableCell>Session ID</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Details</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {flaggedLogs.length > 0 ? (
                  flaggedLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>{log.session_id}</TableCell>
                      <TableCell>{log.reason}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{log.details}</TableCell>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No flagged logs found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
