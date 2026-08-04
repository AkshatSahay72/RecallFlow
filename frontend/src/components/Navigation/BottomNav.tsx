import {
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  Calendar,
  BookOpen
} from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'journal', label: 'Journal', icon: BookOpen }
  ];

  return (
    <div className="bottom-nav">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            className={`bottom-nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
