import React, { useState, useEffect } from 'react';
import type { JournalEntry } from '../types';

export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<JournalEntry['mood']>(null);
  const [tagsStr, setTagsStr] = useState('');
  const [success, setSuccess] = useState('');

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
      setEntries(JSON.parse(stored));
    } else {
      const defaults: JournalEntry[] = [
        {
          id: 1,
          content: "Started building the RecallFlow frontend dashboard today. Used pure vanilla CSS variables for dark/light themes. Looks super fast and developer-centric.",
          mood: "happy",
          tags: ["project", "dev", "css"],
          created_at: new Date().toISOString()
        }
      ];
      localStorage.setItem('local_journal_entries', JSON.stringify(defaults));
      setEntries(defaults);
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
      id: Math.random(),
      content: content.trim(),
      mood,
      tags: parsedTags,
      created_at: new Date().toISOString()
    };

    const updated = [newEntry, ...entries];
    localStorage.setItem('local_journal_entries', JSON.stringify(updated));
    setEntries(updated);

    // Reset
    setContent('');
    setMood(null);
    setTagsStr('');
    setSuccess('Journal entry saved.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDelete = (id: number) => {
    const updated = entries.filter(e => e.id !== id);
    localStorage.setItem('local_journal_entries', JSON.stringify(updated));
    setEntries(updated);
  };

  return (
    <div>
      <h1 style={{ marginBottom: '16px' }}>Journal Logs</h1>

      {/* Editor Panel */}
      <form onSubmit={handleSave} className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '13px', margin: 0 }}>Write Daily Log</h2>
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What did you build, learn, or experience today?"
          rows={3}
          required
        />

        <div>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Select Mood</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {moods.map((m) => (
              <button
                key={m.value}
                type="button"
                className={`mood-btn ${mood === m.value ? 'primary' : ''}`}
                onClick={() => setMood(m.value)}
                style={{ padding: '3px 8px', fontSize: '11px' }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '2px' }}>Tags (comma-separated)</label>
          <input
            type="text"
            value={tagsStr}
            onChange={(e) => setTagsStr(e.target.value)}
            placeholder="dev, health, coding"
          />
        </div>

        <button type="submit" className="primary" style={{ alignSelf: 'flex-start', marginTop: '6px' }}>Save Log</button>
        {success && <div style={{ color: 'var(--success)', fontSize: '11px', marginTop: '4px' }}>{success}</div>}
      </form>

      {/* Journal Entry list */}
      {entries.length === 0 ? (
        <p className="text-muted">No journal logs recorded yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {entries.map((entry) => (
            <div key={entry.id} className="panel" style={{ margin: 0, padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span className="mono text-muted" style={{ fontSize: '11px' }}>
                  {new Date(entry.created_at).toLocaleString()} 
                  {entry.mood && ` • Mood: ${entry.mood.toUpperCase()}`}
                </span>
                <button
                  className="link danger"
                  style={{ fontSize: '11px' }}
                  onClick={() => handleDelete(entry.id)}
                >
                  Delete
                </button>
              </div>

              <p style={{ fontSize: '13px', whiteSpace: 'pre-wrap', lineHeight: 1.5, color: 'var(--text-primary)' }}>
                {entry.content}
              </p>

              {entry.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  {entry.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="mono"
                      style={{ fontSize: '10px', background: 'var(--bg-primary)', padding: '2px 6px', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
