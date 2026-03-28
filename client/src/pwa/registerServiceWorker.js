/**
 * Service Worker Registration Logic
 * Handles registration, update detection, and offline caching success.
 * Follows Requirement 6: structured registerServiceWorker.js
 */

export function register(config) {
  if (import.meta.env.PROD || import.meta.env.DEV) {
    if ("serviceWorker" in navigator) {
      const isProd = import.meta.env.PROD;
      const swUrl = isProd ? "/service-worker.js" : "/dev-sw.js?dev-sw";
      const swType = isProd ? "classic" : "module";

      window.addEventListener("load", () => {
        registerValidSW(swUrl, config, swType);
      });
    }
  }
}

function registerValidSW(swUrl, config, swType) {
  navigator.serviceWorker
    .register(swUrl, { type: swType })
    .then((registration) => {
      // Check for updates periodically
      // registration.update();

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // 4. Update notification system (Requirement 4)
              // This is where we detect a new version is available but not active.
              console.log("New content is available; please refresh.");
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Offline success (Requirement 7)
              console.log("Content is cached for offline use.");
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error("Error during service worker registration:", error);
    });
}

/**
 * 5. Auto reload (Requirement 5)
 * Listen for service worker controller change to reload the page.
 * This ensures the new service worker takes control smoothly.
 */
let refreshing = false;
navigator.serviceWorker.addEventListener("controllerchange", () => {
  if (refreshing) return;
  refreshing = true;
  window.location.reload();
});

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
