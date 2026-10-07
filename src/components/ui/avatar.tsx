import * as React from "react"
import { cn, getInitials } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  fallback?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function Avatar({ className, src, alt, fallback, size = "md", ...props }: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  }

  const initials = fallback || (alt ? getInitials(alt) : "")

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-muted border",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="aspect-square h-full w-full object-cover"
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLElement).style.display = 'none'
          }}
        />
      ) : null}
      
      {/* Fallback initials always rendered behind in case image fails or is absent */}
      <div className="absolute inset-0 flex h-full w-full items-center justify-center font-medium text-muted-foreground -z-10 bg-secondary">
        {initials}
      </div>
    </div>
  )
}
