import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  CircularProgress, 
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

// Import recharts components
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
  const { token } = useContext(AuthContext);
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
      
      console.log("Daily statistics raw data:", dailyRes.data);
      
      // Transform daily stats for chart - handle both object and array formats
      let dailyData: DailyStatsItem[] = [];
      
      if (Array.isArray(dailyRes.data)) {
        // If it's already an array, use it directly
        dailyData = dailyRes.data.map(item => ({
          date: item.date,
          count: Number(item.count || item.total || 0)
        }));
      } else if (typeof dailyRes.data === 'object' && dailyRes.data !== null) {
        // If it's an object with date keys, transform it
        dailyData = Object.entries(dailyRes.data).map(([date, value]) => {
          // Handle if value is an object with total/count property or just a number
          let count = 0;
          if (typeof value === 'object' && value !== null) {
            count = Number('total' in value ? value.total : 
                           'count' in value ? value.count : 0);
          } else if (typeof value === 'number') {
            count = value;
          }
          
          return {
            date,
            count
          };
        });
      }
      
      // Sort by date
      dailyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      console.log("Transformed daily data:", dailyData);
      setDailyStats(dailyData);
      
      // Fetch summary statistics
      const summaryRes = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/statistics/summary', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("Summary statistics raw data:", summaryRes.data);
      
      // Ensure we have valid numbers for the pie chart
      const validLocations = Number(summaryRes.data.valid_locations || 0);
      const invalidLocations = Number(summaryRes.data.invalid_locations || 0);
      
      // Transform summary stats for pie chart
      const summaryData = [
        { name: 'Valid Locations', value: validLocations },
        { name: 'Invalid Locations', value: invalidLocations },
      ];
      
      // Filter out zero values to avoid empty pie segments
      const filteredSummaryData = summaryData.filter(item => item.value > 0);
      
      // If all values are zero, add a placeholder
      if (filteredSummaryData.length === 0) {
        filteredSummaryData.push({ name: 'No Data', value: 1 });
      }
      
      console.log("Transformed pie chart data:", filteredSummaryData);
      
      setSummaryStats({
        raw: summaryRes.data,
        pieData: filteredSummaryData
      });
      
      setError('');
    } catch (err) {
      console.error("Error fetching statistics:", err);
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

  // Custom label formatter for pie chart
  const renderCustomizedLabel = ({ name, percent }: PieChartLabelProps) => {
    // Handle NaN or undefined percent
    const safePercent = isNaN(percent) ? 0 : percent;
    return `${name}: ${(safePercent * 100).toFixed(0)}%`;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
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
                {summaryStats ? (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Attendance
                      </Typography>
                      <Typography variant="h4">
                        {isNaN(Number(summaryStats.raw.total_attendance)) ? 0 : summaryStats.raw.total_attendance}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Unique Students
                      </Typography>
                      <Typography variant="h4">
                        {isNaN(Number(summaryStats.raw.unique_students)) ? 0 : summaryStats.raw.unique_students}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Today's Attendance
                      </Typography>
                      <Typography variant="h4">
                        {isNaN(Number(summaryStats.raw.today_attendance)) ? 0 : summaryStats.raw.today_attendance}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Flagged Logs
                      </Typography>
                      <Typography variant="h4">
                        {isNaN(Number(summaryStats.raw.flagged_logs)) ? 0 : summaryStats.raw.flagged_logs}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <Typography variant="body1" color="text.secondary">
                      No summary statistics available
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
            
            {/* Location Pie Chart */}
            <Box sx={{ width: { xs: '100%', md: '65%' } }}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Location Validity
                </Typography>
                {summaryStats && summaryStats.pieData.length > 0 ? (
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
                        isAnimationActive={!refreshing} // Disable animation during refresh
                      >
                        {summaryStats.pieData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => {
                          // Handle NaN or undefined value
                          const safeValue = isNaN(Number(value)) ? 0 : Number(value);
                          return [`${safeValue} attendances`, ''];
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                    <Typography variant="body1" color="text.secondary">
                      No location data available
                    </Typography>
                  </Box>
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
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => {
                          // Format date to be more readable
                          try {
                            const date = new Date(value);
                            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                          } catch {
                            // No need to use the error variable
                            return value;
                          }
                        }}
                      />
                      <YAxis 
                        allowDecimals={false}
                        domain={[0, 'dataMax + 1']}
                      />
                      <Tooltip 
                        formatter={(value) => {
                          // Handle NaN or undefined value
                          const safeValue = isNaN(Number(value)) ? 0 : Number(value);
                          return [`${safeValue} attendances`, 'Count'];
                        }}
                        labelFormatter={(label) => {
                          // Format the date in the tooltip
                          try {
                            const date = new Date(label);
                            return date.toLocaleDateString(undefined, { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            });
                          } catch {
                            // No need to use the error variable
                            return label;
                          }
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="count" 
                        fill="#8884d8" 
                        name="Attendance Count"
                        isAnimationActive={!refreshing} // Disable animation during refresh
                      />
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


