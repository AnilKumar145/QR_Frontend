import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  CircularProgress, 
  Alert, 
  AppBar, 
  Toolbar, 
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';

// Install recharts if not already installed:
// npm install recharts @types/recharts
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface DailyStatsItem {
  date: string;
  count: number;
}

interface SummaryStats {
  total_attendance: number;
  valid_locations: number;
  invalid_locations: number;
  unique_students: number;
  today_attendance: number;
  flagged_logs: number;
}

interface PieChartItem {
  name: string;
  value: number;
}

interface SummaryStatsData {
  raw: SummaryStats;
  pieData: PieChartItem[];
}

interface PieChartLabelProps {
  name: string;
  percent: number;
}

const StatisticsPage: React.FC = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dailyStats, setDailyStats] = useState<DailyStatsItem[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch daily statistics
      const dailyRes = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/statistics/daily', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Transform daily stats for chart
      const dailyData = Object.entries(dailyRes.data).map(([date, count]) => ({
        date,
        count: Number(count)
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setDailyStats(dailyData);
      
      // Fetch summary statistics
      const summaryRes = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/statistics/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Transform summary stats for pie chart
      const summaryData = [
        { name: 'Valid Locations', value: summaryRes.data.valid_locations },
        { name: 'Invalid Locations', value: summaryRes.data.invalid_locations },
      ];
      
      setSummaryStats({
        raw: summaryRes.data,
        pieData: summaryData
      });
      
      setError('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchStatistics();
  }, [token, navigate, fetchStatistics]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStatistics();
  };

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  // Custom label formatter for pie chart
  const renderCustomizedLabel = ({ name, percent }: PieChartLabelProps) => {
    return `${name}: ${(percent * 100).toFixed(0)}%`;
  };

  // Custom tooltip formatter for charts
  const customTooltipFormatter = (value: number) => {
    return [`${value} attendances`, ''];
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="back"
            sx={{ mr: 2 }}
            onClick={handleBackToDashboard}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Attendance Statistics
          </Typography>
          <IconButton color="inherit" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
          </IconButton>
          <IconButton color="inherit" onClick={handleBackToDashboard}>
            <DashboardIcon />
          </IconButton>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Summary Statistics */}
            <Box sx={{ width: { xs: '100%', md: '30%' } }}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Summary Statistics
                </Typography>
                {summaryStats && (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Attendance
                      </Typography>
                      <Typography variant="h4">
                        {summaryStats.raw.total_attendance}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Unique Students
                      </Typography>
                      <Typography variant="h4">
                        {summaryStats.raw.unique_students}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Today's Attendance
                      </Typography>
                      <Typography variant="h4">
                        {summaryStats.raw.today_attendance}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Flagged Logs
                      </Typography>
                      <Typography variant="h4">
                        {summaryStats.raw.flagged_logs}
                      </Typography>
                    </Box>
                  </>
                )}
              </Paper>
            </Box>
            
            {/* Location Pie Chart */}
            <Box sx={{ width: { xs: '100%', md: '65%' } }}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Location Validity
                </Typography>
                {summaryStats && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={summaryStats.pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={renderCustomizedLabel}
                      >
                        {summaryStats.pieData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={customTooltipFormatter} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Paper>
            </Box>
            
            {/* Daily Attendance Chart */}
            <Box sx={{ width: '100%' }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Daily Attendance
                </Typography>
                {dailyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={dailyStats}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" name="Attendance Count" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <Typography variant="body1" color="text.secondary">
                      No daily statistics available
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default StatisticsPage;




