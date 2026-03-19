import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    (<input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-white/10 bg-[#0f172a]/40 px-4 py-2 text-sm text-white shadow-sm ring-offset-background transition-all placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 autofill:shadow-[0_0_0_1000px_#0f172a_inset] autofill:text-fill-white hover:border-white/20",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }
