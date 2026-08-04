import { useState, useEffect } from 'react';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Chat from './views/Chat';
import MemoryPage from './views/MemoryPage';
import Calendar from './views/Calendar';
import Tasks from './views/Tasks';
import Journal from './views/Journal';
import Settings from './views/Settings';
import Sidebar from './components/Navigation/Sidebar';
import BottomNav from './components/Navigation/BottomNav';
import { getEmailFromToken } from './services/auth';
import { Settings as SettingsIcon, LogOut, MessageSquare } from 'lucide-react';
import './App.css';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Decode email whenever token changes
  useEffect(() => {
    if (token) {
      const email = getEmailFromToken(token);
      setUserEmail(email);
    } else {
      setUserEmail(null);
    }
  }, [token]);

  // Apply theme class to HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('theme-light');
    } else {
      root.classList.remove('theme-light');
    }
  }, [theme]);

  // Keep-alive ping to Render backend health endpoint every 4 minutes
  useEffect(() => {
    const pingBackend = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
        await fetch(`${API_BASE_URL}/api/v1/health`);
        console.log('RecallFlow Backend Health Ping successful');
      } catch (e) {
        console.error('RecallFlow Backend Health Ping failed:', e);
      }
    };

    pingBackend();

    const interval = setInterval(pingBackend, 240000);
    return () => clearInterval(interval);
  }, []);

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // If not logged in, render the login/register workflow
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Helper to render the active panel view
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'chat':
        return <Chat />;
      case 'memories':
        return <MemoryPage />;
      case 'calendar':
        return <Calendar />;
      case 'tasks':
        return <Tasks />;
      case 'journal':
        return <Journal />;
      case 'settings':
        return <Settings theme={theme} onThemeToggle={toggleTheme} />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  // Get human readable title for mobile header
  const getHeaderTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'chat': return 'Chat Agent';
      case 'memories': return 'Memory Archive';
      case 'calendar': return 'Calendar Agenda';
      case 'tasks': return 'Tasks Checklist';
      case 'journal': return 'Journal Logs';
      case 'settings': return 'Settings';
      default: return 'RecallFlow';
    }
  };

  return (
    <div className="app-container">
      {/* Desktop navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
        userEmail={userEmail}
      />

      {/* Mobile Top Header */}
      <header className="mobile-header">
        <span style={{ fontWeight: 700, fontSize: '14px' }}>{getHeaderTitle()}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <SettingsIcon size={18} style={{ cursor: 'pointer' }} onClick={() => setCurrentView('settings')} />
          <LogOut size={18} style={{ cursor: 'pointer' }} onClick={handleLogout} />
        </div>
      </header>

      {/* Main workspace layout */}
      <div className="main-wrapper">
        <main className="main-content">
          {renderView()}
        </main>
      </div>

      {/* Floating Compose action button (Mobile Only) */}
      {currentView !== 'chat' && (
        <button className="mobile-fab" onClick={() => setCurrentView('chat')}>
          <MessageSquare size={20} />
        </button>
      )}

      {/* Mobile Bottom navigation bar */}
      <BottomNav currentView={currentView} onNavigate={setCurrentView} />
    </div>
  );
}
