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

export function SpinnerFullPage({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[10000] overflow-hidden bg-[#020617]">
      {/* Background ambient orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity-30 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Rings */}
        <div className="relative w-28 h-28 mb-8 flex items-center justify-center">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border border-blue-500/10 border-t-blue-500/80 animate-spin" style={{ animationDuration: '2.5s' }} />
          {/* Middle ring */}
          <div className="absolute inset-2 rounded-full border border-purple-500/10 border-b-purple-500/70 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          {/* Inner ring */}
          <div className="absolute inset-4 rounded-full border border-cyan-400/10 border-r-cyan-400/60 animate-spin" style={{ animationDuration: '3s' }} />
          
          {/* Core */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 blur-md animate-pulse" style={{ animationDuration: '2s' }} />
          <div className="absolute w-6 h-6 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 opacity-90 shadow-[0_0_20px_rgba(96,165,250,0.8)]" />
        </div>

        {/* Branding */}
        <h2 className="text-3xl sm:text-4xl font-black tracking-widest uppercase mb-4 shadow-black drop-shadow-lg">
          <span style={{ color: "#f8fafc" }}>Bravy</span>
          <span style={{
            background: "linear-gradient(135deg, #60a5fa 0%, #c084fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>nex</span>
        </h2>

        {/* Loading Message */}
        <div className="flex items-center gap-3 mt-2 px-6 py-2 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm shadow-xl">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
          <p className="text-slate-300 font-semibold tracking-[0.2em] uppercase text-[10px] sm:text-xs">
            {message}
          </p>
          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    </div>
  );
}

export function SpinnerOverlay({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-transparent">
      <Spinner size="lg" className="text-blue-500" />
      <p className="mt-4 text-blue-400/70 text-xs font-bold tracking-wider uppercase">{message}</p>
    </div>
  );
}
