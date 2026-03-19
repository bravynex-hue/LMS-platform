import { useCallback, useEffect, useMemo, useState } from "react";

function isIOSDevice() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isIPadOS =
    /Macintosh/.test(ua) &&
    typeof navigator !== "undefined" &&
    navigator.maxTouchPoints &&
    navigator.maxTouchPoints > 1;
  return isIOS || isIPadOS;
}

function isInStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true
  );
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(window.deferredPWAPrompt || null);
  const [isStandalone, setIsStandalone] = useState(isInStandaloneMode());
  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);

  const isIOS = useMemo(() => isIOSDevice(), []);

  useEffect(() => {
    // Give the browser 2 seconds to fire the initial event before we stop "waiting"
    const timer = setTimeout(() => setIsInitialCheckDone(true), 2000);

    const syncState = () => {
      if (window.deferredPWAPrompt && deferredPrompt !== window.deferredPWAPrompt) {
        setDeferredPrompt(window.deferredPWAPrompt);
        setIsInitialCheckDone(true);
      }
    };
    
    syncState();

    const onPromptReady = () => {
      syncState();
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      window.deferredPWAPrompt = null;
      setIsStandalone(true);
    };

    window.addEventListener("pwa-prompt-ready", onPromptReady);
    window.addEventListener("appinstalled", onAppInstalled);

    const onBeforeInstall = (e) => {
      e.preventDefault();
      window.deferredPWAPrompt = e;
      setDeferredPrompt(e);
      setIsInitialCheckDone(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const mm = window.matchMedia?.("(display-mode: standalone)");
    const onDisplayModeChange = () => setIsStandalone(isInStandaloneMode());
    mm?.addEventListener?.("change", onDisplayModeChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pwa-prompt-ready", onPromptReady);
      window.removeEventListener("appinstalled", onAppInstalled);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      mm?.removeEventListener?.("change", onDisplayModeChange);
    };
  }, [deferredPrompt]);

  const canPromptInstall = (Boolean(deferredPrompt) || Boolean(window.deferredPWAPrompt)) && !isStandalone;

  const promptInstall = useCallback(async () => {
    const promptEvent = deferredPrompt || window.deferredPWAPrompt;
    if (!promptEvent) return { outcome: "dismissed" };
    
    try {
      promptEvent.prompt();
      const res = await promptEvent.userChoice;
      setDeferredPrompt(null);
      window.deferredPWAPrompt = null;
      return res;
    } catch (err) {
      console.error("PWA install prompt error:", err);
      return { outcome: "error" };
    }
  }, [deferredPrompt]);

  return {
    isIOS,
    isStandalone,
    canPromptInstall,
    promptInstall,
    isPreparing: !isInitialCheckDone && !canPromptInstall && !isStandalone
  };
}

