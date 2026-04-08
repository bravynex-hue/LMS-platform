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
    <div className="fixed inset-0 min-h-screen flex flex-col bg-[#020617] relative overflow-hidden z-[10000]">
      {/* Background orbs */}
      <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:60px_60px] opacity:30 pointer-events-none" />
    </div>
  );
}

export function SpinnerOverlay() {
  return <div className="w-full h-full min-h-[100px]" />;
}
