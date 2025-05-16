import { Box, Typography, Button } from '@mui/material';

const Hero = () => {
  return (
    <Box sx={{ height: '100vh', backgroundImage: 'url(/hero.jpg)', backgroundSize: 'cover' }}>
      <Typography variant="h1" sx={{ fontSize: 48, fontWeight: 700, color: 'white' }}>
        QR Attendance
      </Typography>
      <Button variant="contained" color="primary" sx={{ fontSize: 24, fontWeight: 700 }}>
        Get Started
      </Button>
    </Box>
  );
};

export default Hero;