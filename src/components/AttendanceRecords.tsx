import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  People as PeopleIcon,
  School as SchoolIcon
} from '@mui/icons-material';

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

const AttendanceRecords: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();

  // Summary stats
  const [totalRecords, setTotalRecords] = useState(0);
  const [validLocations, setValidLocations] = useState(0);
  const [invalidLocations, setInvalidLocations] = useState(0);
  const [uniqueStudents, setUniqueStudents] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      try {
        setLoading(true);
        const response = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/attendance/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setRecords(response.data);
        setFilteredRecords(response.data);
        
        // Calculate summary stats
        setTotalRecords(response.data.length);
        setValidLocations(response.data.filter((r: AttendanceRecord) => r.is_valid_location).length);
        setInvalidLocations(response.data.filter((r: AttendanceRecord) => !r.is_valid_location).length);
        
        // Count unique students by roll_no
        const uniqueRollNos = new Set(response.data.map((r: AttendanceRecord) => r.roll_no));
        setUniqueStudents(uniqueRollNos.size);
        
        setError('');
      } catch (err) {
        const error = err as { response?: { data?: { detail?: string } } };
        setError(error.response?.data?.detail || 'Failed to fetch attendance records');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = records.filter(record => 
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.section.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecords(filtered);
      setPage(0);
    } else {
      setFilteredRecords(records);
    }
  }, [searchTerm, records]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  // Calculate displayed records based on pagination
  const displayedRecords = filteredRecords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
        Student Attendance Records
      </Typography>
      
      {/* Summary Cards */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3 
        }}>
          <Box sx={{ 
            width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } 
          }}>
            <Card sx={{ 
              height: '100%', 
              boxShadow: theme.shadows[1],
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
              }
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" alignItems="center" mb={1.5}>
                  <Box 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1), 
                      borderRadius: '50%',
                      p: 1,
                      mr: 1.5
                    }}
                  >
                    <PeopleIcon color="primary" />
                  </Box>
                  <Typography variant="subtitle1" color="text.secondary">
                    Total Records
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                  {totalRecords}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ 
            width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } 
          }}>
            <Card sx={{ 
              height: '100%', 
              boxShadow: theme.shadows[1],
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
              }
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" alignItems="center" mb={1.5}>
                  <Box 
                    sx={{ 
                      bgcolor: alpha(theme.palette.success.main, 0.1), 
                      borderRadius: '50%',
                      p: 1,
                      mr: 1.5
                    }}
                  >
                    <CheckCircleIcon color="success" />
                  </Box>
                  <Typography variant="subtitle1" color="text.secondary">
                    Valid Locations
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                  {validLocations}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ 
            width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } 
          }}>
            <Card sx={{ 
              height: '100%', 
              boxShadow: theme.shadows[1],
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
              }
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" alignItems="center" mb={1.5}>
                  <Box 
                    sx={{ 
                      bgcolor: alpha(theme.palette.error.main, 0.1), 
                      borderRadius: '50%',
                      p: 1,
                      mr: 1.5
                    }}
                  >
                    <CancelIcon color="error" />
                  </Box>
                  <Typography variant="subtitle1" color="text.secondary">
                    Invalid Locations
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                  {invalidLocations}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ 
            width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } 
          }}>
            <Card sx={{ 
              height: '100%', 
              boxShadow: theme.shadows[1],
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[4],
              }
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box display="flex" alignItems="center" mb={1.5}>
                  <Box 
                    sx={{ 
                      bgcolor: alpha(theme.palette.info.main, 0.1), 
                      borderRadius: '50%',
                      p: 1,
                      mr: 1.5
                    }}
                  >
                    <SchoolIcon color="info" />
                  </Box>
                  <Typography variant="subtitle1" color="text.secondary">
                    Unique Students
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                  {uniqueStudents}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
      
      {/* Search and Table */}
      <Paper sx={{ p: 3, mb: 3, boxShadow: theme.shadows[1] }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, roll number, branch or section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
            size="small"
          />
        </Box>
        
        <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
          <Table stickyHeader aria-label="attendance records table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>Roll No</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.05), display: { xs: 'none', md: 'table-cell' } }}>Branch</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.05), display: { xs: 'none', md: 'table-cell' } }}>Section</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedRecords.length > 0 ? (
                displayedRecords.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>{record.name}</TableCell>
                    <TableCell>{record.roll_no}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{record.branch}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{record.section}</TableCell>
                    <TableCell>{formatDate(record.timestamp)}</TableCell>
                    <TableCell>
                      <Chip
                        label={record.is_valid_location ? "Valid" : "Invalid"}
                        color={record.is_valid_location ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredRecords.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default AttendanceRecords;





