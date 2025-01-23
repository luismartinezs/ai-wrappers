"use client"

import { useState } from "react"
import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Textarea } from "@/shared/components/ui/textarea"
import { Input } from "@/shared/components/ui/input"
import { MarkdownContent } from "@/shared/components/markdown-content"
import { chatCompletionAction } from "@/modules/openai/server/openai-actions"
import { ChatCompletionMessageParam } from "openai/resources/index.mjs"

export default function MultimodalChat() {
  const [input, setInput] = useState("")
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setImageBase64(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    try {
      const content = [{ type: "text", text: input }] as any

      if (imageBase64) {
        content.push({
          type: "image_url",
          image_url: {
            url: imageBase64
          }
        })
      }

      const result = await chatCompletionAction([
        {
          role: "user",
          content
        }
      ])

      if (result.isSuccess) {
        setResponse(typeof result.data.choices[0].message.content === 'string'
          ? result.data.choices[0].message.content
          : 'Unexpected response format')
      } else {
        setResponse("Error: " + result.message)
      }
    } catch (error) {
      setResponse("An error occurred during inference")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto p-4 space-y-4">
      <div className="space-y-4">
        <Textarea
          placeholder="Ask a question about your image..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[100px]"
        />

        <div className="space-y-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="cursor-pointer"
          />
          {imageBase64 && (
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageBase64}
                alt="Uploaded image"
                className="object-contain w-full h-full"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setImageBase64(null)}
              >
                Remove
              </Button>
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading || !input.trim()}
          className="w-full"
        >
          {isLoading ? "Processing..." : "Submit"}
        </Button>
      </div>

      {response && (
        <Card className="p-4 mt-4">
          <MarkdownContent content={response} />
        </Card>
      )}
    </Card>
  )
}