import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    Typography,
    Alert,
    CircularProgress
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import Webcam from 'react-webcam';
import { useGeolocation } from '../hooks/useGeoLocation';
import { attendanceService } from '../services/attendanceService';
import { useParams } from 'react-router-dom';

interface ApiError extends Error {
    response?: {
        data?: {
            detail?: string;
        };
    };
}

interface LocationErrorDetail {
    error: string;
    message: string;
    your_location: {
        lat: number;
        lon: number;
    };
    distance: number;
    max_allowed_distance: number;
}

interface GeoLocation {
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy: number;
}

const validateLocation = async (location: GeoLocation) => {
    try {
        const response = await attendanceService.validateLocation(
            location.latitude,
            location.longitude
        );
        console.log('Location validation response:', response);
        return response.is_valid;
    } catch (error) {
        console.error('Location validation failed:', error);
        throw error;
    }
};

export const AttendanceMarking: React.FC = () => {
    const { sessionId } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        roll_no: '',
        phone: '',
        branch: '',
        section: ''
    });
    const [selfie, setSelfie] = useState<File | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | React.ReactNode | null>(null);
    const [success, setSuccess] = useState(false);

    const webcamRef = useRef<Webcam>(null);
    const { location, error: locationError } = useGeolocation();

    // Request location permission immediately when component mounts
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => {},
                (error) => {
                    setError(`Location permission: ${error.message}`);
                },
                { enableHighAccuracy: true }
            );
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCaptureSelfie = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            fetch(imageSrc)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
                    setSelfie(file);
                    setShowCamera(false);
                });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!location) {
            setError("Location data is not available. Please enable location services.");
            setLoading(false);
            return;
        }

        try {
            // Enhanced location validation
            if (!location) {
                setError('Location data is not available. Please ensure location services are enabled.');
                return;
            }

            // Pre-validate location before form submission
            const isLocationValid = await validateLocation(location);
            if (!isLocationValid) {
                setError('Your location is outside the allowed attendance area. Please ensure you are within campus boundaries.');
                return;
            }

            if (!selfie) {
                setError('Please take a selfie before submitting.');
                return;
            }

            if (!sessionId) {
                setError('Invalid session. Please scan the QR code again.');
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Log submission data
                console.log('Submitting attendance:', {
                    location: {
                        lat: location.latitude,
                        lon: location.longitude,
                        accuracy: location.accuracy,
                        timestamp: new Date(location.timestamp).toISOString()
                    },
                    sessionId,
                    formData
                });

                const response = await attendanceService.markAttendance({
                    session_id: sessionId,
                    ...formData,
                    location_lat: Number(location.latitude.toFixed(6)),
                    location_lon: Number(location.longitude.toFixed(6)),
                    selfie: selfie,
                });

                console.log('Attendance response:', response);
                setSuccess(true);
            } catch (err: unknown) {
                const error = err as ApiError;
                console.error('Attendance submission error:', error);

                // Handle the detailed location error response
                if (error.response?.data?.detail && typeof error.response.data.detail === 'object') {
                    const detail = error.response.data.detail as LocationErrorDetail;
                    if (detail.error === "Location out of range") {
                        setError(
                            <div>
                                <strong>{detail.error}</strong>
                                <p>{detail.message}</p>
                                <small>
                                    Your location: {detail.your_location.lat}, {detail.your_location.lon}
                                    <br />
                                    Distance from campus: {detail.distance} meters
                                    <br />
                                    Maximum allowed distance: {detail.max_allowed_distance} meters
                                </small>
                            </div>
                        );
                    }
                } else {
                    // Handle other types of errors
                    setError(
                        error.response?.data?.detail || 
                        error.message || 
                        'Failed to submit attendance'
                    );
                }
            } finally {
                setLoading(false);
            }
        } catch (error) {
            console.error('Location validation failed:', error);
            setError('Location validation failed. Please try again.');
        }
    };

    if (success) {
        return (
            <Alert severity="success">
                Attendance marked successfully!
            </Alert>
        );
    }

    return (
        <Card 
            sx={{ 
                maxWidth: { xs: '95%', sm: 600 },
                margin: 'auto',
                mt: 4,
                borderRadius: 2,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
            }}
        >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{
                        fontWeight: 600,
                        color: 'primary.main',
                        textAlign: 'center',
                        mb: 3
                    }}
                >
                    Mark Attendance
                </Typography>

                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mb: 3,
                            animation: 'fadeIn 0.5s ease-in'
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {locationError && (
                    <Alert 
                        severity="error" 
                        sx={{ 
                            mb: 3,
                            animation: 'fadeIn 0.5s ease-in'
                        }}
                    >
                        {locationError}
                    </Alert>
                )}

                <Box 
                    component="form" 
                    onSubmit={handleSubmit} 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 3 
                    }}
                >
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 2
                    }}>
                        <TextField
                            fullWidth
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                }
                            }}
                        />
                        <Box sx={{ 
                            display: 'flex', 
                            gap: 2,
                            flexDirection: { xs: 'column', sm: 'row' }
                        }}>
                            <TextField
                                fullWidth
                                label="Roll Number"
                                name="roll_no"
                                value={formData.roll_no}
                                onChange={handleInputChange}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1,
                                    }
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1,
                                    }
                                }}
                            />
                        </Box>
                        <Box sx={{ 
                            display: 'flex', 
                            gap: 2,
                            flexDirection: { xs: 'column', sm: 'row' }
                        }}>
                            <TextField
                                fullWidth
                                label="Branch"
                                name="branch"
                                value={formData.branch}
                                onChange={handleInputChange}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1,
                                    }
                                }}
                            />
                            <TextField
                                fullWidth
                                label="Section"
                                name="section"
                                value={formData.section}
                                onChange={handleInputChange}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1,
                                    }
                                }}
                            />
                        </Box>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                        {showCamera ? (
                            <Box 
                                sx={{ 
                                    position: 'relative',
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                <Webcam
                                    ref={webcamRef}
                                    audio={false}
                                    screenshotFormat="image/jpeg"
                                    width="100%"
                                    onUserMedia={() => setError(null)}
                                    onUserMediaError={() => setError('Camera access denied')}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleCaptureSelfie}
                                    sx={{ 
                                        position: 'absolute',
                                        bottom: 16,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        borderRadius: 5,
                                        px: 4
                                    }}
                                >
                                    Capture
                                </Button>
                            </Box>
                        ) : (
                            <Button
                                variant="contained"
                                startIcon={<PhotoCamera />}
                                onClick={() => setShowCamera(true)}
                                fullWidth
                                sx={{ 
                                    py: 1.5,
                                    borderRadius: 2,
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                                }}
                            >
                                {selfie ? 'Retake Selfie' : 'Take Selfie'}
                            </Button>
                        )}
                    </Box>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading || !location || !selfie || !sessionId}
                        fullWidth
                        sx={{ 
                            mt: 2,
                            py: 1.5,
                            borderRadius: 2,
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                            '&:disabled': {
                                background: '#ccc',
                            }
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Mark Attendance'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};
