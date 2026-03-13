import { ShieldAlert, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 w-[420px] h-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[420px] h-[420px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_1px_1px,#64748b_1px,transparent_0)] [background-size:24px_24px]" />
      </div>

      <div className="relative z-10 max-w-xl w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-slate-900/60 px-4 py-1.5 text-[10px] font-semibold tracking-[0.3em] uppercase text-cyan-300/80">
          <ShieldAlert className="h-3.5 w-3.5 text-cyan-400" />
          <span>Scheduled Maintenance Window</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            We&apos;re updating{" "}
            <span className="text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">
              Bravynex LMS
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto">
            Our platform is temporarily unavailable while we deploy upgrades and
            improvements. During this time, all pages and dashboards are
            offline.
          </p>
          <p className="text-xs sm:text-sm text-slate-500">
            Please check back in a few minutes. If this message persists longer
            than expected, contact your administrator.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          <Button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 shadow-lg shadow-cyan-500/30 hover:bg-cyan-400 hover:shadow-cyan-400/40 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Status
          </Button>
          <div className="inline-flex items-center gap-2 text-[10px] font-medium text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            <span>System will automatically resume when maintenance ends.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaintenancePage;

