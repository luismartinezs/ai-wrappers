import { z } from "zod"

// Component-specific schemas
const HeroSchema = z.object({
  type: z.literal("hero"),
  headline: z.string(),
  subheadline: z.string(),
  primaryButtonText: z.string(),
  primaryButtonLink: z.string(),
  secondaryButtonText: z.string().optional(),
  secondaryButtonLink: z.string().optional(),
  backgroundImage: z.string().optional()
})

const ValuePropositionSchema = z.object({
  type: z.literal("valueProposition"),
  title: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  icon: z.string().optional()
})

const FeatureSchema = z.object({
  type: z.literal("features"),
  title: z.string(),
  features: z.array(z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string().optional()
  }))
})

const TestimonialSchema = z.object({
  type: z.literal("testimonials"),
  title: z.string(),
  testimonials: z.array(z.object({
    name: z.string(),
    role: z.string(),
    quote: z.string(),
    image: z.string().optional()
  }))
})

const CallToActionSchema = z.object({
  type: z.literal("callToAction"),
  title: z.string(),
  description: z.string(),
  buttonText: z.string(),
  buttonLink: z.string()
})

const PricingSchema = z.object({
  type: z.literal("pricing"),
  title: z.string(),
  plans: z.array(z.object({
    name: z.string(),
    price: z.string(),
    features: z.array(z.string()),
    buttonText: z.string(),
    buttonLink: z.string()
  }))
})

const FAQSchema = z.object({
  type: z.literal("faq"),
  title: z.string(),
  questions: z.array(z.object({
    question: z.string(),
    answer: z.string()
  }))
})

const FooterSchema = z.object({
  type: z.literal("footer"),
  links: z.array(z.object({
    text: z.string(),
    url: z.string()
  })),
  socialMedia: z.array(z.object({
    platform: z.string(),
    url: z.string()
  })),
  copyrightText: z.string()
})

// Combined component schema
export const LandingPageComponentSchema = z.object({
  component: z.enum([
    "Hero",
    "ValueProposition",
    "Features",
    "Testimonials",
    "CallToAction",
    "Pricing",
    "FAQ",
    "Footer"
  ]),
  props: z.discriminatedUnion("type", [
    HeroSchema,
    ValuePropositionSchema,
    FeatureSchema,
    TestimonialSchema,
    CallToActionSchema,
    PricingSchema,
    FAQSchema,
    FooterSchema
  ])
})

export const LandingPageDataSchema = z.object({
  components: z.array(LandingPageComponentSchema)
})

export type LandingPageComponent = z.infer<typeof LandingPageComponentSchema>
export type LandingPageData = z.infer<typeof LandingPageDataSchema>

export interface LandingPageBuilderState {
  isLoading: boolean
  components: LandingPageComponent[]
}