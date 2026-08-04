import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/auth';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await registerUser(email, password, fullName || undefined);
        // Automatically login after register
        const res = await loginUser(email, password);
        onLoginSuccess(res.access_token);
      } else {
        const res = await loginUser(email, password);
        onLoginSuccess(res.access_token);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-panel">
        <h2 style={{ marginBottom: '8px', fontSize: '16px', fontWeight: 700 }}>RecallFlow</h2>
        <p className="text-muted" style={{ marginBottom: '20px', fontSize: '12px' }}>
          {isRegister ? 'Create a personal journal & memory account' : 'Sign in to access your memory database'}
        </p>

        {error && (
          <div style={{ color: 'var(--danger)', marginBottom: '12px', fontSize: '11px', lineHeight: 1.3 }}>
            Error: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isRegister && (
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="primary" disabled={loading} style={{ marginTop: '8px', width: '100%' }}>
            {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
          </button>
        </form>

        <hr style={{ margin: '16px 0' }} />

        <div style={{ textAlign: 'center', fontSize: '11px' }}>
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button className="link" onClick={() => setIsRegister(false)}>
                Sign in
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button className="link" onClick={() => setIsRegister(true)}>
                Sign up
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
