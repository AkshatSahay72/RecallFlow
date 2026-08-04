import { useEffect, useState } from 'react';
import { listTasks } from '../services/tasks';
import { listEvents } from '../services/events';
import type { Task, CalendarEvent } from '../types';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Local storage used to mock memories since there is no backend GET memories endpoint
  const [memories, setMemories] = useState<string[]>([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [loadedTasks, loadedEvents] = await Promise.all([
          listTasks(),
          listEvents()
        ]);
        setTasks(loadedTasks);
        setEvents(loadedEvents);
        
        // Retrieve local mock memories saved during test or chat session
        const stored = localStorage.getItem('local_memories');
        if (stored) {
          setMemories(JSON.parse(stored));
        } else {
          // Set initial defaults if none exist
          const defaults = [
            "My favorite coffee is Caramel Macchiato with extra espresso.",
            "I need to sync calendar tasks on Fridays.",
            "RecallFlow backend is hosted on Render, frontend on Vercel."
          ];
          localStorage.setItem('local_memories', JSON.stringify(defaults));
          setMemories(defaults);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{ color: 'var(--danger)' }}>Error: {error}</div>;

  const pendingTasks = tasks.filter(t => !t.is_completed).slice(0, 5);
  const upcomingEvents = events
    .filter(e => new Date(e.start_time) >= new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5);

  return (
    <div>
      <h1 style={{ marginBottom: '16px' }}>Dashboard</h1>
      
      {/* Today's Summary */}
      <div className="panel" style={{ borderLeft: '2px solid var(--accent)' }}>
        <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Today's Overview</h2>
        <p style={{ marginTop: '8px', lineHeight: 1.5, color: 'var(--text-primary)' }}>
          You have <span className="mono" style={{ fontWeight: 600 }}>{tasks.filter(t => !t.is_completed).length}</span> pending tasks 
          and <span className="mono" style={{ fontWeight: 600 }}>{events.length}</span> calendar events scheduled. 
          Use the <button className="link" onClick={() => onNavigate('chat')}>Chat View</button> to tell RecallFlow to manage them for you.
        </p>
      </div>

      <div className="grid-2">
        {/* Pending Tasks */}
        <div className="panel">
          <h2 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Pending Tasks</span>
            <button className="link" style={{ fontSize: '11px' }} onClick={() => onNavigate('tasks')}>View all</button>
          </h2>
          {pendingTasks.length === 0 ? (
            <p className="text-muted">No pending tasks.</p>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pendingTasks.map(t => (
                <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span>• {t.title}</span>
                  {t.due_date && <span className="mono text-muted" style={{ fontSize: '10px' }}>{new Date(t.due_date).toLocaleDateString()}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="panel">
          <h2 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Upcoming Agenda</span>
            <button className="link" style={{ fontSize: '11px' }} onClick={() => onNavigate('calendar')}>View all</button>
          </h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-muted">No upcoming events scheduled.</p>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upcomingEvents.map(e => {
                const dateStr = new Date(e.start_time).toLocaleDateString();
                const timeStr = new Date(e.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <li key={e.id} style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500 }}>
                      <span>{e.title}</span>
                      <span className="mono text-muted" style={{ fontSize: '10px' }}>{dateStr} @ {timeStr}</span>
                    </div>
                    {e.location && <div className="text-muted" style={{ fontSize: '11px' }}>Location: {e.location}</div>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Memories */}
      <div className="panel" style={{ marginTop: '16px' }}>
        <h2 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Recent Memories</span>
          <button className="link" style={{ fontSize: '11px' }} onClick={() => onNavigate('memories')}>Manage memories</button>
        </h2>
        {memories.length === 0 ? (
          <p className="text-muted">No memories saved yet. Talk to the bot to record them.</p>
        ) : (
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {memories.slice(0, 3).map((m, idx) => (
              <li key={idx} style={{ fontSize: '12px', borderLeft: '2px solid var(--border)', paddingLeft: '10px' }}>
                {m}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
