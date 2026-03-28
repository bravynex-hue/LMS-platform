import React, { useState, useEffect } from "react";
import { usePWAInstall } from "@/pwa/usePWAInstall";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Laptop, Smartphone, Download, PlusSquare, ArrowUpFromLine } from "lucide-react";

/**
 * 1. Platform Detection (Dynamic UI) (Requirement 1)
 * 2. PWA Install Handling (Requirement 2)
 * 5. Install UX Improvements (Requirement 5)
 * 
 * Shows appropriate install instructions based on platform.
 */
const InstallPrompt = () => {
  const { isIOS, isAndroid, isDesktop, isStandalone, isInstalled, canInstall, install } = usePWAInstall();
  const { toast } = useToast();
  const [showPrompt, setShowPrompt] = useState(false);

  // 5. Success toast after install (Requirement 5)
  useEffect(() => {
    if (isInstalled) {
      toast({
        title: "App installed successfully!",
        description: "Bravynex LMS is now on your home screen.",
        duration: 10000,
        action: (
          <Button size="sm" variant="outline" onClick={() => window.location.href = "/home"}>
            Open App
          </Button>
        ),
      });
      setShowPrompt(false);
    }
  }, [isInstalled, toast, setShowPrompt]);

  // Initial prompt display logic
  useEffect(() => {
    if (!isStandalone) {
      // In a real app, you might want to wait a few seconds or show it after a user action.
      // But for this request, we'll show it when the prompt is available or for iOS.
      if (canInstall || isIOS) {
        const timer = setTimeout(() => setShowPrompt(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [canInstall, isIOS, isStandalone, setShowPrompt]);

  if (!showPrompt || isStandalone) return null;

  const handleInstallClick = async () => {
    const outcome = await install();
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
  };

  /**
   * 1. iOS UI (Specific instructions) (Requirement 1)
   */
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[9999] max-w-md mx-auto animate-in fade-in slide-in-from-bottom-5">
        <Card className="shadow-2xl border-primary/20 bg-background/95 backdrop-blur-md">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Phone className="h-5 w-5" />
              <CardTitle className="text-sm font-semibold uppercase tracking-wider">Install on iPhone / iPad</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription className="text-foreground font-medium">1. Tap the Share button <ArrowUpFromLine className="inline h-4 w-4 mx-1" /></CardDescription>
            <CardDescription className="text-foreground font-medium">2. Scroll down and tap "Add to Home Screen" <PlusSquare className="inline h-4 w-4 mx-1" /></CardDescription>
          </CardContent>
          <CardFooter className="flex justify-between gap-3 border-t pt-3">
            <Button variant="ghost" size="sm" onClick={() => setShowPrompt(false)}>Later</Button>
            <Button variant="default" size="sm" onClick={() => setShowPrompt(false)}>Got it!</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  /**
   * 1. Android/Desktop UI (Install button wrapper) (Requirement 1)
   */
  if (canInstall) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[9999] max-w-md mx-auto animate-in fade-in slide-in-from-bottom-5">
        <Card className="shadow-2xl border-primary/20 bg-background/95 backdrop-blur-md">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-primary">
              {isAndroid ? <Smartphone className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
              <CardTitle className="text-lg">Experience Bravynex LMS</CardTitle>
            </div>
            <CardDescription>Install the app for a faster, offline-ready experience.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowPrompt(false)}>Not now</Button>
            <Button size="sm" onClick={handleInstallClick} className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Install App
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return null;
};

export default InstallPrompt;
