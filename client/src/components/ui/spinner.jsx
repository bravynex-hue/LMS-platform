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
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617]">
      <div className="relative">
        <Spinner size="xl" className="text-blue-500" />
        <div className="absolute inset-0 blur-xl bg-blue-500/20 rounded-full animate-pulse" />
      </div>
      <p className="mt-6 text-blue-400 font-bold tracking-widest uppercase text-xs animate-pulse">
        {message}
      </p>
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
