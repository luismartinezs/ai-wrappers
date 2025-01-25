"use server"

import OpenAI from "openai"
import { ActionState } from "@/shared/types/actions-types"
import { logger } from "@/shared/utils/logger"

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY
})

export interface PromptResponse {
  content: string
}

export async function sendPromptAction(
  prompt: string,
  systemPrompt: string = "You are a helpful assistant."
): Promise<ActionState<PromptResponse>> {
  try {
    logger("prompt-actions", "Sending prompt to DeepSeek", { prompt })

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      model: "deepseek-chat"
    })

    const content = completion.choices[0].message.content || ""

    logger("prompt-actions", "Received response from DeepSeek", { content })

    return {
      isSuccess: true,
      message: "Successfully received response",
      data: { content }
    }
  } catch (error) {
    logger("prompt-actions", "Error sending prompt to DeepSeek", { error })
    return {
      isSuccess: false,
      message: "Failed to get response from DeepSeek"
    }
  }
}