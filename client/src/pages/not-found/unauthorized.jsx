import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { ShieldAlert, Home, LogIn, Lock, Zap } from "lucide-react";

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  const handleRedirect = () => {
    if (!auth.authenticate) {
      navigate("/auth");
    } else if (auth.user?.role === "instructor") {
      navigate("/instructor");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" style={{ background: "var(--bg-dark)" }}>
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/5 rounded-full blur-[160px]" />
        <div className="absolute inset-0 grid-bg opacity-[0.05]" />
      </div>

      <div className="relative z-10 max-w-md w-full space-y-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="relative inline-block">
             <div className="absolute -inset-4 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
             <div className="relative w-24 h-24 bg-red-500/10 border border-red-500/30 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                <Lock className="w-12 h-12 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
             </div>
          </div>
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/5 border border-red-500/10">
               <Zap className="w-3.5 h-3.5 text-red-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500/80">Security Protocol Violation</span>
            </div>
            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-tight">
              Access <span className="text-red-500">Denied</span>
            </h2>
            <p className="text-gray-500 font-medium text-sm leading-relaxed">
              Your credentials lack the authorization level required to access this secure node.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={handleRedirect} 
            className="w-full h-14 bg-white text-black hover:bg-gray-200 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
          >
            {auth.authenticate ? (
              <>
                <Home className="w-4 h-4 mr-3" />
                Return to Command Hub
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-3" />
                Initiate Auth Protocol
              </>
            )}
          </Button>
          
          {auth.authenticate && (
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline"
              className="w-full h-14 border-white/10 text-gray-500 hover:text-white hover:bg-white/5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all"
            >
              Abort & Retreat
            </Button>
          )}
        </div>

        {/* Additional Info */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 blur-xl rounded-full -mr-8 -mt-8" />
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest text-center leading-relaxed">
            <strong className="text-gray-400">Escalation Required?</strong> If you believe this is a system error, contact your sector administrator.
          </p>
        </div>
      </div>
    </div>
  );
}