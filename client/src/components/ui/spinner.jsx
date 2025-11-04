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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Spinner size="xl" className="text-gray-700" />
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  );
}

export function SpinnerOverlay({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Spinner size="lg" className="text-gray-700" />
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  );
}
