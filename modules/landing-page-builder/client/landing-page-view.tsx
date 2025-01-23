"use client"

import { Button } from "@/shared/components/ui/button"
import { X } from "lucide-react"
import { LandingPageComponent } from "../types"
import * as Components from "../components"

interface LandingPageViewProps {
  components: LandingPageComponent[]
  onClose: () => void
}

export function LandingPageView({ components, onClose }: LandingPageViewProps) {
  const renderComponent = (component: LandingPageComponent) => {
    const ComponentToRender = Components[component.component as keyof typeof Components]

    if (!ComponentToRender) {
      console.log(`Component ${component.component} not found`)
      return null
    }

    const { type, ...props } = component.props
    const Component = ComponentToRender as React.ComponentType<typeof props>

    return <Component key={component.component} {...props} />
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="sticky top-0 right-0 p-4 flex justify-end bg-background/80 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div>
        {components.map((component, index) => (
          <div key={index}>
            {renderComponent(component)}
          </div>
        ))}
      </div>
    </div>
  )
}