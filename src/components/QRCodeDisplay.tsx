import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    CircularProgress,
    Alert,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { Timer } from './Timer';
import { useQRSession } from '../hooks/useQRSession';

export const QRCodeDisplay: React.FC = () => {
    const { session, loading, error, getRemainingTime, refreshSession } = useQRSession();

    if (error) {
        return (
            <Alert 
                severity="error" 
                action={
                    <IconButton
                        color="inherit"
                        size="small"
                        onClick={refreshSession}
                        aria-label="retry"
                    >
                        <RefreshIcon />
                    </IconButton>
                }
                sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}
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
        <Card sx={{ maxWidth: 400, margin: 'auto', mt: 4 }}>
            <CardContent>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Scan QR Code
                    </Typography>

                    {loading ? (
                        <CircularProgress />
                    ) : (
                        <>
                            {session?.qr_image && (
                                <Box 
                                    component="img"
                                    src={session.qr_image}
                                    alt="QR Code"
                                    sx={{ 
                                        width: '100%', 
                                        maxWidth: 256,
                                        height: 'auto' 
                                    }}
                                />
                            )}
                            
                            <Timer 
                                seconds={getRemainingTime()} 
                                onComplete={refreshSession}
                            />

                            <Typography variant="caption" color="text.secondary">
                                QR Code refreshes automatically every 2 minutes
                            </Typography>

                            <IconButton 
                                onClick={refreshSession}
                                color="primary"
                                aria-label="refresh QR code"
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
