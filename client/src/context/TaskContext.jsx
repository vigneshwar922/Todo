import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { useAuth } from './AuthContext';
import { format } from 'date-fns';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('date_desc');

    const fetchTasks = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const params = { date: selectedDate, filter, sort };
            if (search.trim()) params.search = search;
            const data = await getTasks(params);
            setTasks(data.tasks);
        } catch (err) {
            console.error('Failed to fetch tasks:', err);
        } finally {
            setLoading(false);
        }
    }, [user, selectedDate, filter, search, sort]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const addTask = async (taskData) => {
        try {
            const data = await createTask({ ...taskData, date: selectedDate });
            setTasks(prev => [data.task, ...prev]);
            return data.task;
        } catch (err) {
            console.error('Failed to add task:', err);
            throw err;
        }
    };

    const toggleTask = async (id, isCompleted) => {
        try {
            const data = await updateTask(id, { is_completed: isCompleted });
            setTasks(prev => prev.map(t => t.id === id ? data.task : t));
        } catch (err) {
            console.error('Failed to toggle task:', err);
            throw err;
        }
    };

    const removeTask = async (id) => {
        try {
            await deleteTask(id);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            console.error('Failed to delete task:', err);
            throw err;
        }
    };

    const clearCompleted = async () => {
        const completedIds = tasks.filter(t => t.is_completed).map(t => t.id);
        try {
            await Promise.all(completedIds.map(id => deleteTask(id)));
            setTasks(prev => prev.filter(t => !t.is_completed));
        } catch (err) {
            console.error('Failed to clear completed tasks:', err);
            throw err;
        }
    };

    return (
        <TaskContext.Provider value={{
            tasks,
            loading,
            selectedDate,
            setSelectedDate,
            filter,
            setFilter,
            search,
            setSearch,
            sort,
            setSort,
            fetchTasks,
            addTask,
            toggleTask,
            removeTask,
            clearCompleted
        }}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) throw new Error('useTasks must be used within a TaskProvider');
    return context;
};
