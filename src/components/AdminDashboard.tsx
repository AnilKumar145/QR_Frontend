import { Box, Typography } from '@mui/material';
import AttendanceMarking from './AttendanceMarking';

const AdminDashboard = () => {
  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" sx={{ fontSize: 24, fontWeight: 700, color: 'primary' }}>
        Admin Dashboard
      </Typography>
      <AttendanceMarking />
    </Box>
  );
};

export default AdminDashboard;