// Walk The Plan — Progressive Web App (PWA) & Push Notification Service Worker
// Supports installable web app criteria, offline fallback, and real-time push alerts

const CACHE_NAME = 'wtp-pwa-v1.0';
const SITE_URL = self.location.origin;

const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/favicon.png',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Service Worker Install: precache offline assets & take control immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PWA SW] Precache non-critical item failed:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Service Worker Activate: clean up older cache versions & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[PWA SW] Removing outdated cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => clients.claim())
  );
});

// Fetch event listener: Required by Chromium for PWA Installability
// Uses resilient Network-First strategy to ensure fresh content with offline fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests; pass mutations (POST, PUT, DELETE) directly to network
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Let API calls and file uploads pass through directly
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/uploads')) {
    return;
  }

  // Navigation requests (HTML pages)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cachedRes = await caches.match(req);
          if (cachedRes) return cachedRes;
          const offlinePage = await caches.match('/offline.html');
          return offlinePage || new Response('Offline', { status: 503, statusText: 'Offline' });
        })
    );
    return;
  }

  // Static assets (CSS, JS, Fonts, Images)
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      const fetchPromise = fetch(req).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return networkRes;
      }).catch(() => null);

      return cachedRes || fetchPromise;
    })
  );
});

// --- PUSH NOTIFICATIONS ---

// Listen for push events from the server
self.addEventListener('push', (event) => {
  let data = {
    title: 'Walk The Plan Studio',
    body: 'Book your 1:1 scale blueprint projection session today! Walk through your future home before construction begins.',
    icon: '/favicon.png',
    badge: '/favicon.png',
    url: '/',
    tag: 'wtp-reminder'
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = { ...data, ...payload };
    }
  } catch (e) {
    // Use defaults
  }

  const isLeadAlert = (data.tag && data.tag.startsWith('new-lead-')) || (data.url && (data.url.includes('/fitscalez') || data.url.includes('/admin')));

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.png',
    badge: data.badge || '/favicon.png',
    tag: data.tag || (isLeadAlert ? 'admin-lead-alert' : 'wtp-reminder'),
    renotify: true,
    requireInteraction: true,
    vibrate: isLeadAlert ? [300, 100, 300, 100, 300] : [200, 100, 200, 100, 200],
    data: {
      url: data.url || (isLeadAlert ? '/fitscalez' : '/'),
      dateOfArrival: Date.now()
    },
    actions: isLeadAlert ? [
      {
        action: 'open-admin',
        title: '📋 Open Admin Panel'
      }
    ] : [
      {
        action: 'book-now',
        title: '📅 Book Appointment'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  let targetUrl = SITE_URL + '/fitscalez';

  if (event.action === 'open-admin') {
    targetUrl = SITE_URL + '/fitscalez';
  } else if (event.action === 'book-now') {
    targetUrl = SITE_URL + '/contact';
  } else if (event.notification.data && event.notification.data.url) {
    const rawUrl = event.notification.data.url;
    targetUrl = rawUrl.startsWith('http') ? rawUrl : (SITE_URL + (rawUrl.startsWith('/') ? '' : '/') + rawUrl);
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  // Notification closed
});
