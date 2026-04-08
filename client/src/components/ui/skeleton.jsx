import { cn } from "@/lib/utils"

function Skeleton({
  className,
  variant = "pulse", // "pulse" or "shimmer"
  ...props
}) {
  return (
    (<div
      className={cn(
        "rounded-md bg-muted/40 overflow-hidden relative",
        variant === "pulse" && "animate-pulse",
        variant === "shimmer" && "after:content-[''] after:absolute after:inset-0 after:translate-x-[-100%] after:animate-[shimmer_2s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent",
        "dark:bg-white/5",
        className
      )}
      {...props} />)
  );
}

export { Skeleton }
