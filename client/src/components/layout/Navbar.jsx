import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import ProfileModal from './ProfileModal';
import { format } from 'date-fns';
import { BASE_URL } from '../../api/config';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { tasks, selectedDate } = useTasks();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Filter tasks for the selected date to show in progress ring
    const dateTasks = tasks.filter(t => t.date === selectedDate);
    const total = dateTasks.length;
    const completed = dateTasks.filter(t => t.is_completed).length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

    const RING_CIRCUMFERENCE = 2 * Math.PI * 14; // r=14 → 87.96
    const offset = RING_CIRCUMFERENCE - (pct / 100) * RING_CIRCUMFERENCE;

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(/[\s@_.-]+/).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'U';
    };

    const initials = getInitials(user?.username || user?.email);

    return (
        <>
            <nav className="top-nav" id="top-nav">
                <div className="nav-left">
                    <div className="nav-brand">
                        <i className="fas fa-check-double nav-brand-icon"></i>
                        <span className="nav-brand-name">ZenTasks</span>
                    </div>
                </div>

                <div className="nav-right">
                    <div className="nav-progress-wrap">
                        <div className="progress-ring-wrap" title="Today's completion">
                            <svg className="progress-ring" width="36" height="36" viewBox="0 0 36 36">
                                <defs>
                                    <linearGradient id="pgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#5b5ef4"/>
                                        <stop offset="100%" stopColor="#9333ea"/>
                                    </linearGradient>
                                </defs>
                                <circle className="progress-ring-track" cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" stroke-width="3"/>
                                <circle 
                                    className="progress-ring-bar" 
                                    cx="18" cy="18" r="14" fill="none" 
                                    stroke="url(#pgGrad)" 
                                    strokeWidth="3"
                                    strokeDasharray={RING_CIRCUMFERENCE} 
                                    strokeDashoffset={offset} 
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="progress-pct">{pct}%</span>
                        </div>
                        <div className="nav-progress-text">
                            <span className="progress-label">Daily Progress</span>
                            <span className="progress-count">{completed} / {total} tasks</span>
                        </div>
                    </div>

                    <div className="nav-user-badge">
                        <button 
                            className="user-avatar-btn" 
                            onClick={() => setIsProfileOpen(true)}
                            aria-label="Open profile" 
                            title="View profile"
                        >
                            {user?.profile_photo_url ? (
                                <img src={`${BASE_URL}${user.profile_photo_url}`} alt={user.username} className="user-avatar-img" />
                            ) : (
                                <div className="user-avatar">{initials}</div>
                            )}
                        </button>
                        <span id="user-name-display">{user?.username || user?.email || 'User'}</span>
                        <button 
                            className="nav-logout-btn" 
                            onClick={logout}
                            aria-label="Logout" 
                            title="Logout"
                        >
                            <i className="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>
            </nav>

            {isProfileOpen && <ProfileModal onClose={() => setIsProfileOpen(false)} />}
        </>
    );
};

export default Navbar;
