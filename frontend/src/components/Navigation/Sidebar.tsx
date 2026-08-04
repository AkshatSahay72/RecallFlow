import {
  LayoutDashboard,
  MessageSquare,
  Brain,
  Calendar,
  CheckSquare,
  BookOpen,
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  userEmail: string | null;
}

export default function Sidebar({ currentView, onNavigate, onLogout, userEmail }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Chat Agent', icon: MessageSquare },
    { id: 'memories', label: 'Memory Archive', icon: Brain },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'tasks', label: 'Task Checklist', icon: CheckSquare },
    { id: 'journal', label: 'Journal Logs', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="sidebar">
      <div>
        <div className="sidebar-logo">
          <Brain size={18} color="var(--accent)" />
          <span>RecallFlow</span>
        </div>

        <ul className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <li
                key={item.id}
                className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => onNavigate(item.id)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sidebar-footer">
        {userEmail && (
          <div style={{ marginBottom: '10px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            User: <span className="mono" style={{ fontWeight: 600 }}>{userEmail}</span>
          </div>
        )}
        <button
          onClick={onLogout}
          style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', background: 'none', border: '1px solid var(--border)' }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
