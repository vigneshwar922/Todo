import axios from 'axios';
import { API_BASE } from './config';

export const loginUser = async (identifier, password) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { identifier, password });
    return res.data;
};

export const registerUser = async (username, email, password) => {
    const res = await axios.post(`${API_BASE}/auth/register`, { username, email, password });
    return res.data;
};

export const updateProfile = async (formData, headers) => {
    // If it's FormData, axios handles the boundary and Content-Type
    const h = { ...headers };
    if (formData instanceof FormData) {
        delete h['Content-Type'];
    }
    const res = await axios.put(`${API_BASE}/auth/profile`, formData, { headers: h });
    return res.data;
};
