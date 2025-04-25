import { api } from '../api';

export interface AttendancePayload {
    session_id: string;
    name: string;
    email: string;
    roll_no: string;
    phone: string;
    branch: string;
    section: string;
    location_lat: number;
    location_lon: number;
    selfie: File;
}

export interface AttendanceResponse {
    success: boolean;
    message: string;
}

interface LocationValidationResponse {
    is_valid: boolean;
    distance_meters: number;
    max_allowed_distance_meters: number;
    your_coordinates: {
        lat: number;
        lon: number;
    };
    institution_coordinates: {
        lat: number;
        lon: number;
    };
}

interface ApiError extends Error {
    response?: {
        data?: {
            detail?: string;
        };
    };
}

export const attendanceService = {
    async markAttendance(data: AttendancePayload): Promise<AttendanceResponse> {
        const formData = new FormData();
        
        // Add all fields to FormData
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'selfie') {
                formData.append('selfie', value as File);
            } else if (key === 'location_lat' || key === 'location_lon') {
                // Ensure coordinates are sent as numbers
                formData.append(key, value.toString());
                console.log(`Sending ${key}:`, value, typeof value);
            } else {
                formData.append(key, String(value));
            }
        });

        try {
            console.log('Sending attendance data with coordinates:', {
                lat: data.location_lat,
                lon: data.location_lon
            });

            const response = await api.post('/attendance/mark', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000,
            });
            
            return response.data;
        } catch (error: unknown) {
            const apiError = error as ApiError;
            console.error('Attendance marking error:', apiError);
            
            if (apiError.response?.data?.detail) {
                throw new Error(apiError.response.data.detail);
            }
            throw new Error('Network error - Please check if the backend server is running and accessible');
        }
    },

    async validateLocation(lat: number, lon: number): Promise<LocationValidationResponse> {
        try {
            const response = await api.get(`/utils/location/validate`, {
                params: { lat, lon }
            });
            return response.data;
        } catch (error: unknown) {
            const apiError = error as ApiError;
            console.error('Location validation error:', apiError);
            throw new Error(apiError.response?.data?.detail || 'Failed to validate location');
        }
    }
};
