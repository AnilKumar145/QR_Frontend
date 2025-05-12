import React, { useState, useCallback, useRef, useEffect, ReactNode } from 'react';
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
import { CameraAlt } from '@mui/icons-material';
import Webcam from 'react-webcam';
import { useGeolocation } from '../hooks/useGeoLocation';
import { api } from '../api';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// Keep the GeoLocation interface as it's used by the useGeolocation hook
interface GeoLocation {
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy: number;
}

// Simple interface for location validation response
interface LocationValidationResponse {
    is_valid: boolean;
    distance_meters: number;
    max_allowed_distance_meters: number;
}

const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
};

const validatePhone = (phone: string) => {
    // Check if phone is a valid 10-digit number
    const re = /^[0-9]{10}$/;
    return re.test(phone);
};

export const AttendanceMarking: React.FC = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [formValues, setFormValues] = useState({
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
    const [error, setError] = useState<string | ReactNode | null>(null);
    const [success, setSuccess] = useState(false);
    const [locationValid, setLocationValid] = useState<boolean | null>(null);

    const webcamRef = useRef<Webcam>(null);
    const { location } = useGeolocation();

    // Validate location with the backend
    const validateLocation = async (loc: GeoLocation): Promise<boolean> => {
        try {
            const response = await api.get('/utils/location/validate', {
                params: {
                    lat: loc.latitude,
                    lon: loc.longitude
                }
            });
            
            const data = response.data as LocationValidationResponse;
            return data.is_valid;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.error('Location validation error:', error.response.data);
                // If we get a specific error message from the server, use it
                if (error.response.data.detail) {
                    setError(`Location error: ${error.response.data.detail}`);
                }
            } else {
                console.error('Location validation error:', error);
            }
            return false;
        }
    };

    // Check location validity when location changes
    useEffect(() => {
        if (location) {
            const checkLocation = async () => {
                const isValid = await validateLocation(location);
                setLocationValid(isValid);
                
                if (!isValid) {
                    setError("Your location is outside the allowed area. Please ensure you are within the venue boundaries.");
                }
            };
            
            checkLocation();
        }
    }, [location]);

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
        setFormValues({
            ...formValues,
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
        setLoading(true);
        setError(null);
        
        try {
            // Validate form data...
            
            if (!formValues.name.trim()) {
                setError('Name is required.');
                setLoading(false);
                return;
            }
            if (!validateEmail(formValues.email)) {
                setError('Please enter a valid email address (e.g., student@example.com).');
                setLoading(false);
                return;
            }
            if (!formValues.roll_no.trim()) {
                setError('Roll number is required.');
                setLoading(false);
                return;
            }
            if (!validatePhone(formValues.phone)) {
                setError('Please enter a valid 10-digit phone number.');
                setLoading(false);
                return;
            }
            if (!formValues.branch.trim()) {
                setError('Branch is required.');
                setLoading(false);
                return;
            }
            if (!formValues.section.trim()) {
                setError('Section is required.');
                setLoading(false);
                return;
            }

            if (!location) {
                setError("Location data is not available. Please enable location services and refresh the page.");
                setLoading(false);
                return;
            }

            // Check if location is valid
            if (locationValid === false) {
                setError("Your location is outside the allowed area. Please ensure you are within the venue boundaries.");
                setLoading(false);
                return;
            }

            if (!selfie) {
                setError('Please take a selfie before submitting.');
                setLoading(false);
                return;
            }

            if (!sessionId) {
                setError('Invalid session. Please scan the QR code again.');
                setLoading(false);
                return;
            }
            
            // Create form data
            const submitData = new FormData();
            submitData.append('session_id', sessionId);
            submitData.append('name', formValues.name);
            submitData.append('email', formValues.email);
            submitData.append('roll_no', formValues.roll_no);
            submitData.append('phone', formValues.phone);
            submitData.append('branch', formValues.branch);
            submitData.append('section', formValues.section);
            submitData.append('location_lat', location.latitude.toFixed(6));
            submitData.append('location_lon', location.longitude.toFixed(6));
            submitData.append('selfie', selfie);
            
            // Submit to the correct API endpoint
            await api.post('/attendance/mark', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            // Handle success...
            setSuccess(true);
        } catch (error) {
            console.error('Error submitting attendance:', error);
            
            if (axios.isAxiosError(error) && error.response) {
                const errorData = error.response.data;
                
                // Check if the error is in the expected format with detail property
                if (errorData.detail && typeof errorData.detail === 'object') {
                    if (errorData.detail.error === 'invalid_location') {
                        // Format a user-friendly error message with distance information
                        const details = errorData.detail.details;
                        const distance = Math.round(details.distance_meters);
                        const venueName = details.venue_name || 'venue';
                        const maxDistance = details.max_allowed_distance_meters;
                        
                        setError(
                            `Your location is ${distance}m away from ${venueName}. 
                            Maximum allowed distance is ${maxDistance}m. 
                            Please ensure you are within venue boundaries.`
                        );
                    } else {
                        // For other structured errors, use the message from the detail
                        setError(errorData.detail.message || JSON.stringify(errorData.detail));
                    }
                } else {
                    // For simple error messages
                    setError(`Failed to submit attendance: ${errorData.detail || JSON.stringify(errorData)}`);
                }
            } else {
                setError('Failed to submit attendance. Please try again.');
            }
        } finally {
            setLoading(false);
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
                            value={formValues.name}
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
                            value={formValues.email}
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
                                value={formValues.roll_no}
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
                                value={formValues.phone}
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
                                value={formValues.branch}
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
                                value={formValues.section}
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
                        {!selfie && !showCamera && (
                            <Button
                                variant="outlined"
                                startIcon={<CameraAlt />}
                                onClick={() => setShowCamera(true)}
                                fullWidth
                                sx={{ 
                                    py: 1.5,
                                    borderRadius: 2,
                                    borderWidth: 2,
                                    '&:hover': {
                                        borderWidth: 2
                                    }
                                }}
                            >
                                Take Selfie
                            </Button>
                        )}

                        {showCamera && (
                            <Box sx={{ 
                                position: 'relative',
                                width: '100%',
                                borderRadius: 2,
                                overflow: 'hidden',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                mb: 2
                            }}>
                                <Webcam
                                    ref={webcamRef}
                                    audio={false}
                                    screenshotFormat="image/jpeg"
                                    width="100%"
                                    onUserMedia={() => setError(null)}
                                    onUserMediaError={() => setError('Camera access denied. Please allow camera access in your browser settings.')}
                                />
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        position: 'absolute', 
                                        top: 8, 
                                        left: 0, 
                                        right: 0, 
                                        textAlign: 'center',
                                        color: 'white',
                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                        padding: '4px'
                                    }}
                                >
                                    Please look at the camera and ensure your face is clearly visible
                                </Typography>
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
                        )}

                        {selfie && (
                            <Box sx={{ 
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <Box
                                    component="img"
                                    src={URL.createObjectURL(selfie)}
                                    alt="Selfie"
                                    sx={{ 
                                        width: '100%',
                                        maxWidth: 300,
                                        borderRadius: 2,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                />
                                <Button
                                    variant="text"
                                    color="primary"
                                    onClick={() => {
                                        setSelfie(null);
                                        setShowCamera(true);
                                    }}
                                    sx={{ mt: 1 }}
                                >
                                    Retake Selfie
                                </Button>
                            </Box>
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
                                opacity: 0.7,
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




















