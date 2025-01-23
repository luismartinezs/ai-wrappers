"use client"

import { Card } from "@/shared/components/ui/card"
import { User } from "lucide-react"

interface Testimonial {
  name: string
  role: string
  quote: string
  image?: string
}

interface TestimonialsProps {
  title: string
  testimonials: Testimonial[]
}

export function Testimonials({ title, testimonials }: TestimonialsProps) {
  return (
    <div className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6">
              <blockquote className="space-y-4">
                <p className="text-lg italic">"{testimonial.quote}"</p>

                <footer className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.parentElement?.classList.add('bg-muted')
                          // Add User icon as fallback
                          const icon = document.createElement('div')
                          icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'
                          e.currentTarget.parentElement?.appendChild(icon.firstChild as Node)
                        }}
                      />
                    ) : (
                      <User className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </footer>
              </blockquote>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}