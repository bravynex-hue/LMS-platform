import React, { useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { registerServiceWorker } from "../registration";

/**
 * PWA Update Notification System
 * -----------------------------
 * Detects when a new service worker version is waiting and 
 * prompts the user with an "Update Now" action.
 */
const UpdatePrompt = () => {
  const { toast } = useToast();

  const showUpdateToast = useCallback(
    (registration) => {
      toast({
        title: "New Update Available!",
        description: "A newer version of Bravynex is ready. Refresh to update.",
        duration: Infinity, // Keep visible until user acts
        action: (
          <Button
            size="sm"
            className="flex items-center gap-2 font-bold uppercase text-[10px] h-8 tracking-widest"
            variant="secondary"
            onClick={() => {
              // 1. Force update activation
              if (registration.waiting) {
                sessionStorage.setItem("pwa_updated", "true");
                registration.waiting.postMessage({ type: "SKIP_WAITING" });
              }
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Update Now
          </Button>
        ),
      });
    },
    [toast]
  );

  useEffect(() => {
    // 1. Success Notification after successful reload
    const isUpdating = sessionStorage.getItem("pwa_updated");
    if (isUpdating) {
      toast({
        title: "App Updated Successfully 🎉",
        description: "Bravynex is now running the latest version.",
        duration: 5000,
      });
      sessionStorage.removeItem("pwa_updated");
    }

    // 2. Initial Registration
    registerServiceWorker({
      onUpdate: (registration) => {
        showUpdateToast(registration);
      },
      onSuccess: () => {
        toast({
          title: "Offline Ready",
          description: "This app is now available for offline use.",
          duration: 3000,
        });
      },
    });

    const updateHandler = async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        showUpdateToast(registration);
      }
    };

    const interval = setInterval(updateHandler, 1000 * 60 * 30); // Check more frequently (30m)
    updateHandler();

    return () => clearInterval(interval);
  }, [toast, showUpdateToast]);

  return null; // Component provides logic & toast notifications only.
};

export default UpdatePrompt;
