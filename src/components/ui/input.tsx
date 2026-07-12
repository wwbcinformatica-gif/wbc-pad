"use client"

import { cn } from "@/lib/utils"
import { forwardRef, type InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  rightElement?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, rightElement, id, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full rounded-lg border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2",
              error
                ? "border-red-300 focus:border-red-400 focus:ring-red-200"
                : "border-gray-300 focus:border-[var(--theme-secondary)] focus:ring-[var(--theme-secondary)]/20",
              rightElement ? "pr-10" : "",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
