import React, { useState, useEffect, lazy, Suspense } from 'react';
import BlueprintLoader from '@/shared/components/BlueprintLoader';

const AdminLogin = lazy(() => import('./AdminLogin'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));

/**
 * FitscalezAdmin — Unified Admin Portal Entry
 * Accessible via https://walktheplan.in/fitscalez
 *
 * Provides single-route authentication flow:
 * - Shows AdminLogin when unauthenticated
 * - Seamlessly transitions to AdminDashboard upon authentication without URL redirects
 * - Handles auto-logout and session expiration cleanly
 */
const FitscalezAdmin = () => {
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem('adminToken');
    const expiry = Number(localStorage.getItem('adminSessionExpiry'));
    if (t && (!expiry || expiry > Date.now())) return t;
    return null;
  });

  useEffect(() => {
    const checkToken = () => {
      const t = localStorage.getItem('adminToken');
      const expiry = Number(localStorage.getItem('adminSessionExpiry'));
      if (t && (!expiry || expiry > Date.now())) {
        setToken(t);
      } else {
        setToken(null);
      }
    };
    checkToken();
    window.addEventListener('storage', checkToken);
    return () => window.removeEventListener('storage', checkToken);
  }, []);

  return (
    <Suspense fallback={<BlueprintLoader />}>
      {!token ? (
        <AdminLogin onLoginSuccess={(newToken) => setToken(newToken || localStorage.getItem('adminToken'))} />
      ) : (
        <AdminDashboard onLogout={() => setToken(null)} />
      )}
    </Suspense>
  );
};

export default FitscalezAdmin;
