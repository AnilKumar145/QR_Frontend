import React, { useState, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField, 
  Grid as MuiGrid, 
  CircularProgress, 
  Alert,
  Snackbar,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
  GridProps
} from '@mui/material';
// Import from the correct paths for MUI X Date Pickers v7
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
// We'll use a dynamic import for XLSX to avoid TypeScript errors
// import * as XLSX from 'xlsx';

// Create a Grid component that works with both v5 and v6/v7
const Grid = (props: GridProps) => <MuiGrid {...props} />;

interface ReportOptions {
  reportType: string;
  startDate: Date | null;
  endDate: Date | null;
  format: string;
  includePhotos: boolean;
  emailTo: string;
}

const AttendanceReportGenerator: React.FC = () => {
  const { token } = useContext(AuthContext);
  const [options, setOptions] = useState<ReportOptions>({
    reportType: 'daily',
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date(),
    format: 'excel',
    includePhotos: false,
    emailTo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fix the handleChange function to work with SelectChangeEvent
  const handleChange = (e: SelectChangeEvent | React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as string;
    const value = e.target.value;
    setOptions({
      ...options,
      [name]: value
    });
  };

  // Fix the handleDateChange function with proper typing
  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | null) => {
    setOptions({
      ...options,
      [field]: date
    });
  };

  // Keep the handleCheckboxChange function as it's used for the includePhotos checkbox
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOptions({
      ...options,
      [e.target.name]: e.target.checked
    });
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Format dates for API
      const startDate = options.startDate ? options.startDate.toISOString().split('T')[0] : '';
      const endDate = options.endDate ? options.endDate.toISOString().split('T')[0] : '';
      
      // Fetch attendance data
      const response = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/attendance/report', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          start_date: startDate,
          end_date: endDate,
          report_type: options.reportType
        }
      });
      
      if (options.format === 'excel') {
        try {
          // Dynamically import XLSX to avoid TypeScript errors
          const XLSX = await import('xlsx');
          
          // Generate Excel file
          const worksheet = XLSX.utils.json_to_sheet(response.data);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
          
          // Generate filename
          const fileName = `attendance_report_${startDate}_to_${endDate}.xlsx`;
          
          // Download file
          XLSX.writeFile(workbook, fileName);
          setSuccess('Report downloaded successfully!');
        } catch (err) {
          console.error('Error generating Excel:', err);
          setError('Failed to generate Excel file. Please try again.');
        }
      } else if (options.format === 'pdf') {
        // For PDF, we would typically use a library like jsPDF
        // This is a simplified version
        setSuccess('PDF generation is not implemented yet');
      }
      
      // If email option is selected
      if (options.emailTo) {
        // Send email with report
        await axios.post('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/attendance/email-report', {
          email: options.emailTo,
          start_date: startDate,
          end_date: endDate,
          report_type: options.reportType,
          include_photos: options.includePhotos
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setSuccess('Report has been emailed successfully!');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Generate Attendance Report
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Report Type</InputLabel>
              <Select
                name="reportType"
                value={options.reportType}
                onChange={handleChange as (event: SelectChangeEvent<string>) => void}
                label="Report Type"
              >
                <MenuItem value="daily">Daily Summary</MenuItem>
                <MenuItem value="student">By Student</MenuItem>
                <MenuItem value="course">By Course</MenuItem>
                <MenuItem value="detailed">Detailed (All Records)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Format</InputLabel>
              <Select
                name="format"
                value={options.format}
                onChange={handleChange as (event: SelectChangeEvent<string>) => void}
                label="Format"
              >
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <DatePicker
              label="Start Date"
              value={options.startDate}
              onChange={(date) => handleDateChange('startDate', date)}
              slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <DatePicker
              label="End Date"
              value={options.endDate}
              onChange={(date) => handleDateChange('endDate', date)}
              slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={options.includePhotos}
                  onChange={handleCheckboxChange}
                  name="includePhotos"
                  color="primary"
                />
              }
              label="Include Photos (Email only)"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              margin="normal"
              name="emailTo"
              label="Email Report To (Optional)"
              value={options.emailTo}
              onChange={handleChange as (event: React.ChangeEvent<HTMLInputElement>) => void}
              placeholder="Enter email address"
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={generateReport}
                disabled={loading || !options.startDate || !options.endDate}
                sx={{ 
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Download Report'}
              </Button>
              
              {options.emailTo && (
                <Button
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  onClick={generateReport}
                  disabled={loading || !options.startDate || !options.endDate}
                >
                  Email Report
                </Button>
              )}
            </Box>
          </Grid>
          
          {error && (
            <Grid item xs={12}>
              <Alert severity="error">{error}</Alert>
            </Grid>
          )}
        </Grid>
        
        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={() => setSuccess('')}
          message={success}
        />
      </Paper>
    </LocalizationProvider>
  );
};

export default AttendanceReportGenerator;



