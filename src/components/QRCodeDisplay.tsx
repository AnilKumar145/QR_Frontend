import React from 'react';
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
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { Timer } from './Timer';
import { useQRSession } from '../hooks/useQRSession';

export const QRCodeDisplay: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
                                onComplete={refreshSession}
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
                                onClick={refreshSession}
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
