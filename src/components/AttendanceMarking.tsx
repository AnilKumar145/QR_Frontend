import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    Typography,
    Alert,
    CircularProgress,
    Dialog,
} from '@mui/material';
import { QrCodeScanner, PhotoCamera } from '@mui/icons-material';
import Webcam from 'react-webcam';
import { useGeolocation } from '../hooks/useGeoLocation';
import { attendanceService } from '../services/attendanceService';
import {  useParams } from 'react-router-dom';

export const AttendanceMarking: React.FC = () => {
    
    const { sessionId: urlSessionId } = useParams(); // rename to avoid conflict
    const [sessionId, setSessionId] = useState<string | null>(null); // Add this state
    const [rollNo, setRollNo] = useState('');
    const [selfie, setSelfie] = useState<File | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const webcamRef = useRef<Webcam>(null);
    const { location, error: locationError } = useGeolocation();
    const qrScannerId = 'html5-qr-scanner';

    useEffect(() => {
        console.log('Component mounted with urlSessionId:', urlSessionId);
    }, [urlSessionId]);

    useEffect(() => {
        if (urlSessionId) {
            console.log('Setting session ID from URL:', urlSessionId);
            setSessionId(urlSessionId);
        }
    }, [urlSessionId]);

    const handleQRScan = useCallback((decodedText: string): void => {
        console.log('Raw QR Scan Result:', decodedText);

        try {
            // Try to extract session ID from URL
            const urlMatch = decodedText.match(/mark-attendance\/([^/]+)$/);
            if (!urlMatch) {
                throw new Error('Invalid QR code format');
            }
            const sessionId = urlMatch[1];
            
            console.log('Extracted session ID:', sessionId);

            // Clean up scanner
            if (scanner.current) {
                scanner.current.clear().catch(console.error);
                scanner.current = null;
            }
            setShowQRScanner(false);

            // For Google Lens and other QR readers, they will directly open the URL
            // This code will only run if scanned within the app
            setSessionId(sessionId);
            window.location.href = `/mark-attendance/${sessionId}`;

        } catch (error) {
            console.error('QR Processing Error:', error);
            setError(error instanceof Error ? error.message : 'Failed to process QR code');
        }
    }, []);

    // Add scanner ref to store the instance
    const scanner = useRef<Html5QrcodeScanner | null>(null);

    // Update QR scanner initialization
    useEffect(() => {
        if (showQRScanner) {
            const newScanner = new Html5QrcodeScanner(
                qrScannerId,
                { 
                    fps: 10, 
                    qrbox: { width: 250, height: 250 },
                    rememberLastUsedCamera: true,
                },
                false
            );
            
            scanner.current = newScanner;
            newScanner.render(handleQRScan, console.error);
        }

        return () => {
            if (scanner.current) {
                scanner.current.clear().catch(console.error);
                scanner.current = null;
            }
        };
    }, [showQRScanner, handleQRScan]);

    const handleCaptureSelfie = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            // Convert base64 to File object
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
        if (!location || !selfie || !sessionId || !rollNo) {
            setError('Please fill all required fields');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await attendanceService.markAttendance({
                session_id: sessionId,
                roll_no: rollNo,
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
        <>
            <Card sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Mark Attendance
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    {locationError && <Alert severity="error" sx={{ mb: 2 }}>{locationError}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Roll Number"
                            value={rollNo}
                            onChange={(e) => setRollNo(e.target.value)}
                            required
                        />

                        <Button
                            variant="contained"
                            startIcon={<QrCodeScanner />}
                            onClick={() => setShowQRScanner(true)}
                        >
                            Scan QR Code
                        </Button>

                        {showCamera ? (
                            <Box sx={{ position: 'relative' }}>
                                <Webcam
                                    ref={webcamRef}
                                    audio={false}
                                    screenshotFormat="image/jpeg"
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
                            >
                                Take Selfie
                            </Button>
                        )}

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading || !location || !selfie || !sessionId || !rollNo}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Mark Attendance'}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            <Dialog
                open={showQRScanner}
                onClose={() => {
                    setShowQRScanner(false);
                    if (scanner.current) {
                        scanner.current.clear().catch(console.error);
                        scanner.current = null;
                    }
                }}
                maxWidth="sm"
                fullWidth
            >
                <Box sx={{ p: 2 }}>
                    <div id={qrScannerId} />
                </Box>
            </Dialog>
        </>
    );
};



































