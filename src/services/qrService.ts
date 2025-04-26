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
    async getCurrentSession(): Promise<QRSession> {
        try {
            console.log('Requesting new QR session...');
            const response = await api.post('/qr-session/generate', null, {
                params: {
                    duration_minutes: 2
                }
            });
            
            console.log('QR Session Response:', response.data);
            
            if (!validateQRData(response.data)) {
                console.error('Invalid QR data format:', response.data);
                throw new QRSessionError('Invalid response format from server');
            }
            
            return response.data;
        } catch (error) {
            console.error('QR Session Error:', error);
            if (error instanceof AxiosError) {
                if (!error.response) {
                    throw new QRSessionError('Network error - Please check your connection');
                }
                if (error.response.status === 404) {
                    throw new QRSessionError('QR session endpoint not found');
                }
                if (error.response.status === 422) {
                    throw new QRSessionError('Invalid request parameters');
                }
                throw new QRSessionError(error.response.data?.detail || 'Server error occurred');
            }
            throw new QRSessionError('An unexpected error occurred. Please try again.');
        }
    }
};
