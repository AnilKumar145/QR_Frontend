import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, TextField, InputAdornment, CircularProgress,
  Chip, IconButton, Tooltip, AppBar, Toolbar
} from '@mui/material';
import { Search as SearchIcon, ArrowBack as ArrowBackIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import PrintIcon from '@mui/icons-material/Print';

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
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<AttendanceRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }

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
  }, [token, navigate]);

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

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBackToDashboard}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Attendance Records
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportClick}
              sx={{ ml: 2 }}
              disabled={loading || refreshing || filteredAttendance.length === 0}
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
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <TextField
            placeholder="Search by name or roll number"
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
          <TableContainer component={Paper} sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }} id="attendance-table">
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Roll No</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Branch</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Section</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell>{record.name}</TableCell>
                      <TableCell>{record.roll_no}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{record.branch}</TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{record.section}</TableCell>
                      <TableCell>{new Date(record.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Tooltip title={record.is_valid_location ? "Valid location" : "Invalid location"}>
                          <Chip
                            icon={record.is_valid_location ? <LocationOnIcon /> : <LocationOffIcon />}
                            label={record.is_valid_location ? "Valid" : "Invalid"}
                            color={record.is_valid_location ? "success" : "error"}
                            size="small"
                          />
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No attendance records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
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


