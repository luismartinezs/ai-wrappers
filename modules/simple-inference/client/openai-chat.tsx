"use client"

import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { chatCompletionAction } from "@/modules/openai/server/openai-actions"
import type { OpenAIMessage } from "@/modules/openai/server/openai-actions"
import { Card } from "@/shared/components/ui/card"
import { markdownToHtml } from "@/shared/utils/markdown"

const SAMPLE_QUERIES = [
  "What are some effective ways to reduce stress and anxiety?",
  "Can you explain how photosynthesis works in plants?",
  "What were the main causes of World War II?",
  "How does the human immune system protect against diseases?",
  "What are some interesting facts about black holes in space?",
  "Can you explain the basics of climate change and its effects?",
  "What are some popular traditional dishes from different cultures?",
  "How do electric vehicles work and impact the environment?",
]

export function OpenAIChat() {
  const [input, setInput] = useState("")
  const [response, setResponse] = useState("")
  const [parsedResponse, setParsedResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sampleQueries] = useState(() => {
    const shuffled = [...SAMPLE_QUERIES].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    try {
      const messages: OpenAIMessage[] = [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: input }
      ]

      const result = await chatCompletionAction(messages)

      if (result.isSuccess) {
        setResponse(result.data.message.content)
        // Parse markdown to HTML
        const html = await markdownToHtml(result.data.message.content)
        setParsedResponse(html)
      } else {
        setResponse(`Error: ${result.message}`)
        setParsedResponse(`Error: ${result.message}`)
      }
    } catch (error) {
      const errorMessage = "An error occurred while processing your request."
      setResponse(errorMessage)
      setParsedResponse(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          disabled={isLoading}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Thinking..." : "Ask OpenAI"}
        </Button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sampleQueries.map((query, index) => (
          <Card
            key={index}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            role="button"
            tabIndex={0}
            onClick={() => setInput(query)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setInput(query)
              }
            }}
            aria-label={`Use sample question: ${query}`}
          >
            <p className="text-sm text-gray-600 dark:text-gray-300">{query}</p>
          </Card>
        ))}
      </div>

      {response && (
        <div className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 prose dark:prose-invert max-w-none">
          <div
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: parsedResponse }}
          />
        </div>
      )}
    </div>
  )
}