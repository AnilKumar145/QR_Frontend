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
import axios from 'axios';

interface Venue {
    id: number;
    name: string;
    institution_name: string;
}

export const QRCodeDisplay: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { session, loading, error, getRemainingTime, refreshSession } = useQRSession();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [selectedVenue, setSelectedVenue] = useState<string>(''); // Updated to string
    const [venuesLoading, setVenuesLoading] = useState(false);

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                setVenuesLoading(true);
                const response = await axios.get('https://qr-backend-1-pq5i.onrender.com/api/v1/venues/list');
                setVenues(response.data);
            } catch (err) {
                console.error('Error fetching venues:', err);
            } finally {
                setVenuesLoading(false);
            }
        };
        
        fetchVenues();
    }, []);

    const handleVenueChange = (event: SelectChangeEvent) => {
        setSelectedVenue(event.target.value);
    };

    const refreshSessionWithVenue = async () => {
        if (selectedVenue) {
            const venueId = Number(selectedVenue);
            await refreshSession(venueId);
        } else {
            await refreshSession();
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
                        Scan QR Code
                    </Typography>

                    <Box sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
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
                                    <em>No specific venue</em>
                                </MenuItem>
                                {venues.map((venue) => (
                                    <MenuItem key={venue.id} value={venue.id.toString()}>
                                        {venue.name} ({venue.institution_name})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        
                        {selectedVenue && (
                            <Button 
                                variant="contained" 
                                color="primary"
                                onClick={refreshSessionWithVenue}
                                sx={{ mt: 1 }}
                                disabled={loading}
                            >
                                Generate QR for Selected Venue
                            </Button>
                        )}
                    </Box>

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
                            )}
                            
                            <Timer 
                                seconds={getRemainingTime()} 
                                onComplete={() => refreshSession()}
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

                            <IconButton 
                                onClick={() => refreshSession()}
                                color="primary"
                                aria-label="refresh QR code"
                                sx={{
                                    backgroundColor: 'rgba(0,0,0,0.05)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0,0,0,0.1)',
                                    }
                                }}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};
