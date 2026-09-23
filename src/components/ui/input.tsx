import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-gray-500 selection:bg-blue-300 h-9 w-full min-w-0 bg-white border-4 border-black rounded-none px-3 py-1 text-[10px] font-pixel sm:text-xs transition-none outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 shadow-[4px_4px_0_0_#000]",
        "focus-visible:bg-[#fef08a] focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] focus-visible:shadow-[2px_2px_0_0_#000]",
        "aria-invalid:border-red-500 aria-invalid:bg-red-200",
        className
      )}
      {...props}
    />
  )
}

export { Input }
