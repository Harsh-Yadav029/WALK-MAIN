// Walk The Plan — Push Notification Registration & Subscription Manager
// Supports Service Worker push events, VAPID key sync, and backend registration

const FALLBACK_VAPID_KEY = 'BJKZ8nW8KrczZ2nnBiLqZEhCqg44hweYvCHHSqYst_cJdxaNYgfPRrVq4SWE84Hx2iHLvDvD5whZfW_h1B8sqsU';

/**
 * Convert base64 VAPID public key string to Uint8Array for PushManager
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Fetch VAPID public key from backend or fall back to known key
 */
async function getVapidPublicKey() {
  try {
    const res = await fetch('/api/push/vapid-public-key');
    if (res.ok) {
      const data = await res.json();
      if (data && data.publicKey) return data.publicKey;
    }
  } catch (e) {
    // Fall back to embedded key
  }
  return FALLBACK_VAPID_KEY;
}

/**
 * Check if the current browser environment supports Push Notifications & Service Workers
 */
export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Get current notification permission ('granted', 'denied', 'default', or 'unsupported')
 */
export function getNotificationPermission() {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Register Service Worker for push notifications
 */
export async function registerServiceWorker() {
  if (!isPushSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;
    return reg;
  } catch (err) {
    console.warn('[Push] Service worker registration error:', err);
    return null;
  }
}

/**
 * Sync active push subscription with the backend database
 */
export async function syncSubscriptionWithBackend(subscription) {
  if (!subscription) return false;
  try {
    const deviceId = localStorage.getItem('wtp_device_id') || '';
    const visitorId = localStorage.getItem('wtp_vid') || '';

    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        device_id: deviceId,
        visitor_id: visitorId
      })
    });

    if (res.ok) {
      localStorage.setItem('wtp_push_subscribed', '1');
      console.log('[Push] Subscription synced successfully with backend.');
      return true;
    }
  } catch (err) {
    console.warn('[Push] Failed to sync subscription with backend:', err);
  }
  return false;
}

/**
 * Explicit user opt-in: requests browser permission and subscribes to push notifications
 * Returns { success: boolean, permission: string, error?: string }
 */
export async function subscribeUserToPush() {
  if (!isPushSupported()) {
    return { success: false, permission: 'unsupported', error: 'Notifications not supported on this browser.' };
  }

  try {
    // 1. Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, permission, error: 'Notification permission not granted.' };
    }

    // 2. Ensure Service Worker is registered
    const reg = await registerServiceWorker();
    if (!reg) {
      return { success: false, permission, error: 'Failed to initialize service worker.' };
    }

    // 3. Subscribe or retrieve existing subscription
    const vapidKey = await getVapidPublicKey();
    let subscription = await reg.pushManager.getSubscription();

    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });
    }

    // 4. Send subscription to backend
    const synced = await syncSubscriptionWithBackend(subscription);

    return { success: synced, permission: 'granted' };
  } catch (err) {
    console.error('[Push] subscribeUserToPush error:', err);
    return { success: false, permission: Notification.permission || 'error', error: err.message };
  }
}

/**
 * Automatically initialize push notifications on page load
 * If already granted, silently verifies & updates backend subscription.
 */
export async function initPushNotifications() {
  if (!isPushSupported()) return;

  try {
    const reg = await registerServiceWorker();
    if (!reg) return;

    // Check existing subscription
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) {
      // Re-sync with backend to ensure device_id & visit activity are up-to-date
      await syncSubscriptionWithBackend(subscription);
    } else if (Notification.permission === 'granted') {
      // Permission was already granted previously, subscribe now
      const vapidKey = await getVapidPublicKey();
      const newSub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });
      await syncSubscriptionWithBackend(newSub);
    }
  } catch (err) {
    // Non-blocking
    console.warn('[Push] initPushNotifications error:', err);
  }
}

/**
 * Unsubscribe current device from push notifications
 */
