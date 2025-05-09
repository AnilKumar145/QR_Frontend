import axios from 'axios';

// Make sure the base URL is correct
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://qr-backend-1-pq5i.onrender.com/api/v1';

export const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000, // 15 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add request interceptor to log requests for debugging
api.interceptors.request.use(
    config => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config);
        return config;
    },
    error => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Enhanced error handling
api.interceptors.response.use(
    response => {
        console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
        return response;
    },
    error => {
        const errorDetails = {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        };
        
        console.error('API Error Details:', errorDetails);
        
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout - Server took too long to respond');
        }
        
        if (!error.response) {
            console.error('Network Error Details:', error);
            throw new Error('Network error - Please check if the backend server is running and accessible');
        }
        
        if (error.response.status === 422) {
            throw new Error(error.response.data?.detail || 'Invalid form data');
        }
        
        if (error.response.status === 404) {
            throw new Error('API endpoint not found - Please check the API URL');
        }

        if (error.response.status === 500) {
            throw new Error('Server error - Please try again later');
        }
        
        throw new Error(
            error.response?.data?.detail || 
            error.response?.data?.message || 
            error.message || 
            'An unexpected error occurred'
        );
    }
);

export default api;
