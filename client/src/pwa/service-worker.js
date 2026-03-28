import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute, setCatchHandler } from "workbox-routing";
import { NetworkFirst, CacheFirst, NetworkOnly } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { setCacheNameDetails, clientsClaim } from "workbox-core";

/**
 * PWA Service Worker (v2.1.0)
 * Optimized for LMS performance and data security.
 */

// 1. Precise Versioning and Cache Names
const CACHE_VERSION = "v2.1.0";
setCacheNameDetails({
  prefix: "bravynex",
  suffix: CACHE_VERSION,
  precache: "precache",
  runtime: "runtime",
});

// 2. Activation Logic
clientsClaim();
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// 3. Clean environment
cleanupOutdatedCaches();

// 4. Precaching (Vite build assets)
precacheAndRoute(self.__WB_MANIFEST || []);

/**
 * 5. Caching Strategy
 * -------------------
 * - EXCLUDED: API, auth, user data, dashboard (Requirement 4)
 * - NAVIGATION: Network-first with HTML fallback
 * - ASSETS: Cache-first for performance
 */

// Never cache dynamic API or sensitive data
registerRoute(
  ({ url }) =>
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("/auth/") ||
    url.pathname.includes("/dashboard/") ||
    url.pathname.includes("/user/"),
  new NetworkOnly()
);

// Network-first for navigations
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "html-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24, // 24h
      }),
    ],
  })
);

// Cache-first for core assets
registerRoute(
  ({ request }) =>
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "worker",
  new CacheFirst({
    cacheName: "assets-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30d
      }),
    ],
  })
);

// Optimized cache for static media
registerRoute(
  ({ request }) => request.destination === "image" || request.destination === "font",
  new CacheFirst({
    cacheName: "static-media-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 90, // 90d
      }),
    ],
  })
);

// Offline fallback
setCatchHandler(async ({ event }) => {
  if (event.request?.mode === "navigate") {
    return caches.match("/index.html");
  }
  return Response.error();
});
