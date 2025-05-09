// Use environment variable for backend URL with fallback
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://qr-backend-1-pq5i.onrender.com/api/v1';

export const apiConfig = {
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
};

// For debugging
console.log('Using API URL:', API_BASE_URL);


