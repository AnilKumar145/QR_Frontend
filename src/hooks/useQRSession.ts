import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import axios from 'axios';

interface QRSession {
    session_id: string;
    qr_image: string;
    expires_at: string;
    venue_id?: number;
    venue_name?: string;
}

export const useQRSession = () => {
    const [session, setSession] = useState<QRSession | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState(Date.now());
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);

    const fetchSession = useCallback(async (venueId?: number) => {
        try {
            setLoading(true);
            setError(null);
            
            let response;
            
            if (venueId !== undefined) {
                // Use the venue-specific endpoint
                console.log(`Using venue-specific endpoint for venue ID: ${venueId}`);
                response = await api.post(`/qr-session/generate-for-venue/${venueId}`, null, {
                    params: { duration_minutes: 2 }
                });
            } else {
                // If no venue is selected, we'll use the institution-wide endpoint
                // This is still venue-based but uses the default institution venue
                console.log('Using institution-wide QR session endpoint');
                response = await api.post('/qr-session/generate', null, {
                    params: { duration_minutes: 2 }
                });
            }
            
            if (response.data) {
                setSession(response.data);
                setLastRefresh(Date.now());
                setAutoRefreshEnabled(true); // Enable auto-refresh after manual generation
            } else {
                setError('Failed to generate QR code. Please try again.');
            }
        } catch (err) {
            console.error('Error fetching QR session:', err);
            
            if (axios.isAxiosError(err)) {
                const errorMessage = err.response?.data?.detail || 
                                    err.response?.status || 
                                    err.message || 
                                    'Unknown error';
                setError(`Failed to generate QR code: ${errorMessage}`);
            } else {
                setError('Failed to generate QR code. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Set up auto-refresh only after manual generation
    useEffect(() => {
        let intervalId: number | null = null;
        
        if (autoRefreshEnabled && session) {
            intervalId = window.setInterval(() => {
                // Use the same venue ID for auto-refresh
                fetchSession(session.venue_id);
            }, 2 * 60 * 1000); // 2 minutes
        }
        
        return () => {
            if (intervalId !== null) {
                clearInterval(intervalId);
            }
        };
    }, [autoRefreshEnabled, fetchSession, session]);

    // Calculate remaining time until refresh
    const getRemainingTime = useCallback(() => {
        const refreshInterval = 2 * 60 * 1000; // 2 minutes in milliseconds
        const elapsed = Date.now() - lastRefresh;
        return Math.max(0, refreshInterval - elapsed) / 1000;
    }, [lastRefresh]);

    return {
        session,
        loading,
        error,
        getRemainingTime,
        refreshSession: fetchSession
    };
};




