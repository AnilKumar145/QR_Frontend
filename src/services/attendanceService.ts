import { api } from '../api';

export interface AttendancePayload {
    session_id: string;
    roll_no: string;
    location_lat: number;
    location_lon: number;
    selfie: File;
}

export interface AttendanceResponse {
    success: boolean;
    message: string;
}

export const attendanceService = {
    async markAttendance(data: AttendancePayload): Promise<AttendanceResponse> {
        const formData = new FormData();
        formData.append('session_id', data.session_id);
        formData.append('roll_no', data.roll_no);
        formData.append('location_lat', data.location_lat.toString());
        formData.append('location_lon', data.location_lon.toString());
        formData.append('selfie', data.selfie);

        try {
            const response = await api.post('/attendance/mark', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch  {
            throw new Error('Failed to mark attendance');
        }
    }
};