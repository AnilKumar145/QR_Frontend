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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState(Date.now());

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
                // Use the general endpoint
                console.log('Using general QR session endpoint');
                response = await api.post('/qr-session/generate', null, {
                    params: { duration_minutes: 2 }
                });
            }
            
            if (response.data) {
                setSession(response.data);
                setLastRefresh(Date.now());
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

    // Initial fetch on component mount
    useEffect(() => {
        fetchSession();
        
        // Set up auto-refresh every 2 minutes
        const intervalId = setInterval(() => {
            fetchSession();
        }, 2 * 60 * 1000);
        
        return () => clearInterval(intervalId);
    }, [fetchSession]);

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


