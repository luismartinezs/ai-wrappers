"use client"

import { Card } from "@/shared/components/ui/card"
import { Sparkles } from "lucide-react"

interface Feature {
  title: string
  description: string
  icon?: string
}

interface FeaturesProps {
  title: string
  features: Feature[]
}

export function Features({ title, features }: FeaturesProps) {
  return (
    <div className="py-20 px-4 bg-muted/50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6">
              <div className="mb-4">
                {feature.icon ? (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <img
                      src={feature.icon}
                      alt=""
                      className="w-6 h-6"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        // Add Sparkles icon as fallback
                        const icon = document.createElement('div')
                        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>'
                        e.currentTarget.parentElement?.appendChild(icon.firstChild as Node)
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}