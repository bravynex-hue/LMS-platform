import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Spinner({ className, size = "default", ...props }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <Loader2
      className={cn("animate-spin text-gray-600", sizeClasses[size], className)}
      {...props}
    />
  );
}

export function SpinnerFullPage() {
  return (
    <div className="fixed inset-0 min-h-screen flex flex-col items-center justify-center space-y-8 bg-[#020617] relative overflow-hidden z-[10000]">
      {/* Dynamic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">
        {/* Animated Brand Placeholder */}
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative">
           <div className="absolute inset-0 rounded-2xl border border-blue-500/30 animate-ping" />
           <div className="w-10 h-10 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
        </div>
        
        {/* Content Skeletons */}
        <div className="w-full space-y-4">
          <div className="h-8 w-3/4 mx-auto rounded-lg bg-white/5 animate-pulse" />
          <div className="h-3 w-1/2 mx-auto rounded-lg bg-white/5 animate-pulse" />
          <div className="pt-6">
            <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-blue-600 w-1/3 animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/60 animate-pulse">Initializing Ecosystem</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}

export function SpinnerOverlay() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-transparent space-y-4 w-full">
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/20 animate-pulse" />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500 animate-[shimmer_2s_infinite]" />
      </div>
      <div className="h-2 w-24 bg-white/5 rounded-full relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
      </div>
    </div>
  );
}
