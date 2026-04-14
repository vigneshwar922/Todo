let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

// Robustness Fix: Ensure the API_URL always ends with /api
if (API_URL && !API_URL.endsWith('/api')) {
    // Remove trailing slash if present, then add /api
    API_URL = API_URL.replace(/\/$/, '') + '/api';
}

export const API_BASE = API_URL;
export const BASE_URL = API_URL.replace('/api', '');

export const authHeaders = () => {
    const token = localStorage.getItem('zenTasksToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};
