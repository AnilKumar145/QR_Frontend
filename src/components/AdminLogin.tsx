import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert, Container, Paper, CircularProgress, Fade } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useContext(AuthContext);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Prepare form-urlencoded data as backend expects OAuth2PasswordRequestForm
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      // Use the full backend URL
      const response = await axios.post('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/login', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const token = response.data.access_token;
      login(token); // Use context login to set token
      
      // Show success message before redirecting
      setSuccess(true);
      
      // Redirect after a short delay to show the success message
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
      
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Login failed');
      }
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, position: 'relative' }}>
        {success && (
          <Fade in={success}>
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.9)',
                zIndex: 10,
                borderRadius: 2
              }}
            >
              <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" color="success.main">
                Login Successful!
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Redirecting to dashboard...
              </Typography>
              <CircularProgress size={24} sx={{ mt: 2 }} />
            </Box>
          </Fade>
        )}
        
        <Typography variant="h5" component="h2" align="center" gutterBottom>
          Admin Login
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoFocus
            disabled={loading || success}
          />
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading || success}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading || success}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminLogin;
