import { AlertTriangle, Home } from 'lucide-react';

interface NotFoundProps {
  onNavigateHome: () => void;
}

export default function NotFound({ onNavigateHome }: NotFoundProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '60px 20px',
        minHeight: '60vh'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--danger-bg)',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}
      >
        <AlertTriangle size={28} />
      </div>
      <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Page Not Found</h1>
      <p className="text-muted" style={{ maxWidth: '400px', marginBottom: '24px', lineHeight: 1.5 }}>
        The section you are trying to access does not exist or has been moved.
      </p>
      <button
        type="button"
        className="primary"
        onClick={onNavigateHome}
      >
        <Home size={16} />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
}
