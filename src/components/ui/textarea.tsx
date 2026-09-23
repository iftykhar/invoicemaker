import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-gray-500 aria-invalid:border-red-500 aria-invalid:bg-red-200 flex field-sizing-content min-h-16 w-full bg-white border-4 border-black rounded-none px-3 py-2 text-[10px] font-pixel sm:text-xs transition-none outline-none shadow-[4px_4px_0_0_#000] focus-visible:bg-[#fef08a] focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] focus-visible:shadow-[2px_2px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
