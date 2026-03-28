import { useCallback, useEffect, useState, useMemo } from "react";

/**
 * 1. Platform Detection (Requirement 1)
 * Detect device type for dynamic install UI.
 */
function getPlatform() {
  const ua = window.navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isDesktop = !isIOS && !isAndroid;
  
  return { isIOS, isAndroid, isDesktop };
}

function isInStandaloneMode() {
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );
}

/**
 * 2. PWA Install Handling (Requirement 2)
 */
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(isInStandaloneMode());
  const [isInstalled, setIsInstalled] = useState(false);
  const platform = useMemo(() => getPlatform(), []);

  useEffect(() => {
    // 2. beforeinstallprompt event (Requirement 2)
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log("PWA: Install prompt available");
    };

    // 2. appinstalled event (Requirement 2 & 5)
    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      setIsInstalled(true);
      console.log("PWA: App installed successfully");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);

    const mm = window.matchMedia("(display-mode: standalone)");
    const onDisplayModeChange = () => setIsStandalone(isInStandaloneMode());
    mm.addEventListener("change", onDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
      mm.removeEventListener("change", onDisplayModeChange);
    };
  }, []);

  /**
   * 2. Trigger install prompt (Requirement 2)
   */
  const install = useCallback(async () => {
    if (!deferredPrompt) {
      console.warn("PWA: No install prompt available");
      return null;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA: User choice outcome: ${outcome}`);
      
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
      return outcome;
    } catch (err) {
      console.error("PWA: Error during prompt:", err);
      return null;
    }
  }, [deferredPrompt]);

  return {
    ...platform,
    isStandalone,
    isInstalled,
    canInstall: Boolean(deferredPrompt) && !isStandalone,
    install,
  };
}
