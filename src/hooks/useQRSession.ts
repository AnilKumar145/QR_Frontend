import { useState, useEffect, useCallback } from 'react';
import { QRSession, qrService } from '../services/qrService';

export const useQRSession = () => {
    const [session, setSession] = useState<QRSession | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchNewSession = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const newSession = await qrService.getCurrentSession();
            setSession(newSession);
            return true; // Indicate successful fetch
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch QR session');
            return false; // Indicate failed fetch
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Initial fetch
        fetchNewSession().then(success => {
            if (success) {
                // Only start interval if initial fetch was successful
                const intervalId = setInterval(fetchNewSession, 120000);
                return () => clearInterval(intervalId);
            }
        });
    }, [fetchNewSession]);

    // Calculate remaining time
    const getRemainingTime = useCallback(() => {
        if (!session?.expires_at) return 0;
        
        const expiryTime = new Date(session.expires_at).getTime();
        const now = new Date().getTime();
        const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
        
        return remaining;
    }, [session?.expires_at]);

    return {
        session,
        loading,
        error,
        getRemainingTime,
        refreshSession: fetchNewSession
    };
};

