import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/auth';
import { Brain, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        await registerUser(email.trim(), password, fullName.trim() || undefined);
        // Automatically login after successful registration
        const res = await loginUser(email.trim(), password);
        onLoginSuccess(res.access_token);
      } else {
        const res = await loginUser(email.trim(), password);
        onLoginSuccess(res.access_token);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred during authentication.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Brain size={26} color="var(--accent)" />
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>RecallFlow</h1>
        </div>
        <p className="text-muted" style={{ marginBottom: '22px', fontSize: '13px' }}>
          {isRegister
            ? 'Create an account to start managing your memories and tasks'
            : 'Sign in to access your personal productivity assistant'}
        </p>

        {error && (
          <div
            role="alert"
            style={{
              color: 'var(--danger)',
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 12px',
              marginBottom: '16px',
              fontSize: '12px',
              lineHeight: 1.4
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isRegister && (
            <div>
              <label htmlFor="auth-name" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Email Address *
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="auth-password" style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Password *
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                style={{ paddingRight: '36px' }}
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: '6px', minWidth: '28px', minHeight: '28px', padding: '2px' }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="primary"
            disabled={loading}
            style={{ marginTop: '6px', width: '100%', height: '38px' }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : isRegister ? (
              <>
                <UserPlus size={16} />
                <span>Create Account</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <hr style={{ margin: '20px 0', borderColor: 'var(--border)' }} />

        <div style={{ textAlign: 'center', fontSize: '12px' }}>
          {isRegister ? (
            <span style={{ color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <button
                type="button"
                className="link"
                onClick={() => {
                  setIsRegister(false);
                  setError('');
                }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span style={{ color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <button
                type="button"
                className="link"
                onClick={() => {
                  setIsRegister(true);
                  setError('');
                }}
              >
                Sign Up
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
