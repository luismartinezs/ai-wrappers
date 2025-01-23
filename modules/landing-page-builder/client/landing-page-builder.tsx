"use client"

import { useState } from "react"
import { Textarea } from "@/shared/components/ui/textarea"
import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { LandingPageComponent, LandingPageBuilderState } from "../types"
import { generateLandingPageAction } from "../server/actions"
import { LandingPageView } from "./landing-page-view"

export function LandingPageBuilder() {
  const [description, setDescription] = useState("")
  const [state, setState] = useState<LandingPageBuilderState>({
    isLoading: false,
    components: []
  })
  const [showPreview, setShowPreview] = useState(false)

  const handleSubmit = async () => {
    if (!description.trim()) return

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const result = await generateLandingPageAction(description)

      if (result.isSuccess && result.data) {
        setState({
          isLoading: false,
          components: result.data.components
        })
        // Show preview after successful generation
        setShowPreview(true)
      } else {
        console.error(result.message)
        setState(prev => ({ ...prev, isLoading: false }))
      }
    } catch (error) {
      console.error("Error:", error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto space-y-8 p-8">
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Landing Page Builder</h2>

            <p className="text-muted-foreground">
              Describe your business and we'll generate a landing page for you. It could be anything - a restaurant,
              an airline, a SaaS product, a marketplace, or an e-commerce store.
            </p>

            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your business..."
              className="min-h-[200px]"
            />

            <Button
              onClick={handleSubmit}
              disabled={!description.trim() || state.isLoading}
              className="w-full"
            >
              {state.isLoading ? "Generating..." : "Generate Landing Page"}
            </Button>
          </div>
        </Card>

        {state.components.length > 0 && !showPreview && (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Generated Landing Page</h2>
                <Button onClick={() => setShowPreview(true)}>
                  Preview Landing Page
                </Button>
              </div>

              <pre className="whitespace-pre-wrap text-sm text-muted-foreground">
                {JSON.stringify(state.components, null, 2)}
              </pre>
            </div>
          </Card>
        )}
      </div>

      {showPreview && (
        <LandingPageView
          components={state.components}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  )
}