import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Loader } from 'lucide-react';
import AdminSuspendedNotice from '@/admin/components/AdminSuspendedNotice';
import { IS_ADMIN_PANEL_STOPPED } from '@/shared/config/adminLock';
import { subscribeAdminToPush } from '@/shared/utils/pushNotifications';

const AdminLogin = ({ onLoginSuccess }) => {
  if (IS_ADMIN_PANEL_STOPPED) {
    return <AdminSuspendedNotice />;
  }

  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [status, setStatus] = useState({ loading: false, error: null });

  useEffect(() => {
    if (localStorage.getItem('adminUser') === 'parth') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      localStorage.removeItem('adminSessionExpiry');
    }
    // Check if token already exists and session is valid (runs in background)
    const token = localStorage.getItem('adminToken');
    const expiry = Number(localStorage.getItem('adminSessionExpiry'));
    if (token) {
      if (expiry && expiry <= Date.now()) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminSessionExpiry');
      } else {
        verifyExistingToken(token);
      }
    }
  }, []);

  const verifyExistingToken = async (token) => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        if (onLoginSuccess) {
          onLoginSuccess(token);
        } else {
          navigate('/fitscalez');
        }
      } else {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminSessionExpiry');
      }
    } catch (err) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminSessionExpiry');
    }
  };

  const handleInputChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed.');

      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', data.username);
      // Initialize 20-minute session expiry (runs in background)
      localStorage.setItem('adminSessionExpiry', (Date.now() + 20 * 60 * 1000).toString());

      // Instantly register this logged-in device for real-time lead alerts
      try {
        await subscribeAdminToPush(data.token);
      } catch (pushErr) {
        console.warn('Auto admin push register on login:', pushErr);
      }

      if (onLoginSuccess) {
        onLoginSuccess(data.token);
      } else {
        navigate('/fitscalez');
      }
    } catch (err) {
      let msg = err.message || 'Invalid credentials.';
      msg = msg.replace(/\.?\s*Please use username:?\s*fitscalez/gi, '').trim();
      setStatus({ loading: false, error: msg || 'Invalid credentials.' });
    }
  };

  return (
    <div className="container" style={{ padding: '8rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', border: '1px solid var(--border-color)', boxShadow: '0 15px 35px rgba(0,0,0,0.5), 0 0 15px var(--glow-color)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '56px', height: '56px', background: 'rgba(239, 199, 25,0.1)', color: 'var(--accent-orange)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid var(--accent-orange)' }}>
            <Lock size={24} />
          </div>
          <h1 style={{ fontSize: '1.8rem', color: '#ffffff' }}>Admin Portal</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Sign in to manage bookings, blogs, and gallery.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label" htmlFor="username">Username</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                id="username" 
                name="username" 
                value={credentials.username}
                onChange={handleInputChange}
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="username"
                required 
              />
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                id="password" 
                name="password" 
                value={credentials.password}
                onChange={handleInputChange}
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                required 
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}
            disabled={status.loading}
          >
            {status.loading ? <Loader className="animated-float" size={18} /> : 'Login to Dashboard'}
          </button>

          {status.error && (
            <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '6px', color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>
              {status.error}
            </div>
          )}

        </form>

      </div>
    </div>
  );
};

export default AdminLogin;
