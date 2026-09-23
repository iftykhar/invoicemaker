import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-[10px] sm:text-xs font-pixel uppercase transition-all duration-75 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none rounded-none border-4 border-black shadow-[4px_4px_0_0_#000] cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-[#4ade80] text-black hover:bg-[#22c55e]", // Arcade Green
        destructive: "bg-[#ef4444] text-white hover:bg-[#dc2626]",
        outline: "bg-white text-black hover:bg-gray-200",
        secondary: "bg-[#facc15] text-black hover:bg-[#eab308]", // Arcade Yellow
        ghost: "hover:bg-gray-200 border-transparent shadow-none active:translate-x-0 active:translate-y-0 text-black",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
