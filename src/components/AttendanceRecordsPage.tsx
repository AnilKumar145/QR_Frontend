import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  CircularProgress, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
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
}

const AttendanceRecordsPage: React.FC = () => {
  const { token } = useContext(AuthContext);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/attendance/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttendance(response.data);
        setFilteredAttendance(response.data);
        setError('');
      } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string } } };
        setError(error.response?.data?.detail || 'Failed to fetch attendance records');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [token]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAttendance(attendance);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = attendance.filter(record => 
        record.name.toLowerCase().includes(lowercasedSearch) ||
        record.roll_no.toLowerCase().includes(lowercasedSearch) ||
        record.branch.toLowerCase().includes(lowercasedSearch) ||
        record.section.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredAttendance(filtered);
    }
  }, [searchTerm, attendance]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/attendance/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance(response.data);
      setFilteredAttendance(response.data);
      setError('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  };

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
        <Typography variant="h5" component="h1" sx={{ fontWeight: 500 }}>
          Attendance Records
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            size="small"
          >
            Refresh
          </Button>
          
          <Button 
            variant="contained" 
            startIcon={<FileDownloadIcon />}
            size="small"
          >
            Export
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by name or roll number"
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
          size="small"
          sx={{
            backgroundColor: 'white',
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
            }
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ color: 'error.main', mb: 2 }}>
          {error}
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Roll No</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Branch</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Section</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAttendance.map((record) => (
                <TableRow
                  key={record.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {record.name}
                  </TableCell>
                  <TableCell>{record.roll_no}</TableCell>
                  <TableCell>{record.branch}</TableCell>
                  <TableCell>{record.section}</TableCell>
                  <TableCell>{formatDate(record.timestamp)}</TableCell>
                  <TableCell>
                    <Chip
                      label={record.is_valid_location ? "Valid" : "Invalid"}
                      color={record.is_valid_location ? "success" : "error"}
                      size="small"
                      sx={{ 
                        minWidth: 60,
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AttendanceRecordsPage;

<style>
  {`
    @media print {
      body * {
        visibility: hidden;
      }
      #attendance-table, #attendance-table * {
        visibility: visible;
      }
      #attendance-table {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      .MuiToolbar-root, .MuiAppBar-root, button {
        display: none !important;
      }
    }
  `}
</style>



