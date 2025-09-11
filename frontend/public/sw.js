const CACHE_NAME = 'attendance-system-v1';
const API_CACHE_NAME = 'api-cache-v1';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful GET requests for 5 minutes
          if (request.method === 'GET' && response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
              // Expire after 5 minutes
              setTimeout(() => {
                cache.delete(request);
              }, 5 * 60 * 1000);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached response if available
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(request);
      })
  );
});

// Background sync for offline attendance marking
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-attendance') {
    event.waitUntil(syncAttendance());
  }
});

async function syncAttendance() {
  try {
    const offlineAttendance = await getOfflineAttendance();
    
    for (const attendance of offlineAttendance) {
      try {
        const response = await fetch('/api/attendance/qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${attendance.token}`
          },
          body: JSON.stringify(attendance.data)
        });

        if (response.ok) {
          await removeOfflineAttendance(attendance.id);
          console.log('Synced offline attendance:', attendance.id);
        }
      } catch (error) {
        console.error('Failed to sync attendance:', error);
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

async function getOfflineAttendance() {
  // Implementation would read from IndexedDB
  return [];
}

async function removeOfflineAttendance(id) {
  // Implementation would remove from IndexedDB
  console.log('Removed offline attendance:', id);
}

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'mark-attendance') {
    event.waitUntil(
      clients.openWindow('/mark-attendance')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});