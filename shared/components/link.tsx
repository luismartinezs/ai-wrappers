"use client"

import NextLink from "next/link"
import { cn } from "@/shared/utils/cn"

interface LinkProps extends React.ComponentPropsWithoutRef<typeof NextLink> {
  variant?: "default" | "header" | "card"
  children: React.ReactNode
}

export function Link({
  className,
  variant = "default",
  children,
  ...props
}: LinkProps) {
  return (
    <NextLink
      className={cn(
        // Base styles
        "transition-colors",
        // Variant styles
        {
          // Default variant
          "text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200":
            variant === "default",
          // Header variant
          "text-gray-900 hover:text-gray-600 dark:text-white dark:hover:text-gray-300":
            variant === "header",
          // Card variant
          "block p-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800":
            variant === "card"
        },
        className
      )}
      {...props}
    >
      {children}
    </NextLink>
  )
}