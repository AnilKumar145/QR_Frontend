import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    CircularProgress,
    Alert,
    useTheme,
    useMediaQuery,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Button
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { Timer } from './Timer';
import { useQRSession } from '../hooks/useQRSession';
import { api } from '../api';
import axios from 'axios';

interface Venue {
    id: number;
    name: string;
    institution_name?: string;
}

export const QRCodeDisplay: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { session, loading, error, getRemainingTime, refreshSession } = useQRSession();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [selectedVenue, setSelectedVenue] = useState<string>('');
    const [venuesLoading, setVenuesLoading] = useState(false);
    const [venueError, setVenueError] = useState<string | null>(null);
    const [qrGenerated, setQrGenerated] = useState(false);

    // Remove the initial QR code generation
    useEffect(() => {
        // Only fetch venues, don't generate QR code yet
        const fetchVenues = async () => {
            try {
                setVenuesLoading(true);
                setVenueError(null);
                const response = await api.get('/admin/venues');
                console.log('Venues API response:', response);
                
                if (response.data && Array.isArray(response.data)) {
                    const venuesWithInstitution = response.data.map(venue => ({
                        ...venue,
                        institution_name: venue.institution_name || 'Unknown institution'
                    }));
                    
                    setVenues(venuesWithInstitution);
                    if (response.data.length === 0) {
                        setVenueError('No venues available. Please add venues in the admin panel.');
                    }
                } else {
                    console.error('Unexpected venues data format:', response.data);
                    setVenueError('Received invalid venue data format from server.');
                }
            } catch (err) {
                console.error('Error fetching venues:', err);
                if (axios.isAxiosError(err)) {
                    const errorMessage = err.response?.data?.detail || 
                                        err.response?.status || 
                                        err.message || 
                                        'Unknown error';
                    setVenueError(`Failed to load venues: ${errorMessage}`);
                } else {
                    setVenueError('Failed to load venues. Please try again later.');
                }
            } finally {
                setVenuesLoading(false);
            }
        };
        
        fetchVenues();
    }, []);

    const handleVenueChange = (event: SelectChangeEvent) => {
        setSelectedVenue(event.target.value);
        // Reset QR generated state when venue changes
        setQrGenerated(false);
    };

    const refreshSessionWithVenue = async () => {
        try {
            if (selectedVenue) {
                const venueId = Number(selectedVenue);
                await refreshSession(venueId);
            } else {
                await refreshSession();
            }
            setQrGenerated(true);
        } catch (err) {
            console.error('Error generating QR code:', err);
        }
    };

    if (error) {
        return (
            <Alert 
                severity="error" 
                action={
                    <IconButton
                        color="inherit"
                        size="small"
                        onClick={() => refreshSession()}
                        aria-label="retry"
                    >
                        <RefreshIcon />
                    </IconButton>
                }
                sx={{ 
                    maxWidth: 400, 
                    margin: 'auto', 
                    mt: 4,
                    animation: 'fadeIn 0.5s ease-in'
                }}
            >
                <div>
                    <strong>Error:</strong> {error}
                    <br />
                    <small>Click the refresh icon to try again</small>
                </div>
            </Alert>
        );
    }

    return (
        <Card 
            sx={{ 
                maxWidth: isMobile ? '95%' : 400,
                margin: 'auto',
                mt: 4,
                borderRadius: 2,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-5px)',
                },
            }}
        >
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                <Box 
                    display="flex" 
                    flexDirection="column" 
                    alignItems="center" 
                    gap={3}
                >
                    <Typography 
                        variant="h5" 
                        component="h2" 
                        gutterBottom
                        sx={{
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            textAlign: 'center',
                            mb: 2
                        }}
                    >
                        Generate QR Code for Attendance
                    </Typography>

                    <Box sx={{ mb: 3, maxWidth: 400, mx: 'auto', width: '100%' }}>
                        {venueError && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                {venueError}
                                <Button 
                                    size="small" 
                                    onClick={() => window.location.reload()} 
                                    sx={{ ml: 1 }}
                                >
                                    Retry
                                </Button>
                            </Alert>
                        )}
                        
                        <FormControl fullWidth disabled={loading || venuesLoading}>
                            <InputLabel id="venue-select-label">Select Venue</InputLabel>
                            <Select
                                labelId="venue-select-label"
                                value={selectedVenue}
                                label="Select Venue"
                                onChange={handleVenueChange}
                                sx={{ textAlign: 'left' }}
                            >
                                <MenuItem value="">
                                    <em>Institution-wide (Default Location)</em>
                                </MenuItem>
                                {venues.map((venue) => (
                                    <MenuItem key={venue.id} value={venue.id.toString()}>
                                        {venue.name} ({venue.institution_name})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={refreshSessionWithVenue}
                            sx={{ mt: 1, width: '100%' }}
                            disabled={loading}
                        >
                            Generate QR Code
                        </Button>
                    </Box>

                    {/* Only show QR code if it has been generated */}
                    {qrGenerated && (
                        <>
                            {loading ? (
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        minHeight: 256 
                                    }}
                                >
                                    <CircularProgress size={60} />
                                </Box>
                            ) : (
                                <>
                                    {session?.qr_image && (
                                        <>
                                            <Box 
                                                sx={{ 
                                                    position: 'relative',
                                                    width: '100%',
                                                    maxWidth: 256,
                                                    margin: 'auto',
                                                    p: 2,
                                                    background: '#fff',
                                                    borderRadius: 1,
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                }}
                                            >
                                                <Box
                                                    component="img"
                                                    src={session.qr_image}
                                                    alt="QR Code"
                                                    sx={{ 
                                                        width: '100%',
                                                        height: 'auto',
                                                        display: 'block',
                                                        borderRadius: 1,
                                                    }}
                                                />
                                            </Box>
                                            
                                            {/* Display venue information */}
                                            <Typography 
                                                variant="subtitle1" 
                                                sx={{ 
                                                    mt: 2,
                                                    fontWeight: 'medium',
                                                    color: theme.palette.primary.main
                                                }}
                                            >
                                                {session.venue_name ? 
                                                    `QR Code for: ${session.venue_name}` : 
                                                    'Institution-wide QR Code'}
                                            </Typography>
                                        </>
                                    )}
                                    
                                    <Timer 
                                        seconds={getRemainingTime()} 
                                        onComplete={() => refreshSessionWithVenue()}
                                    />

                                    <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{ 
                                            textAlign: 'center',
                                            fontStyle: 'italic'
                                        }}
                                    >
                                        QR Code refreshes automatically every 2 minutes
                                    </Typography>
                                </>
                            )}
                        </>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};
