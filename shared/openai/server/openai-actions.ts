"use server"

import OpenAI from "openai"
import { ActionState } from "@/shared/types/actions-types"
import { ChatCompletionMessageParam, ChatCompletion } from "openai/resources/chat/completions"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export type SimplifiedChatCompletion = {
  id: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string | null
    }
    finish_reason: string | null
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function chatCompletionAction(
  messages: ChatCompletionMessageParam[]
): Promise<ActionState<SimplifiedChatCompletion>> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
    })

    // Transform to plain object with only needed properties
    const simplifiedCompletion: SimplifiedChatCompletion = {
      id: completion.id,
      created: completion.created,
      model: completion.model,
      choices: completion.choices.map(choice => ({
        index: choice.index,
        message: {
          role: choice.message.role,
          content: choice.message.content
        },
        finish_reason: choice.finish_reason
      })),
      usage: completion.usage ? {
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens
      } : {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    }

    return {
      isSuccess: true,
      message: "OpenAI chat completion successful",
      data: simplifiedCompletion
    }
  } catch (error) {
    console.error("Error in OpenAI chat completion:", error)
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to get chat completion"
    }
  }
}