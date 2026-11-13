import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Sparkles, X, ArrowRight, Check } from 'lucide-react';
import { useSettings } from '@/shared/context/SettingsContext';
import { isPushSupported, getNotificationPermission, subscribeUserToPush } from '@/shared/utils/pushNotifications';

export default function SiteNotificationBanner() {
  const { settings, openLeadModal } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();

  const [dismissed, setDismissed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribedNow, setSubscribedNow] = useState(false);

  // Hidden on admin & login paths
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login') || location.pathname.startsWith('/fitscalez');

  const isEnabled = settings && settings.site_notification_enabled === '1';
  const notifTime = settings ? (settings.site_notification_time || 'initial') : 'initial';
  const title = settings && settings.site_notification_title ? settings.site_notification_title : '🏠 Walk Your Floor Plan at 1:1 Scale!';
  const body = settings && settings.site_notification_body ? settings.site_notification_body : 'Book your full-scale blueprint projection session today! Experience your future home before construction begins.';
  const targetUrl = settings && settings.site_notification_url ? settings.site_notification_url : '/contact';
  const badgeText = settings && settings.site_notification_badge ? settings.site_notification_badge : 'LIVE ANNOUNCEMENT';

  // Check dismissal cache whenever notification time or settings update
  useEffect(() => {
    if (!isEnabled) return;
    try {
      const dismissedTimestamp = localStorage.getItem('wtp_site_notif_dismissed_time');
      if (dismissedTimestamp === notifTime) {
        setDismissed(true);
      } else {
        setDismissed(false);
      }
    } catch (e) {
      // LocalStorage fallback
    }
  }, [isEnabled, notifTime]);

  if (isAdminRoute || !isEnabled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    try {
      localStorage.setItem('wtp_site_notif_dismissed_time', notifTime);
    } catch (e) {}
    setDismissed(true);
  };

  const handleActionClick = () => {
    if (targetUrl === '/contact' || targetUrl === 'contact' || targetUrl === '#book') {
      if (openLeadModal) openLeadModal();
      else navigate('/contact');
    } else if (targetUrl.startsWith('http')) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate(targetUrl);
    }
  };

  const handleSubscribeDevicePush = async (e) => {
    e.stopPropagation();
    setSubscribing(true);
    try {
      const res = await subscribeUserToPush();
      if (res && res.success) {
        setSubscribedNow(true);
        setTimeout(() => setSubscribedNow(false), 4000);
      }
    } catch (err) {
      console.warn('[Site Banner Push Opt-in] Error:', err);
    } finally {
      setSubscribing(false);
    }
  };

  const canPromptDevicePush = isPushSupported() && getNotificationPermission() === 'default';

  return (
    <aside
      role="region"
      aria-label="Site-wide notification announcement"
      className="site-notification-banner"
      style={{
        position: 'fixed',
        top: '84px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '860px',
        zIndex: 9992,
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(11, 19, 43, 0.98) 100%)',
        border: '1px solid rgba(239, 199, 25, 0.55)',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.65), 0 0 25px rgba(239, 199, 25, 0.2)',
        borderRadius: '14px',
        padding: '12px 18px',
        color: '#f8fafc',
        backdropFilter: 'blur(20px)',
        animation: 'bannerSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      <style>{`
        @keyframes bannerSlideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -18px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
        @keyframes livePulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @media (max-width: 640px) {
          .site-notification-banner {
            top: 76px !important;
            width: calc(100% - 20px) !important;
            padding: 10px 14px !important;
          }
          .site-notif-actions {
            flex-direction: column !important;
            align-items: stretch !important;
          }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header Badge & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: '999px',
                background: 'rgba(239, 199, 25, 0.18)',
                border: '1px solid rgba(239, 199, 25, 0.45)',
                color: '#efc719',
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  display: 'inline-block',
                  animation: 'livePulseDot 2s infinite'
                }}
              />
              {badgeText}
            </span>

            <h4
              style={{
                margin: 0,
                fontSize: '0.92rem',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.01em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {title}
            </h4>
          </div>

          {/* Body Text */}
          <p
            style={{
              margin: '0 0 10px 0',
              fontSize: '0.82rem',
              color: '#cbd5e1',
              lineHeight: '1.45'
            }}
          >
            {body}
          </p>

          {/* Action Row */}
          <div className="site-notif-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleActionClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #efc719 0%, #d4af37 100%)',
                color: '#0b132b',
                fontWeight: 700,
                fontSize: '0.78rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(239, 199, 25, 0.25)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <span>Explore / Book Studio Session</span>
              <ArrowRight size={13} />
            </button>

            {/* Direct Device Push Opt-In for non-subscribers */}
            {canPromptDevicePush && !subscribedNow && (
              <button
                type="button"
                onClick={handleSubscribeDevicePush}
                disabled={subscribing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#f8fafc',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  cursor: subscribing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; }}
                title="Get notifications directly on your phone or PC screen even when the browser is closed"
              >
                <Bell size={12} color="#efc719" />
                <span>{subscribing ? 'Enabling...' : '🔔 Get Direct Device Alerts'}</span>
              </button>
            )}

            {subscribedNow && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  color: '#22c55e',
                  fontWeight: 700
                }}
              >
                <Check size={13} /> Device Push Alerts Enabled!
              </span>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss announcement banner"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#ffffff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
          title="Dismiss banner"
        >
          <X size={16} />
        </button>
      </div>
    </aside>
  );
}
