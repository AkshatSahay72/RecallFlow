import {
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  Calendar,
  Menu
} from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenMenu: () => void;
}

export default function BottomNav({ currentView, onNavigate, onOpenMenu }: BottomNavProps) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
  ];

  return (
    <nav className="bottom-nav" aria-label="Mobile Navigation">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'inherit',
              padding: 0
            }}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}

      {/* Menu button to open mobile drawer with Memories, Journal, Settings, and Account */}
      <button
        type="button"
        className="bottom-nav-item"
        onClick={onOpenMenu}
        aria-label="Open mobile menu"
        style={{
          background: 'none',
          border: 'none',
          fontFamily: 'inherit',
          padding: 0
        }}
      >
        <Menu size={20} />
        <span>More</span>
      </button>
    </nav>
  );
}
