import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TextField, InputAdornment, CircularProgress,
  Chip, Button, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText
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
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
    // Filter attendance based on search query
    if (searchQuery.trim() === '') {
      setFilteredAttendance(attendance);
    } else {
      const filtered = attendance.filter(record => 
        record.roll_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAttendance(filtered);
    }
  }, [searchQuery, attendance]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleRefresh = async () => {
    if (!token) return;
    
    try {
      setRefreshing(true);
      const response = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/attendance/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendance(response.data);
      setFilteredAttendance(response.data);
      setError('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Failed to refresh attendance records');
    } finally {
      setRefreshing(false);
    }
  };

  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const exportToExcel = async () => {
    try {
      setExportLoading(true);
      
      // Dynamically import XLSX to avoid TypeScript errors
      const XLSX = await import('xlsx');
      
      // Create a worksheet from the filtered attendance data
      const worksheet = XLSX.utils.json_to_sheet(filteredAttendance);
      
      // Create a workbook and add the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
      
      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      const fileName = `attendance_records_${date}.xlsx`;
      
      // Write the file and trigger download
      XLSX.writeFile(workbook, fileName);
      
      setExportLoading(false);
      handleExportClose();
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setExportLoading(false);
    }
  };

  const exportToPDF = () => {
    // This would typically use a library like jsPDF
    alert('PDF export functionality coming soon!');
    handleExportClose();
  };

  const printRecords = () => {
    window.print();
    handleExportClose();
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AdminHeader onMenuClick={handleSidebarToggle} title="Attendance Records" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
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
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Attendance Records
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title="Refresh data">
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={refreshing}
                  size="small"
                >
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
              </Tooltip>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportClick}
                disabled={loading || refreshing || filteredAttendance.length === 0}
                size="small"
              >
                Export
              </Button>
              <Menu
                anchorEl={exportAnchorEl}
                open={Boolean(exportAnchorEl)}
                onClose={handleExportClose}
              >
                <MenuItem onClick={exportToExcel} disabled={exportLoading}>
                  <ListItemIcon>
                    <TableChartIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Export to Excel</ListItemText>
                </MenuItem>
                <MenuItem onClick={exportToPDF} disabled={exportLoading}>
                  <ListItemIcon>
                    <PictureAsPdfIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Export to PDF</ListItemText>
                </MenuItem>
                <MenuItem onClick={printRecords} disabled={exportLoading}>
                  <ListItemIcon>
                    <PrintIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Print Records</ListItemText>
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Paper sx={{ p: 3, mb: 3 }}>
            <TextField
              placeholder="Search by name or roll number"
              variant="outlined"
              size="small"
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error" sx={{ p: 2 }}>
                {error}
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small" id="attendance-table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Roll No</TableCell>
                      <TableCell>Branch</TableCell>
                      <TableCell>Section</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Location</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAttendance.length > 0 ? (
                      filteredAttendance.map((record) => (
                        <TableRow key={record.id}>
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
            )}
          </Paper>
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







