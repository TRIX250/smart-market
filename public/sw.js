
const CACHE_NAME = 'smartmarket-v2';
const URLS_TO_CACHE = [
    '/',
    '/pos',
    '/inventory',
    '/manifest.json',
    '/globals.css'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(URLS_TO_CACHE))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// --- NOTIFICATION SUPPORT ---

self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'New Notification', body: 'You have a new alert.' };

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [200, 100, 200]
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});

// --- FETCH STRATEGY ---

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    if (event.request.destination === 'image' ||
        event.request.destination === 'style' ||
        event.request.destination === 'script') {
        event.respondWith(
            caches.match(event.request)
                .then((response) => response || fetch(event.request))
        );
        return;
    }

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match('/'))
        );
        return;
    }
});
