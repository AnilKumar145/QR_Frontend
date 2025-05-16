import  { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { ChangeEvent, FormEvent } from 'react';
const AttendanceMarking = () => {
  const [attendance, setAttendance] = useState({
    studentName: '',
    attendanceStatus: '',
  });

const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
  setAttendance({ ...attendance, [event.target.name]: event.target.value });
};

const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  // Submit the attendance data to the server
};

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" sx={{ fontSize: 24, fontWeight: 700, color: 'primary' }}>
        Attendance Marking
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Student Name"
          name="studentName"
          value={attendance.studentName}
          onChange={handleInputChange}
          sx={{ width: '100%', marginBottom: 2 }}
        />
        <TextField
          label="Attendance Status"
          name="attendanceStatus"
          value={attendance.attendanceStatus}
          onChange={handleInputChange}
          sx={{ width: '100%', marginBottom: 2 }}
        />
        <Button variant="contained" color="primary" type="submit">
          Mark Attendance
        </Button>
      </form>
    </Box>
  );
};

export default AttendanceMarking;