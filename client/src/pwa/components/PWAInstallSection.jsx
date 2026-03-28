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
    <section className="py-24 px-6 sm:px-8 relative overflow-hidden" id="pwa-install">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-[#020817] -z-20" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />

      <div className="max-w-7xl mx-auto">
        <div 
          className="relative rounded-[3rem] p-1px overflow-hidden group"
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(168,85,247,0.1) 100%)' }}
        >
          {/* Inner Content Container */}
          <div className="relative bg-[#0a1122]/90 backdrop-blur-3xl rounded-[3rem] p-8 sm:p-20 overflow-hidden">
            
            {/* Grid Background */}
            <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

            <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
              
              {/* Left Column: Hyper-Premium App Mockup */}
              <div className="relative order-2 lg:order-1 flex justify-center items-center h-[400px] lg:h-[500px]">
                <div className="relative w-64 h-[500px] rounded-[3rem] border-[8px] border-[#1e293b] bg-[#020617] shadow-[0_0_50px_rgba(59,130,246,0.2)] overflow-hidden scale-90 lg:scale-100 transition-transform duration-700 hover:rotate-2">
                  {/* Phone Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1e293b] rounded-b-2xl z-20" />
                  
                  {/* App UI Simulation */}
                  <div className="p-4 pt-10 space-y-4">
                    <div className="h-6 w-24 bg-blue-500/20 rounded-md" />
                    <div className="h-40 w-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl border border-white/5" />
                    <div className="space-y-2">
                      <div className="h-4 w-full bg-white/5 rounded" />
                      <div className="h-4 w-3/4 bg-white/5 rounded" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-20 bg-white/5 rounded-xl" />
                      <div className="h-20 bg-white/5 rounded-xl" />
                    </div>
                    {/* Floating Pulse Dot */}
                    <div className="absolute bottom-10 right-4 w-12 h-12 rounded-full bg-blue-500 blur-xl animate-pulse opacity-50" />
                  </div>
                </div>

                {/* Floating Feature Cards behind/around phone */}
                <div className="absolute -left-4 top-20 bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl animate-bounce-slow max-w-[180px]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-[11px] font-bold text-white">Instant Load</p>
                  </div>
                </div>

                <div className="absolute -right-8 bottom-32 bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl animate-float max-w-[180px]" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-[11px] font-bold text-white">Offline Sync</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Content */}
              <div className="order-1 lg:order-2 space-y-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] uppercase tracking-widest font-black text-blue-400">Superior App Experience</span>
                  </div>
                  
                  <h2 className="text-5xl sm:text-7xl font-black text-white leading-[1.05] tracking-tight">
                    Study Without <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Boundaries.</span>
                  </h2>
                  
                  <p className="text-lg text-slate-400 mt-8 max-w-lg leading-relaxed">
                    Install the Bravynex PWA for a hyper-fast, immersive learning environment. No app stores, no updates to wait for—just one tap away.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    { icon: Laptop, text: "Multi-device Sync" },
                    { icon: CheckCircle2, text: "90% Less Data" },
                    { icon: Zap, text: "Ultra-low Latency" },
                    { icon: Download, text: "Zero Install Lag" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 group/item">
                      <div className="w-5 h-5 rounded-md bg-blue-500/10 flex items-center justify-center group-hover/item:bg-blue-500/20 transition-colors">
                        <item.icon className="w-3 h-3 text-blue-400" />
                      </div>
                      <span className="text-sm font-bold text-slate-300 group-hover/item:text-white transition-colors">{item.text}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-8">
                  {canInstall ? (
                    <button 
                      onClick={install}
                      className="group relative h-16 px-10 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:shadow-[0_25px_60px_rgba(37,99,235,0.5)] active:scale-95"
                    >
                      <div className="relative z-10 flex items-center gap-3">
                        <Download className="w-6 h-6 animate-bounce" />
                        Install Application
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ) : isIOS ? (
                    <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20 backdrop-blur-xl">
                      <p className="text-sm font-bold text-blue-400 flex items-center gap-3">
                         <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">1</span>
                         Tap Share then "Add to Home Screen"
                      </p>
                    </div>
                  ) : (
                    <div className="h-16 px-10 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 text-slate-500 font-bold opacity-60">
                      <CheckCircle2 className="w-6 h-6" />
                      App Already Installed
                    </div>
                  )}

                  <div className="flex flex-col">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Architecture</p>
                     <p className="text-xs text-slate-400 font-medium">Native-Grade PWA 3.0</p>
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
