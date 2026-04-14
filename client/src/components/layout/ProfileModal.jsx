import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { updateProfile as apiUpdateProfile } from '../../api/auth';
import { authHeaders, BASE_URL } from '../../api/config';

const ProfileModal = ({ onClose }) => {
    const { user, updateProfile, logout } = useAuth();
    const { showToast } = useToast();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() && !password.trim()) {
            setError('Please provide at least one field to update.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            if (username.trim()) formData.append('username', username.trim());
            if (password.trim()) formData.append('password', password.trim());
            if (photo) formData.append('profile_photo', photo);

            const data = await apiUpdateProfile(formData, authHeaders());
            updateProfile(data.user);
            showToast('Profile updated successfully!', 'success');
            setUsername('');
            setPassword('');
            setPhoto(null);
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to update profile';
            showToast(msg, 'error');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const initials = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

    return (
        <div className="profile-modal-overlay" onClick={(e) => e.target.className === 'profile-modal-overlay' && onClose()}>
            <div className="profile-modal">
                <button className="profile-modal-close" onClick={onClose} aria-label="Close profile">
                    <i className="fas fa-times"></i>
                </button>

                <div className="profile-avatar-section">
                    <div className="profile-avatar-wrap">
                        {user?.profile_photo_url ? (
                            <img src={`${BASE_URL}${user.profile_photo_url}`} alt="Profile" className="profile-avatar-img" />
                        ) : (
                            <div className="profile-avatar-display">{initials}</div>
                        )}
                        <label className="profile-avatar-upload-btn" htmlFor="avatar-file-input" title="Upload photo">
                            <i className="fas fa-camera"></i>
                        </label>
                        <input 
                            type="file" 
                            id="avatar-file-input" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => setPhoto(e.target.files[0])}
                        />
                    </div>
                    {photo && <div className="profile-avatar-hint">Ready to upload: {photo.name}</div>}
                </div>

                <div className="profile-info-section">
                    <div className="profile-info-row">
                        <i className="fas fa-user profile-info-icon"></i>
                        <div>
                            <div className="profile-info-label">Username</div>
                            <div className="profile-info-value">{user?.username || '—'}</div>
                        </div>
                    </div>
                    <div className="profile-info-row">
                        <i className="fas fa-envelope profile-info-icon"></i>
                        <div>
                            <div className="profile-info-label">Email</div>
                            <div className="profile-info-value">{user?.email || '—'}</div>
                        </div>
                    </div>
                </div>

                <div className="profile-divider"></div>

                <div className="profile-edit-section">
                    <h3 className="profile-edit-title"><i className="fas fa-pen"></i> Update Details</h3>
                    {error && <div className="toast error" style={{ position: 'static', marginBottom: '1rem', width: '100%' }}>{error}</div>}
                    {success && <div className="toast success" style={{ position: 'static', marginBottom: '1rem', width: '100%' }}>{success}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="profile-new-username"><i className="fas fa-user"></i> New Username</label>
                            <input 
                                type="text" 
                                id="profile-new-username" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter new username" 
                                maxLength="30" 
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="profile-new-password"><i className="fas fa-lock"></i> New Password <span className="optional-label">(optional)</span></label>
                            <input 
                                type="password" 
                                id="profile-new-password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Leave blank to keep current" 
                                minLength="6" 
                            />
                        </div>
                        <button type="submit" className="profile-save-btn" disabled={loading}>
                            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Save Changes'}
                        </button>
                    </form>
                </div>

                <button className="profile-logout-btn" onClick={logout}>
                    <i className="fas fa-sign-out-alt"></i> Sign Out
                </button>
            </div>
        </div>
    );
};

export default ProfileModal;
