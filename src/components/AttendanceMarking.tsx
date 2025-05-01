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
import { PhotoCamera } from '@mui/icons-material';
import Webcam from 'react-webcam';
import { useGeolocation } from '../hooks/useGeoLocation';
import { attendanceService } from '../services/attendanceService';
import { useParams } from 'react-router-dom';

interface ApiError extends Error {
    response?: {
        data?: {
            detail?: string | object;
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
    const [error, setError] = useState<string | ReactNode | null>(null);
    const [success, setSuccess] = useState(false);

    const webcamRef = useRef<Webcam>(null);
    const { location } = useGeolocation();

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

        try {
            // Enhanced form validations
            if (!formData.name.trim()) {
                setError('Name is required.');
                setLoading(false);
                return;
            }
            if (!validateEmail(formData.email)) {
                setError('Please enter a valid email address (e.g., student@example.com).');
                setLoading(false);
                return;
            }
            if (!formData.roll_no.trim()) {
                setError('Roll number is required.');
                setLoading(false);
                return;
            }
            if (!validatePhone(formData.phone)) {
                setError('Please enter a valid 10-digit phone number.');
                setLoading(false);
                return;
            }
            if (!formData.branch.trim()) {
                setError('Branch is required.');
                setLoading(false);
                return;
            }
            if (!formData.section.trim()) {
                setError('Section is required.');
                setLoading(false);
                return;
            }

            if (!location) {
                setError("Location data is not available. Please enable location services and refresh the page.");
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

            // Log the data being sent to help debug
            console.log('Submitting attendance with data:', {
                session_id: sessionId,
                ...formData,
                location_lat: location ? Number(location.latitude.toFixed(6)) : null,
                location_lon: location ? Number(location.longitude.toFixed(6)) : null,
                selfie: selfie,
            });

            // Pre-validate location before form submission
            const isLocationValid = await validateLocation(location);
            if (!isLocationValid) {
                setError(
                    <div>
                        <strong>Location validation failed</strong>
                        <p>You appear to be far from the institution campus in Vijayawada.</p>
                        <p>Attendance can only be marked when you are physically present on campus.</p>
                    </div>
                );
                setLoading(false);
                return;
            }

            // Submit the attendance
            await attendanceService.markAttendance({
                session_id: sessionId,
                ...formData,
                location_lat: Number(location.latitude.toFixed(6)),
                location_lon: Number(location.longitude.toFixed(6)),
                selfie: selfie,
            });

            setSuccess(true);
        } catch (err: unknown) {
            const error = err as ApiError;
            console.error('Attendance submission error:', error);

            if (error.response?.data?.detail && typeof error.response.data.detail === 'object') {
                const detail = error.response.data.detail as LocationErrorDetail;
                if (detail.error === "Location out of range") {
                    setError(
                        <div>
                            <strong>You are too far from campus</strong>
                            <p>{detail.message}</p>
                            <p>Attendance can only be marked when you are physically present on the Vijayawada campus.</p>
                            <small>
                                Your location: {detail.your_location.lat.toFixed(4)}, {detail.your_location.lon.toFixed(4)}
                                <br />
                                Distance from campus: {detail.distance.toLocaleString()} meters
                                <br />
                                Maximum allowed distance: {detail.max_allowed_distance.toLocaleString()} meters
                            </small>
                        </div>
                    );
                }
            } else {
                setError(
                    typeof error.response?.data?.detail === 'string' ? error.response.data.detail :
                    error.message || 
                    'Failed to submit attendance. Please ensure you are on campus in Vijayawada.'
                );
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








