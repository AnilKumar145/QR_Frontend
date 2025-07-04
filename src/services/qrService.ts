import { api } from '../api';
import { AxiosError } from 'axios';

export interface QRSession {
    session_id: string;
    qr_image: string;
    expires_at: string;
}

// Add validation function
export const validateQRData = (data: unknown): data is QRSession => {
    if (typeof data !== 'object' || !data) return false;
    const qrData = data as Record<string, unknown>;
    return typeof qrData.session_id === 'string' &&
           typeof qrData.qr_image === 'string' &&
           typeof qrData.expires_at === 'string';
};

export class QRSessionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'QRSessionError';
    }
}

export const qrService = {
    async getCurrentSession(venueId?: number): Promise<QRSession> {
        try {
            console.log('Requesting new QR session...');
            
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
            
            // Log the full response for debugging
            console.log('QR session response:', response.data);
            
            // Ensure the QR code URL is correct for the frontend
            if (response.data && response.data.qr_image) {
                // The QR code should point to the correct attendance URL
                console.log('QR code generated successfully');
            }
            
            return response.data;
        } catch (error) {
            console.error('Error fetching QR session:', error);
            
            // Use AxiosError for better error handling
            if (error instanceof AxiosError) {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    const errorMessage = error.response.data?.detail || 
                                        error.response.data?.message || 
                                        `Server error: ${error.response.status}`;
                    throw new QRSessionError(errorMessage);
                } else if (error.request) {
                    // The request was made but no response was received
                    throw new QRSessionError('No response received from server. Please check your connection.');
                } else {
                    // Something happened in setting up the request
                    throw new QRSessionError(`Request error: ${error.message}`);
                }
            }
            
            throw new QRSessionError('Unknown error occurred while generating QR code');
        }
    },
    
    validateQRData(data: unknown): data is QRSession {
        if (typeof data !== 'object' || !data) return false;
        const qrData = data as Record<string, unknown>;
        return typeof qrData.session_id === 'string' &&
               typeof qrData.qr_image === 'string' &&
               typeof qrData.expires_at === 'string';
    }
};
