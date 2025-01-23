"use client"

import { Button } from "@/shared/components/ui/button"

interface HeroProps {
  headline: string
  subheadline: string
  primaryButtonText: string
  primaryButtonLink: string
  secondaryButtonText?: string
  secondaryButtonLink?: string
  backgroundImage?: string
}

export function Hero({
  headline,
  subheadline,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  backgroundImage
}: HeroProps) {
  return (
    <div className="relative min-h-[600px] flex items-center justify-center">
      {/* Background with gradient fallback */}
      <div
        className={`absolute inset-0 z-0 ${!backgroundImage ? 'bg-gradient-to-b from-primary/10 to-background' : ''}`}
        style={backgroundImage ? {
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : undefined}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 py-20">
        <h1 className="text-5xl font-bold mb-6">{headline}</h1>
        <p className="text-xl text-muted-foreground mb-8">{subheadline}</p>

        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <a href={primaryButtonLink}>{primaryButtonText}</a>
          </Button>

          {secondaryButtonText && secondaryButtonLink && (
            <Button asChild variant="outline" size="lg">
              <a href={secondaryButtonLink}>{secondaryButtonText}</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}