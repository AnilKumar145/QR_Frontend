import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TextField, InputAdornment, CircularProgress,
  Chip, Button, Menu, MenuItem, ListItemIcon, ListItemText,
  TablePagination, Card, useTheme
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
  TableChart as TableChartIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { Sidebar } from './Sidebar';
import AdminHeader from './AdminHeader';

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
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();

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
    setPage(0); // Reset to first page when filtering
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

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate displayed records based on pagination
  const displayedRecords = filteredAttendance.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} title="Attendance Records" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${sidebarOpen ? 240 : 0}px)` },
          mt: '64px',
          ml: { sm: sidebarOpen ? '240px' : 0 },
          transition: theme => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowY: 'auto'
        }}
      >
        <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
          <Card sx={{ mb: 3, p: 2, borderRadius: 2, boxShadow: theme.shadows[2] }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              mb: 2,
              gap: 2
            }}>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                Attendance Records
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
                width: { xs: '100%', sm: 'auto' },
                flexWrap: 'wrap'
              }}>
                <TextField
                  placeholder="Search records..."
                  size="small"
                  sx={{ 
                    minWidth: { xs: '100%', sm: '220px' },
                    backgroundColor: 'white'
                  }}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={loading}
                  sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                >
                  Refresh
                </Button>
                
                <Button 
                  variant="contained" 
                  startIcon={<FileDownloadIcon />}
                  onClick={handleExportClick}
                  sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                >
                  Export
                </Button>
                
                <Menu
                  anchorEl={exportMenuAnchor}
                  open={Boolean(exportMenuAnchor)}
                  onClose={handleExportClose}
                >
                  <MenuItem onClick={handleExportClose}>
                    <ListItemIcon>
                      <TableChartIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export as CSV</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleExportClose}>
                    <ListItemIcon>
                      <PictureAsPdfIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export as PDF</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleExportClose}>
                    <ListItemIcon>
                      <PrintIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Print</ListItemText>
                  </MenuItem>
                </Menu>
              </Box>
            </Box>
            
            {error && (
              <Box sx={{ mb: 2 }}>
                <Typography color="error" sx={{ p: 2, bgcolor: 'error.lighter', borderRadius: 1 }}>
                  {error}
                </Typography>
              </Box>
            )}

            <Paper sx={{ 
              width: '100%', 
              overflow: 'hidden',
              borderRadius: 1,
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
                    <Table stickyHeader size="small" id="attendance-table">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Roll No</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Branch</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Section</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Timestamp</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.paper' }}>Location</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {displayedRecords.length > 0 ? (
                          displayedRecords.map((record) => (
                            <TableRow 
                              key={record.id}
                              hover
                              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                              <TableCell>{record.name}</TableCell>
                              <TableCell>{record.roll_no}</TableCell>
                              <TableCell>{record.branch}</TableCell>
                              <TableCell>{record.section}</TableCell>
                              <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
                              <TableCell>
                                <Chip
                                  label={record.is_valid_location ? "Valid" : "Invalid"}
                                  color={record.is_valid_location ? "success" : "error"}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    fontWeight: 500,
                                    minWidth: '70px'
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                              <Typography variant="body1" color="text.secondary">
                                No records found
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredAttendance.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </>
              )}
            </Paper>
          </Card>
        </Box>
      </Box>
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


