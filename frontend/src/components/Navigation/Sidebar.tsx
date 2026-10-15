import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Brain,
  Calendar,
  CheckSquare,
  BookOpen,
  Settings as SettingsIcon,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  userEmail: string | null;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
}

export default function Sidebar({
  currentView,
  onNavigate,
  onLogout,
  userEmail,
  theme,
  onThemeToggle
}: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Chat Agent', icon: MessageSquare },
    { id: 'memories', label: 'Memory Archive', icon: Brain },
    { id: 'calendar', label: 'Calendar Agenda', icon: Calendar },
    { id: 'tasks', label: 'Task Checklist', icon: CheckSquare },
    { id: 'journal', label: 'Journal Logs', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="sidebar" aria-label="Sidebar Navigation">
      <div>
        <div
          className="sidebar-logo"
          onClick={() => onNavigate('dashboard')}
          role="button"
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('dashboard');
            }
          }}
          aria-label="RecallFlow Home Dashboard"
        >
          <Brain size={22} color="var(--accent)" />
          <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            RecallFlow
          </span>
        </div>

        <nav aria-label="Main Navigation">
          <ul className="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => onNavigate(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      justifyContent: 'flex-start',
                      fontFamily: 'inherit'
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="sidebar-footer">
        {userEmail && (
          <div
            style={{
              marginBottom: '12px',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)'
            }}
          >
            <div className="text-muted" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Signed In As
            </div>
            <div
              className="mono"
              style={{
                fontSize: '11px',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={userEmail}
            >
              {userEmail}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {onThemeToggle && (
            <button
              type="button"
              className="icon-btn"
              onClick={onThemeToggle}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              style={{ border: '1px solid var(--border)' }}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              background: 'none',
              border: '1px solid var(--border)',
              padding: '6px 10px',
              fontSize: '12px'
            }}
            aria-label="Sign out from RecallFlow"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
