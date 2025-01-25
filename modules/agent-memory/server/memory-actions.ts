"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/modules/auth/server/auth-options"
import { Conversation, IMessage } from "./memory-schema"
import { connectDB } from "@/modules/mongodb/server/mongodb-client"
import { ActionState } from "@/shared/types/actions-types"
import { sendPromptAction, Message as LLMMessage } from "./prompt-actions"
import { logger } from "@/shared/utils/logger"
import mongoose from "mongoose"

export async function createConversationAction(): Promise<ActionState<{ id: string }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      logger("memory-actions", "Unauthorized attempt to create conversation")
      return { isSuccess: false, message: "Unauthorized" }
    }

    await connectDB()

    const conversation = await Conversation.create({
      userId: session.user.id,
      title: "New Conversation",
      messages: []
    })

    logger("memory-actions", "Created new conversation", {
      conversationId: conversation._id.toString(),
      userId: session.user.id
    })

    return {
      isSuccess: true,
      message: "Conversation created",
      data: { id: conversation._id.toString() }
    }
  } catch (error) {
    logger("memory-actions", "Error creating conversation", { error })
    return { isSuccess: false, message: "Failed to create conversation" }
  }
}

export async function addMessageAction(
  conversationId: string,
  content: string,
  role: "user" | "assistant"
): Promise<ActionState<IMessage>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      logger("memory-actions", "Unauthorized attempt to add message")
      return { isSuccess: false, message: "Unauthorized" }
    }

    await connectDB()

    logger("memory-actions", "Finding conversation for message", {
      conversationId,
      userId: session.user.id
    })

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: session.user.id
    })

    if (!conversation) {
      logger("memory-actions", "Conversation not found", { conversationId })
      return { isSuccess: false, message: "Conversation not found" }
    }

    const message = {
      role,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    conversation.messages.push(message)
    conversation.lastMessageAt = new Date()
    await conversation.save()

    logger("memory-actions", "Added message to conversation", {
      conversationId,
      role,
      messageCount: conversation.messages.length
    })

    return {
      isSuccess: true,
      message: "Message added",
      data: message as IMessage
    }
  } catch (error) {
    logger("memory-actions", "Error adding message", { error, conversationId })
    return { isSuccess: false, message: "Failed to add message" }
  }
}

export async function getConversationAction(
  conversationId: string
): Promise<ActionState<IMessage[]>> {
  try {
    logger("memory-actions", "Starting getConversationAction", { conversationId })

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      logger("memory-actions", "Unauthorized attempt to get conversation")
      return { isSuccess: false, message: "Unauthorized" }
    }

    // Validate conversation ID format
    if (!conversationId || !conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      logger("memory-actions", "Invalid conversation ID format", { conversationId })
      return { isSuccess: false, message: "Invalid conversation ID format" }
    }

    await connectDB()

    logger("memory-actions", "Finding conversation", {
      conversationId,
      userId: session.user.id
    })

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: session.user.id
    })

    if (!conversation) {
      logger("memory-actions", "Conversation not found", { conversationId })
      return { isSuccess: false, message: "Conversation not found" }
    }

    logger("memory-actions", "Retrieved conversation", {
      conversationId,
      messageCount: conversation.messages.length,
      messages: conversation.messages.map((m: IMessage) => ({
        role: m.role,
        contentLength: m.content.length,
        hasCreatedAt: !!m.createdAt,
        hasUpdatedAt: !!m.updatedAt
      }))
    })

    return {
      isSuccess: true,
      message: "Conversation retrieved",
      data: conversation.messages
    }
  } catch (error) {
    logger("memory-actions", "Error getting conversation", { error, conversationId })
    return { isSuccess: false, message: "Failed to get conversation" }
  }
}

export async function listConversationsAction(): Promise<
  ActionState<Array<{ id: string; title: string; lastMessageAt: string }>>
> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      logger("memory-actions", "Unauthorized attempt to list conversations")
      return { isSuccess: false, message: "Unauthorized" }
    }

    await connectDB()

    logger("memory-actions", "Listing conversations", { userId: session.user.id })

    const conversations = await Conversation.find({ userId: session.user.id })
      .select("title lastMessageAt")
      .sort({ lastMessageAt: -1 })
      .lean<Array<{ _id: mongoose.Types.ObjectId; title: string; lastMessageAt: Date }>>()

    if (!Array.isArray(conversations)) {
      logger("memory-actions", "Invalid response from database", {
        userId: session.user.id,
        response: typeof conversations
      })
      return { isSuccess: false, message: "Invalid database response" }
    }

    logger("memory-actions", "Retrieved conversations list", {
      userId: session.user.id,
      count: conversations.length,
      isEmpty: conversations.length === 0
    })

    return {
      isSuccess: true,
      message: conversations.length ? "Conversations retrieved" : "No conversations found",
      data: conversations.map((c) => ({
        id: c._id.toString(),
        title: c.title,
        lastMessageAt: c.lastMessageAt.toISOString()
      }))
    }
  } catch (error) {
    logger("memory-actions", "Error listing conversations", { error })
    return { isSuccess: false, message: "Failed to list conversations" }
  }
}

