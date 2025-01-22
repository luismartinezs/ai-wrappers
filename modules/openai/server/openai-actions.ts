"use server"

import OpenAI from "openai"
import { ActionState } from "@/shared/types/actions-types"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface OpenAIMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface OpenAIResponse {
  message: OpenAIMessage
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function chatCompletionAction(
  messages: OpenAIMessage[]
): Promise<ActionState<OpenAIResponse>> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    })

    const response: OpenAIResponse = {
      message: completion.choices[0].message as OpenAIMessage,
      usage: completion.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    }

    return {
      isSuccess: true,
      message: "OpenAI chat completion successful",
      data: response
    }
  } catch (error) {
    console.error("Error in OpenAI chat completion:", error)
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to get chat completion"
    }
  }
}