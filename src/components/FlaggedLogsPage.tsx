import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  TextField, 
  InputAdornment, 
  CircularProgress,
  Container
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';

interface FlaggedLog {
  id: number;
  session_id: string;
  reason: string;
  details: string;
  timestamp: string;
}

const FlaggedLogsPage: React.FC = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [flaggedLogs, setFlaggedLogs] = useState<FlaggedLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<FlaggedLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const fetchFlaggedLogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/flagged-logs', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFlaggedLogs(response.data);
        setFilteredLogs(response.data);
        setError('');
      } catch (err) {
        const error = err as { response?: { data?: { detail?: string } } };
        setError(error.response?.data?.detail || 'Failed to fetch flagged logs');
      } finally {
        setLoading(false);
      }
    };

    fetchFlaggedLogs();
  }, [token, navigate]);

  useEffect(() => {
    // Filter logs based on search query
    if (searchQuery.trim() === '') {
      setFilteredLogs(flaggedLogs);
    } else {
      const filtered = flaggedLogs.filter(log => 
        log.session_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.reason.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLogs(filtered);
    }
  }, [searchQuery, flaggedLogs]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleRefresh = async () => {
    if (!token) return;
    
    try {
      setRefreshing(true);
      const response = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/flagged-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFlaggedLogs(response.data);
      setFilteredLogs(response.data);
      setError('');
    } catch (err) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Failed to refresh flagged logs');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="lg" sx={{ mt: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <TextField
            placeholder="Search by session ID or reason"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ width: { xs: '100%', sm: '50%', md: '30%' } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Paper sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
            {error}
          </Paper>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Session ID</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Details</TableCell>
                  <TableCell>Timestamp</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>{log.session_id}</TableCell>
                      <TableCell>{log.reason}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{log.details}</TableCell>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No flagged logs found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
};

export default FlaggedLogsPage;

