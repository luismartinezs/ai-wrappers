import mongoose from "mongoose"

// Define the message schema
const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true
    },
    content: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
)

// Define the conversation schema
const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    messages: [messageSchema],
    title: {
      type: String,
      required: true
    },
    lastMessageAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

// Create indexes
conversationSchema.index({ userId: 1, lastMessageAt: -1 })

// Export the models with prefixed collection names
export const Message = mongoose.models.agentmemory_messages || mongoose.model("agentmemory_messages", messageSchema)
export const Conversation = mongoose.models.agentmemory_conversations || mongoose.model("agentmemory_conversations", conversationSchema)

// Export types
export type IMessage = mongoose.InferSchemaType<typeof messageSchema>
export type IConversation = mongoose.InferSchemaType<typeof conversationSchema>