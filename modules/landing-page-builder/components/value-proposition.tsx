"use client"

import { Card } from "@/shared/components/ui/card"
import { Lightbulb } from "lucide-react"

interface ValuePropositionProps {
  title: string
  description: string
  features: string[]
  icon?: string
}

export function ValueProposition({
  title,
  description,
  features,
  icon
}: ValuePropositionProps) {
  return (
    <div className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-6 flex justify-center">
          {icon ? (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <img
                src={icon}
                alt=""
                className="w-8 h-8"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  // Add Lightbulb icon as fallback
                  const icon = document.createElement('div')
                  icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>'
                  e.currentTarget.parentElement?.appendChild(icon.firstChild as Node)
                }}
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lightbulb className="w-8 h-8 text-primary" />
            </div>
          )}
        </div>

        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-xl text-muted-foreground mb-12">{description}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="p-6">
              <p>{feature}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}