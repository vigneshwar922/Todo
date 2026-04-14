import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { loginUser } from '../../api/auth';

const LoginForm = () => {
    const { login } = useAuth();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id.replace('login-', '')]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await loginUser(formData.identifier, formData.password);
            login(data.user, data.token);
            showToast(`Welcome back, ${data.user.username}!`, 'success');
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to sign in. Please check your credentials.';
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form id="login-form" className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error-message"><i className="fas fa-exclamation-circle"></i> {error}</div>}
            
            <div className="form-group">
                <label htmlFor="login-identifier"><i className="fas fa-user-circle"></i> Email or Username</label>
                <input 
                    type="text" 
                    id="login-identifier" 
                    placeholder="you@example.com or username" 
                    required 
                    autoComplete="username"
                    value={formData.identifier}
                    onChange={handleChange}
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="login-password"><i className="fas fa-lock"></i> Password</label>
                <input 
                    type="password" 
                    id="login-password" 
                    placeholder="Your password" 
                    required 
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                />
            </div>
            
            <button type="submit" id="login-btn" className="auth-submit-btn" disabled={loading}>
                <span className={loading ? 'btn-text hidden' : 'btn-text'}>Sign In</span>
                <span className={loading ? 'btn-spinner' : 'btn-spinner hidden'}>
                    <i className="fas fa-circle-notch fa-spin"></i>
                </span>
            </button>
        </form>
    );
};

export default LoginForm;
