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
    <section className="py-24 sm:py-32 px-4 sm:px-8 relative overflow-hidden" id="pwa-install">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-[#020617] -z-20" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto">
        <div 
          className="relative rounded-[2.5rem] sm:rounded-[4rem] p-px overflow-hidden group"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(168,85,247,0.1) 100%)' }}
        >
          {/* Inner Content Container */}
          <div className="relative bg-[#020617] backdrop-blur-3xl rounded-[2.5rem] sm:rounded-[4rem] p-8 sm:p-24 overflow-hidden border border-white/5">
            
            {/* Grid Background */}
            <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
              
              {/* Left Column: App Mockup */}
              <div className="relative order-2 lg:order-1 flex justify-center items-center h-[350px] sm:h-[450px] lg:h-[550px]">
                {/* Phone Mockup */}
                <div className="relative w-48 sm:w-72 h-[410px] sm:h-[550px] rounded-[2.5rem] sm:rounded-[3.5rem] border-[8px] sm:border-[10px] border-[#1e293b] bg-[#020617] shadow-[0_0_60px_rgba(59,130,246,0.2)] overflow-hidden scale-90 sm:scale-100 transition-transform duration-700 hover:rotate-1">
                  {/* Phone Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 sm:w-36 h-5 sm:h-7 bg-[#1e293b] rounded-b-2xl z-20" />
                  
                  {/* App UI Simulation */}
                  <div className="p-4 sm:p-6 pt-10 sm:pt-12 space-y-4">
                    <div className="h-6 w-24 bg-blue-500/20 rounded-md" />
                    <div className="h-32 sm:h-48 w-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl border border-white/5" />
                    <div className="space-y-3">
                      <div className="h-4 w-full bg-white/5 rounded" />
                      <div className="h-4 w-3/4 bg-white/5 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-20 bg-white/5 rounded-xl" />
                      <div className="h-20 bg-white/5 rounded-xl" />
                    </div>
                    {/* Floating Pulse Dot */}
                    <div className="absolute bottom-12 right-6 w-12 h-12 rounded-full bg-blue-500 blur-2xl animate-pulse opacity-40" />
                  </div>
                </div>

                {/* Floating Feature Cards - Fixed Stretching Issue */}
                <div className="absolute left-0 bottom-10 sm:left-[-2rem] sm:top-20 sm:bottom-auto bg-[#1e293b]/95 backdrop-blur-2xl border border-white/10 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl animate-bounce-slow max-w-[140px] sm:max-w-[190px]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-[11px] font-black text-white tracking-wide">Instant Load</p>
                  </div>
                </div>

                <div className="absolute right-0 top-10 sm:right-[-2.5rem] sm:bottom-32 sm:top-auto bg-[#1e293b]/95 backdrop-blur-2xl border border-white/10 p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl animate-float max-w-[140px] sm:max-w-[190px]" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-[11px] font-black text-white tracking-wide">Offline Sync</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Content */}
              <div className="order-1 lg:order-2 space-y-10 text-center lg:text-left">
                <div className="flex flex-col items-center lg:items-start">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-blue-400">Superior App Experience</span>
                  </div>
                  
                  <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tighter">
                    Study Without <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Boundaries.</span>
                  </h2>
                  
                  <p className="text-lg sm:text-xl text-slate-400 mt-8 max-w-xl leading-relaxed mx-auto lg:mx-0">
                    Install the Bravynex PWA for a hyper-fast, immersive learning environment. No app stores, no updates to wait for—just one tap away.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 max-w-md mx-auto lg:mx-0">
                  {[
                    { icon: Laptop, text: "Multi-device Sync" },
                    { icon: CheckCircle2, text: "90% Less Data" },
                    { icon: Zap, text: "Ultra-low Latency" },
                    { icon: Download, text: "Zero Install Lag" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-center lg:justify-start gap-4 group/item">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover/item:bg-blue-500/20 transition-colors">
                        <item.icon className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <span className="text-sm font-bold text-slate-300 group-hover/item:text-white transition-colors">{item.text}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8">
                  {canInstall ? (
                    <button 
                      onClick={install}
                      className="group relative w-full sm:w-auto h-16 px-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:shadow-[0_25px_60px_rgba(37,99,235,0.5)] active:scale-95 flex items-center justify-center"
                    >
                      <div className="relative z-10 flex items-center gap-3">
                        <Download className="w-6 h-6 animate-bounce" />
                        Install Application
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ) : isIOS ? (
                    <div className="w-full sm:w-auto p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 backdrop-blur-xl">
                      <p className="text-sm font-bold text-blue-400 flex items-center gap-4 justify-center">
                         <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-xs">1</span>
                         Tap Share then "Add to Home Screen"
                      </p>
                    </div>
                  ) : (
                    <div className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-4 text-slate-500 font-bold opacity-60">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500/50" />
                      App Already Installed
                    </div>
                  )}

                  <div className="flex flex-col items-center sm:items-start">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Architecture</p>
                     <p className="text-xs text-slate-400 font-medium tracking-tight">Native-Grade PWA 3.0</p>
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
