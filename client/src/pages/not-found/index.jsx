"use client";
import { Link } from "react-router-dom";
import { MoveLeft, ShieldAlert, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: "var(--bg-dark)" }}>
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 grid-bg opacity-[0.05]" />
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative inline-block">
           <div className="absolute -inset-4 bg-red-500/10 rounded-full blur-2xl animate-pulse" />
           <div className="relative w-32 h-32 bg-white/5 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl rotate-3 group hover:rotate-0 transition-transform duration-500">
              <ShieldAlert className="w-16 h-16 text-red-500/80 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
           </div>
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-2">
             <Zap className="w-3.5 h-3.5 text-yellow-500" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Protocol Failure: 404</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-none">
            Signal <span className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]">Lost</span>
          </h1>
          <h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest">Navigation Node Not Found</h2>
          <p className="text-gray-600 max-w-md mx-auto font-medium text-sm leading-relaxed px-4">
            The requested data segment is either missing or has been relocated within the encrypted multi-verse. 
            Access is currently restricted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/">
            <Button 
              className="bg-white text-black hover:bg-gray-200 h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
            >
              <MoveLeft className="w-4 h-4 mr-3" />
              Reset Connection
            </Button>
          </Link>
          <div className="hidden sm:block h-10 w-px bg-white/10" />
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-800">Bravynex Engineering Terminal v1.0.4</p>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-20">
         <div className="w-24 h-px bg-gradient-to-r from-transparent to-white/20" />
         <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
         <div className="w-24 h-px bg-gradient-to-l from-transparent to-white/20" />
      </div>
    </div>
  );
}

export default NotFoundPage;
