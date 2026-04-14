import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import { AuthProvider } from './context/AuthContext'
import { TaskProvider } from './context/TaskContext'
import { ToastProvider } from './context/ToastContext'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <AuthProvider>
        <TaskProvider>
          <App />
        </TaskProvider>
      </AuthProvider>
    </ToastProvider>
  </StrictMode>,
)
