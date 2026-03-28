import { useCallback, useEffect, useState, useMemo } from "react";

/**
 * PWA Management Hook
 * -------------------
 * Detects device platform (iOS, Android, Desktop) and handles 
 * the installation prompt (including early capture logic).
 */

function getPlatform() {
  const ua = (typeof window !== "undefined" && window.navigator.userAgent) || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isDesktop = !isIOS && !isAndroid;
  
  return { isIOS, isAndroid, isDesktop };
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(isInStandaloneMode());
  const [isInstalled, setIsInstalled] = useState(false);
  const platform = useMemo(() => getPlatform(), []);

  useEffect(() => {
    // 1. Initial check: Capture from window if index.html already caught it
    if (window.deferredPWAPrompt) {
      setDeferredPrompt(window.deferredPWAPrompt);
      console.log("PWA: Found captured install prompt from window.deferredPWAPrompt");
    }

    // 2. Fallback: Listen for beforeinstallprompt if it fires later
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPWAPrompt = e; // Optional: Sync back
      console.log("PWA: Install prompt available");
    };

    // 3. Post-install logic
    const onAppInstalled = () => {
      setDeferredPrompt(null);
      window.deferredPWAPrompt = null;
      setIsStandalone(true);
      setIsInstalled(true);
      console.log("PWA: App installed successfully");
    };

    // Event listeners
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);

    // Watch for display mode changes (e.g. user opens as standalone midway)
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
   * Action: Trigger the native installation prompt
   */
  const install = useCallback(async () => {
    const prompt = deferredPrompt || window.deferredPWAPrompt;
    if (!prompt) {
      console.warn("PWA: No install prompt available");
      return null;
    }

    try {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      console.log(`PWA: User choice outcome: ${outcome}`);
      
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        window.deferredPWAPrompt = null;
      }
      return outcome;
    } catch (err) {
      console.error("PWA: Error during prompt process:", err);
      return null;
    }
  }, [deferredPrompt]);

  return {
    ...platform,
    isStandalone,
    isInstalled,
    canInstall: (Boolean(deferredPrompt) || Boolean(window.deferredPWAPrompt)) && !isStandalone,
    install,
  };
}
