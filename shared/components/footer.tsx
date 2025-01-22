"use client"

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="container py-4">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} AI Wrappers. Built with Next.js and TypeScript.
        </p>
      </div>
    </footer>
  )
}