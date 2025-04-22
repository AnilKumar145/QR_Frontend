import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    Typography,
    Alert,
    CircularProgress,
    Grid
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import Webcam from 'react-webcam';
import { useGeolocation } from '../hooks/useGeoLocation';
import { attendanceService } from '../services/attendanceService';
import { useParams } from 'react-router-dom';

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
    const [error, setError] = useState<string | null>(null);
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
        if (!location || !selfie || !sessionId) {
            setError('Please ensure location access is granted and selfie is taken');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await attendanceService.markAttendance({
                session_id: sessionId,
                ...formData,
                location_lat: location.latitude,
                location_lon: location.longitude,
                selfie: selfie,
            });
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to mark attendance');
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
        <Card sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Mark Attendance
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {locationError && <Alert severity="error" sx={{ mb: 2 }}>{locationError}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Grid container spacing={2}>
                        <Grid component="div" sx={{ gridColumn: 'span 12' }}>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid component="div" sx={{ gridColumn: 'span 12' }}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid component="div" sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                            <TextField
                                fullWidth
                                label="Roll Number"
                                name="roll_no"
                                value={formData.roll_no}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid component="div" sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                            <TextField
                                fullWidth
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid component="div" sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                            <TextField
                                fullWidth
                                label="Branch"
                                name="branch"
                                value={formData.branch}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                        <Grid component="div" sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
                            <TextField
                                fullWidth
                                label="Section"
                                name="section"
                                value={formData.section}
                                onChange={handleInputChange}
                                required
                            />
                        </Grid>
                    </Grid>

                    {showCamera ? (
                        <Box sx={{ position: 'relative', width: '100%', height: 'auto' }}>
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
                                sx={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)' }}
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
                        >
                            {selfie ? 'Retake Selfie' : 'Take Selfie'}
                        </Button>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading || !location || !selfie || !sessionId}
                        fullWidth
                    >
                        {loading ? <CircularProgress size={24} /> : 'Mark Attendance'}
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};



