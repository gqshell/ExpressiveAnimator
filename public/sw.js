const CACHE_NAME = 'expressive-animator-20210617-1';
const CACHE_ALLOW = [CACHE_NAME];

const urlsToCache = [
    '/',
    '/index.html',
    '/favicon.png',
    '/build/bundle.css',
    '/build/bundle.js',
    '/skia/skia.js',
    '/skia/skia.wasm',
    '/engine/canvas-engine.js',
    '/engine/font.ttf.woff2',
    '/icons/icon-48.png',
    '/icons/icon-57.png',
    '/icons/icon-60.png',
    '/icons/icon-72.png',
    '/icons/icon-76.png',
    '/icons/icon-96.png',
    '/icons/icon-114.png',
    '/icons/icon-120.png',
    '/icons/icon-144.png',
    '/icons/icon-152.png',
    '/icons/icon-180.png',
    '/icons/icon-192.png',
    '/icons/icon-256.png',
    '/icons/icon-384.png',
    '/icons/icon-512.png',
];

self.addEventListener('install', function(event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - return response
                if (response) {
                    // console.log('cache hit');
                    return response;
                }

                return fetch(event.request).then(
                    function(response) {
                        // Check if we received a valid response
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (CACHE_ALLOW.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
