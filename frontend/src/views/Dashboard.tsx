import { useEffect, useState, useCallback } from 'react';
import { listTasks } from '../services/tasks';
import { listEvents } from '../services/events';
import type { Task, CalendarEvent } from '../types';
import { formatDate } from '../utils/date';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import { CheckSquare, Calendar, Brain, RefreshCw, MessageSquare } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [memories, setMemories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [loadedTasks, loadedEvents] = await Promise.all([
        listTasks().catch(() => [] as Task[]),
        listEvents().catch(() => [] as CalendarEvent[])
      ]);
      setTasks(loadedTasks);
      setEvents(loadedEvents);

      const stored = localStorage.getItem('local_memories');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setMemories(Array.isArray(parsed) ? parsed : []);
        } catch {
          setMemories([]);
        }
      } else {
        setMemories([]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load dashboard data.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return <LoadingState message="Loading your dashboard overview..." />;
  }

  if (error) {
    return (
      <div className="panel" style={{ borderLeft: '3px solid var(--danger)' }}>
        <h2 style={{ color: 'var(--danger)', marginBottom: '8px' }}>Unable to load dashboard data</h2>
        <p className="text-muted" style={{ marginBottom: '16px' }}>{error}</p>
        <button type="button" className="primary" onClick={loadDashboardData}>
          <RefreshCw size={14} />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => !t.is_completed);
  const topPending = pendingTasks.slice(0, 5);

  const upcomingEvents = events
    .filter(e => {
      try {
        return new Date(e.start_time).getTime() >= Date.now() - 3600000;
      } catch {
        return true;
      }
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '4px' }}>Overview Dashboard</h1>
          <p className="text-muted" style={{ margin: 0 }}>
            Here is your daily activity, schedule agenda, and pending actions.
          </p>
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={loadDashboardData}
          title="Refresh Dashboard"
          aria-label="Refresh Dashboard"
          style={{ border: '1px solid var(--border)' }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Overview Metric Banner */}
      <div className="panel" style={{ borderLeft: '3px solid var(--accent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '15px' }}>Today's Summary</h2>
            <p style={{ marginTop: '6px', marginBottom: 0, lineHeight: 1.6 }}>
              You have <strong style={{ color: 'var(--accent)' }}>{pendingTasks.length}</strong> pending task{pendingTasks.length === 1 ? '' : 's'} and{' '}
              <strong style={{ color: 'var(--accent)' }}>{upcomingEvents.length}</strong> upcoming agenda item{upcomingEvents.length === 1 ? '' : 's'}.
            </p>
          </div>
          <button
            type="button"
            className="primary"
            onClick={() => onNavigate('chat')}
            style={{ fontSize: '12px' }}
          >
            <MessageSquare size={14} />
            <span>Ask RecallFlow AI</span>
          </button>
        </div>
      </div>

      <div className="grid-2">
        {/* Pending Tasks Panel */}
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckSquare size={16} color="var(--accent)" />
              <h2 style={{ margin: 0 }}>Pending Tasks ({pendingTasks.length})</h2>
            </div>
            <button
              type="button"
              className="link"
              style={{ fontSize: '12px' }}
              onClick={() => onNavigate('tasks')}
            >
              View all
            </button>
          </div>

          {topPending.length === 0 ? (
            <EmptyState
              icon={<CheckSquare size={28} />}
              title="No Pending Tasks"
              description="You're all caught up! Create a new task or ask the AI to plan your day."
              actionLabel="Add Task"
              onAction={() => onNavigate('tasks')}
            />
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topPending.map(t => (
                <li
                  key={t.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 0',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>{t.title}</span>
                  {t.due_date && (
                    <span className="mono text-muted" style={{ fontSize: '11px' }}>
                      Due: {formatDate(t.due_date)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming Events Panel */}
        <div className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} color="var(--accent)" />
              <h2 style={{ margin: 0 }}>Upcoming Agenda ({upcomingEvents.length})</h2>
            </div>
            <button
              type="button"
              className="link"
              style={{ fontSize: '12px' }}
              onClick={() => onNavigate('calendar')}
            >
              View all
            </button>
          </div>

          {upcomingEvents.length === 0 ? (
            <EmptyState
              icon={<Calendar size={28} />}
              title="Agenda Is Clear"
              description="No upcoming events scheduled. Add a meeting or sync with Google Calendar."
              actionLabel="Schedule Event"
              onAction={() => onNavigate('calendar')}
            />
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {upcomingEvents.map(e => {
                const dateStr = formatDate(e.start_time);
                let timeStr = '';
                try {
                  timeStr = new Date(e.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } catch {
                  timeStr = '';
                }
                return (
                  <li
                    key={e.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '6px 0',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500, fontSize: '13px' }}>
                      <span>{e.title}</span>
                      <span className="mono text-muted" style={{ fontSize: '11px' }}>
                        {dateStr} {timeStr && `@ ${timeStr}`}
                      </span>
                    </div>
                    {e.location && (
                      <span className="text-muted" style={{ fontSize: '11px', marginTop: '2px' }}>
                        📍 {e.location}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Memories Section */}
      <div className="panel" style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Brain size={16} color="var(--accent)" />
            <h2 style={{ margin: 0 }}>Recent Memory Facts ({memories.length})</h2>
          </div>
          <button
            type="button"
            className="link"
            style={{ fontSize: '12px' }}
            onClick={() => onNavigate('memories')}
          >
            Manage archive
          </button>
        </div>

        {memories.length === 0 ? (
          <EmptyState
            icon={<Brain size={28} />}
            title="No Memories Stored Yet"
            description="RecallFlow saves personal facts and preferences to personalize assistance. Record your first fact or mention it in chat."
            actionLabel="Record a Fact"
            onAction={() => onNavigate('memories')}
          />
        ) : (
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {memories.slice(0, 3).map((m, idx) => (
              <li
                key={idx}
                style={{
                  fontSize: '13px',
                  borderLeft: '2px solid var(--border)',
                  paddingLeft: '12px',
                  color: 'var(--text-primary)'
                }}
              >
                {m}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
