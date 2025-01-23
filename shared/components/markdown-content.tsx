"use client"

import { useEffect, useState } from "react"
import { markdownToHtml } from "@/shared/utils/markdown"

interface MarkdownContentProps {
  content: string
  className?: string
}

export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  const [parsedContent, setParsedContent] = useState("")

  useEffect(() => {
    async function parseContent() {
      const html = await markdownToHtml(content)
      setParsedContent(html)
    }
    parseContent()
  }, [content])

  return (
    <div
      className={`prose dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: parsedContent }}
    />
  )
}