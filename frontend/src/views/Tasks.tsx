import React, { useEffect, useState, useCallback } from 'react';
import { listTasks, createTask, updateTask, deleteTask } from '../services/tasks';
import type { Task } from '../types';
import { formatDate } from '../utils/date';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import ConfirmModal from '../components/common/ConfirmModal';
import Toast, { type ToastMessage } from '../components/common/Toast';
import { CheckSquare, Trash2, Plus, RefreshCw } from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Deletion modal state
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listTasks();
      setTasks(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch tasks.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    try {
      await createTask({
        title: newTitle.trim(),
        due_date: newDueDate ? newDueDate : undefined
      });
      setNewTitle('');
      setNewDueDate('');
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Task added successfully.'
      });
      loadTasks();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create task.';
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: msg
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleCompleted = async (task: Task) => {
    const updatedStatus = !task.is_completed;
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_completed: updatedStatus } : t));

    try {
      await updateTask(task.id, { is_completed: updatedStatus });
    } catch (err: unknown) {
      // Rollback
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_completed: task.is_completed } : t));
      const msg = err instanceof Error ? err.message : 'Failed to update task status.';
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: msg
      });
    }
  };

  const confirmDelete = async () => {
    if (deleteTargetId === null) return;
    const idToDelete = deleteTargetId;
    setDeleteTargetId(null);

    // Optimistic removal
    const previousTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== idToDelete));

    try {
      await deleteTask(idToDelete);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Task deleted.'
      });
    } catch (err: unknown) {
      setTasks(previousTasks);
      const msg = err instanceof Error ? err.message : 'Failed to delete task.';
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: msg
      });
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.is_completed;
    if (filter === 'completed') return t.is_completed;
    return true;
  });

  if (loading) {
    return <LoadingState message="Loading your task checklist..." />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '4px' }}>Task Checklist</h1>
          <p className="text-muted" style={{ margin: 0 }}>
            Manage your daily to-dos, deadlines, and completion states.
          </p>
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={loadTasks}
          title="Refresh Tasks"
          aria-label="Refresh Tasks"
          style={{ border: '1px solid var(--border)' }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {error && (
        <div className="panel" style={{ borderLeft: '3px solid var(--danger)', marginBottom: '16px' }}>
          <p style={{ color: 'var(--danger)', marginBottom: '8px' }}>{error}</p>
          <button type="button" className="primary" onClick={loadTasks} style={{ fontSize: '12px' }}>
            <RefreshCw size={14} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Quick Add Form */}
      <div className="panel" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '14px', marginBottom: '10px' }}>Create New Task</h2>
        <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ flexGrow: 1, minWidth: '220px' }}>
            <label htmlFor="task-title-input" className="sr-only">Task Title</label>
            <input
              id="task-title-input"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What do you need to get done?"
              required
              disabled={submitting}
            />
          </div>
          <div style={{ width: '150px' }}>
            <label htmlFor="task-due-date" className="sr-only">Due Date</label>
            <input
              id="task-due-date"
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              disabled={submitting}
              title="Due Date"
            />
          </div>
          <button type="submit" className="primary" disabled={submitting || !newTitle.trim()}>
            <Plus size={16} />
            <span>{submitting ? 'Adding...' : 'Add Task'}</span>
          </button>
        </form>
      </div>

      {/* Filters and Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '8px',
          alignItems: 'center'
        }}
        role="tablist"
        aria-label="Filter tasks"
      >
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'pending'}
          className={filter === 'pending' ? 'primary' : ''}
          onClick={() => setFilter('pending')}
          style={{ fontSize: '12px', padding: '4px 12px' }}
        >
          Pending ({tasks.filter(t => !t.is_completed).length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'completed'}
          className={filter === 'completed' ? 'primary' : ''}
          onClick={() => setFilter('completed')}
          style={{ fontSize: '12px', padding: '4px 12px' }}
        >
          Completed ({tasks.filter(t => t.is_completed).length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'all'}
          className={filter === 'all' ? 'primary' : ''}
          onClick={() => setFilter('all')}
          style={{ fontSize: '12px', padding: '4px 12px' }}
        >
          All ({tasks.length})
        </button>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={32} />}
          title={
            filter === 'completed'
              ? 'No Completed Tasks Yet'
              : filter === 'pending'
              ? 'No Pending Tasks'
              : 'No Tasks Found'
          }
          description={
            filter === 'completed'
              ? 'Complete tasks from the pending list to view them here.'
              : 'Use the quick add form above or ask RecallFlow AI to schedule your tasks.'
          }
        />
      ) : (
        <div className="task-list">
          {filteredTasks.map((t) => (
            <div
              key={t.id}
              className={`task-item ${t.is_completed ? 'completed' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <input
                  type="checkbox"
                  id={`task-check-${t.id}`}
                  checked={t.is_completed}
                  onChange={() => handleToggleCompleted(t)}
                  aria-label={`Mark "${t.title}" as ${t.is_completed ? 'incomplete' : 'completed'}`}
                />
                <label
                  htmlFor={`task-check-${t.id}`}
                  style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <span className="task-title" style={{ fontSize: '13.5px', fontWeight: 500 }}>
                    {t.title}
                  </span>
                  {t.due_date && (
                    <span className="mono text-muted" style={{ fontSize: '11px' }}>
                      Due: {formatDate(t.due_date)}
                    </span>
                  )}
                  {t.google_task_id && (
                    <span
                      className="mono"
                      style={{
                        fontSize: '9px',
                        background: 'var(--bg-primary)',
                        padding: '1px 5px',
                        border: '1px solid var(--border)',
                        borderRadius: '3px'
                      }}
                    >
                      SYNCED
                    </span>
                  )}
                </label>
              </div>

              <button
                type="button"
                className="link danger"
                style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => setDeleteTargetId(t.id)}
                aria-label={`Delete task: ${t.title}`}
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation modal for deletion */}
      <ConfirmModal
        isOpen={deleteTargetId !== null}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete Task"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Notification Toast */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
