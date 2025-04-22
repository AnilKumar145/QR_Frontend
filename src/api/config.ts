export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://qr-backend-p9m7.onrender.com/api/v1';

export const apiConfig = {
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
};