import { useState, useEffect, useCallback } from 'react';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Chat from './views/Chat';
import MemoryPage from './views/MemoryPage';
import Calendar from './views/Calendar';
import Tasks from './views/Tasks';
import Journal from './views/Journal';
import Settings from './views/Settings';
import NotFound from './views/NotFound';
import Sidebar from './components/Navigation/Sidebar';
import BottomNav from './components/Navigation/BottomNav';
import MobileDrawer from './components/Navigation/MobileDrawer';
import { getEmailFromToken } from './services/auth';
import { Settings as SettingsIcon, LogOut, Sun, Moon, MessageSquarePlus } from 'lucide-react';
import './App.css';

const VALID_VIEWS = ['dashboard', 'chat', 'memories', 'calendar', 'tasks', 'journal', 'settings'];

function getViewFromHash(): string {
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  if (!hash) return 'dashboard';
  return hash;
}

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<string>(() => getViewFromHash());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('recallflow_theme') as 'light' | 'dark') || 'dark';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync with browser URL hash
  const navigateTo = useCallback((view: string) => {
    window.location.hash = `#/${view}`;
    setCurrentView(view);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const view = getViewFromHash();
      setCurrentView(view);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Listen for auth:expired event from api.ts
  useEffect(() => {
    const handleAuthExpired = () => {
      setToken(null);
      setUserEmail(null);
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  // Decode email whenever token changes
  useEffect(() => {
    if (token) {
      const email = getEmailFromToken(token);
      setUserEmail(email);
    } else {
      setUserEmail(null);
    }
  }, [token]);

  // Apply theme class to HTML element and persist
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('theme-light');
    } else {
      root.classList.remove('theme-light');
    }
    localStorage.setItem('recallflow_theme', theme);
  }, [theme]);

  // Dynamic document title
  useEffect(() => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      chat: 'Chat Assistant',
      memories: 'Memory Archive',
      calendar: 'Calendar Agenda',
      tasks: 'Tasks Checklist',
      journal: 'Journal Logs',
      settings: 'Settings'
    };
    const activeTitle = titles[currentView] || 'Not Found';
    document.title = `${activeTitle} — RecallFlow`;
  }, [currentView]);

  // Keep-alive ping to Render backend every 4 minutes to prevent cold starts.
  useEffect(() => {
    const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const PING_INTERVAL = 4 * 60 * 1000; // 4 minutes

    const ping = () => {
      fetch(`${BACKEND_URL}/api/v1/health`, { mode: 'no-cors' })
        .then(() => {})
        .catch(() => {});
    };

    ping();
    const id = setInterval(ping, PING_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    navigateTo('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserEmail(null);
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
    if (!VALID_VIEWS.includes(currentView)) {
      return <NotFound onNavigateHome={() => navigateTo('dashboard')} />;
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} />;
      case 'chat':
        return <Chat userEmail={userEmail} />;
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
        return <Dashboard onNavigate={navigateTo} />;
    }
  };

  // Get human readable title for mobile header
  const getHeaderTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Dashboard';
      case 'chat': return 'Chat Agent';
      case 'memories': return 'Memory Archive';
      case 'calendar': return 'Calendar Agenda';
      case 'tasks': return 'Task Checklist';
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
        onNavigate={navigateTo}
        onLogout={handleLogout}
        userEmail={userEmail}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      {/* Mobile Top Header */}
      <header className="mobile-header" aria-label="Mobile Header">
        <button
          type="button"
          onClick={() => navigateTo('dashboard')}
          style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer' }}
          aria-label="RecallFlow Home"
        >
          <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
            {getHeaderTitle()}
          </span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => navigateTo('settings')}
            aria-label="Settings"
          >
            <SettingsIcon size={18} />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={handleLogout}
            aria-label="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main workspace layout */}
      <div className="main-wrapper">
        <main className="main-content" id="main-content" tabIndex={-1}>
          {renderView()}
        </main>
      </div>

      {/* Mobile Floating Action Button (Quick Chat / Action) */}
      {currentView !== 'chat' && (
        <button
          type="button"
          className="mobile-fab"
          onClick={() => navigateTo('chat')}
          aria-label="Chat with RecallFlow"
          title="Ask RecallFlow"
        >
          <MessageSquarePlus size={22} />
        </button>
      )}

      {/* Mobile Bottom navigation bar */}
      <BottomNav
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenMenu={() => setMobileMenuOpen(true)}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentView={currentView}
        onNavigate={navigateTo}
        onLogout={handleLogout}
        userEmail={userEmail}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
    </div>
  );
}
