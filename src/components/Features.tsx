import { Box, Typography, Card } from '@mui/material';

const Features = () => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Card sx={{ width: 300, height: 200, margin: 2 }}>
        <Typography variant="h6" sx={{ fontSize: 24, fontWeight: 700, color: 'primary' }}>
          Feature 1
        </Typography>
        <Typography variant="body1" sx={{ fontSize: 18, color: 'secondary' }}>
          Description of feature 1
        </Typography>
      </Card>
      <Card sx={{ width: 300, height: 200, margin: 2 }}>
        <Typography variant="h6" sx={{ fontSize: 24, fontWeight: 700, color: 'primary' }}>
          Feature 2
        </Typography>
        <Typography variant="body1" sx={{ fontSize: 18, color: 'secondary' }}>
          Description of feature 2
        </Typography>
      </Card>
    </Box>
  );
};

export default Features;