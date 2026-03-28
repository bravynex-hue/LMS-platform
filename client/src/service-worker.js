import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { registerRoute, setCatchHandler } from "workbox-routing";
import { NetworkFirst, CacheFirst, NetworkOnly } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { setCacheNameDetails, clientsClaim } from "workbox-core";

/**
 * 4. Service Worker Caching Strategy (Requirement 4)
 * Critical for LMS: Avoid caching sensitive or dynamic data.
 */

// Versioning (Requirement 4)
const CACHE_VERSION = "v2.0.0";
setCacheNameDetails({
  prefix: "bravynex",
  suffix: CACHE_VERSION,
  precache: "precache",
  runtime: "runtime",
});

// Immediate activation (Requirement 3)
clientsClaim();
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Clean old caches (Requirement 4)
cleanupOutdatedCaches();

// Precaching (Vite build assets)
precacheAndRoute(self.__WB_MANIFEST || []);

/**
 * 4. DO NOT CACHE: API, authenticated data, dashboard (Requirement 4)
 */
registerRoute(
  ({ url }) =>
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("/auth/") ||
    url.pathname.includes("/dashboard/") ||
    url.pathname.includes("/user/"),
  new NetworkOnly()
);

// 4. Network-first for HTML (Requirement 4)
registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "html-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      }),
    ],
  })
);

// 4. Cache-first for static assets (Requirement 4)
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
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

registerRoute(
  ({ request }) => request.destination === "image" || request.destination === "font",
  new CacheFirst({
    cacheName: "static-media-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 90, // 90 days
      }),
    ],
  })
);

// Offline fallback for navigations
setCatchHandler(async ({ event }) => {
  if (event.request?.mode === "navigate") {
    return caches.match("/index.html");
  }
  return Response.error();
});
