import OpenAI from "openai"
import { ChatCompletionMessageParam } from "openai/resources/chat/completions"
import { zodResponseFormat } from "openai/helpers/zod"
import { z } from "zod"

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

export async function createChatCompletion(
  messages: ChatCompletionMessageParam[]
): Promise<SimplifiedChatCompletion> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
  })

  // Transform to plain object with only needed properties
  return {
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
}

export async function createStructuredChatCompletion<T extends z.ZodType>(
  messages: ChatCompletionMessageParam[],
  schema: T,
  propertyName: string
): Promise<z.infer<T>> {
  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: messages,
    response_format: zodResponseFormat(schema, propertyName),
  })

  return completion.choices[0].message.parsed
}