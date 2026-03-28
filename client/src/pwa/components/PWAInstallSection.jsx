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
  const { isStandalone, isInstalled, canInstall, install, isIOS } = usePWA();

  if (isStandalone || isInstalled) return null;

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-8 relative overflow-hidden" id="pwa-install">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-[#020817] -z-20" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto">
        <div 
          className="relative rounded-[2rem] sm:rounded-[3rem] p-px overflow-hidden group"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(168,85,247,0.2) 100%)' }}
        >
          {/* Inner Content Container */}
          <div className="relative bg-[#0a1122]/95 backdrop-blur-3xl rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-20 overflow-hidden">
            
            {/* Grid Background */}
            <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
              
              {/* Right Column (Mobile First): Content */}
              <div className="order-1 lg:order-2 space-y-8 sm:space-y-10 text-center lg:text-left">
                <div className="flex flex-col items-center lg:items-start">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6 sm:mb-8">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-black text-blue-400">Superior App Experience</span>
                  </div>
                  
                  <h2 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white leading-tight lg:leading-[1.05] tracking-tight">
                    Study Without <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Boundaries.</span>
                  </h2>
                  
                  <p className="text-base sm:text-lg text-slate-400 mt-6 sm:mt-8 max-w-lg leading-relaxed mx-auto lg:mx-0">
                    Install the Bravynex PWA for a hyper-fast, immersive learning environment. No app stores, no updates to wait for—just one tap away.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:gap-6 justify-center">
                  {[
                    { icon: Laptop, text: "Multi-device Sync" },
                    { icon: CheckCircle2, text: "90% Less Data" },
                    { icon: Zap, text: "Ultra-low Latency" },
                    { icon: Download, text: "Zero Install Lag" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-center lg:justify-start gap-2 sm:gap-4 group/item">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-blue-500/10 flex items-center justify-center group-hover/item:bg-blue-500/20 transition-colors">
                        <item.icon className="w-3 h-3 text-blue-400" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-300 group-hover/item:text-white transition-colors text-left">{item.text}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 sm:gap-8">
                  {canInstall ? (
                    <button 
                      onClick={install}
                      className="group relative w-full sm:w-auto h-14 sm:h-16 px-10 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-base sm:text-lg transition-all shadow-[0_15px_40px_rgba(37,99,235,0.3)] hover:shadow-[0_25px_60px_rgba(37,99,235,0.5)] active:scale-95 flex items-center justify-center"
                    >
                      <div className="relative z-10 flex items-center gap-3">
                        <Download className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
                        Install Application
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ) : isIOS ? (
                    <div className="w-full sm:w-auto p-4 sm:p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 backdrop-blur-xl">
                      <p className="text-xs sm:text-sm font-bold text-blue-400 flex items-center gap-3 justify-center">
                         <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">1</span>
                         Tap Share then "Add to Home Screen"
                      </p>
                    </div>
                  ) : (
                    <div className="w-full sm:w-auto h-14 sm:h-16 px-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-slate-500 font-bold opacity-60">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                      App Already Installed
                    </div>
                  )}

                  <div className="flex flex-col items-center sm:items-start opacity-60 sm:opacity-100">
                     <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Architecture</p>
                     <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-tight">Native-Grade PWA 3.0</p>
                  </div>
                </div>
              </div>

              {/* Left Column: App Mockup (Below content on mobile) */}
              <div className="relative order-2 lg:order-1 flex justify-center items-center h-[350px] sm:h-[450px] lg:h-[500px]">
                {/* Phone Mockup - Hidden on very small screens or made much smaller */}
                <div className="relative w-48 sm:w-64 h-[400px] sm:h-[500px] rounded-[2.5rem] sm:rounded-[3rem] border-[6px] sm:border-[8px] border-[#1e293b] bg-[#020617] shadow-[0_0_40px_rgba(59,130,246,0.15)] overflow-hidden scale-90 sm:scale-100 transition-transform duration-700 hover:rotate-1">
                  {/* Phone Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-5 sm:h-6 bg-[#1e293b] rounded-b-2xl z-20" />
                  
                  {/* App UI Simulation */}
                  <div className="p-3 sm:p-4 pt-8 sm:pt-10 space-y-3 sm:space-y-4">
                    <div className="h-5 sm:h-6 w-20 sm:w-24 bg-blue-500/20 rounded-md" />
                    <div className="h-32 sm:h-40 w-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl sm:rounded-2xl border border-white/5" />
                    <div className="space-y-2">
                      <div className="h-3 sm:h-4 w-full bg-white/5 rounded" />
                      <div className="h-3 sm:h-4 w-3/4 bg-white/5 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-16 sm:h-20 bg-white/5 rounded-lg sm:rounded-xl" />
                      <div className="h-16 sm:h-20 bg-white/5 rounded-lg sm:rounded-xl" />
                    </div>
                    {/* Floating Pulse Dot */}
                    <div className="absolute bottom-10 right-4 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-blue-500 blur-xl animate-pulse opacity-40" />
                  </div>
                </div>

                {/* Floating Feature Cards - Simplified/Repositioned for mobile */}
                <div className="absolute left-0 bottom-10 sm:left-[-1rem] sm:top-20 bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl animate-bounce-slow max-w-[140px] sm:max-w-[180px]">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-bold text-white">Instant Load</p>
                  </div>
                </div>

                <div className="absolute right-0 top-10 sm:right-[-1.5rem] sm:bottom-32 bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl animate-float max-w-[140px] sm:max-w-[180px]" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-bold text-white">Offline Sync</p>
                  </div>
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
