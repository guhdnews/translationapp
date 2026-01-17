// Service Worker for Translate Voice Notes PWA
const CACHE_NAME = 'translate-voice-notes-v1';
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    // Activate immediately
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    // Take control of all clients
    self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and API calls
    if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone the response before caching
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // Fallback to cache
                return caches.match(event.request);
            })
    );
});

// Handle share target POST requests
self.addEventListener('fetch', (event) => {
    if (event.request.method === 'POST' && event.request.url.includes('/share-target')) {
        event.respondWith(
            (async () => {
                const formData = await event.request.formData();
                const audioFile = formData.get('audio');

                // Store the shared file in a temporary location
                const clients = await self.clients.matchAll({ type: 'window' });

                if (clients.length > 0) {
                    // If there's an existing client, send the file to it
                    clients[0].postMessage({
                        type: 'SHARED_FILE',
                        file: audioFile,
                    });
                    clients[0].focus();
                } else {
                    // Store the file temporarily and redirect
                    // The share-target page will handle it
                    const cache = await caches.open('shared-files');
                    await cache.put('shared-audio', new Response(audioFile));
                }

                return Response.redirect('/share-target?shared=true', 303);
            })()
        );
    }
});
