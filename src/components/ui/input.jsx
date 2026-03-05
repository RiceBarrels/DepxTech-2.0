"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useWebHaptics } from "web-haptics/react"

function Input({
  className,
  type,
  onFocus,
  onBlur,
  ...props
}) {
  const { trigger } = useWebHaptics()

  const handleFocus = React.useCallback((e) => {
    trigger('selection')
    onFocus?.(e)
  }, [trigger, onFocus])

  const handleBlur = React.useCallback((e) => {
    trigger('selection')
    onBlur?.(e)
  }, [trigger, onBlur])

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-12 w-full min-w-0 rounded-full border bg-transparent px-5 py-3 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-12 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props} />
  );
}

export { Input }
