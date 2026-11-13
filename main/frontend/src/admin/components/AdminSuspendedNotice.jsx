import React from 'react';
import { Lock } from 'lucide-react';

const AdminSuspendedNotice = () => {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      boxSizing: 'border-box',
      background: '#070a12',
      color: '#ffffff'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        padding: '3rem 2rem',
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        borderRadius: '16px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 25px rgba(239, 68, 68, 0.15)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444',
          marginBottom: '1.5rem'
        }}>
          <Lock size={30} />
        </div>

        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#ffffff',
          margin: '0 0 0.75rem 0',
          lineHeight: 1.3
        }}>
          Admin Panel Temporarily Suspended
        </h1>

        <p style={{
          fontSize: '0.95rem',
          color: '#94a3b8',
          margin: 0,
          lineHeight: 1.5
        }}>
          Access is temporarily suspended due to pending payment.
        </p>
      </div>
    </div>
  );
};

export default AdminSuspendedNotice;
