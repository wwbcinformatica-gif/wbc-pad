"use client"

import { cn } from "@/lib/utils"
import { forwardRef, type ButtonHTMLAttributes } from "react"
import { useSound } from "@/contexts/sound-context"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, onClick, ...props }, ref) => {
    const { play } = useSound()

    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
      play()
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed btn-3d",
          {
            "bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] text-white hover:from-[#10b8b8] hover:to-[#28a870] focus:ring-[var(--theme-primary)] btn-glow": variant === "primary",
            "bg-gradient-to-r from-[var(--theme-secondary)] to-[var(--theme-primary)] text-white hover:from-[#28a870] hover:to-[#10b8b8] focus:ring-[var(--theme-secondary)]": variant === "secondary",
            "border-2 border-[var(--theme-primary)]/40 text-[var(--theme-primary)] hover:bg-gradient-to-r hover:from-[var(--theme-primary)] hover:to-[var(--theme-secondary)] hover:text-white focus:ring-[var(--theme-primary)] glass": variant === "outline",
            "text-gray-600 hover:bg-white/80 hover:shadow-sm focus:ring-gray-300 glass": variant === "ghost",
            "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 btn-3d": variant === "danger",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-5 py-2.5 text-sm": size === "md",
            "px-8 py-3 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : null}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