export async function sendMessageAction(
  conversationId: string,
  content: string
): Promise<ActionState<{ userMessage: IMessage; assistantMessage: IMessage }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      logger("memory-actions", "Unauthorized attempt to send message")
      return { isSuccess: false, message: "Unauthorized" }
    }

    await connectDB()

    logger("memory-actions", "Finding conversation for sending message", {
      conversationId,
      userId: session.user.id
    })

    // Get conversation and its messages for context
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: session.user.id
    })

    if (!conversation) {
      logger("memory-actions", "Conversation not found for sending message", { conversationId })
      return { isSuccess: false, message: "Conversation not found" }
    }

    // Store user message
    const userMessage = {
      role: "user" as const,
      content,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    conversation.messages.push(userMessage)

    logger("memory-actions", "Added user message", {
      conversationId,
      messageCount: conversation.messages.length
    })

    // Prepare conversation history for LLM
    const messageHistory: LLMMessage[] = conversation.messages.map((msg: IMessage) => ({
      role: msg.role,
      content: msg.content
    }))

    logger("memory-actions", "Sending message history to LLM", {
      conversationId,
      messageCount: messageHistory.length
    })

    // Get response from LLM with full conversation history
    const llmResponse = await sendPromptAction(messageHistory)
    if (!llmResponse.isSuccess) {
      logger("memory-actions", "Failed to get LLM response", { conversationId })
      return { isSuccess: false, message: "Failed to get LLM response" }
    }

    // Store assistant message
    const assistantMessage = {
      role: "assistant" as const,
      content: llmResponse.data.content,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    conversation.messages.push(assistantMessage)

    logger("memory-actions", "Added assistant message", {
      conversationId,
      messageCount: conversation.messages.length
    })

    // Update conversation
    conversation.lastMessageAt = new Date()
    await conversation.save()

    logger("memory-actions", "Saved conversation with new messages", {
      conversationId,
      messageCount: conversation.messages.length
    })

    // Generate title if this is the first message exchange (2 messages: user + assistant)
    if (conversation.messages.length === 2) {
      logger("memory-actions", "Triggering title generation for first message", { conversationId })
      await updateConversationTitleAction(conversationId)
    }

    return {
      isSuccess: true,
      message: "Message sent and response received",
      data: {
        userMessage: userMessage as IMessage,
        assistantMessage: assistantMessage as IMessage
      }
    }
  } catch (error) {
    logger("memory-actions", "Error sending message", { error, conversationId })
    return { isSuccess: false, message: "Failed to send message" }
  }
}

export async function updateConversationTitleAction(
  conversationId: string
): Promise<ActionState<{ title: string }>> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      logger("memory-actions", "Unauthorized attempt to update conversation title")
      return { isSuccess: false, message: "Unauthorized" }
    }

    await connectDB()

    // Get conversation and its messages
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: session.user.id
    })

    if (!conversation) {
      logger("memory-actions", "Conversation not found for title update", { conversationId })
      return { isSuccess: false, message: "Conversation not found" }
    }

    // Only generate title if there are messages
    if (conversation.messages.length === 0) {
      return { isSuccess: false, message: "No messages to generate title from" }
    }

    // Prepare messages for title generation
    const messageHistory: LLMMessage[] = conversation.messages.map((msg: IMessage) => ({
      role: msg.role,
      content: msg.content
    }))

    // Generate title using LLM
    const titleResponse = await sendPromptAction(
      messageHistory,
      "You are a helpful assistant that generates short, descriptive titles for conversations. Generate a concise title (max 6 words) that captures the main topic or theme of this conversation. Respond with just the title, nothing else."
    )

    if (!titleResponse.isSuccess) {
      logger("memory-actions", "Failed to generate title", { conversationId })
      return { isSuccess: false, message: "Failed to generate title" }
    }

    // Update conversation title
    conversation.title = titleResponse.data.content.trim()
    await conversation.save()

    logger("memory-actions", "Updated conversation title", {
      conversationId,
      title: conversation.title
    })

    return {
      isSuccess: true,
      message: "Title updated successfully",
      data: { title: conversation.title }
    }
  } catch (error) {
    logger("memory-actions", "Error updating conversation title", { error, conversationId })
    return { isSuccess: false, message: "Failed to update conversation title" }
  }
}
