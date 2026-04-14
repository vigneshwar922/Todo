const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
export const API_BASE = API_URL;
export const BASE_URL = API_URL.replace('/api', '');

export const authHeaders = () => {
    const token = localStorage.getItem('zenTasksToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};
