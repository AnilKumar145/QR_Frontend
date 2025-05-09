import axios from 'axios';

// Use the deployed backend URL
const API_BASE_URL = 'https://qr-backend-1-pq5i.onrender.com/api/v1';

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000, // 15 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config);
        return config;
    },
    error => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
api.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('API Error Response:', error.response.status, error.response.data);
            
            // Handle authentication errors
            if (error.response.status === 401) {
                localStorage.removeItem('authToken');
                // Redirect to login if not already there
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/admin/login';
                }
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('API No Response:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('API Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
