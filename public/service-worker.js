/* Simple SW: cache static assets and API responses (stale-while-revalidate) */
const STATIC_CACHE = "static-v1";
const RUNTIME_CACHE = "runtime-v1";
const STATIC_ASSETS = [
    "/",
    "/index.html"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
                    .map((k) => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

const API_HOSTS = [
    "api.open-meteo.com",
    "geocoding-api.open-meteo.com"
];

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Only GET
    if (request.method !== "GET") return;

    // Stale-while-revalidate for API + same-origin
    if (url.origin === location.origin || API_HOSTS.includes(url.host)) {
        event.respondWith(
            caches.match(request).then((cached) => {
                const fetchPromise = fetch(request)
                    .then((response) => {
                        const copy = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
                        return response;
                    })
                    .catch(() => cached);
                return cached || fetchPromise;
            })
        );
    }
});

// Receive alert messages and show notification
self.addEventListener("message", async (event) => {
    const { type, payload } = event.data || {};
    if (type === "SHOW_ALERT_NOTIFICATION" && payload?.title) {
        const permission = await self.registration.showNotification(payload.title, {
            body: payload.body || "",
            tag: payload.tag || "weather-alert",
            icon: payload.icon || undefined,
            data: payload.data || {}
        });
    }
});
