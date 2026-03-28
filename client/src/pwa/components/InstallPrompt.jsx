import React, { useState, useEffect } from "react";
import { usePWA } from "../hooks";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Laptop, Smartphone, Download, PlusSquare, ArrowUpFromLine } from "lucide-react";

/**
 * PWA Install UI
 * --------------
 * Dynamic cards based on device type (iOS, Android, Desktop).
 * Triggers success feedback and "Open App" action.
 */
const InstallPrompt = () => {
  const { isIOS, isAndroid, isDesktop, isStandalone, isInstalled, canInstall, install } = usePWA();
  const { toast } = useToast();
  const [showPrompt, setShowPrompt] = useState(false);

  // Success toast logic
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

  // Prompt logic
  useEffect(() => {
    // Only show if not already in standalone mode
    if (!isStandalone) {
      // Trigger prompt after a small delay for better UX
      if (canInstall || isIOS) {
        const timer = setTimeout(() => setShowPrompt(true), 2000);
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
   * 1. iOS Instructions (Manual)
   */
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[9999] max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-5">
        <Card className="shadow-2xl border-primary/20 bg-background/95 backdrop-blur-md">
          <CardHeader className="pb-2 text-center">
            <div className="flex items-center justify-center gap-2 text-primary mb-1">
              <Phone className="h-5 w-5" />
              <CardTitle className="text-xs font-bold uppercase tracking-widest">Install on iPhone / iPad</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pt-2">
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
              <p className="text-sm font-medium">Tap the Share button <ArrowUpFromLine className="inline h-4 w-4 mx-1 text-primary" /></p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
              <p className="text-sm font-medium">Tap "Add to Home Screen" <PlusSquare className="inline h-4 w-4 mx-1 text-primary" /></p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between gap-3 border-t pt-4 px-6">
            <Button variant="ghost" size="sm" className="text-xs uppercase" onClick={() => setShowPrompt(false)}>Later</Button>
            <Button variant="default" size="sm" className="text-xs uppercase" onClick={() => setShowPrompt(false)}>Got it!</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  /**
   * 2. Android/Desktop (One-click Install)
   */
  if (canInstall) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-[9999] max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-5">
        <Card className="shadow-2xl border-primary/20 bg-background/95 backdrop-blur-md overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3 text-primary">
              <div className="bg-primary/10 p-2 rounded-lg">
                {isAndroid ? <Smartphone className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
              </div>
              <div>
                <CardTitle className="text-sm font-bold uppercase tracking-tight">Experience Bravynex LMS</CardTitle>
                <CardDescription className="text-[10px] uppercase font-semibold text-muted-foreground/60 leading-tight">Fast, offline learning ready.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardFooter className="flex justify-end gap-3 pt-2 bg-primary/5 px-6">
            <Button variant="ghost" size="xs" className="text-[10px] uppercase font-bold" onClick={() => setShowPrompt(false)}>Not now</Button>
            <Button size="sm" onClick={handleInstallClick} className="flex items-center gap-2 h-8 text-[11px] font-bold uppercase tracking-wide">
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
