import React, { useEffect, useState } from 'react';
import { listTasks, createTask, updateTask, deleteTask } from '../services/tasks';
import type { Task } from '../types';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadTasks() {
    try {
      const data = await listTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await createTask({
        title: newTitle.trim(),
        due_date: newDueDate ? new Date(newDueDate).toISOString().slice(0, 19) : undefined
      });
      setNewTitle('');
      setNewDueDate('');
      loadTasks();
    } catch (err: any) {
      setError(err.message || 'Failed to create task.');
    }
  };

  const handleToggleCompleted = async (task: Task) => {
    try {
      await updateTask(task.id, { is_completed: !task.is_completed });
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_completed: !t.is_completed } : t));
    } catch (err: any) {
      setError(err.message || 'Failed to update task.');
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete task.');
    }
  };

  if (loading) return <div>Loading tasks...</div>;

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.is_completed;
    if (filter === 'completed') return t.is_completed;
    return true;
  });

  return (
    <div>
      <h1 style={{ marginBottom: '16px' }}>Task Checklist</h1>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '16px' }}>Error: {error}</div>}

      {/* Quick Add Form */}
      <form onSubmit={handleCreateTask} className="panel" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="I want to buy bread..."
          required
          style={{ flexGrow: 1 }}
        />
        <input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          style={{ width: '130px' }}
        />
        <button type="submit" className="primary">Add Task</button>
      </form>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
        <button
          className={filter === 'pending' ? 'primary' : ''}
          onClick={() => setFilter('pending')}
          style={{ fontSize: '11px', padding: '3px 8px' }}
        >
          Pending
        </button>
        <button
          className={filter === 'completed' ? 'primary' : ''}
          onClick={() => setFilter('completed')}
          style={{ fontSize: '11px', padding: '3px 8px' }}
        >
          Completed
        </button>
        <button
          className={filter === 'all' ? 'primary' : ''}
          onClick={() => setFilter('all')}
          style={{ fontSize: '11px', padding: '3px 8px' }}
        >
          All
        </button>
      </div>

      {/* Task Checklist agenda */}
      {filteredTasks.length === 0 ? (
        <p className="text-muted">No tasks found.</p>
      ) : (
        <div className="task-list">
          {filteredTasks.map((t) => (
            <div key={t.id} className={`task-item ${t.is_completed ? 'completed' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={t.is_completed}
                  onChange={() => handleToggleCompleted(t)}
                />
                <div>
                  <span style={{ fontSize: '13px' }}>{t.title}</span>
                  {t.due_date && (
                    <span className="mono text-muted" style={{ fontSize: '10px', marginLeft: '10px' }}>
                      Due: {new Date(t.due_date).toLocaleDateString()}
                    </span>
                  )}
                  {t.google_task_id && (
                    <span className="mono" style={{ fontSize: '8px', background: 'var(--bg-primary)', padding: '1px 3px', border: '1px solid var(--border)', marginLeft: '8px' }}>
                      GOOGLE SYNCED
                    </span>
                  )}
                </div>
              </div>
              <button
                className="link danger"
                style={{ fontSize: '11px' }}
                onClick={() => handleDeleteTask(t.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
