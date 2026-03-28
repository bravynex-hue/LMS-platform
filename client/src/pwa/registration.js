/**
 * Service Worker Registration & Lifecycle Management
 * Optimized for React + Vite PWA strategies.
 */

export function registerServiceWorker(config) {
  if (import.meta.env.PROD || import.meta.env.DEV) {
    if ("serviceWorker" in navigator) {
      const isProd = import.meta.env.PROD;
      const swUrl = isProd ? "/service-worker.js" : "/dev-sw.js?dev-sw";
      const swType = isProd ? "classic" : "module";

      window.addEventListener("load", () => {
        handleServiceWorker(swUrl, config, swType);
      });
    }
  }
}

function handleServiceWorker(swUrl, config, swType) {
  navigator.serviceWorker
    .register(swUrl, { type: swType })
    .then((registration) => {
      // 1. Initial/periodic check for waiting worker if user refreshes
      if (registration.waiting && config?.onUpdate) {
        config.onUpdate(registration);
      }

      // 2. Lifecycle listeners
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // Version changed: Content available but not yet active
              console.log("PWA: New version detected; waiting for user action.");
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Initial caching
              console.log("PWA: Initial offline caching complete.");
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error("PWA: Registration error:", error);
    });
}

/**
 * 3. Atomic Activation Lifecycle
 * ----------------------------
 * Ensures the app reloads seamlessly when the new worker takes control.
 */
let refreshing = false;
navigator.serviceWorker.addEventListener("controllerchange", () => {
  if (refreshing) return;
  refreshing = true;
  window.location.reload();
});

export function unregisterServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => console.error(error.message));
  }
}
