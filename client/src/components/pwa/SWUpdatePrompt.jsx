import React, { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import * as serviceWorkerRegistration from "@/pwa/registerServiceWorker";

/**
 * Requirement 4 & 6: Update Notification System
 * Detects when a new service worker version is waiting and prompts the user.
 */
const SWUpdatePrompt = () => {
  const { toast } = useToast();

  useEffect(() => {
    // 5. Registration (Requirement 6)
    serviceWorkerRegistration.register({
      onUpdate: (registration) => {
        // This callback is triggered when a new SW version is waiting
        showUpdateToast(registration);
      },
      onSuccess: () => {
        // Optional: Notify user that app is offline-ready on first load
        toast({
          title: "Offline Ready",
          description: "This app is now available for offline use.",
          duration: 3000,
        });
      },
    });

    // Handle updates found by the browser itself
    const updateHandler = async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        showUpdateToast(registration);
      }
    };

    // Check for updates periodically
    const interval = setInterval(updateHandler, 1000 * 60 * 60); // Every hour
    updateHandler(); // Check on mount

    return () => clearInterval(interval);
  }, []);

  const showUpdateToast = (registration) => {
    toast({
      title: "New Update Available!",
      description: "A newer version of the app is ready. Refresh to update.",
      duration: Infinity, // Keep it visible until user acts
      action: (
        <Button
          size="sm"
          className="flex items-center gap-2"
          variant="secondary"
          onClick={() => {
            // 3. Force update behavior (Requirement 3)
            // Send the message to SW to skip waiting and activate immediately
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
  };

  return null; // This component registers logic/UI via Toasts, doesn't render its own DOM.
};

export default SWUpdatePrompt;
