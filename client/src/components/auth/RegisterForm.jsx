import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { registerUser } from '../../api/auth';

const RegisterForm = () => {
    const { login } = useAuth();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id.replace('reg-', '')]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters.');
            setLoading(false);
            return;
        }

        try {
            const data = await registerUser(formData.username, formData.email, formData.password);
            login(data.user, data.token);
            showToast(`Welcome to ZenTasks, ${data.user.username}!`, 'success');
        } catch (err) {
            const msg = err.response?.data?.error || 'Registration failed. Please try again.';
            setError(msg);
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form id="register-form" className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error-message"><i className="fas fa-exclamation-circle"></i> {error}</div>}
            
            <div className="form-group">
                <label htmlFor="reg-username"><i className="fas fa-user"></i> Username</label>
                <input 
                    type="text" 
                    id="reg-username" 
                    placeholder="Choose a username" 
                    required 
                    autoComplete="username"
                    maxLength="30"
                    value={formData.username}
                    onChange={handleChange}
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="reg-email"><i className="fas fa-envelope"></i> Email</label>
                <input 
                    type="email" 
                    id="reg-email" 
                    placeholder="you@example.com" 
                    required 
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="reg-password"><i className="fas fa-lock"></i> Password</label>
                <input 
                    type="password" 
                    id="reg-password" 
                    placeholder="Min. 6 characters" 
                    required 
                    autoComplete="new-password"
                    minLength="6"
                    value={formData.password}
                    onChange={handleChange}
                />
            </div>
            
            <button type="submit" id="register-btn" className="auth-submit-btn" disabled={loading}>
                <span className={loading ? 'btn-text hidden' : 'btn-text'}>Create Account</span>
                <span className={loading ? 'btn-spinner' : 'btn-spinner hidden'}>
                    <i className="fas fa-circle-notch fa-spin"></i>
                </span>
            </button>
        </form>
    );
};

export default RegisterForm;
