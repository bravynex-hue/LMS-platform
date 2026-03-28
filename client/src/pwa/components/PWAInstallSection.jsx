import React from "react";
import { usePWA } from "../hooks";
import { 
  Download, 
  Smartphone, 
  Laptop, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  ShieldCheck,
  ZapIcon,
  PhoneCallIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * PWAInstallSection
 * -----------------
 * A premium static section for the home page to promote app installation.
 * Uses the same usePWA hook for consistent state.
 */
const PWAInstallSection = () => {
  const { isStandalone, isInstalled, canInstall, install, isIOS, isAndroid } = usePWA();

  // If already installed or in standalone mode, show a "Thank You" or features list instead
  // Or just hide it for a cleaner UI once installed.
  if (isStandalone || isInstalled) return null;

  return (
    <section className="py-24 px-6 sm:px-8 relative overflow-hidden" id="pwa-install">
      <div className="absolute inset-0 bg-blue-600/5 -z-10" />
      <div className="orb orb-blue absolute w-[400px] h-[400px] -right-20 -top-20 opacity-[0.05] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto">
        <div className="rounded-[2.5rem] border border-blue-500/10 bg-gradient-to-br from-blue-900/40 to-slate-900/40 backdrop-blur-3xl overflow-hidden p-8 sm:p-16 relative">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
            <Smartphone size={300} />
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Column: Visuals */}
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full" />
                <div className="relative flex flex-col gap-4">
                  <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-2xl skew-x-1 hover:skew-x-0 transition-transform duration-500">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Zap className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Instant Access</p>
                        <p className="text-xs text-slate-400">Launch directly from your home screen</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 shadow-2xl ml-8 -skew-x-1 hover:skew-x-0 transition-transform duration-500">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <ShieldCheck className="text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Secure Offline Learning</p>
                        <p className="text-xs text-slate-400">Cached lessons for uninterrupted flow</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Content & Actions */}
            <div className="order-1 lg:order-2 space-y-8">
              <div>
                <span className="section-badge mb-6 inline-flex">
                  <Download className="w-3 h-3" />
                  App Experience
                </span>
                <h2 className="text-4xl sm:text-6xl font-black text-white leading-tight">
                  Learning on the <br /> 
                  <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">go. Guaranteed.</span>
                </h2>
                <p className="text-lg text-slate-400 mt-6 max-w-lg">
                  Install the Bravynex PWA for a faster, immersive experience. Access your courses anywhere, even with poor connectivity.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "No App Store needed",
                  "Consumes 90% less data",
                  "Fast biometrics login",
                  "Real-time notifications"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-medium text-slate-200">{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                {canInstall ? (
                  <Button 
                    onClick={install}
                    className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-[0_15px_30px_rgba(37,99,235,0.3)] transition-all transform hover:-translate-y-1"
                  >
                    <Download className="mr-3 h-6 w-6" />
                    Install Now
                  </Button>
                ) : isIOS ? (
                  <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
                    <p className="text-sm font-bold text-blue-400 flex items-center gap-2">
                       <Smartphone className="h-4 h-4" /> Tap Share and "Add to Home Screen"
                    </p>
                  </div>
                ) : (
                  <Button 
                    variant="outline"
                    className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 text-white font-bold opacity-50 cursor-not-allowed"
                    disabled
                  >
                    Standalone Ready
                  </Button>
                )}
                <div className="flex flex-col justify-center">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">Compatible with</p>
                   <p className="text-xs text-slate-600 mt-1">iOS, Android, Windows & macOS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PWAInstallSection;
