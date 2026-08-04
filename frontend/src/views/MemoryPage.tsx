import React, { useState, useEffect } from 'react';

export default function MemoryPage() {
  const [memories, setMemories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [newMemory, setNewMemory] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('local_memories');
    if (stored) {
      setMemories(JSON.parse(stored));
    }
  }, []);

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.trim()) return;

    const updated = [newMemory.trim(), ...memories];
    localStorage.setItem('local_memories', JSON.stringify(updated));
    setMemories(updated);
    setNewMemory('');
    setSuccessMsg('Memory stored successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = (indexToDelete: number) => {
    const updated = memories.filter((_, idx) => idx !== indexToDelete);
    localStorage.setItem('local_memories', JSON.stringify(updated));
    setMemories(updated);
  };

  const filteredMemories = memories.filter(m => 
    m.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 style={{ marginBottom: '8px' }}>Memory Archive</h1>
      <p className="text-muted" style={{ marginBottom: '24px' }}>
        Semantic long-term facts stored about you. The AI uses these vectors to answer queries.
      </p>

      {/* Quick Add Form */}
      <div className="panel" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Record a Fact</h2>
        <form onSubmit={handleAddMemory} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            placeholder="E.g., I have a dog named Rusty who loves chicken snacks."
            required
            style={{ flexGrow: 1 }}
          />
          <button type="submit" className="primary">Save Fact</button>
        </form>
        {successMsg && (
          <div style={{ color: 'var(--success)', fontSize: '11px', marginTop: '6px' }}>{successMsg}</div>
        )}
      </div>

      {/* Search and Filters */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter memories by keyword..."
          style={{ width: '100%' }}
        />
      </div>

      {/* Timeline View */}
      {filteredMemories.length === 0 ? (
        <p className="text-muted">No matching memories found.</p>
      ) : (
        <div className="timeline">
          {filteredMemories.map((m, idx) => (
            <div key={idx} className="timeline-item">
              <div className="timeline-dot" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="timeline-meta mono">FACT ID: {idx + 1}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{m}</div>
                </div>
                <button
                  className="link danger"
                  style={{ fontSize: '11px', color: 'var(--danger)', padding: 0 }}
                  onClick={() => handleDelete(idx)}
                >
                  Forget
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
