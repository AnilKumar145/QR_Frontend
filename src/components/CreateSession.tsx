import React, { useState, useContext } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Container, 
  Paper, 
  CircularProgress, 
  Alert,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

const CreateSession: React.FC = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sessionName, setSessionName] = useState('');
  const [duration, setDuration] = useState('30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(
        'https://qr-backend-1-pq5i.onrender.com/api/v1/admin/sessions/create',
        {
          name: sessionName,
          duration_minutes: parseInt(duration)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess(true);
      setSessionName('');
      setDuration('30');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) 
        ? err.response?.data?.detail || 'Failed to create session'
        : 'Failed to create session';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
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
            Create New Session
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          {success ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Session created successfully! Redirecting to dashboard...
            </Alert>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              <Typography variant="h5" component="h1" gutterBottom>
                Create New Attendance Session
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Session Name"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  required
                  placeholder="e.g., CS101 Lecture 5"
                />
                
                <TextField
                  label="Duration (minutes)"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  inputProps={{ min: 5, max: 180 }}
                  helperText="Session duration between 5 and 180 minutes"
                />
                
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Session'}
                </Button>
              </form>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default CreateSession;

