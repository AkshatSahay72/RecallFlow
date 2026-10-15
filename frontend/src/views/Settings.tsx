import { useState, useEffect } from 'react';
import ConfirmModal from '../components/common/ConfirmModal';
import Toast, { type ToastMessage } from '../components/common/Toast';
import { Sun, Moon, Link2, CheckCircle2, Server, Globe } from 'lucide-react';

interface SettingsProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export default function Settings({ theme, onThemeToggle }: SettingsProps) {
  const [googleLinked, setGoogleLinked] = useState<boolean>(false);
  const [confirmUnlink, setConfirmUnlink] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    const isLinked = localStorage.getItem('google_linked') === 'true';
    setGoogleLinked(isLinked);
  }, []);

  const handleLinkGoogle = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    localStorage.setItem('google_linked', 'true');
    window.location.href = `${API_BASE_URL}/api/v1/auth/google/login?token=${token}`;
  };

  const handleConfirmUnlink = () => {
    localStorage.removeItem('google_linked');
    setGoogleLinked(false);
    setConfirmUnlink(false);
    setToast({
      id: Date.now().toString(),
      type: 'info',
      message: 'Google Account unlinked from this session.'
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ marginBottom: '4px' }}>Settings & Preferences</h1>
        <p className="text-muted" style={{ margin: 0 }}>
          Manage your external service integrations, interface theme, and environment configuration.
        </p>
      </div>

      {/* Account Linkages */}
      <div className="panel" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Link2 size={18} color="var(--accent)" />
          <h2 style={{ margin: 0, fontSize: '15px' }}>Connected Integrations</h2>
        </div>
        <p className="text-muted" style={{ marginBottom: '16px' }}>
          Connect external accounts to automatically synchronize tasks and calendar appointments.
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 16px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-primary)',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Google Services (Calendar & Tasks)</span>
              {googleLinked && (
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--success)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <CheckCircle2 size={12} />
                  <span>CONNECTED</span>
                </span>
              )}
            </div>
            <div className="text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>
              Synchronizes scheduled events to Google Calendar and checklist items to Google Tasks.
            </div>
          </div>

          <div>
            {googleLinked ? (
              <button
                type="button"
                className="danger"
                onClick={() => setConfirmUnlink(true)}
              >
                Disconnect
              </button>
            ) : (
              <button
                type="button"
                className="primary"
                onClick={handleLinkGoogle}
              >
                Link Google Account
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Theme Preferences */}
      <div className="panel" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          {theme === 'light' ? <Sun size={18} color="var(--warning)" /> : <Moon size={18} color="var(--accent)" />}
          <h2 style={{ margin: 0, fontSize: '15px' }}>Appearance & Theme</h2>
        </div>
        <p className="text-muted" style={{ marginBottom: '16px' }}>
          Toggle between dark charcoal mode and clean daylight theme.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '13px' }}>
            Current Theme: <strong style={{ color: 'var(--accent)' }}>{theme.toUpperCase()}</strong>
          </span>
          <button type="button" onClick={onThemeToggle} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            <span>Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode</span>
          </button>
        </div>
      </div>

      {/* Hosting & System Information */}
      <div className="panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Server size={18} color="var(--accent)" />
          <h2 style={{ margin: 0, fontSize: '15px' }}>Environment & Architecture</h2>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Server size={14} /> Backend API Host
                </span>
              </td>
              <td className="mono" style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>
                Render (FastAPI)
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={14} /> Frontend Client Host
                </span>
              </td>
              <td className="mono" style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>
                Vercel (React + Vite)
              </td>
            </tr>
            <tr>
              <td style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>
                API Endpoint Base
              </td>
              <td className="mono" style={{ padding: '10px 0', textAlign: 'right', color: 'var(--accent)' }}>
                {API_BASE_URL}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmUnlink}
        title="Disconnect Google Integration"
        message="Are you sure you want to disconnect Google Services? Automatic calendar and task synchronization will be paused."
        confirmLabel="Disconnect"
        isDanger={true}
        onConfirm={handleConfirmUnlink}
        onCancel={() => setConfirmUnlink(false)}
      />

      {/* Toast Feedback */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
