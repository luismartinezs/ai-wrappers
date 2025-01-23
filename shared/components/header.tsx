"use client"

import { Link } from "@/shared/components/link"
import { cn } from "@/shared/utils/cn"
import { AuthButton } from "@/modules/auth/client/auth-button"

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto py-4 px-4">
        <div className="max-w-screen-lg mx-auto flex items-center justify-between">
          <Link href="/" variant="header">
            <span className="text-xl font-bold">AI Wrappers</span>
          </Link>

          <nav className="flex items-center space-x-4">
            <AuthButton />
          </nav>
        </div>
      </div>
    </header>
  )
}