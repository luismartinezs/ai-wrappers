"use client"

import { cn } from "@/shared/utils/cn"

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"
}

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full"
}

export function PageWrapper({
  children,
  className,
  maxWidth = "xl"
}: PageWrapperProps) {
  return (
    <main className="flex-1">
      <div
        className={cn(
          "container mx-auto px-4 py-12",
          maxWidthClasses[maxWidth],
          className
        )}
      >
        {children}
      </div>
    </main>
  )
}