import React, { useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Brain,
  Calendar,
  CheckSquare,
  BookOpen,
  Settings as SettingsIcon,
  LogOut,
  X,
  Sun,
  Moon
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  userEmail: string | null;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export default function MobileDrawer({
  isOpen,
  onClose,
  currentView,
  onNavigate,
  onLogout,
  userEmail,
  theme,
  onThemeToggle
}: MobileDrawerProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeBtnRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Chat Agent', icon: MessageSquare },
    { id: 'memories', label: 'Memory Archive', icon: Brain },
    { id: 'calendar', label: 'Calendar Agenda', icon: Calendar },
    { id: 'tasks', label: 'Task Checklist', icon: CheckSquare },
    { id: 'journal', label: 'Journal Logs', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onClose();
  };

  return (
    <div
      className="mobile-drawer-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div
              className="sidebar-logo"
              style={{ margin: 0, padding: 0 }}
              onClick={() => handleItemClick('dashboard')}
            >
              <Brain size={20} color="var(--accent)" />
              <span style={{ fontSize: '16px', fontWeight: 700 }}>RecallFlow</span>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              className="icon-btn"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav aria-label="Mobile Menu Navigation">
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleItemClick(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      style={{
                        width: '100%',
                        background: 'none',
                        border: 'none',
                        justifyContent: 'flex-start',
                        fontFamily: 'inherit',
                        padding: '10px 12px'
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

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
          {userEmail && (
            <div
              style={{
                marginBottom: '14px',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)'
              }}
            >
              <div className="text-muted" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
                Account
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
              >
                {userEmail}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onThemeToggle}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px',
                fontSize: '12px'
              }}
              aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px',
                fontSize: '12px'
              }}
              aria-label="Sign out"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
