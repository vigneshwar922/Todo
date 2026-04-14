import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthScreen = () => {
    const [activeTab, setActiveTab] = useState('login');

    return (
        <div id="auth-screen" className="auth-container">
            <div className="auth-wrapper">
                {/* Decorative side panel */}
                <div className="auth-side">
                    <div className="auth-side-content">
                        <div className="auth-brand-logo">
                            <i className="fas fa-check-double"></i>
                        </div>
                        <h2>Stay organized,<br />stay ahead.</h2>
                        <p>Plan your days, track your progress, and accomplish more with ZenTasks.</p>
                        <div className="auth-features">
                            <div className="auth-feature"><i className="fas fa-calendar-days"></i> Date-based task planning</div>
                            <div className="auth-feature"><i className="fas fa-flag"></i> Priority & tag support</div>
                            <div className="auth-feature"><i className="fas fa-cloud"></i> Synced across devices</div>
                        </div>
                    </div>
                </div>

                {/* Auth card */}
                <div className="auth-card">
                    <div className="auth-logo">
                        <i className="fas fa-check-double"></i>
                        <h1>ZenTasks</h1>
                        <p>Your tasks, everywhere you are.</p>
                    </div>

                    <div className="auth-tabs">
                        <button 
                            className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                            onClick={() => setActiveTab('login')}
                        >
                            Sign In
                        </button>
                        <button 
                            className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                            onClick={() => setActiveTab('register')}
                        >
                            Create Account
                        </button>
                    </div>

                    {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
