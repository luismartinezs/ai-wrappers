"use client"

import { Button } from "@/shared/components/ui/button"

interface CallToActionProps {
  title: string
  description: string
  buttonText: string
  buttonLink: string
}

export function CallToAction({
  title,
  description,
  buttonText,
  buttonLink
}: CallToActionProps) {
  return (
    <div className="py-20 px-4 bg-primary text-primary-foreground">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-xl mb-8 text-primary-foreground/80">{description}</p>

        <Button asChild size="lg" variant="secondary">
          <a href={buttonLink}>{buttonText}</a>
        </Button>
      </div>
    </div>
  )
}