import axios from 'axios';
import { API_BASE, authHeaders } from './config';

export const getTasks = async (params = {}) => {
    const res = await axios.get(`${API_BASE}/tasks`, {
        headers: authHeaders(),
        params
    });
    return res.data;
};

export const createTask = async (taskData) => {
    const res = await axios.post(`${API_BASE}/tasks`, taskData, {
        headers: authHeaders()
    });
    return res.data;
};

export const updateTask = async (id, taskData) => {
    const res = await axios.put(`${API_BASE}/tasks/${id}`, taskData, {
        headers: authHeaders()
    });
    return res.data;
};

export const deleteTask = async (id) => {
    const res = await axios.delete(`${API_BASE}/tasks/${id}`, {
        headers: authHeaders()
    });
    return res.data;
};
