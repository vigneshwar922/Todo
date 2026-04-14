import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('zenTasksUser');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Validation check could go here
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('zenTasksToken', token);
        localStorage.setItem('zenTasksUser', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('zenTasksToken');
        localStorage.removeItem('zenTasksUser');
        setUser(null);
    };

    const updateProfile = (updatedUser) => {
        localStorage.setItem('zenTasksUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
