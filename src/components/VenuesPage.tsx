import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  Box, Typography, Paper, Button, TextField, Dialog, 
  DialogTitle, DialogContent, DialogActions, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, CircularProgress, Alert, MenuItem, Select,
  FormControl, InputLabel, SelectChangeEvent
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import AdminLayout from './Admin/AdminLayout';

interface Institution {
  id: number;
  name: string;
}

interface Venue {
  id: number;
  name: string;
  institution_id: number;
  institution_name?: string;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number | null; // Not geofence_radius
}

const VenuesPage: React.FC = () => {
  const { token } = useContext(AuthContext);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    institution_id: '',
    latitude: '',
    longitude: '',
    radius_meters: '' // Not geofence_radius
  });

  const fetchInstitutions = useCallback(async () => {
    try {
      const response = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/institutions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInstitutions(response.data);
    } catch (err) {
      console.error('Error fetching institutions:', err);
      setError('Failed to fetch institutions');
    }
  }, [token]);

  const fetchVenues = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/admin/venues', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVenues(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch venues');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchInstitutions();
      await fetchVenues();
    };
    fetchData();
  }, [fetchInstitutions, fetchVenues]);

  const handleOpenDialog = (venue: Venue | null = null) => {
    if (venue) {
      setCurrentVenue(venue);
      setFormData({
        name: venue.name,
        institution_id: venue.institution_id.toString(),
        latitude: venue.latitude?.toString() || '',
        longitude: venue.longitude?.toString() || '',
        radius_meters: venue.radius_meters?.toString() || '' // Not geofence_radius
      });
    } else {
      setCurrentVenue(null);
      setFormData({
        name: '',
        institution_id: institutions.length > 0 ? institutions[0].id.toString() : '',
        latitude: '',
        longitude: '',
        radius_meters: '' // Not geofence_radius
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

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        institution_id: parseInt(formData.institution_id),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        radius_meters: formData.radius_meters ? parseFloat(formData.radius_meters) : null // Not geofence_radius
      };

      if (currentVenue) {
        // Update existing venue
        await axios.put(
          `https://qr-backend-1-pq5i.onrender.com/api/v1/admin/venues/${currentVenue.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new venue
        await axios.post(
          'https://qr-backend-1-pq5i.onrender.com/api/v1/admin/venues',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      handleCloseDialog();
      fetchVenues();
    } catch (err) {
      console.error('Error saving venue:', err);
      setError('Failed to save venue');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this venue?')) {
      try {
        await axios.delete(`https://qr-backend-1-pq5i.onrender.com/api/v1/admin/venues/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchVenues();
      } catch (err) {
        console.error('Error deleting venue:', err);
        setError('Failed to delete venue. It may be in use by QR sessions.');
      }
    }
  };

  const getInstitutionName = (institutionId: number) => {
    const institution = institutions.find(i => i.id === institutionId);
    return institution ? institution.name : 'Unknown';
  };

  return (
    <AdminLayout>
      <Box sx={{ 
        p: 3, 
        maxWidth: '1200px', 
        mx: 'auto',  // This centers the container
        width: '100%' // Ensure it takes full width up to maxWidth
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Venues</Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={institutions.length === 0}
          >
            Add Venue
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {institutions.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You need to create at least one institution before adding venues.
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ 
            mb: 3,
            overflowX: 'auto' // Ensures table is scrollable on small screens
          }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '25%' }}>Name</TableCell>
                  <TableCell sx={{ width: '25%' }}>Institution</TableCell>
                  <TableCell sx={{ width: '20%' }}>Coordinates</TableCell>
                  <TableCell sx={{ width: '15%' }}>Radius (m)</TableCell>
                  <TableCell align="center" sx={{ width: '15%' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {venues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No venues found. Add your first venue.
                    </TableCell>
                  </TableRow>
                ) : (
                  venues.map((venue) => (
                    <TableRow key={venue.id}>
                      <TableCell sx={{ pl: 2 }}>{venue.name}</TableCell>
                      <TableCell>{getInstitutionName(venue.institution_id)}</TableCell>
                      <TableCell>
                        {venue.latitude && venue.longitude 
                          ? `${venue.latitude.toFixed(6)}, ${venue.longitude.toFixed(6)}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {venue.radius_meters ? venue.radius_meters.toFixed(1) : 'N/A'} {/* Not geofence_radius */}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenDialog(venue)}
                          size="small"
                          title="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDelete(venue.id)}
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
            {currentVenue ? 'Edit Venue' : 'Add Venue'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Venue Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="institution-select-label">Institution</InputLabel>
              <Select
                labelId="institution-select-label"
                name="institution_id"
                value={formData.institution_id}
                label="Institution"
                onChange={handleSelectChange}
                required
              >
                {institutions.map((institution) => (
                  <MenuItem key={institution.id} value={institution.id}>
                    {institution.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
            
            <TextField
              margin="dense"
              name="radius_meters" // Not geofence_radius
              label="Radius (meters)"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.radius_meters} // Not geofence_radius
              onChange={handleInputChange}
              inputProps={{ min: 0, step: 'any' }}
              helperText="Distance in meters from the coordinates where attendance is allowed"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={!formData.name || !formData.institution_id}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
};

export default VenuesPage;