export async function unsubscribePush() {
  if (!isPushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();

      const deviceId = localStorage.getItem('wtp_device_id') || '';
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          endpoint: subscription.endpoint
        })
      });

      localStorage.removeItem('wtp_push_subscribed');
      console.log('[Push] Successfully unsubscribed.');
      return true;
    }
  } catch (err) {
    console.warn('[Push] unsubscribePush error:', err);
  }
  return false;
}

/**
 * Register admin device to receive real-time push notifications whenever a new lead arrives
 */
export async function subscribeAdminToPush(token, forceReset = false) {
  if (!isPushSupported()) {
    return { success: false, permission: 'unsupported', error: 'Notifications not supported on this device/browser.' };
  }

  try {
    const adminToken = token || localStorage.getItem('adminToken');
    if (!adminToken) {
      return { success: false, error: 'Admin session token not found.' };
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, permission, error: 'Notification permission not granted.' };
    }

    const reg = await registerServiceWorker();
    if (!reg) {
      return { success: false, permission, error: 'Service worker registration failed.' };
    }

    const vapidKey = await getVapidPublicKey();
    let subscription = await reg.pushManager.getSubscription();
    
    // If forceReset is requested, unsubscribe from stale subscription first
    if (subscription && forceReset) {
      try {
        await subscription.unsubscribe();
        subscription = null;
      } catch (unsubErr) {
        console.warn('[Admin Push] Existing subscription cleanup:', unsubErr);
      }
    }

    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });
    }

    const deviceId = localStorage.getItem('wtp_device_id') || 'admin-' + Math.random().toString(36).substring(2, 9);
    const visitorId = localStorage.getItem('wtp_vid') || '';

    const res = await fetch('/api/admin/push/subscribe-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        device_id: deviceId,
        visitor_id: visitorId
      })
    });

    if (res.ok) {
      localStorage.setItem('wtp_admin_push_subscribed', '1');
      console.log('[Admin Push] Device successfully registered for instant lead alerts.');
      return { success: true, permission: 'granted' };
    } else {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.error || 'Failed to register admin device with server.' };
    }
  } catch (err) {
    console.error('[Admin Push] subscribeAdminToPush error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Reset all admin devices on server and re-subscribe current device fresh
 */
export async function resetAndSubscribeAdminPush(token) {
  try {
    const adminToken = token || localStorage.getItem('adminToken');
    if (adminToken) {
      await fetch('/api/admin/push/reset-admin-devices', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
    }
    localStorage.removeItem('wtp_admin_push_subscribed');
    const result = await subscribeAdminToPush(token, true);
    return result;
  } catch (err) {
    console.error('[Admin Push] resetAndSubscribeAdminPush error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Unsubscribe admin device from lead alerts
 */
export async function unsubscribeAdminPush(token) {
  try {
    const adminToken = token || localStorage.getItem('adminToken');
    const deviceId = localStorage.getItem('wtp_device_id') || '';

    if (adminToken) {
      await fetch('/api/admin/push/unsubscribe-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ device_id: deviceId })
      });
    }

    localStorage.removeItem('wtp_admin_push_subscribed');
    return { success: true };
  } catch (err) {
    console.warn('[Admin Push] unsubscribeAdminPush error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Check if admin device has push notifications active
 */
export function isAdminPushSubscribed() {
  if (!isPushSupported()) return false;
  return Notification.permission === 'granted' && localStorage.getItem('wtp_admin_push_subscribed') === '1';
}

/**
 * Play a pleasant 3-tone notification chime using Web Audio API
 * (Zero external audio asset dependency, works across all browsers)
 */
export function playAlertChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Tone 1: E5 (659Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Tone 2: B5 (987Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.1);
    gain2.gain.setValueAtTime(0.3, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.55);

    // Tone 3: E6 (1318Hz)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(1318.51, now + 0.22);
    gain3.gain.setValueAtTime(0.35, now + 0.22);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.22);
    osc3.stop(now + 0.8);
  } catch (e) {
    // Non-blocking
  }
}


