import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute, setCatchHandler } from "workbox-routing";
import { NetworkFirst, CacheFirst, NetworkOnly } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { setCacheNameDetails, clientsClaim } from "workbox-core";

/**
 * PWA Service Worker (v2.1.0)
 * Optimized for LMS performance and data security.
 */

// 1. Precise Versioning for Cache Busting (Requirement 3)
const CACHE_VERSION = "lms-app-v2.2.0"; 
setCacheNameDetails({
  prefix: "bravynex",
  suffix: CACHE_VERSION,
  precache: "precache",
  runtime: "runtime",
});

// 2. Immediate Activation (Requirement 2)
self.skipWaiting();
clientsClaim();

// 3. Update Handler (Requirement 1 & 6)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// 4. Clean old caches automatically (Requirement 3)
cleanupOutdatedCaches();

// 5. Precaching (Vite build assets)
precacheAndRoute(self.__WB_MANIFEST || []);

/**
 * 6. Smart Caching Strategy (Requirement 4 & 5)
 * -------------------------------------------
 * - NEVER cache API, course content, or secure data.
 * - ALWAYS fetch fresh data from the backend.
 */

// Route: API and Course Data (Network Only)
registerRoute(
  ({ url }) => 
    url.pathname.includes("/api/") || 
    url.pathname.includes("/student/") || 
    url.pathname.includes("/instructor/") ||
    url.pathname.includes("/auth/"),
  new NetworkOnly() // Ensures fresh data (Requirement 5)
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
