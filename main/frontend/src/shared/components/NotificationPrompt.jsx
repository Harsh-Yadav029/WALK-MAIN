import React, { useState, useEffect } from 'react';
import { isPushSupported, getNotificationPermission, subscribeUserToPush } from '@/shared/utils/pushNotifications';
import { useSettings } from '@/shared/context/SettingsContext';

export default function NotificationPrompt() {
  const { isLeadModalOpen } = useSettings();
  const [visible, setVisible] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // 1. Check browser support
    if (!isPushSupported()) return;

    // 2. If permission is already granted or denied, don't show prompt
    const perm = getNotificationPermission();
    if (perm !== 'default') return;

    // 3. If visitor already booked an appointment, no need to remind them
    if (localStorage.getItem('wtp_has_booked') === '1') return;

    // 4. Check if visitor recently dismissed prompt
    const dismissedUntil = localStorage.getItem('wtp_notif_prompt_dismissed');
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) return;

    // 5. If lead appointment modal is currently open, wait until user closes or finishes
    if (isLeadModalOpen) return;

    // 6. Display after a gentle browsing delay
    const timer = setTimeout(() => {
      if (localStorage.getItem('wtp_has_booked') === '1') return;
      setVisible(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [isLeadModalOpen]);

  const handleEnable = async () => {
    setSubscribing(true);
    try {
      const result = await subscribeUserToPush();
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          setVisible(false);
        }, 2500);
      } else if (result.permission === 'denied') {
        setVisible(false);
      } else {
        // Permission was dismissed or failed, hide for 4 hours
        localStorage.setItem('wtp_notif_prompt_dismissed', String(Date.now() + 4 * 60 * 60 * 1000));
        setVisible(false);
      }
    } catch (err) {
      console.warn('[Push Prompt] Enable error:', err);
      setVisible(false);
    } finally {
      setSubscribing(false);
    }
  };

  const handleDismiss = () => {
    // Dismiss for 4 hours
    localStorage.setItem('wtp_notif_prompt_dismissed', String(Date.now() + 4 * 60 * 60 * 1000));
    setVisible(false);
  };

  // Check if visitor has not subscribed yet to show floating trigger
  const canShowFloatingBell = !visible && !success && isPushSupported() && getNotificationPermission() === 'default' && localStorage.getItem('wtp_has_booked') !== '1';

  if (!visible) {
    if (canShowFloatingBell) {
      return (
        <>
          <style>{`
            @keyframes gentlePulse {
              0%, 100% { box-shadow: 0 8px 24px rgba(0,0,0,0.45), 0 0 16px rgba(239, 199, 25, 0.3); }
              50% { box-shadow: 0 8px 24px rgba(0,0,0,0.45), 0 0 24px rgba(239, 199, 25, 0.7); }
            }
            .notif-bell-btn {
              position: fixed;
              bottom: 82px;
              right: 24px;
              z-index: 9998;
              width: 46px;
              height: 46px;
              border-radius: 50%;
              background: linear-gradient(135deg, #efc719 0%, #d4af37 100%);
              border: 2px solid rgba(255, 255, 255, 0.35);
              box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45), 0 0 16px rgba(239, 199, 25, 0.4);
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 20px;
              color: #0b132b;
              transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
              animation: gentlePulse 3s infinite;
            }
            .notif-bell-btn:hover {
              transform: translateY(-2px) scale(1.08);
              box-shadow: 0 10px 28px rgba(0, 0, 0, 0.55), 0 0 22px rgba(239, 199, 25, 0.6);
            }
            /* On mobile: keep cleanly stacked above scroll-to-top button with 14px gap */
            @media (max-width: 768px) {
              .notif-bell-btn {
                bottom: calc(72px + env(safe-area-inset-bottom, 0px));
                right: 16px;
                width: 42px;
                height: 42px;
                font-size: 18px;
              }
            }
          `}</style>
          <button
            onClick={() => setVisible(true)}
            aria-label="Enable reminder notifications"
            title="Enable Daily Studio Reminders"
            className="notif-bell-btn"
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            🔔
          </button>
        </>
      );
    }
    return null;
  }

  return (
    <aside
      aria-label="Daily appointment reminders notification"
      className="notif-prompt-card"
      style={{
        position: 'fixed',
        right: '24px',
        maxWidth: '380px',
        width: 'calc(100vw - 32px)',
        zIndex: 9999,
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(11, 19, 43, 0.98) 100%)',
        border: '1px solid rgba(239, 199, 25, 0.45)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(239, 199, 25, 0.15)',
        borderRadius: '16px',
        padding: '18px 20px',
        color: '#ffffff',
        backdropFilter: 'blur(16px)',
        animation: 'slideUpNotif 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      <style>{`
        @keyframes slideUpNotif {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        /* Desktop: sits near bottom-right corner */
        .notif-prompt-card {
          bottom: 24px;
        }
        /* Mobile: clean full-width bottom alignment with safe margin */
        @media (max-width: 768px) {
          .notif-prompt-card {
            bottom: calc(16px + env(safe-area-inset-bottom, 0px)) !important;
            right: 16px !important;
            left: 16px !important;
            width: auto !important;
            max-width: 400px !important;
            margin: 0 auto !important;
          }
        }
      `}</style>

      {success ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.2)',
              border: '1px solid #22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22c55e',
              fontSize: '18px',
              flexShrink: 0
            }}
          >
            ✓
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: '#22c55e' }}>
              Notification
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
              You will receive our offers.
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(239, 199, 25, 0.2), rgba(239, 199, 25, 0.05))',
                  border: '1px solid rgba(239, 199, 25, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0
                }}
              >
                🔔
              </div>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                Walk Your Floor Plan First!
              </h4>
            </div>
            <button
              onClick={handleDismiss}
              aria-label="Close notification reminder prompt"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: '18px',
                lineHeight: 1,
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px'
              }}
              title="Dismiss"
            >
              ×
            </button>
          </div>

          <p style={{ margin: '10px 0 14px', fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.45' }}>
            Don't start construction without walking your layout at 1:1 scale. Enable on your device to book your studio session discount.
          </p>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handleEnable}
              disabled={subscribing}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #efc719 0%, #d4af37 100%)',
                color: '#0b132b',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: subscribing ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(239, 199, 25, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              {subscribing ? (
                <span>Enabling...</span>
              ) : (
                <>
                  <span style={{ fontSize: '15px' }}>🔔</span>
                  <span>Notification</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
