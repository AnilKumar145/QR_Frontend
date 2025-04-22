import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 10000,
    withCredentials: true
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
