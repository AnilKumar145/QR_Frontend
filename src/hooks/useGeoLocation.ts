import { useState, useEffect } from 'react';

interface GeoLocation {
    latitude: number;
    longitude: number;
    timestamp: number;
    accuracy: number;
}

export const useGeolocation = () => {
    const [location, setLocation] = useState<GeoLocation | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        const successHandler = (position: GeolocationPosition) => {
            // Round coordinates to 6 decimal places (standard GPS precision)
            const lat = Number(position.coords.latitude.toFixed(6));
            const lon = Number(position.coords.longitude.toFixed(6));

            // Enhanced validation
            if (isNaN(lat) || isNaN(lon)) {
                console.error('Invalid coordinates received:', position.coords);
                setError('Received invalid coordinates from GPS');
                return;
            }

            // Validate digit counts
            if (String(Math.abs(lat)).length > 9 || String(Math.abs(lon)).length > 11) {
                console.error('Coordinates exceed maximum allowed digits');
                setError('Invalid GPS precision');
                return;
            }

            setLocation({
                latitude: lat,
                longitude: lon,
                timestamp: position.timestamp,
                accuracy: position.coords.accuracy
            });
        };

        const errorHandler = (error: GeolocationPositionError) => {
            console.error('Geolocation error:', {
                code: error.code,
                message: error.message
            });

            const errorMessages: Record<number, string> = {
                [GeolocationPositionError.PERMISSION_DENIED]: 
                    'Location access denied. Please enable location services in your browser settings and refresh the page.',
                [GeolocationPositionError.POSITION_UNAVAILABLE]: 
                    'Unable to determine your location. Please check your device\'s location settings and ensure you have a clear view of the sky.',
                [GeolocationPositionError.TIMEOUT]: 
                    'Location request timed out. Please check your internet connection and try again.'
            };

            setError(errorMessages[error.code] || 'An unknown location error occurred.');
        };

        const options: PositionOptions = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        };

        // Get initial position
        navigator.geolocation.getCurrentPosition(
            successHandler,
            errorHandler,
            options
        );

        // Then watch for changes
        const watchId = navigator.geolocation.watchPosition(
            successHandler,
            errorHandler,
            options
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    return { location, error };
};
