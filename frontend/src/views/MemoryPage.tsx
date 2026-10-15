import React, { useState, useEffect } from 'react';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import Toast, { type ToastMessage } from '../components/common/Toast';
import { Brain, Plus, Search, Trash2, X } from 'lucide-react';

export default function MemoryPage() {
  const [memories, setMemories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [newMemory, setNewMemory] = useState('');
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
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
  }, []);

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.trim()) return;

    const updated = [newMemory.trim(), ...memories];
    localStorage.setItem('local_memories', JSON.stringify(updated));
    setMemories(updated);
    setNewMemory('');
    setToast({
      id: Date.now().toString(),
      type: 'success',
      message: 'Memory saved to archive.'
    });
  };

  const confirmForget = () => {
    if (deleteIndex === null) return;
    const targetIdx = deleteIndex;
    const updated = memories.filter((_, idx) => idx !== targetIdx);
    localStorage.setItem('local_memories', JSON.stringify(updated));
    setMemories(updated);
    setDeleteIndex(null);
    setToast({
      id: Date.now().toString(),
      type: 'success',
      message: 'Memory forgotten.'
    });
  };

  const filteredMemories = memories.filter(m =>
    m.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ marginBottom: '4px' }}>Memory Archive</h1>
        <p className="text-muted" style={{ margin: 0 }}>
          Semantic long-term facts stored about you. RecallFlow uses these memories to personalize answers.
        </p>
      </div>

      {/* Record a Fact Panel */}
      <div className="panel" style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '15px', marginBottom: '10px' }}>Record a Fact</h2>
        <form onSubmit={handleAddMemory} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ flexGrow: 1, minWidth: '240px' }}>
            <label htmlFor="new-memory-input" className="sr-only">Memory fact description</label>
            <input
              id="new-memory-input"
              type="text"
              value={newMemory}
              onChange={(e) => setNewMemory(e.target.value)}
              placeholder="E.g., I prefer morning workouts; my primary programming stack is React and Python."
              required
            />
          </div>
          <button type="submit" className="primary" disabled={!newMemory.trim()}>
            <Plus size={16} />
            <span>Save Fact</span>
          </button>
        </form>
      </div>

      {/* Search and Filters */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <label htmlFor="search-memory-input" className="sr-only">Filter memories</label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
          <input
            id="search-memory-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stored memory facts..."
            style={{ paddingLeft: '36px', paddingRight: search ? '36px' : '12px' }}
          />
          {search && (
            <button
              type="button"
              className="icon-btn"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              style={{ position: 'absolute', right: '8px' }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Memories Timeline View */}
      <h2 style={{ fontSize: '16px', marginBottom: '14px' }}>
        {search ? `Search Results (${filteredMemories.length})` : `Archived Memories (${memories.length})`}
      </h2>

      {filteredMemories.length === 0 ? (
        <EmptyState
          icon={<Brain size={32} />}
          title={search ? 'No Matching Memories' : 'No Memories Recorded Yet'}
          description={
            search
              ? `No memories matched your query "${search}". Try different keywords or clear the search.`
              : 'Record your personal preferences, project details, or facts above so RecallFlow remembers them.'
          }
          actionLabel={search ? 'Clear Search' : undefined}
          onAction={search ? () => setSearch('') : undefined}
        />
      ) : (
        <div className="timeline">
          {filteredMemories.map((m, idx) => (
            <div key={idx} className="timeline-item">
              <div className="timeline-dot" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div>
                  <div className="timeline-meta mono">FACT #{idx + 1}</div>
                  <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {m}
                  </div>
                </div>
                <button
                  type="button"
                  className="link danger"
                  style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
                  onClick={() => setDeleteIndex(idx)}
                  aria-label={`Forget fact: ${m}`}
                >
                  <Trash2 size={13} />
                  <span>Forget</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteIndex !== null}
        title="Forget Memory Fact"
        message="Are you sure you want to remove this fact from your memory archive? RecallFlow will no longer use it during chat conversations."
        confirmLabel="Forget Fact"
        isDanger={true}
        onConfirm={confirmForget}
        onCancel={() => setDeleteIndex(null)}
      />

      {/* Toast feedback */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
