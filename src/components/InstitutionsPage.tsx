import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, Dialog, 
  DialogTitle, DialogContent, DialogActions, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, CircularProgress, Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import AdminLayout from './Admin/AdminLayout';

interface Institution {
  id: number;
  name: string;
  city: string | null; // Make nullable to handle possible null values
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

const InstitutionsPage: React.FC = () => {
  const { token } = useContext(AuthContext);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentInstitution, setCurrentInstitution] = useState<Institution | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    address: '',
    latitude: '',
    longitude: ''
  });

  const fetchInstitutions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/institutions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInstitutions(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch institutions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  const handleOpenDialog = (institution: Institution | null = null) => {
    if (institution) {
      setCurrentInstitution(institution);
      setFormData({
        name: institution.name,
        city: institution.city || '',
        address: institution.address || '',
        latitude: institution.latitude?.toString() || '',
        longitude: institution.longitude?.toString() || ''
      });
    } else {
      setCurrentInstitution(null);
      setFormData({
        name: '',
        city: '',
        address: '',
        latitude: '',
        longitude: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        city: formData.city,
        address: formData.address,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };

      if (currentInstitution) {
        // Update existing institution
        await axios.put(
          `https://qr-backend-1-pq5i.onrender.com/api/v1/admin/institutions/${currentInstitution.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new institution
        await axios.post(
          'https://qr-backend-1-pq5i.onrender.com/api/v1/admin/institutions',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      handleCloseDialog();
      fetchInstitutions();
    } catch (err) {
      console.error('Error saving institution:', err);
      setError('Failed to save institution');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this institution?')) {
      try {
        await axios.delete(`https://qr-backend-1-pq5i.onrender.com/api/v1/admin/institutions/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchInstitutions();
      } catch (err) {
        console.error('Error deleting institution:', err);
        setError('Failed to delete institution. It may have associated venues.');
      }
    }
  };

  // Remove the unused getCity function
  // const getCity = (address: string | null): string => {
  //   if (!address) return 'N/A';
  //   
  //   // Try to extract city from address
  //   // This is a simple implementation - you might need to adjust based on your address format
  //   const parts = address.split(',');
  //   if (parts.length > 1) {
  //     return parts[parts.length - 2].trim();
  //   }
  //   
  //   return address.split(' ')[0] || 'N/A';
  // };

  return (
    <AdminLayout>
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Institutions</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Institution
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {institutions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No institutions found. Add your first institution.
                    </TableCell>
                  </TableRow>
                ) : (
                  institutions.map((institution) => (
                    <TableRow key={institution.id}>
                      <TableCell><strong>{institution.name}</strong></TableCell>
                      <TableCell>{institution.city || 'N/A'}</TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenDialog(institution)}
                          size="small"
                          title="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(institution.id)}
                          size="small"
                          title="Delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {currentInstitution ? 'Edit Institution' : 'Add Institution'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Institution Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="city"
              label="City"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.city}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="address"
              label="Address"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.address}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                margin="dense"
                name="latitude"
                label="Latitude"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.latitude}
                onChange={handleInputChange}
                inputProps={{ step: 'any' }}
              />
              <TextField
                margin="dense"
                name="longitude"
                label="Longitude"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.longitude}
                onChange={handleInputChange}
                inputProps={{ step: 'any' }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={!formData.name}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default InstitutionsPage;








