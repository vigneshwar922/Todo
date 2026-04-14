import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === id ? { ...t, fadeOut: true } : t));
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 300); // Wait for fade-out animation
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div id="toast-container">
                {toasts.map(toast => (
                    <div 
                        key={toast.id} 
                        className={`toast ${toast.type} ${toast.fadeOut ? 'fade-out' : ''}`}
                        onClick={() => removeToast(toast.id)}
                    >
                        <i className={`toast-icon fas ${
                            toast.type === 'success' ? 'fa-check-circle' : 
                            toast.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'
                        }`}></i>
                        <span className="toast-message">{toast.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
