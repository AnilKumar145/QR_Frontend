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
                formData.append('selfie', value);
            } else {
                formData.append(key, String(value));
            }
        });

        try {
            console.log('Attempting to connect to:', import.meta.env.VITE_API_BASE_URL);
            console.log('Sending attendance data:', {
                ...data,
                selfie: 'File object' // Don't log the actual file
            });
            
            const response = await api.post('/attendance/mark', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000, // Increase timeout for file upload
            });
            
            console.log('Attendance response:', response.data);
            return response.data;
        } catch (error: unknown) {
            const apiError = error as ApiError;
            console.error('Attendance marking error:', apiError);
            console.error('Full error object:', {
                message: apiError.message,
                response: apiError.response,
                stack: apiError.stack
            });
            
            if (apiError.response?.data?.detail) {
                throw new Error(apiError.response.data.detail);
            }
            throw apiError; // Throw the original error to preserve the error chain
        }
    }
};
