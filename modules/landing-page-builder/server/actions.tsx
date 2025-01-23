"use server"

import { createChatCompletion, createStructuredChatCompletion } from "@/shared/openai/server/openai-lib"
import { ActionState } from "@/shared/types/actions-types"
import { LandingPageData, LandingPageDataSchema } from "../types"

const AVAILABLE_COMPONENTS = `Components and Props:
- Hero: { headline, subheadline, primaryButtonText, primaryButtonLink, secondaryButtonText, secondaryButtonLink, backgroundImage }
- ValueProposition: { title, description, features, icon }
- Features: { title, features: [{ title, description, icon }] }
- Testimonials: { title, testimonials: [{ name, role, quote, image }] }
- CallToAction: { title, description, buttonText, buttonLink }
- Pricing: { title, plans: [{ name, price, features, buttonText, buttonLink }] }
- FAQ: { title, questions: [{ question, answer }] }
- Footer: { links: [{ text, url }], socialMedia: [{ platform, url }], copyrightText }`

export async function generateLandingPageAction(
  description: string
): Promise<ActionState<LandingPageData>> {
  try {
    // Step 1: Generate landing page content in markdown
    const contentCompletion = await createChatCompletion([
      {
        role: "system",
        content: "You are a landing page expert that generates optimized landing page content in markdown format. Focus on compelling copy that converts."
      },
      {
        role: "user",
        content: `Generate optimized landing page content for the following business description: ${description}. Include sections for headline, subheadline, value proposition, features, testimonials, and call-to-action. The content should be conversion-focused and persuasive.`
      }
    ])

    const markdownContent = contentCompletion.choices[0]?.message?.content

    if (!markdownContent) {
      throw new Error("No content generated")
    }

    // Step 2: Map content to React components
    const data = await createStructuredChatCompletion(
      [
        {
          role: "system",
          content: "You are a landing page generator. Your task is to map markdown content to React components and their props, returning a structured JSON output."
        },
        {
          role: "user",
          content: `You are a landing page generator. Based on the following markdown content, generate a landing page by mapping it to the provided list of React components and their props. Return the output as a JSON structure.

Content:
${markdownContent}

${AVAILABLE_COMPONENTS}

Output Format:
{
  "components": [
    {
      "component": "ComponentName",
      "props": { ... }
    }
  ]
}`
        }
      ],
      LandingPageDataSchema,
      "landingPage"
    )

    return {
      isSuccess: true,
      message: "Landing page content generated successfully",
      data
    }
  } catch (error) {
    console.error("Error generating landing page:", error)
    return {
      isSuccess: false,
      message: "Failed to generate landing page content"
    }
  }
}