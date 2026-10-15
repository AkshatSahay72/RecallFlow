import React, { useEffect, useState, useCallback } from 'react';
import { listEvents, createEvent, deleteEvent } from '../services/events';
import type { CalendarEvent } from '../types';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import Toast, { type ToastMessage } from '../components/common/Toast';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Trash2, RefreshCw, X } from 'lucide-react';

export default function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Deletion state
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listEvents();
      data.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
      setEvents(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch calendar events.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !startTime || !endTime) {
      setFormError('Please complete all required fields.');
      return;
    }

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    if (endDate <= startDate) {
      setFormError('End time must be after start time.');
      return;
    }

    setSubmitting(true);
    try {
      const startIso = startDate.toISOString().slice(0, 19);
      const endIso = endDate.toISOString().slice(0, 19);

      await createEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        start_time: startIso,
        end_time: endIso,
        location: location.trim() || undefined
      });

      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
      setLocation('');
      setFormOpen(false);

      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Event scheduled successfully.'
      });
      loadEvents();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to schedule event.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteTargetId === null) return;
    const idToDelete = deleteTargetId;
    setDeleteTargetId(null);

    const previousEvents = [...events];
    setEvents(prev => prev.filter(e => e.id !== idToDelete));

    try {
      await deleteEvent(idToDelete);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Event cancelled.'
      });
    } catch (err: unknown) {
      setEvents(previousEvents);
      const msg = err instanceof Error ? err.message : 'Failed to delete event.';
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: msg
      });
    }
  };

  if (loading) {
    return <LoadingState message="Loading your calendar agenda..." />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ marginBottom: '4px' }}>Calendar Agenda</h1>
          <p className="text-muted" style={{ margin: 0 }}>
            Scheduled events, meetings, and calendar appointments.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="icon-btn"
            onClick={loadEvents}
            title="Refresh Events"
            aria-label="Refresh Events"
            style={{ border: '1px solid var(--border)' }}
          >
            <RefreshCw size={16} />
          </button>
          <button
            type="button"
            className="primary"
            onClick={() => setFormOpen(!formOpen)}
            aria-expanded={formOpen}
          >
            {formOpen ? <X size={16} /> : <Plus size={16} />}
            <span>{formOpen ? 'Cancel' : 'Schedule Event'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="panel" style={{ borderLeft: '3px solid var(--danger)', marginBottom: '16px' }}>
          <p style={{ color: 'var(--danger)', marginBottom: '8px' }}>{error}</p>
          <button type="button" className="primary" onClick={loadEvents} style={{ fontSize: '12px' }}>
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Schedule Event Form */}
      {formOpen && (
        <form onSubmit={handleCreateEvent} className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '15px', margin: 0 }}>Schedule New Event</h2>

          {formError && (
            <div style={{ color: 'var(--danger)', fontSize: '12px', background: 'var(--danger-bg)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="event-title" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Event Title *
            </label>
            <input
              id="event-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Sprint Planning, Dentist Appointment"
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="event-desc" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Description / Notes
            </label>
            <input
              id="event-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Meeting agenda, dial-in link, or notes"
              disabled={submitting}
            />
          </div>

          <div className="grid-2">
            <div>
              <label htmlFor="event-start" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Start Time *
              </label>
              <input
                id="event-start"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="event-end" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                End Time *
              </label>
              <input
                id="event-end"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label htmlFor="event-location" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Location / Link
            </label>
            <input
              id="event-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Google Meet, Conference Room A, or address"
              disabled={submitting}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
            <button type="button" onClick={() => setFormOpen(false)} disabled={submitting}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Events Agenda List */}
      {events.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon size={32} />}
          title="No Events Scheduled"
          description="Your calendar agenda is completely clear. Click Schedule Event to book your next appointment."
          actionLabel="Schedule Event"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {events.map((e) => {
            const startObj = new Date(e.start_time);
            const endObj = new Date(e.end_time);
            const dateStr = startObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = `${startObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

            return (
              <div
                key={e.id}
                className="panel"
                style={{
                  margin: 0,
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '84px',
                      borderRight: '1px solid var(--border)',
                      paddingRight: '12px',
                      flexShrink: 0
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{dateStr.split(',')[0]}</div>
                    <div className="mono text-muted" style={{ fontSize: '11px', marginTop: '2px' }}>
                      {startObj.getDate()} {startObj.toLocaleString(undefined, { month: 'short' })}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{e.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <Clock size={12} color="var(--text-secondary)" />
                      <span className="mono text-muted" style={{ fontSize: '12px' }}>{timeStr}</span>
                    </div>

                    {e.description && (
                      <p style={{ fontSize: '13px', marginTop: '8px', marginBottom: 0, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {e.description}
                      </p>
                    )}

                    {e.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                        <MapPin size={12} color="var(--text-secondary)" />
                        <span className="text-muted" style={{ fontSize: '12px' }}>{e.location}</span>
                      </div>
                    )}

                    {e.google_event_id && (
                      <span
                        className="mono"
                        style={{
                          fontSize: '9px',
                          background: 'var(--bg-primary)',
                          padding: '2px 6px',
                          border: '1px solid var(--border)',
                          borderRadius: '3px',
                          display: 'inline-block',
                          marginTop: '8px'
                        }}
                      >
                        GOOGLE EVENT LINKED
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="link danger"
                  style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => setDeleteTargetId(e.id)}
                  aria-label={`Cancel event: ${e.title}`}
                >
                  <Trash2 size={14} />
                  <span>Cancel Event</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="Cancel Calendar Event"
        message="Are you sure you want to cancel this event from your calendar? This action cannot be undone."
        confirmLabel="Cancel Event"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
