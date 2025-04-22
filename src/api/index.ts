import axios from 'axios';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: false,  // Change this to false if you don't need credentials
});

// Enhanced error handling
api.interceptors.response.use(
    response => response,
    error => {
        const errorDetails = {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        };
        
        console.error('API Error Details:', errorDetails);
        
        if (!error.response) {
            throw new Error('Network error - Please check your connection');
        }
        
        if (error.response.status === 422) {
            throw new Error(error.response.data?.detail || 'Invalid form data');
        }
        
        if (error.response.status === 404) {
            throw new Error('Resource not found');
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
