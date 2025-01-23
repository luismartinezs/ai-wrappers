"use server"

import { ActionState } from "@/shared/types/actions-types"
import { ChatCompletionMessageParam } from "openai/resources/chat/completions"
import { createChatCompletion, SimplifiedChatCompletion } from "@/shared/openai/server/openai-lib"

export type { SimplifiedChatCompletion }

export async function chatCompletionAction(
  messages: ChatCompletionMessageParam[]
): Promise<ActionState<SimplifiedChatCompletion>> {
  try {
    const completion = await createChatCompletion(messages)

    return {
      isSuccess: true,
      message: "OpenAI chat completion successful",
      data: completion
    }
  } catch (error) {
    console.error("Error in OpenAI chat completion:", error)
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Failed to get chat completion"
    }
  }
}