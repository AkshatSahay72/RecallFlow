import React, { useState, useEffect } from 'react';
import type { JournalEntry } from '../types';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import Toast, { type ToastMessage } from '../components/common/Toast';
import { BookOpen, Trash2, Save, Tag } from 'lucide-react';

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalEntry['mood']>(null);
  const [tagsStr, setTagsStr] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const moods: { label: string; value: JournalEntry['mood'] }[] = [
    { label: '🙂 Happy', value: 'happy' },
    { label: '😐 Neutral', value: 'neutral' },
    { label: '🙁 Sad', value: 'sad' },
    { label: '😰 Anxious', value: 'anxious' },
    { label: '😴 Tired', value: 'tired' }
  ];

  useEffect(() => {
    const stored = localStorage.getItem('local_journal_entries');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setEntries(Array.isArray(parsed) ? parsed : []);
      } catch {
        setEntries([]);
      }
    } else {
      setEntries([]);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const parsedTags = tagsStr
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const newEntry: JournalEntry = {
      id: Date.now(),
      content: content.trim(),
      mood,
      tags: parsedTags,
      created_at: new Date().toISOString()
    };

    const updated = [newEntry, ...entries];
    localStorage.setItem('local_journal_entries', JSON.stringify(updated));
    setEntries(updated);

    setContent('');
    setMood(null);
    setTagsStr('');
    setToast({
      id: Date.now().toString(),
      type: 'success',
      message: 'Journal entry saved.'
    });
  };

  const confirmDelete = () => {
    if (deleteTargetId === null) return;
    const updated = entries.filter(e => e.id !== deleteTargetId);
    localStorage.setItem('local_journal_entries', JSON.stringify(updated));
    setEntries(updated);
    setDeleteTargetId(null);
    setToast({
      id: Date.now().toString(),
      type: 'success',
      message: 'Journal entry removed.'
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ marginBottom: '4px' }}>Journal Logs</h1>
        <p className="text-muted" style={{ margin: 0 }}>
          Personal reflections, daily logs, moods, and thoughts.
        </p>
      </div>

      {/* Editor Panel */}
      <form onSubmit={handleSave} className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '15px', margin: 0 }}>Write Daily Log</h2>

        <div>
          <label htmlFor="journal-content" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            What did you build, learn, or experience today? *
          </label>
          <textarea
            id="journal-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your reflection here..."
            rows={4}
            required
          />
        </div>

        <div>
          <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Current Mood
          </span>
          <div className="mood-selector" role="radiogroup" aria-label="Select mood">
            {moods.map((m) => (
              <button
                key={m.value}
                type="button"
                className={`mood-btn ${mood === m.value ? 'selected' : ''}`}
                onClick={() => setMood(mood === m.value ? null : m.value)}
                aria-pressed={mood === m.value}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="journal-tags" style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Tags (comma-separated)
          </label>
          <input
            id="journal-tags"
            type="text"
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            placeholder="work, health, ideas, milestone"
          />
        </div>

        <button type="submit" className="primary" style={{ alignSelf: 'flex-start', marginTop: '4px' }}>
          <Save size={14} />
          <span>Save Log Entry</span>
        </button>
      </form>

      {/* Journal Entry List */}
      <h2 style={{ fontSize: '16px', marginBottom: '14px' }}>Previous Logs ({entries.length})</h2>

      {entries.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={32} />}
          title="No Journal Logs Yet"
          description="Record your thoughts, accomplishments, and moods to build your daily reflection archive."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {entries.map((entry) => (
            <div key={entry.id} className="panel" style={{ margin: 0, padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="mono text-muted" style={{ fontSize: '12px' }}>
                  {new Date(entry.created_at).toLocaleString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {entry.mood && ` • Mood: ${entry.mood.toUpperCase()}`}
                </span>
                <button
                  type="button"
                  className="link danger"
                  style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => setDeleteTargetId(entry.id)}
                  aria-label="Delete entry"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>

              <p style={{ fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: 0 }}>
                {entry.content}
              </p>

              {entry.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                  {entry.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="mono"
                      style={{
                        fontSize: '11px',
                        background: 'var(--bg-primary)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Tag size={10} />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="Delete Journal Entry"
        message="Are you sure you want to permanently delete this journal log?"
        confirmLabel="Delete Entry"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
