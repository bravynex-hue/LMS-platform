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
    // 2. Initial Registration with logic callbacks
    registerServiceWorker({
      onUpdate: (registration) => {
        // Callback: New version waiting
        showUpdateToast(registration);
      },
      onSuccess: () => {
        // Callback: Initial offline-cache success
        toast({
          title: "Offline Ready",
          description: "This app is now available for offline use.",
          duration: 3000,
        });
      },
    });

    // 3. Periodic update check for persistent sessions
    const updateHandler = async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        showUpdateToast(registration);
      }
    };

    const interval = setInterval(updateHandler, 1000 * 60 * 60); // Check every hour
    updateHandler(); // Immediate check on mount

    return () => clearInterval(interval);
  }, [toast, showUpdateToast]);

  return null; // Component provides logic & toast notifications only.
};

export default UpdatePrompt;
