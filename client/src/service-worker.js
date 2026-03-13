import { cleanupOutdatedCaches, precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, setCatchHandler } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate, CacheFirst, NetworkOnly } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { Queue } from "workbox-background-sync";

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

// SPA navigation fallback (so previously-cached shell works offline)
let allowlist;
if (import.meta.env.DEV) {
  // In dev, only intercept the entry point to avoid breaking HMR/routes.
  allowlist = [/^\/$/];
}

registerRoute(
  ({ request, url }) =>
    request.mode === "navigate" &&
    url.origin === self.location.origin &&
    (!allowlist || allowlist.some((re) => re.test(url.pathname))),
  createHandlerBoundToURL("/index.html")
);

// JS/CSS: fast with background update
registerRoute(
  ({ request }) => request.destination === "script" || request.destination === "style" || request.destination === "worker",
  new StaleWhileRevalidate({ cacheName: "assets" })
);

// Images: cache-first with expiration
registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

// Documents: try network first, fall back to cache (good for basic pages)
registerRoute(
  ({ request }) => request.destination === "document",
  new NetworkFirst({
    cacheName: "pages",
    networkTimeoutSeconds: 4,
  })
);

// Background sync scaffold (replays queued requests when connectivity returns)
const bgSyncQueue = new Queue("bravynex-bg-sync", {
  maxRetentionTime: 24 * 60, // minutes
});

registerRoute(
  ({ url, request }) =>
    url.origin === self.location.origin &&
    request.method !== "GET" &&
    // Avoid queuing non-API resources; tune these prefixes to your API surface.
    ["/auth/", "/secure/", "/notify/", "/student/", "/instructor/"].some((p) => url.pathname.startsWith(p)),
  new NetworkOnly({
    plugins: [
      {
        fetchDidFail: async ({ request }) => {
          await bgSyncQueue.pushRequest({ request });
        },
      },
    ],
  }),
  "POST"
);

self.addEventListener("sync", (event) => {
  if (event.tag === "bravynex-sync") {
    event.waitUntil(bgSyncQueue.replayRequests());
  }
});

// Push-notification ready scaffold
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data?.json?.() || {};
  } catch {
    payload = { title: event.data?.text?.() || "Bravynex", body: "You have a new update." };
  }

  const title = payload.title || "Bravynex";
  const options = {
    body: payload.body || "You have a new update.",
    icon: "/icons/icon-192.svg",
    badge: "/icons/icon-192.svg",
    data: payload.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsArr) => {
      const existing = clientsArr.find((c) => "focus" in c);
      if (existing) {
        existing.focus();
        existing.navigate?.(targetUrl);
        return;
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});

// Offline fallback for failed navigations
setCatchHandler(async ({ event }) => {
  if (event.request?.mode === "navigate") {
    return caches.match("/index.html");
  }
  throw new Error("No fallback available");
});
