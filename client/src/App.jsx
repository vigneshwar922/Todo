import React from 'react';
import { useAuth } from './context/AuthContext';
import AuthScreen from './components/auth/AuthScreen';
import Dashboard from './components/Dashboard';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div id="loading-overlay">
        <div className="spinner-lg"></div>
      </div>
    );
  }

  return (
    <>
      {user ? <Dashboard /> : <AuthScreen />}
      
      {/* Toast Container - rendered by CSS mostly but can be used by a Toast system later */}
      <div id="toast-container" aria-live="polite"></div>
    </>
  );
}

export default App;
