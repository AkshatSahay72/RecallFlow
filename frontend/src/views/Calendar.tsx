import React, { useEffect, useState } from 'react';
import { listEvents, createEvent, deleteEvent } from '../services/events';
import type { CalendarEvent } from '../types';

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  async function loadEvents() {
    try {
      const data = await listEvents();
      // Sort events by start date
      data.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch calendar events.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;

    try {
      // Form times are local, convert to ISO 8601 string
      const startIso = new Date(startTime).toISOString();
      const endIso = new Date(endTime).toISOString();

      await createEvent({
        title,
        description: description || undefined,
        start_time: startIso.slice(0, 19), // Remove milliseconds
        end_time: endIso.slice(0, 19),
        location: location || undefined
      });

      // Reset
      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
      setLocation('');
      setFormOpen(false);
      
      // Reload
      loadEvents();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule event.');
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteEvent(id);
      loadEvents();
    } catch (err: any) {
      setError(err.message || 'Failed to delete event.');
    }
  };

  if (loading) return <div>Loading calendar...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1>Calendar Agenda</h1>
        <button className="primary" onClick={() => setFormOpen(!formOpen)}>
          {formOpen ? 'Cancel' : 'Quick Add Event'}
        </button>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '16px' }}>Error: {error}</div>}

      {/* Quick Add Event Form */}
      {formOpen && (
        <form onSubmit={handleCreateEvent} className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '13px', margin: 0 }}>Schedule New Event</h2>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>Event Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Project Review meeting" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notes or agenda" />
          </div>
          <div className="grid-2">
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>Start Time</label>
              <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>End Time</label>
              <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Physical location or link" />
          </div>
          <button type="submit" className="primary" style={{ alignSelf: 'flex-start', marginTop: '6px' }}>Schedule</button>
        </form>
      )}

      {/* Agenda list view */}
      {events.length === 0 ? (
        <p className="text-muted">No calendar events scheduled.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {events.map((e) => {
            const startObj = new Date(e.start_time);
            const endObj = new Date(e.end_time);
            const dateStr = startObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = `${startObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

            return (
              <div key={e.id} className="panel" style={{ margin: 0, padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ width: '90px', borderRight: '1px solid var(--border)', paddingRight: '10px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{dateStr.split(',')[0]}</div>
                    <div className="mono text-muted" style={{ fontSize: '11px' }}>{startObj.getDate()} {startObj.toLocaleString(undefined, { month: 'short' })}</div>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '13px', fontWeight: 600 }}>{e.title}</h3>
                    <div className="mono text-muted" style={{ fontSize: '11px', marginTop: '2px' }}>{timeStr}</div>
                    {e.description && <p style={{ fontSize: '12px', marginTop: '6px', color: 'var(--text-secondary)', marginBottom: 0 }}>{e.description}</p>}
                    {e.location && <div className="text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>📍 {e.location}</div>}
                    {e.google_event_id && (
                      <span className="mono" style={{ fontSize: '9px', background: 'var(--bg-primary)', padding: '2px 4px', border: '1px solid var(--border)', display: 'inline-block', marginTop: '6px' }}>
                        GOOGLE EVENT LINKED
                      </span>
                    )}
                  </div>
                </div>
                <button className="link danger" style={{ fontSize: '11px' }} onClick={() => handleDeleteEvent(e.id)}>Cancel</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
