import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
  autoCloseMs?: number;
}

export default function Toast({ toast, onDismiss, autoCloseMs = 3500 }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, autoCloseMs);
    return () => clearTimeout(timer);
  }, [toast, onDismiss, autoCloseMs]);

  if (!toast) return null;

  return (
    <div
      className={`toast-banner ${toast.type}`}
      role="status"
      aria-live="polite"
    >
      {toast.type === 'success' && <CheckCircle2 size={16} color="var(--success)" />}
      {toast.type === 'error' && <AlertCircle size={16} color="var(--danger)" />}
      <span>{toast.message}</span>
      <button
        type="button"
        className="icon-btn"
        aria-label="Dismiss notification"
        onClick={onDismiss}
        style={{ minWidth: '24px', minHeight: '24px', padding: '2px', marginLeft: '6px' }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
