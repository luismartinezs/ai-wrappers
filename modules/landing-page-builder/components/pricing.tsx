"use client"

import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"

interface PricingPlan {
  name: string
  price: string
  features: string[]
  buttonText: string
  buttonLink: string
}

interface PricingProps {
  title: string
  plans: PricingPlan[]
}

export function Pricing({ title, plans }: PricingProps) {
  return (
    <div className="py-20 px-4 bg-muted/50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold">{plan.price}</div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button asChild className="w-full">
                <a href={plan.buttonLink}>{plan.buttonText}</a>
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}