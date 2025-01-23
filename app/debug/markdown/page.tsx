"use client"

import { useState, useEffect, ChangeEvent } from "react"
import { Card } from "@/shared/components/ui/card"
import { Textarea } from "@/shared/components/ui/textarea"
import { markdownToHtml } from "@/shared/utils/markdown"
import { PageWrapper } from "@/shared/components/page-wrapper"

export default function MarkdownDebugPage() {
  const [markdown, setMarkdown] = useState("")
  const [html, setHtml] = useState("")

  useEffect(() => {
    const updateHtml = async () => {
      if (!markdown) {
        setHtml("")
        return
      }
      const parsedHtml = await markdownToHtml(markdown)
      setHtml(parsedHtml)
    }
    updateHtml()
  }, [markdown])

  return (
    <PageWrapper maxWidth="full">
      <h1 className="text-2xl font-bold mb-6">Markdown Debug</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-3">Markdown Input</h2>
          <Textarea
            value={markdown}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMarkdown(e.target.value)}
            placeholder="Enter markdown here..."
            className="min-h-[500px] font-mono"
          />
        </Card>

        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-3">HTML Output</h2>
          <div
            className="prose dark:prose-invert max-w-none min-h-[500px] p-4 bg-muted rounded-md"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Card>
      </div>
    </PageWrapper>
  )
}
